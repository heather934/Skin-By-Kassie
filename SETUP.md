# Setup — SkinByKLB on Cloudflare Pages

Everything here is on Cloudflare's free tier at this site's size. Budget about
twenty minutes. Do the steps in order — the last one won't work until the others
are done.

---

## 1. Create the Pages project

Upload the site folder to GitHub, then in the Cloudflare dashboard:

**Workers & Pages → Create → Pages → Connect to Git**, pick the repo.

Build settings:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `/` |

There's no build step — the HTML is already generated. Deploy.

You'll get a URL like `skinbyklb.pages.dev`. Check it loads before continuing.

---

## 2. Create the storage

**Storage & Databases → KV → Create namespace**
Name it `skinbyklb-content`. Copy the namespace ID.

**R2 → Create bucket**
Name it `skinbyklb-photos`. Leave it private — photos are served through the
site, not from a public bucket URL.

---

## 3. Bind them to the site

**Workers & Pages → skinbyklb → Settings → Bindings**, and add both:

| Type | Variable name | Points at |
|---|---|---|
| KV namespace | `CONTENT` | `skinbyklb-content` |
| R2 bucket | `PHOTOS` | `skinbyklb-photos` |

The variable names have to match exactly — the code looks for `CONTENT` and
`PHOTOS`.

Also paste the KV namespace ID into `wrangler.toml` so local development works.

---

## 4. Lock the admin area

This is the part that actually keeps people out.

Go to **Zero Trust** (one-time setup: pick a team name — it becomes
`yourteam.cloudflareaccess.com`, and choose the free plan).

**Access → Applications → Add an application → Self-hosted**

| Field | Value |
|---|---|
| Application name | SkinByKLB admin |
| Session duration | 24 hours |
| Domain | `skinbyklb.pages.dev` (or your custom domain) |
| Path | `admin` |

Add a **second** domain entry on the same application, same domain, path
`api/admin`. Both need covering — one protects the screen, the other protects
the data behind it.

Then add a policy:

| Field | Value |
|---|---|
| Policy name | Kassie only |
| Action | Allow |
| Include → Emails | Kassie's email address |

Under login methods, leave **One-time PIN** enabled. That's what lets her sign in
with an emailed code instead of a password.

Save, then open the application's **Overview** tab and copy the
**Application Audience (AUD) Tag** — a long string of letters and numbers.

---

## 5. Set the environment variables

**Workers & Pages → skinbyklb → Settings → Variables and Secrets**, add three:

| Name | Value |
|---|---|
| `ACCESS_TEAM_DOMAIN` | `yourteam.cloudflareaccess.com` (no `https://`) |
| `ACCESS_AUD` | the AUD tag from step 4 |
| `ADMIN_EMAIL` | Kassie's email, exactly as entered in the Access policy |

`ADMIN_EMAIL` accepts a comma-separated list if more than one person ever needs
in.

**Redeploy after saving** — variables only apply to new deployments.

---

## 6. Test it

1. Open `yoursite.pages.dev/admin` in a private window.
   You should get Cloudflare's sign-in screen, not the panel.
2. Enter Kassie's email, then the code that arrives. The panel loads.
3. Change a price, press Save, then open the services page. New price.
4. Upload a photo, then open the gallery page. It's there.
5. Try `/api/admin/content` directly in a fresh private window — you should be
   bounced to sign-in, never see data.

If step 5 shows data without a login, the second domain entry in step 4 is
missing. Fix that before going live.

---


## 7. Confirm the domain and security headers

Once `skinbykassie.com` is connected as a custom domain on this Pages project
(**Workers & Pages → skinbyklb → Custom domains**), a few things are already
built to match it:

- `robots.txt` and `sitemap.xml` both point at `https://skinbykassie.com` —
  if the domain ever changes, update `SITE_DOMAIN` near the top of
  `generate.py` and re-run the build.
- `_headers` sets a Content-Security-Policy, HSTS, and a Permissions-Policy
  blocking camera/mic/geolocation/payment, none of which the site uses.
- `robots.txt` blocks known AI-training crawlers (GPTBot, CCBot,
  Google-Extended, ClaudeBot, and about 15 others) by name, in addition to the
  usual `/admin` and `/api/` disallow. Every response also carries an
  `X-Robots-Tag: noai, noimageai` header as a second signal. This matters here
  specifically because the gallery has real client before/after photos —
  clients consented to them appearing on the website, which is a different
  thing from consenting to them being scraped into an AI training set.

  **Important limitation:** both of the above are honor-system. Compliant
  crawlers (OpenAI's, Anthropic's, Google's) do respect them, but nothing
  technical stops a scraper that doesn't. For actual enforcement, turn on
  Cloudflare's own blocking:

  **Security → Bots** (in the Cloudflare dashboard, not Pages settings) →
  find **AI Scrapers and Crawlers** → set it to **Block**. This is a real
  edge-level block that works regardless of whether the crawler reads
  robots.txt at all, and it's included on every Cloudflare plan, free
  included. This is the step that actually matters — the robots.txt and
  header changes are the polite version of the same request.

After connecting the domain, load the site once and check the browser's
console for CSP violations — a strict `script-src 'self'` will break anything
that tries to load a script from an unlisted origin, so this is worth a
one-time check rather than assuming it's fine.


## 8. Turn on Web Analytics

**Cloudflare dashboard → Analytics & Logs → Web Analytics → Add a site.**

Since this site already runs on Cloudflare's network, pick **Automatic setup** —
Cloudflare injects the tracking beacon at the edge with no code changes here. Point
it at `skinbykassie.com` once the custom domain is connected.

It's free, doesn't use cookies, and needs no cookie-consent banner as a result —
worth knowing if Kassie ever asks whether the site should have one.

The site's Content-Security-Policy (in `_headers`) already allows the beacon script
(`static.cloudflareinsights.com`) and its reporting endpoint (`cloudflareinsights.com`),
so nothing else needs to change for this to work.

## Notes

**Why two layers.** Cloudflare Access blocks unauthenticated requests before
they reach the site. The code in `functions/api/admin/_middleware.js`
independently verifies the signed token on every admin request and checks the
email against `ADMIN_EMAIL`. If the Access policy were ever deleted by accident,
the API stays shut rather than silently opening to the world.

**The admin URL is not a secret.** It's `/admin`, it's excluded from search
engines via `robots.txt` and `_headers`, and that's it. The security is the login,
not the obscurity — which is the right way round. Don't rely on nobody guessing
the address.

**Costs.** KV, R2 and Access are all free at this volume — Access is free up to
50 users, R2 gives 10 GB of storage, and the site would need thousands of daily
visitors to approach the Pages limits.

**Adding a new service.** Prices, durations, descriptions and hiding a service
are all editable from the panel. Adding a *brand new* service means a new page,
which means adding it to `SERVICES` in `generate.py` and
`DEFAULT_SERVICES` in `functions/api/_defaults.js`, then redeploying. That's a
developer job, not a Kassie job — worth knowing before she asks.

**Local development.** `npx wrangler pages dev .` after filling in
`wrangler.toml`. The admin panel won't authenticate locally (there's no Access in
front of it), so the admin API returns 403 by design.

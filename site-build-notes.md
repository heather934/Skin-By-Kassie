# Skin by Kassie — Build Notes

## Status
Rose gold / black / white palette, editorial homepage modelled on formcollectiveohio.com's
structure, real client photos in the gallery and select service pages, and 12 service
pages covering everything Kassie actually offers. Kassie has confirmed photo release
permission for the client photos currently in use.

Site brand is **Skin by Kassie**, matching Kassie's logo.

---

## Services (12, across 4 categories)

| Category | Services |
|---|---|
| Facials | Signature Facial, Express Facial, Acne Treatment Facial, Chemical Peel |
| Hair removal | Waxing, **Sugaring** |
| Lashes & brows | Lash Lift & Tint, Lash Extensions, Brow Lamination |
| **Permanent Makeup & Tattoo** | **Brow Permanent Makeup**, **Lip Blush**, **Fine-Line Tattoo** |

Bold = added this round, based on real client photos Kassie provided that didn't match
any of the original 8 services. The original brief mentioned permanent makeup and
fine-line tattoos from the start — this closes that gap.

Sugaring has no photo yet. Kassie is providing a before/after separately — when it
arrives, add it to `SERVICE_PHOTOS` in `generate.py` the same way the others are wired
(see below), and it'll appear on `service-sugaring.html` and can be added to the gallery.

---

## Real photos in use

15 client photos, all confirmed released for web use. Files live in `images/gallery/`.

**Gallery page** — 11 in "Before & after" (brow PMU, lip blush, lash work, one fine-line
tattoo stencil-to-healed shot), 4 in "Process & close-ups" (application in-progress,
the lash style guide, two finished tattoo pieces). "Inside the studio" still shows
placeholders — none of the 15 were of the space itself.

**Service pages** — three photos double up as the lead image on their matching page,
via the `SERVICE_PHOTOS` dict near the top of `generate.py`:
- Lash Extensions → the lash style comparison chart (Classic through Russian Volume)
- Signature Facial → a facial before/after
- Brow Permanent Makeup → a brow PMU before/after
- Lip Blush → a lip blush before/after
- Fine-Line Tattoo → a finished linework piece

A photo is only used on a service page when it actually depicts that treatment —
nothing was placed just to fill a slot. Brow Lamination and Sugaring still show
placeholders because no photo matched them specifically.

**To add or swap a service-page photo:** edit `SERVICE_PHOTOS` in `generate.py`
(maps a service slug to a file in `images/gallery/` plus alt text), then re-run
`python3 generate.py`.

---

## Files

```
skinbyklb/
├── generate.py            Build script — services, pages, SERVICE_PHOTOS
├── styles.css              Design tokens in :root — rose gold bg, black text, white accent
├── main.js                 Dropdown menu + scroll reveal
├── site-content.js         Pulls live prices/photos from the admin API into static pages
├── images/gallery/         15 real client photos (g01–g15, descriptive filenames)
├── wrangler.toml, _headers, robots.txt, SETUP.md   Cloudflare config + setup guide
├── index.html · about.html · services.html · gallery.html · faq.html · contact.html
├── service-*.html          12 service detail pages
├── admin/index.html        Kassie's panel (prices, photos)
└── functions/               Cloudflare Pages Functions (public + admin APIs, R2 image route)
```

---

## Studio details — now real

Pulled from Kassie's Facebook page:
- **Address:** 418 Eighth Street, Suite D, Huntington, WV 25701
- **Online booking:** https://skinbyklb.square.site — Square handles booking, so every
  "Book" / "Book now" / "Book this treatment" button across the site now links there
  directly (opens in a new tab), rather than to the internal contact form.
- The internal inquiry form on `contact.html` is kept for questions, not booking —
  its CTAs say "Ask a question" and stay pointed at the form. "Not sure what to book?"
  and "Still have a question?" are the two that route internally; every other CTA on
  the site routes to Square.
- No phone number was provided, so the placeholder phone was removed rather than
  guessed. Add one via `STUDIO_ADDRESS_LINE1`/`STUDIO_ADDRESS_LINE2`/a new phone
  constant near the top of `generate.py` if Kassie wants it listed.

**Sugaring now has its before/after photo** (`g16-sugaring-leg-before-after.jpg`) — a
real client leg before/after. It's on `service-sugaring.html` and in the gallery's
"Before & after" section. All 16 photos are release-confirmed for web use.

## Security hardening (this round)

- **Domain confirmed:** `skinbykassie.com`. `robots.txt` and the new `sitemap.xml`
  both point there now — `sitemap.xml` regenerates from the real page list on every
  build (`build_sitemap()` in `generate.py`), so it can't quietly drift out of sync
  the way a hand-written one would.
- **AI crawlers blocked by name** in `robots.txt` (GPTBot, CCBot, Google-Extended,
  ClaudeBot, Bytespider, and others), separate from the general `/admin` and `/api/`
  disallow. Rationale: clients consented to their before/after photos going on the
  website — not to those photos being pulled into AI training data. Worth revisiting
  this list periodically, since new crawlers appear.
- **CSP, HSTS, and Permissions-Policy added** to `_headers`. This required pulling
  the admin panel's ~13,000 characters of inline `<script>` out into
  `admin/admin.js`, since a real `script-src 'self'` can't allow inline scripts.
  Nothing else needed to move — the public pages already only load external
  `main.js` / `site-content.js` and have no inline event handlers.
- **CSRF defense-in-depth** on the admin API: `functions/api/admin/_middleware.js`
  now also checks the `Origin` header on any non-GET request, so a forged request
  from another page can't ride on the Access session cookie alone.

## Still to do

- Real prices — everything still reads `$00` — everything still reads `$00`
- Real durations for the new PMU/tattoo services — the ranges given are reasonable
  industry estimates, not Kassie's actual numbers; confirm before launch
- Kassie's bio, testimonial, phone, address, hours
- Real FAQ and policy answers — worth adding PMU/tattoo-specific questions (touch-up
  timing, who shouldn't get tattooed, patch test policy) now that those services exist
- Studio interior photos — gallery's "Inside the studio" section is still placeholder
- Hero, statement band, and portrait photos — none of the 15 provided fit those slots
- Contact form has no backend — Formspree or EmailJS
- Favicon and Open Graph image

---

## Superseded
1–4. Earlier single-page, five-page, and thirteen-page hamburger-nav versions —
     see prior notes for full history if ever needed.
5. Editorial redesign with black/gold palette, then black/rose-gold palette —
   superseded by the current rose gold background / black text / white accent scheme.
6. 8-service structure — superseded by the 12-service structure above.

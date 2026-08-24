# Skin by Kassie — Launch To-Do

_Last updated: 2026-08-23_

## 🔴 Blocks launch — nothing works without these

- [ ] Regain GitHub access
- [ ] Create GitHub repo (private, empty, no README)
- [ ] Send Claude the repo URL + a personal access token → push the site
- [ ] Cloudflare dashboard: Connect to Git (attach the pushed repo to a Pages project)
- [ ] Cloudflare dashboard: Storage & Databases → R2 → enable R2 (accept terms)
- [ ] Set Pages environment variables (values are ready, just need pasting in):
  - `ACCESS_TEAM_DOMAIN`
  - `ACCESS_AUD`
  - `ADMIN_EMAIL`
- [ ] Attach `skinbykassie.com` as the custom domain on the Pages project

## ⚖️ Legal — resolve before the PMU/tattoo pages go live

- [ ] Call Cabell County Health Department — confirm whether Kassie's current
      license covers permanent makeup and fine-line tattoo, or whether a
      separate body-art permit is required
- [ ] Confirm a written consent/intake process exists for PMU and tattoo
      clients (West Virginia law requires this regardless of the website)

## ✍️ Real content — replace every placeholder

- [ ] Prices for all 12 services (everything currently reads `$00`)
- [ ] Durations for sugaring, brow PMU, lip blush, fine-line tattoo
      (current numbers are estimates, not Kassie's real numbers)
- [ ] Kassie's bio (home page + about page)
- [ ] A real testimonial
- [ ] Studio hours
- [ ] Remaining 9 FAQ answers (only the cancellation policy is final)
- [ ] Read through all 12 service pages — check the copy against what
      Kassie actually does, especially aftercare claims

## 📸 Photos still needed

- [ ] Hero image (homepage)
- [ ] Two full-width "statement band" photos
- [ ] A portrait of Kassie
- [ ] Offset image pair near the top of the homepage
- [ ] Studio interior shots (gallery's "Inside the studio" section)
- [ ] Kassie's real logo (to replace the placeholder favicon)

## 🤔 Decisions, not just content

- [ ] Should the $50 cancellation fee be higher for 2–3 hour PMU/tattoo
      appointments specifically?
- [ ] Confirm sugaring, brow PMU, lip blush, and fine-line tattoo match
      Kassie's actual menu — these were inferred from photos, not confirmed
      against her real price list
- [ ] Wire the contact form to Formspree or EmailJS (still has no backend)
- [ ] Turn on Cloudflare Web Analytics (dashboard toggle, ~5 minutes)

---

**Where things stand right now:** the Cloudflare Access application and KV
namespace are already live and correctly scoped to `skinbykassie.com` — those
two pieces are done. Everything above is what's left.

/**
 * Fallback service data and KV key names.
 *
 * These values are what the site shows before Kassie has saved anything, and
 * what it falls back to if KV is ever empty. They're kept in sync with the
 * SERVICES list in generate.py — if you add a service there, add it here too.
 */

export const KEY = {
  services: "content:services",
  gallery: "content:gallery",
};

export const DEFAULT_SERVICES = [
  {
    slug: "signature-facial",
    name: "Signature Facial",
    price: "$00",
    duration: "60 min",
    tagline: "A full reset, built around whatever your skin is doing this week.",
    hidden: false,
  },
  {
    slug: "express-facial",
    name: "Express Facial",
    price: "$00",
    duration: "30 min",
    tagline: "A short reset for a lunch break or the day before something important.",
    hidden: false,
  },
  {
    slug: "acne-treatment-facial",
    name: "Acne Treatment Facial",
    price: "$00",
    duration: "75 min",
    tagline: "Deep-cleansing and extraction focused. Best booked as a short series.",
    hidden: false,
  },
  {
    slug: "chemical-peel",
    name: "Chemical Peel",
    price: "$00",
    duration: "45 min",
    tagline: "Strength chosen at consultation. Real results, honest downtime.",
    hidden: false,
  },
  {
    slug: "waxing",
    name: "Waxing",
    price: "From $00",
    duration: "10–45 min",
    tagline: "Brows, face and body — hard wax or soft, depending on the area.",
    hidden: false,
  },
  {
    slug: "lash-lift-and-tint",
    name: "Lash Lift & Tint",
    price: "$00",
    duration: "60 min",
    tagline: "Your own lashes, lifted at the root. Roughly six weeks, no upkeep.",
    hidden: false,
  },
  {
    slug: "lash-extensions",
    name: "Lash Extensions",
    price: "$00 full set · $00 fill",
    duration: "120 min · 60 min fill",
    tagline: "Mapped to your eye shape so they still read as your lashes.",
    hidden: false,
  },
  {
    slug: "brow-lamination",
    name: "Brow Lamination",
    price: "$00",
    duration: "45 min",
    tagline: "Fuller, brushed-up brows using the hair you already have.",
    hidden: false,
  },
  {
    slug: "sugaring",
    name: "Sugaring",
    price: "From $00",
    duration: "15–45 min",
    tagline: "An all-natural paste alternative to wax — gentler on sensitive skin.",
    hidden: false,
  },
  {
    slug: "brow-permanent-makeup",
    name: "Brow Permanent Makeup",
    price: "$00",
    duration: "2–3 hrs incl. numbing",
    tagline: "Hair-stroke or powder pigment, mapped to the brow you actually have.",
    hidden: false,
  },
  {
    slug: "lip-blush",
    name: "Lip Blush",
    price: "$00",
    duration: "2–3 hrs incl. numbing",
    tagline: "Soft, natural color and a sharper lip line that doesn't rub off.",
    hidden: false,
  },
  {
    slug: "fine-line-tattoo",
    name: "Fine-Line Tattoo",
    price: "From $00",
    duration: "30–90 min",
    tagline: "Delicate linework, lettering and small custom pieces.",
    hidden: false,
  },
];

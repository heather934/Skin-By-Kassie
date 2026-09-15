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
  copy: "content:copy",
  testimonials: "content:testimonials",
  findMe: "content:find-me",
};

export const DEFAULT_SERVICES = [
  {
    slug: "signature-facial",
    name: "Signature Facial",
    price: "$00",
    duration: "60 min",
    tagline: "A full reset, built around whatever your skin is doing this week.",
    description: "Placeholder copy. The signature facial is the one to book if you're not sure where to start. It covers a double cleanse, exfoliation, extractions where they're needed, a mask chosen on the day, and a massage that isn't rushed.\n\nNothing is decided before you arrive. The products change based on what your skin needs, which is why this works for most people regardless of skin type.",
    hidden: false,
  },
  {
    slug: "express-facial",
    name: "Express Facial",
    price: "$00",
    duration: "30 min",
    tagline: "A short reset for a lunch break or the day before something important.",
    description: "Placeholder copy. The express facial covers the essentials — cleanse, exfoliation, a quick mask and moisturiser — without the massage and the longer extraction work.\n\nIt's the right call when you want your skin to look good on Friday and you only have half an hour on Thursday.",
    hidden: false,
  },
  {
    slug: "acne-treatment-facial",
    name: "Acne Treatment Facial",
    price: "$00",
    duration: "75 min",
    tagline: "Deep-cleansing and extraction focused. Best booked as a short series.",
    description: "Placeholder copy. This is the longest facial on the menu because extractions take time to do properly. The goal is to clear congestion without damaging the skin around it.\n\nOne appointment helps. Three or four spaced two weeks apart is where you'll actually see the change — and part of the appointment is working out what's causing the breakouts in the first place.",
    hidden: false,
  },
  {
    slug: "chemical-peel",
    name: "Chemical Peel",
    price: "$00",
    duration: "45 min",
    tagline: "Strength chosen at consultation. Real results, honest downtime.",
    description: "Placeholder copy. Peels resurface the top layer of skin to soften texture, fade dark marks and clear congestion. Strength is decided in person, never booked blind.\n\nIf you've never had one, you'll start light. There's no benefit to going hard on the first appointment.",
    hidden: false,
  },
  {
    slug: "waxing",
    name: "Waxing",
    price: "From $00",
    duration: "10–45 min",
    tagline: "Brows, face and body — hard wax or soft, depending on the area.",
    description: "Placeholder copy. Every area gets the wax that suits it. Hard wax for sensitive skin and coarser hair, soft wax where speed matters and the skin can take it.\n\nBrows are shaped to your face rather than a template, then tidied with tweezers so the edge is clean.",
    hidden: false,
  },
  {
    slug: "lash-lift-and-tint",
    name: "Lash Lift & Tint",
    price: "$00",
    duration: "60 min",
    tagline: "Your own lashes, lifted at the root. Roughly six weeks, no upkeep.",
    description: "Placeholder copy. A lift curls your natural lashes from the base and a tint darkens them, so you get the open-eye effect without extensions or daily mascara.\n\nIt's the low-maintenance option — nothing to fill, nothing to brush, and no adhesive.",
    hidden: false,
  },
  {
    slug: "lash-extensions",
    name: "Lash Extensions",
    price: "$00 full set · $00 fill",
    duration: "120 min · 60 min fill",
    tagline: "Mapped to your eye shape so they still read as your lashes.",
    description: "Placeholder copy. A classic set places one extension on each natural lash. The length and curl are mapped to your eye shape rather than applied uniformly, which is the difference between subtle and obvious.\n\nFills are booked every two to three weeks. Leave it longer and it becomes a new set.",
    hidden: false,
  },
  {
    slug: "brow-lamination",
    name: "Brow Lamination",
    price: "$00",
    duration: "45 min",
    tagline: "Fuller, brushed-up brows using the hair you already have.",
    description: "Placeholder copy. Lamination resets the direction your brow hairs grow in, so gaps close up and the shape holds without daily gel.\n\nIt pairs well with a wax and tint in the same appointment — ask when you book.",
    hidden: false,
  },
  {
    slug: "sugaring",
    name: "Sugaring",
    price: "From $00",
    duration: "15–45 min",
    tagline: "An all-natural paste alternative to wax — gentler on sensitive skin.",
    description: "Placeholder copy. Sugaring uses a paste made from sugar, lemon and water, applied at body temperature rather than hot. It grips only the hair, not the skin, which tends to mean less irritation and fewer ingrowns than traditional waxing.\n\nAvailable for the same areas as waxing — face, underarm, arm, leg and bikini — so if wax has been rough on your skin in the past, this is worth trying instead.",
    hidden: false,
  },
  {
    slug: "brow-permanent-makeup",
    name: "Brow Permanent Makeup",
    price: "$00",
    duration: "2–3 hrs incl. numbing",
    tagline: "Hair-stroke or powder pigment, mapped to the brow you actually have.",
    description: "Placeholder copy. Pigment is deposited into the upper layers of the skin to fill sparse areas, sharpen shape or replace a brow that's been over-plucked for years. Mapped and drawn in first, reviewed with you, then implanted.\n\nResults soften over the following weeks as the pigment settles. A follow-up fill 4 to 8 weeks later fine-tunes shape and color and is included in the price of a first session.",
    hidden: false,
  },
  {
    slug: "lip-blush",
    name: "Lip Blush",
    price: "$00",
    duration: "2–3 hrs incl. numbing",
    tagline: "Soft, natural color and a sharper lip line that doesn't rub off.",
    description: "Placeholder copy. Pigment is implanted to even out natural lip tone, define the border, and add a soft wash of color — closer to 'your lips, but rested' than a bold lipstick look, though depth is adjustable to what you want.\n\nNumbing is used throughout, and most people are surprised by how manageable it is. Color is intentionally bold on day one and settles to the true shade over the following weeks.",
    hidden: false,
  },
  {
    slug: "fine-line-tattoo",
    name: "Fine-Line Tattoo",
    price: "From $00",
    duration: "30–90 min",
    tagline: "Delicate linework, lettering and small custom pieces.",
    description: "Placeholder copy. Fine-line work covers small, detailed tattoos — script, a loved one's handwriting, single-line portraits, botanical linework — sized and placed to hold up over time rather than blur out.\n\nBring a reference or an idea and it's refined together beforehand. Simple pieces can often be done same-day; anything larger or more custom is scheduled after a design is finalized.",
    hidden: false,
  },
];

// "About the studio" and "Meet Kassie" — editable from the admin Content tab.
export const DEFAULT_COPY = {
  aboutStudio: {
    heading: "Unhurried by design",
    body: "One chair, one client, and as long as the appointment actually needs. " +
          "Nothing is scripted in advance and nothing gets rushed to make room for " +
          "the next booking.",
  },
  meetKassie: {
    heading: "Hi, I'm Kassie",
    body: "Placeholder bio. A short, warm introduction goes here — how long you've " +
          "been doing this, what drew you to skincare, and the kind of clients you " +
          "love working with. Two or three sentences is plenty.",
  },
  // The homepage banner (hero) heading and subhead.
  heroBanner: {
    heading: "Skin that looks like you, on your best day",
    body: "Facials, waxing and lashes, one client at a time.",
  },
  // The one-line quote over the wide studio photo. No heading — body only.
  studioBand: {
    heading: "",
    body: "A small studio, built around one person at a time",
  },
};

// The "Find me" section on the contact page — location, booking link, hours
// and social link. Editable from the admin Content tab.
export const DEFAULT_FIND_ME = {
  addressLine1: "418 Eighth Street, Suite D",
  addressLine2: "Huntington, WV 25701",
  bookingUrl: "https://skinbyklb.square.site",
  bookingLabel: "skinbyklb.square.site",
  hoursMonday: "placeholder",
  hoursTuesdayFriday: "placeholder",
  hoursSaturday: "placeholder",
  hoursSunday: "closed",
  socialUrl: "https://www.facebook.com/skinbykassie",
  socialLabel: "facebook.com/skinbykassie",
};

// Seed testimonial so the homepage never shows an empty section before Kassie
// adds her own or a client review gets approved.
export const DEFAULT_TESTIMONIALS = [
  {
    id: "seed-1",
    quote: "Placeholder testimonial. Swap this for a real review — the specific " +
           "ones land hardest, so pick a client who mentions how their skin " +
           "actually changed.",
    author: "Client name — Treatment",
    approved: true,
    source: "kassie",
    submittedAt: null,
  },
];

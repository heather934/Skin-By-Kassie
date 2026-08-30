/**
 * The service pages that can show their own photos.
 *
 * Kept here so the public API, the admin panel and the site all agree on the
 * same slugs. The slug matches the page filename: service-<slug>.html
 */

export const SERVICES = [
  { slug: "signature-facial", name: "Signature Facial", group: "Facials" },
  { slug: "express-facial", name: "Express Facial", group: "Facials" },
  { slug: "acne-treatment-facial", name: "Acne Treatment Facial", group: "Facials" },
  { slug: "chemical-peel", name: "Chemical Peel", group: "Facials" },
  { slug: "waxing", name: "Waxing", group: "Hair removal" },
  { slug: "sugaring", name: "Sugaring", group: "Hair removal" },
  { slug: "lash-extensions", name: "Lash Extensions", group: "Lashes & brows" },
  { slug: "lash-lift-and-tint", name: "Lash Lift & Tint", group: "Lashes & brows" },
  { slug: "brow-lamination", name: "Brow Lamination", group: "Lashes & brows" },
  { slug: "brow-permanent-makeup", name: "Brow Permanent Makeup", group: "Permanent makeup" },
  { slug: "lip-blush", name: "Lip Blush", group: "Permanent makeup" },
  { slug: "fine-line-tattoo", name: "Fine-Line Tattoo", group: "Permanent makeup" },
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

/**
 * Turn the saved { slug: [photoId, ...] } map into real photos, keeping the
 * order Kassie chose and quietly dropping anything she has since deleted.
 */
export function resolveServicePhotos(index) {
  const photos = Array.isArray(index?.photos) ? index.photos : [];
  const assigned = index?.services && typeof index.services === "object" ? index.services : {};
  const out = {};

  for (const slug of SERVICE_SLUGS) {
    const ids = Array.isArray(assigned[slug]) ? assigned[slug] : [];
    const picked = ids
      .map((id) => photos.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ id: p.id, key: p.key, caption: p.caption || "" }));

    if (picked.length) out[slug] = picked;
  }

  return out;
}

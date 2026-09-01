/**
 * Photo slots — the fixed spots on the site that show a single photo.
 *
 * Every slot fills itself automatically from whatever Kassie has uploaded, so
 * the site never shows an empty placeholder box. She can override any slot from
 * the admin panel; an override is just a photo id stored in index.slots.
 *
 * `prefer` is the order of categories to try when picking automatically.
 */

export const SLOTS = [
  {
    key: "hero",
    label: "Home page banner",
    prefer: ["studio", "before-after", "detail"],
  },
  {
    key: "tileA",
    label: "Home page — left photo",
    prefer: ["detail", "before-after", "studio"],
  },
  {
    key: "tileB",
    label: "Home page — right photo",
    prefer: ["studio", "detail", "before-after"],
  },
  {
    key: "portrait",
    label: "Photo of you (home and about pages)",
    prefer: ["studio", "detail", "before-after"],
  },
  {
    key: "studioBand",
    label: "Home page — wide studio photo",
    prefer: ["studio", "detail", "before-after"],
  },
  {
    key: "exteriorBand",
    label: "Home page — studio exterior or entrance",
    prefer: ["studio", "detail", "before-after"],
  },
];

export const SLOT_KEYS = SLOTS.map((s) => s.key);

/**
 * Work out which photo each slot should show.
 *
 * Photos arrive newest-first. Manual picks win. Anything left over is filled
 * automatically, avoiding repeats until there's nothing else to use.
 *
 * Returns { hero: { id, key, caption }, ... } — only slots that resolved.
 */
export function resolveSlots(index) {
  const photos = Array.isArray(index?.photos) ? index.photos : [];
  const chosen = {};
  if (!photos.length) return chosen;

  const manual = index?.slots && typeof index.slots === "object" ? index.slots : {};
  const used = new Set();

  const take = (photo, slotKey) => {
    chosen[slotKey] = { id: photo.id, key: photo.key, caption: photo.caption || "" };
    used.add(photo.id);
  };

  // Manual picks first, so an override is never stolen by the auto-filler.
  for (const slot of SLOTS) {
    const picked = photos.find((p) => p.id === manual[slot.key]);
    if (picked) take(picked, slot.key);
  }

  // Then fill the rest, preferring a category that suits the spot.
  for (const slot of SLOTS) {
    if (chosen[slot.key]) continue;

    let picked = null;
    for (const category of slot.prefer) {
      picked = photos.find((p) => p.category === category && !used.has(p.id));
      if (picked) break;
    }
    // Nothing unused in any preferred category — take any unused photo, and
    // failing that, reuse one rather than leaving a grey box on the site.
    if (!picked) picked = photos.find((p) => !used.has(p.id));
    if (!picked) picked = photos[0];

    if (picked) take(picked, slot.key);
  }

  return chosen;
}

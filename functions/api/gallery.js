/**
 * /api/gallery — public, read-only.
 *
 * Serves the photo list for the gallery grids, plus the resolved photo slots
 * (banner, home page tiles, portrait) so the main pages show real photos
 * instead of placeholder boxes.
 */

import { KEY } from "./_defaults.js";
import { resolveSlots } from "./_slots.js";

export async function onRequestGet({ env }) {
  const index = (await env.CONTENT.get(KEY.gallery, { type: "json" })) || { photos: [] };

  // Strip the uploader's email before this reaches the public site.
  const photos = index.photos.map(({ id, key, category, caption }) => ({
    id,
    key,
    category,
    caption,
  }));

  return new Response(JSON.stringify({ photos, slots: resolveSlots(index) }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

/**
 * /api/gallery — public, read-only.
 *
 * Serves the photo list for the gallery grids, the resolved photo slots
 * (banner, home page tiles, portrait) and the photos Kassie has assigned to
 * individual service pages.
 */

import { KEY } from "./_defaults.js";
import { resolveSlots } from "./_slots.js";
import { resolveServicePhotos } from "./_services.js";

export async function onRequestGet({ env }) {
  const index = (await env.CONTENT.get(KEY.gallery, { type: "json" })) || { photos: [] };

  // Strip the uploader's email before this reaches the public site.
  const photos = index.photos.map(({ id, key, category, caption }) => ({
    id,
    key,
    category,
    caption,
  }));

  const body = {
    photos,
    slots: resolveSlots(index),
    services: resolveServicePhotos(index),
  };

  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

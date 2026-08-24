/**
 * /api/gallery — public, read-only.
 * Serves the photo list to the live gallery page.
 */

import { KEY } from "./_defaults.js";

export async function onRequestGet({ env }) {
  const index = (await env.CONTENT.get(KEY.gallery, { type: "json" })) || { photos: [] };

  // Strip the uploader's email before this reaches the public site.
  const photos = index.photos.map(({ id, key, category, caption }) => ({
    id,
    key,
    category,
    caption,
  }));

  return new Response(JSON.stringify({ photos }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

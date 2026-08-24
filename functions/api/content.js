/**
 * /api/content — public, read-only.
 * Serves the current prices and service details to the live site.
 */

import { DEFAULT_SERVICES, KEY } from "./_defaults.js";

export async function onRequestGet({ env }) {
  const stored = await env.CONTENT.get(KEY.services, { type: "json" });

  const body = {
    services: stored?.services || DEFAULT_SERVICES,
    extras: stored?.extras || [],
    updatedAt: stored?.updatedAt || null,
  };

  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      // Short cache so Kassie's edits appear quickly but repeat visits are cheap.
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

/**
 * /api/copy — public, read-only.
 * Serves the "About the studio" and "Meet Kassie" text to the live site.
 */

import { DEFAULT_COPY, KEY } from "./_defaults.js";

export async function onRequestGet({ env }) {
  const stored = await env.CONTENT.get(KEY.copy, { type: "json" });

  const body = {
    aboutStudio: stored?.aboutStudio || DEFAULT_COPY.aboutStudio,
    meetKassie: stored?.meetKassie || DEFAULT_COPY.meetKassie,
  };

  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

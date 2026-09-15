/**
 * /api/find-me — public, read-only.
 * Serves the studio location, hours, booking link and social link shown in
 * the "Find me" section on the contact page.
 */

import { DEFAULT_FIND_ME, KEY } from "./_defaults.js";

export async function onRequestGet({ env }) {
  const stored = await env.CONTENT.get(KEY.findMe, { type: "json" });

  const body = Object.assign({}, DEFAULT_FIND_ME, stored || {});

  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
      // Short cache so Kassie's edits appear quickly but repeat visits are cheap.
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

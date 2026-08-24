/**
 * /api/admin/copy
 * GET/PUT for the "About the studio" and "Meet Kassie" text.
 * Behind Cloudflare Access + this folder's _middleware.js.
 */

import { DEFAULT_COPY, KEY } from "../_defaults.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export async function onRequestGet({ env }) {
  const stored = await env.CONTENT.get(KEY.copy, { type: "json" });
  return json({
    aboutStudio: stored?.aboutStudio || DEFAULT_COPY.aboutStudio,
    meetKassie: stored?.meetKassie || DEFAULT_COPY.meetKassie,
  });
}

export async function onRequestPut({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Could not read that request." }, 400);
  }

  const clean = (s, max) => String(s ?? "").slice(0, max).trim();
  const section = (s) => ({
    heading: clean(s?.heading, 80),
    body: clean(s?.body, 1200),
  });

  const payload = {
    aboutStudio: section(body.aboutStudio),
    meetKassie: section(body.meetKassie),
  };

  await env.CONTENT.put(KEY.copy, JSON.stringify(payload));
  return json({ ok: true });
}

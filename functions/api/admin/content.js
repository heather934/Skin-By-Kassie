/**
 * /api/admin/content
 *
 * GET  — current service data (KV values merged over the built-in defaults)
 * PUT  — save edited service data
 *
 * Behind Cloudflare Access + the _middleware.js check in this folder.
 */

import { DEFAULT_SERVICES, KEY } from "../_defaults.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export async function onRequestGet({ env }) {
  const stored = await env.CONTENT.get(KEY.services, { type: "json" });
  return json({
    services: stored?.services || DEFAULT_SERVICES,
    extras: stored?.extras || [],
    updatedAt: stored?.updatedAt || null,
  });
}

export async function onRequestPut({ request, env, data }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Could not read that request." }, 400);
  }

  if (!Array.isArray(body.services)) {
    return json({ error: "Services are missing from that request." }, 400);
  }

  const clean = (s) => String(s ?? "").slice(0, 400).trim();

  const services = body.services.map((s) => ({
    slug: clean(s.slug),
    name: clean(s.name),
    price: clean(s.price),
    duration: clean(s.duration),
    tagline: clean(s.tagline),
    hidden: Boolean(s.hidden),
  }));

  const extras = (Array.isArray(body.extras) ? body.extras : [])
    .map((e) => ({ name: clean(e.name), price: clean(e.price) }))
    .filter((e) => e.name);

  const payload = {
    services,
    extras,
    updatedAt: new Date().toISOString(),
    updatedBy: data.adminEmail,
  };

  await env.CONTENT.put(KEY.services, JSON.stringify(payload));
  return json({ ok: true, updatedAt: payload.updatedAt });
}

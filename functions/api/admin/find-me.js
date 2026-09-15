/**
 * /api/admin/find-me
 * GET/PUT for the "Find me" section on the contact page — location, hours,
 * booking link and social link.
 * Behind Cloudflare Access + this folder's _middleware.js.
 */

import { DEFAULT_FIND_ME, KEY } from "../_defaults.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

// Field name -> max length. Kept in sync with DEFAULT_FIND_ME in _defaults.js.
const FIELDS = {
  addressLine1: 120,
  addressLine2: 120,
  bookingUrl: 300,
  bookingLabel: 120,
  hoursMonday: 60,
  hoursTuesdayFriday: 60,
  hoursSaturday: 60,
  hoursSunday: 60,
  socialUrl: 300,
  socialLabel: 120,
};

export async function onRequestGet({ env }) {
  try {
    const stored = await env.CONTENT.get(KEY.findMe, { type: "json" });
    return json(Object.assign({}, DEFAULT_FIND_ME, stored || {}));
  } catch (err) {
    return json({ error: `Could not load content: ${err.message}` }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Could not read that request." }, 400);
  }

  const clean = (s, max) => String(s ?? "").slice(0, max).trim();

  const payload = {};
  for (const [field, max] of Object.entries(FIELDS)) {
    payload[field] = clean(body[field], max);
  }

  await env.CONTENT.put(KEY.findMe, JSON.stringify(payload));
  return json({ ok: true });
}

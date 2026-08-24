/**
 * /api/testimonials — public.
 *
 * GET  — approved testimonials only, for display on the site
 * POST — a client submitting a review. Goes in as unapproved; nothing a
 *        client submits appears on the site until Kassie approves it from
 *        the admin panel's Reviews tab.
 */

import { DEFAULT_TESTIMONIALS, KEY } from "./_defaults.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function readAll(env) {
  const stored = await env.CONTENT.get(KEY.testimonials, { type: "json" });
  return stored?.testimonials || DEFAULT_TESTIMONIALS;
}

export async function onRequestGet({ env }) {
  const all = await readAll(env);
  const approved = all
    .filter((t) => t.approved)
    .map(({ id, quote, author, rating }) => ({ id, quote, author, rating }));

  return new Response(JSON.stringify({ testimonials: approved }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Could not read that submission." }, 400);
  }

  // Honeypot: a real visitor never sees or fills this field (hidden via CSS).
  // A bot filling out every field in a scraped form almost always fills it.
  if (body.website) {
    return json({ ok: true }); // pretend success, drop it silently
  }

  const clean = (s, max) => String(s ?? "").slice(0, max).trim();

  const author = clean(body.author, 80);
  const quote = clean(body.quote, 600);
  const rating = Number.isInteger(body.rating) && body.rating >= 1 && body.rating <= 5
    ? body.rating
    : null;

  if (!author || !quote) {
    return json({ error: "A name and a review are both needed." }, 400);
  }
  if (quote.length < 10) {
    return json({ error: "That review looks too short — a sentence or two helps." }, 400);
  }

  const all = await readAll(env);
  const entry = {
    id: `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    quote,
    author,
    rating,
    approved: false,
    source: "client",
    submittedAt: new Date().toISOString(),
  };
  all.unshift(entry);

  await env.CONTENT.put(KEY.testimonials, JSON.stringify({ testimonials: all }));
  return json({ ok: true });
}

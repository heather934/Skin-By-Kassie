/**
 * /api/admin/testimonials
 *
 * GET    — every testimonial, approved or not (the admin needs to see pending
 *          client submissions to moderate them)
 * POST   — Kassie adding her own testimonial directly (auto-approved)
 * PATCH  — approve, edit, or unapprove an existing one
 * DELETE — remove one (?id=...)
 */

import { DEFAULT_TESTIMONIALS, KEY } from "../_defaults.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function readAll(env) {
  const stored = await env.CONTENT.get(KEY.testimonials, { type: "json" });
  return stored?.testimonials || DEFAULT_TESTIMONIALS;
}

async function writeAll(env, testimonials) {
  await env.CONTENT.put(KEY.testimonials, JSON.stringify({ testimonials }));
}

export async function onRequestGet({ env }) {
  const all = await readAll(env);
  return json({ testimonials: all });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Could not read that request." }, 400);
  }

  const clean = (s, max) => String(s ?? "").slice(0, max).trim();
  const author = clean(body.author, 80);
  const quote = clean(body.quote, 600);
  if (!author || !quote) {
    return json({ error: "A name and a quote are both needed." }, 400);
  }

  const all = await readAll(env);
  const entry = {
    id: `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    quote,
    author,
    rating: Number.isInteger(body.rating) ? body.rating : null,
    approved: true, // Kassie-authored — no moderation step needed
    source: "kassie",
    submittedAt: new Date().toISOString(),
  };
  all.unshift(entry);
  await writeAll(env, all);
  return json({ ok: true, testimonial: entry });
}

export async function onRequestPatch({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Could not read that request." }, 400);
  }

  const all = await readAll(env);
  const entry = all.find((t) => t.id === body.id);
  if (!entry) return json({ error: "That review no longer exists." }, 404);

  if (typeof body.approved === "boolean") entry.approved = body.approved;
  if (typeof body.quote === "string") entry.quote = body.quote.slice(0, 600).trim();
  if (typeof body.author === "string") entry.author = body.author.slice(0, 80).trim();

  await writeAll(env, all);
  return json({ ok: true, testimonial: entry });
}

export async function onRequestDelete({ request, env }) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "No review was specified." }, 400);

  const all = await readAll(env);
  const next = all.filter((t) => t.id !== id);
  if (next.length === all.length) return json({ error: "That review no longer exists." }, 404);

  await writeAll(env, next);
  return json({ ok: true });
}

/**
 * /api/admin/gallery
 *
 * GET    — list every photo, newest first
 * POST   — upload a photo (multipart: file, category, caption)
 * DELETE — remove a photo (?id=...)
 * PATCH  — update a caption or category (JSON: id, caption, category)
 * PUT    — set which photo fills a slot (JSON: slots: { hero: id|null, ... })
 *          and/or which photos appear on a service page
 *          (JSON: services: { waxing: [id, ...] })
 *
 * Photo bytes live in R2. The index lives in KV so listing stays fast.
 */

import { KEY } from "../_defaults.js";
import { SLOT_KEYS, resolveSlots } from "../_slots.js";
import { SERVICE_SLUGS, resolveServicePhotos } from "../_services.js";

const CATEGORIES = ["before-after", "detail", "studio"];
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB — the admin panel resizes before sending
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function readIndex(env) {
  return (await env.CONTENT.get(KEY.gallery, { type: "json" })) || { photos: [] };
}

async function writeIndex(env, index) {
  await env.CONTENT.put(KEY.gallery, JSON.stringify(index));
}

export async function onRequestGet({ env }) {
  try {
    const index = await readIndex(env);
    // `slots` is what Kassie picked; `resolved` is what the site actually shows
    // once the automatic choices are filled in.
    return json({
      ...index,
      slots: index.slots || {},
      services: index.services || {},
      resolved: resolveSlots(index),
      resolvedServices: resolveServicePhotos(index),
    });
  } catch (err) {
    return json({ error: `Could not load photos: ${err.message}` }, 500);
  }
}

export async function onRequestPost({ request, env, data }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "That upload could not be read." }, 400);
  }

  const file = form.get("file");
  if (!file || typeof file.arrayBuffer !== "function") {
    return json({ error: "No photo was attached." }, 400);
  }

  const type = file.type || "image/jpeg";
  if (!ALLOWED_TYPES.includes(type)) {
    return json({ error: "Photos must be JPEG, PNG or WebP." }, 400);
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) {
    return json({ error: "That photo is too large. Try a smaller one." }, 400);
  }

  const category = CATEGORIES.includes(form.get("category"))
    ? form.get("category")
    : "before-after";
  const caption = String(form.get("caption") || "").slice(0, 200).trim();

  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const key = `gallery/${id}.${ext}`;

  await env.PHOTOS.put(key, bytes, {
    httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" },
  });

  const index = await readIndex(env);
  index.photos.unshift({
    id,
    key,
    category,
    caption,
    type,
    uploadedAt: new Date().toISOString(),
    uploadedBy: data.adminEmail,
  });
  await writeIndex(env, index);

  return json({ ok: true, photo: index.photos[0] });
}

export async function onRequestPatch({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Could not read that request." }, 400);
  }

  const index = await readIndex(env);
  const photo = index.photos.find((p) => p.id === body.id);
  if (!photo) return json({ error: "That photo no longer exists." }, 404);

  if (typeof body.caption === "string") {
    photo.caption = body.caption.slice(0, 200).trim();
  }
  if (CATEGORIES.includes(body.category)) {
    photo.category = body.category;
  }

  await writeIndex(env, index);
  return json({ ok: true, photo });
}

/**
 * Choose which photo fills a slot. Send null (or "auto") for a slot to hand it
 * back to the automatic picker.
 */
export async function onRequestPut({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Could not read that request." }, 400);
  }

  const wanted = body && typeof body.slots === "object" && body.slots ? body.slots : null;
  const wantedServices =
    body && typeof body.services === "object" && body.services ? body.services : null;
  if (!wanted && !wantedServices) return json({ error: "Nothing was sent to save." }, 400);

  const index = await readIndex(env);
  const slots = index.slots && typeof index.slots === "object" ? { ...index.slots } : {};
  const services = index.services && typeof index.services === "object" ? { ...index.services } : {};

  for (const key of SLOT_KEYS) {
    if (!wanted || !(key in wanted)) continue;

    const value = wanted[key];
    if (!value || value === "auto") {
      delete slots[key];
      continue;
    }
    if (!index.photos.some((p) => p.id === value)) {
      return json({ error: "That photo no longer exists." }, 404);
    }
    slots[key] = value;
  }

  for (const slug of SERVICE_SLUGS) {
    if (!wantedServices || !(slug in wantedServices)) continue;

    const ids = Array.isArray(wantedServices[slug]) ? wantedServices[slug] : [];
    // Keep only ids that are real, and drop duplicates so a photo can't be
    // listed twice on the same page.
    const clean = [];
    for (const id of ids) {
      if (clean.includes(id)) continue;
      if (!index.photos.some((p) => p.id === id)) {
        return json({ error: "That photo no longer exists." }, 404);
      }
      clean.push(id);
    }

    if (clean.length) services[slug] = clean;
    else delete services[slug];
  }

  index.slots = slots;
  index.services = services;
  await writeIndex(env, index);

  return json({
    ok: true,
    slots,
    services,
    resolved: resolveSlots(index),
    resolvedServices: resolveServicePhotos(index),
  });
}

export async function onRequestDelete({ request, env }) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "No photo was specified." }, 400);

  const index = await readIndex(env);
  const photo = index.photos.find((p) => p.id === id);
  if (!photo) return json({ error: "That photo no longer exists." }, 404);

  await env.PHOTOS.delete(photo.key);
  index.photos = index.photos.filter((p) => p.id !== id);

  // A deleted photo must not stay pinned to a slot, or that spot would go blank
  // instead of falling back to the automatic pick.
  if (index.slots) {
    for (const key of SLOT_KEYS) {
      if (index.slots[key] === id) delete index.slots[key];
    }
  }

  // Same for the service pages it was showing on.
  if (index.services) {
    for (const slug of SERVICE_SLUGS) {
      if (!Array.isArray(index.services[slug])) continue;
      index.services[slug] = index.services[slug].filter((x) => x !== id);
      if (!index.services[slug].length) delete index.services[slug];
    }
  }

  await writeIndex(env, index);

  return json({ ok: true, resolved: resolveSlots(index) });
}

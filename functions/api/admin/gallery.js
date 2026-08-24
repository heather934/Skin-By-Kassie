/**
 * /api/admin/gallery
 *
 * GET    — list every photo, newest first
 * POST   — upload a photo (multipart: file, category, caption)
 * DELETE — remove a photo (?id=...)
 * PATCH  — update a caption or category (JSON: id, caption, category)
 *
 * Photo bytes live in R2. The index lives in KV so listing stays fast.
 */

import { KEY } from "../_defaults.js";

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
  const index = await readIndex(env);
  return json(index);
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

export async function onRequestDelete({ request, env }) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "No photo was specified." }, 400);

  const index = await readIndex(env);
  const photo = index.photos.find((p) => p.id === id);
  if (!photo) return json({ error: "That photo no longer exists." }, 404);

  await env.PHOTOS.delete(photo.key);
  index.photos = index.photos.filter((p) => p.id !== id);
  await writeIndex(env, index);

  return json({ ok: true });
}

/**
 * /img/<r2-key> — streams a photo out of R2.
 *
 * Keeps the bucket private: nobody needs a public R2 URL, and the bucket
 * can't be enumerated from outside.
 */

export async function onRequestGet({ params, env, request }) {
  const key = Array.isArray(params.path) ? params.path.join("/") : params.path;
  if (!key || !key.startsWith("gallery/")) {
    return new Response("Not found", { status: 404 });
  }

  const object = await env.PHOTOS.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  // Serve a 304 when the browser already has it.
  const etag = object.httpEtag;
  if (request.headers.get("If-None-Match") === etag) {
    return new Response(null, { status: 304 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", etag);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}

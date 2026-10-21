export function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}
export function sameOrigin(req) {
  const expected = process.env.APP_ORIGIN;
  if (!expected) fail(503, "APP_ORIGIN is not configured.");
  if (req.headers.origin !== new URL(expected).origin)
    fail(403, "Request origin is not allowed.");
}
// Public content and enquiry APIs accept only the explicitly configured public
// site origin. Admin/auth endpoints continue requiring APP_ORIGIN exclusively.
export function publicCors(req, res, methods = ["GET"]) {
  const allowed = [process.env.PUBLIC_SITE_ORIGIN, process.env.APP_ORIGIN]
    .filter(Boolean)
    .map((v) => new URL(v).origin);
  const origin = req.headers.origin;
  if (origin && !allowed.includes(origin))
    fail(403, "Request origin is not allowed.");
  res.setHeader("Vary", "Origin");
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "600");
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}
export function publicWriteOrigin(req) {
  const expected = process.env.PUBLIC_SITE_ORIGIN || process.env.APP_ORIGIN;
  if (!expected) fail(503, "Public website origin is not configured.");
  if (req.headers.origin !== new URL(expected).origin)
    fail(403, "Request origin is not allowed.");
}
export async function body(req, { maxBytes = 180000 } = {}) {
  if (!/^application\/json(?:;|$)/i.test(req.headers["content-type"] || ""))
    fail(415, "Use application/json.");
  let value = req.body;
  if (value === undefined) {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > maxBytes) fail(413, "Request is too large.");
      chunks.push(chunk);
    }
    value = Buffer.concat(chunks).toString();
  }
  if (typeof value === "string" && Buffer.byteLength(value) > maxBytes)
    fail(413, "Request is too large.");
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    fail(400, "Invalid JSON.");
  }
}
export function endpoint(fn) {
  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    try {
      const value = await fn(req, res);
      if (!res.writableEnded) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(value));
      }
    } catch (e) {
      res.statusCode = e.status || 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: e.status ? e.message : "The request failed. Please try again.",
        }),
      );
      if (!e.status) console.error("API request failed:", e.name);
    }
  };
}

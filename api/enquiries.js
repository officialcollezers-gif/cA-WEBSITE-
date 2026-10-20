import { randomUUID } from "node:crypto";
import { endpoint, body, sameOrigin, fail } from "../server/http.js";
import { appendRows, configured, initialized } from "../server/google.js";
export default endpoint(async (req) => {
  if (req.method !== "POST") fail(405, "Method not allowed.");
  sameOrigin(req);
  const data = await body(req);
  if (!data || typeof data !== "object") fail(400, "Invalid enquiry.");
  if (data.website) return { ok: true };
  const record = Object.fromEntries(
    [
      "name",
      "email",
      "phone",
      "service",
      "category",
      "message",
      "source",
      "clientType",
    ].map((k) => [
      k,
      typeof data[k] === "string"
        ? data[k].trim().slice(0, k === "message" ? 2000 : 250)
        : "",
    ]),
  );
  if (
    !record.name ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email) ||
    !/^[+\d\s()-]{10,20}$/.test(record.phone) ||
    !record.message ||
    !data.consent
  )
    fail(
      400,
      "Provide your name, valid email and phone, message, and contact consent.",
    );
  if (!process.env.TURNSTILE_SECRET_KEY)
    fail(503, "Enquiry spam protection is not configured.");
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: data.challengeToken || "",
      }),
      signal: AbortSignal.timeout(10000),
    },
  );
  const challenge = await response.json();
  if (
    !challenge.success ||
    challenge.hostname !== new URL(process.env.APP_ORIGIN).hostname
  )
    fail(400, "Please complete the spam protection check again.");
  if (!configured() || !(await initialized()))
    fail(
      503,
      "Online enquiries are not available yet. Please contact us directly.",
    );
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  await appendRows("Enquiries", [
    [id, createdAt, JSON.stringify({ ...record, id, createdAt })],
  ]);
  return { ok: true };
});

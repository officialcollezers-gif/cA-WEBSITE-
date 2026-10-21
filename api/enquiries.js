import { createHmac } from "node:crypto";
import { appsScriptConfigured, scriptRequest } from "../server/apps-script.js";
import { randomUUID } from "node:crypto";
import {
  endpoint,
  body,
  publicCors,
  publicWriteOrigin,
  fail,
} from "../server/http.js";
import { appendRows, configured, initialized } from "../server/google.js";
export default endpoint(async (req, res) => {
  if (publicCors(req, res, ["POST"])) return;
  if (req.method !== "POST") fail(405, "Method not allowed.");
  publicWriteOrigin(req);
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
  if (appsScriptConfigured() && !process.env.TURNSTILE_SECRET_KEY) {
    if ((process.env.SESSION_SECRET || "").length < 32)
      fail(503, "Server session secret is missing.");
    const ip = String(
      req.headers["x-vercel-forwarded-for"] ||
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "unknown",
    )
      .split(",")[0]
      .trim();
    const rateKey = createHmac("sha256", process.env.SESSION_SECRET)
      .update(ip)
      .digest("hex");
    await scriptRequest("enquiry", {
      rateKey,
      record: {
        ...record,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      },
    });
    return { ok: true };
  }
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
    challenge.hostname !==
      new URL(process.env.PUBLIC_SITE_ORIGIN || process.env.APP_ORIGIN).hostname
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

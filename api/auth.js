import { createHmac } from "node:crypto";
import { appsScriptConfigured, scriptRequest } from "../server/apps-script.js";
import { allowed } from "../server/auth.js";
import { endpoint, body, sameOrigin, fail } from "../server/http.js";
import {
  readSession,
  verifyGoogle,
  sessionToken,
  setSession,
} from "../server/auth.js";
export default endpoint(async (req, res) => {
  if (req.method === "GET")
    return {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      loginMethod:
        appsScriptConfigured() || !process.env.GOOGLE_CLIENT_ID
          ? "password"
          : "google",
      configured: appsScriptConfigured() || !!process.env.GOOGLE_CLIENT_ID,
      user: readSession(req)?.email || null,
    };
  sameOrigin(req);
  if (req.method === "DELETE") {
    setSession(res, "", true);
    return { ok: true };
  }
  if (req.method !== "POST") fail(405, "Method not allowed.");
  const data = await body(req);
  let email;
  if (appsScriptConfigured()) {
    if (
      typeof data?.password !== "string" ||
      data.password.length > 200 ||
      typeof data?.email !== "string" ||
      data.email.length > 254
    )
      fail(400, "Enter your admin email and password.");
    if ((process.env.SESSION_SECRET || "").length < 32)
      fail(503, "The server session secret is missing.");
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
    const result = await scriptRequest("login", {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      rateKey,
    });
    if (!allowed(result.email))
      fail(403, "This email is not in the server administrator list.");
    email = result.email;
  } else email = await verifyGoogle(data?.credential);
  setSession(res, sessionToken(email));
  return { user: email };
});

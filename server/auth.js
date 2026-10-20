import { createHmac, timingSafeEqual } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { fail } from "./http.js";
const cookieName = "fincore_session";
function secret() {
  if ((process.env.SESSION_SECRET || "").length < 32)
    fail(503, "Set a session secret of at least 32 characters.");
  return process.env.SESSION_SECRET;
}
const sign = (value) =>
  createHmac("sha256", secret()).update(value).digest("base64url");
export function allowed(email) {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(email?.toLowerCase());
}
export function sessionToken(email) {
  const payload = Buffer.from(
    JSON.stringify({ email, expires: Date.now() + 8 * 3600000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function readSession(req) {
  const token = (req.headers.cookie || "")
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  if (!token) return null;
  const [payload, signature = ""] = token.split(".");
  const expected = sign(payload);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.expires > Date.now() && allowed(data.email) ? data : null;
  } catch {
    return null;
  }
}
export function requireAdmin(req) {
  const user = readSession(req);
  if (!user) fail(401, "Sign in as an administrator to continue.");
  return user;
}
export function setSession(res, token, clear = false) {
  const secure = process.env.APP_ORIGIN?.startsWith("https://")
    ? "; Secure"
    : "";
  res.setHeader(
    "Set-Cookie",
    `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear ? 0 : 28800}${secure}`,
  );
}
export async function verifyGoogle(credential) {
  if (!process.env.GOOGLE_CLIENT_ID)
    fail(503, "Google sign-in is not configured.");
  let payload;
  try {
    const ticket = await new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
    ).verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    fail(401, "Google sign-in could not be verified.");
  }
  if (!payload.email_verified || !allowed(payload.email))
    fail(403, "This Google account is not an administrator.");
  return payload.email;
}

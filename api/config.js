import { endpoint, fail } from "../server/http.js";
export default endpoint((req) => {
  if (req.method !== "GET") fail(405, "Method not allowed.");
  return { turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "" };
});

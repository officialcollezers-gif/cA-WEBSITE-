import { endpoint, fail, publicCors } from "../server/http.js";
export default endpoint((req, res) => {
  if (publicCors(req, res)) return;
  if (req.method !== "GET") fail(405, "Method not allowed.");
  return { turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "" };
});

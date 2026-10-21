import { appsScriptConfigured } from "../server/apps-script.js";
import { endpoint, fail, publicCors } from "../server/http.js";
export default endpoint((req, res) => {
  if (publicCors(req, res)) return;
  if (req.method !== "GET") fail(405, "Method not allowed.");
  return {
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "",
    protection: process.env.TURNSTILE_SITE_KEY
      ? "turnstile"
      : appsScriptConfigured()
        ? "rate-limit"
        : "unavailable",
  };
});

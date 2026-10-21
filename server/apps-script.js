import { fail } from "./http.js";
export function appsScriptConfigured() {
  return !!(process.env.APPS_SCRIPT_URL && process.env.APPS_SCRIPT_SECRET);
}
export async function scriptRequest(action, payload = {}) {
  if (!appsScriptConfigured())
    fail(
      503,
      "Complete the Apps Script connection first. See APPS_SCRIPT_SETUP.md.",
    );
  const url = new URL(process.env.APPS_SCRIPT_URL);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "script.google.com" ||
    !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname)
  )
    fail(503, "Use the deployed Apps Script web app URL ending in /exec.");
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        ...payload,
        secret: process.env.APPS_SCRIPT_SECRET,
      }),
      redirect: "follow",
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    fail(
      502,
      "Apps Script could not be reached. Check the deployment URL and access settings.",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    fail(
      502,
      "Apps Script did not return JSON. Deploy it as a web app with access set to Anyone.",
    );
  }
  if (!response.ok) fail(502, "Apps Script returned an HTTP error.");
  if (!data.ok)
    fail(
      [400, 401, 403, 404, 409, 429, 503].includes(data.status)
        ? data.status
        : 502,
      data.error || "Apps Script request failed.",
    );
  return data.result;
}

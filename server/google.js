import { appsScriptConfigured, scriptRequest } from "./apps-script.js";
import { JWT } from "google-auth-library";
let client;
export function configured() {
  return (
    appsScriptConfigured() ||
    !!(
      process.env.GOOGLE_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
    )
  );
}
async function sheets(path, method = "GET", body) {
  if (!configured())
    throw Object.assign(
      new Error("Google Sheets is not configured. Follow SETUP.md."),
      { status: 503 },
    );
  client ||= new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const { token } = await client.getAccessToken();
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(process.env.GOOGLE_SHEET_ID)}${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(20000),
    },
  );
  if (!response.ok) {
    console.error("Sheets request failed:", response.status);
    throw Object.assign(
      new Error(
        "Google Sheets could not be accessed. Check the sheet ID, API access and service account sharing.",
      ),
      { status: 502 },
    );
  }
  return response.json();
}
export async function initialized() {
  if (appsScriptConfigured())
    return (await scriptRequest("status")).initialized;
  const data = await sheets("?fields=sheets.properties.title");
  const titles = data.sheets.map((s) => s.properties.title);
  return titles.includes("Content") && titles.includes("Enquiries");
}
export async function initializeTabs() {
  if (appsScriptConfigured()) {
    await scriptRequest("initialize");
    return;
  }
  const data = await sheets("?fields=sheets.properties.title");
  const titles = data.sheets.map((s) => s.properties.title);
  const missing = ["Content", "Enquiries"].filter((t) => !titles.includes(t));
  if (missing.length)
    await sheets(":batchUpdate", "POST", {
      requests: missing.map((title) => ({
        addSheet: { properties: { title } },
      })),
    });
}
export async function readRows(tab) {
  if (appsScriptConfigured())
    return (await scriptRequest("read", { tab })).rows;
  return (
    (await sheets(`/values/${encodeURIComponent(`${tab}!A:E`)}`)).values || []
  );
}
export async function appendRows(tab, values) {
  if (appsScriptConfigured()) {
    await scriptRequest("append", { tab, values });
    return;
  }
  await sheets(
    `/values/${encodeURIComponent(`${tab}!A:E`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    "POST",
    { values },
  );
}

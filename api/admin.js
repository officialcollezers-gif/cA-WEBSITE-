import { clearPublicCache } from "../server/public-cache.js";
import { endpoint, body, sameOrigin, fail } from "../server/http.js";
import { requireAdmin } from "../server/auth.js";
import {
  configured,
  initialized,
  initializeTabs,
  readRows,
  appendRows,
} from "../server/google.js";
import { defaults, assemble, validateRecord } from "../server/content.js";
export default endpoint(async (req) => {
  const user = requireAdmin(req);
  if (req.method === "GET") {
    if (!configured())
      return {
        configured: false,
        initialized: false,
        content: defaults,
        enquiries: [],
      };
    const ready = await initialized();
    return {
      configured: true,
      initialized: ready,
      content: ready ? assemble(await readRows("Content")) : defaults,
      enquiries: ready
        ? (await readRows("Enquiries"))
            .reverse()
            .map((r) => {
              try {
                return JSON.parse(r[2]);
              } catch {
                return null;
              }
            })
            .filter(Boolean)
        : [],
    };
  }
  sameOrigin(req);
  if (req.method !== "POST") fail(405, "Method not allowed.");
  const data = await body(req);
  if (data.action === "initialize") {
    await initializeTabs();
    const existing = new Set(
      (await readRows("Content")).map((r) => `${r[0]}:${r[1]}`),
    );
    const rows = [];
    for (const kind of ["settings", "categories", "blogs", "pages"])
      for (const value of kind === "settings"
        ? [defaults.settings]
        : defaults[kind]) {
        if (!existing.has(`${kind}:${value.id}`))
          rows.push([
            kind,
            value.id,
            JSON.stringify(validateRecord(kind, value)),
            new Date().toISOString(),
            user.email,
          ]);
      }
    if (rows.length) await appendRows("Content", rows);
    clearPublicCache();
    return { ok: true };
  }
  if (!(await initialized())) fail(409, "Initialize the Google Sheet first.");
  const { kind } = data;
  const value = validateRecord(kind, data.record);
  if (data.action === "delete") {
    if (kind === "settings") fail(400, "Site settings cannot be deleted.");
    value.deleted = true;
  } else if (data.action !== "save") fail(400, "Unknown action.");
  const json = JSON.stringify(value);
  if (json.length > 45000)
    fail(
      400,
      "This record is too large for a Sheet cell. Shorten the content or split the category.",
    );
  await appendRows("Content", [
    [kind, value.id, json, new Date().toISOString(), user.email],
  ]);
  clearPublicCache();
  return { ok: true };
});

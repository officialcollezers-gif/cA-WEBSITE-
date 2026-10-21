import { publicContent } from "../server/public-cache.js";
import { endpoint, fail, publicCors } from "../server/http.js";
import { configured, initialized, readRows } from "../server/google.js";
import { defaults, assemble } from "../server/content.js";
export default endpoint(async (req, res) => {
  if (publicCors(req, res)) return;
  if (req.method !== "GET") fail(405, "Method not allowed.");
  if (!configured()) return { ...defaults, source: "starter" };
  return publicContent(async () => {
    if (!(await initialized())) return { ...defaults, source: "starter" };
    return { ...assemble(await readRows("Content"), true), source: "google" };
  });
});

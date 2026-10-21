import {
  endpoint,
  body,
  sameOrigin,
  publicCors,
  fail,
} from "../server/http.js";
import { requireAdmin } from "../server/auth.js";
import { scriptRequest, appsScriptConfigured } from "../server/apps-script.js";
import { validateImage } from "../server/images.js";
export default endpoint(async (req, res) => {
  if (req.method === "POST") {
    requireAdmin(req);
    sameOrigin(req);
    const image = validateImage(await body(req, { maxBytes: 1450000 }));
    if (!appsScriptConfigured())
      fail(503, "Image uploads require the Apps Script backend.");
    const status = await scriptRequest("status");
    if (!status.mediaReady)
      fail(
        409,
        "Update Apps Script, run enableImageUploads, and deploy a new script version before uploading.",
      );
    const result = await scriptRequest("uploadImage", {
      data: image.data,
      mimeType: image.mimeType,
      name: image.name,
    });
    if (!/^[A-Za-z0-9_-]{10,100}$/.test(result.fileId || ""))
      fail(502, "Drive did not return a valid uploaded image ID.");
    return {
      fileId: result.fileId,
      url: new URL(
        "/api/media?id=" + encodeURIComponent(result.fileId),
        process.env.APP_ORIGIN,
      ).href,
    };
  }
  if (publicCors(req, res, ["GET", "HEAD"])) return;
  if (!["GET", "HEAD"].includes(req.method)) fail(405, "Method not allowed.");
  const id = new URL(req.url, "http://localhost").searchParams.get("id");
  if (!/^[A-Za-z0-9_-]{10,100}$/.test(id || "")) fail(400, "Invalid image ID.");
  const result = await scriptRequest("readImage", { fileId: id });
  const image = validateImage(result);
  res.setHeader("Content-Type", image.mimeType);
  res.setHeader(
    "Cache-Control",
    "public, max-age=86400, s-maxage=86400, immutable",
  );
  res.setHeader("Content-Length", String(image.bytes.length));
  res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  res.end(req.method === "HEAD" ? undefined : image.bytes);
});

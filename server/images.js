import { fail } from "./http.js";
export const MAX_IMAGE_BYTES = 1024 * 1024;
export function validateImage(data) {
  if (
    !data ||
    typeof data.data !== "string" ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(data.data) ||
    data.data.length % 4 !== 0 ||
    data.data.length > 4 * Math.ceil(MAX_IMAGE_BYTES / 3)
  )
    fail(
      400,
      "Choose a JPEG, PNG or WebP image up to 1 MB after optimization.",
    );
  const bytes = Buffer.from(data.data, "base64");
  if (
    !bytes.length ||
    bytes.length > MAX_IMAGE_BYTES ||
    bytes.toString("base64") !== data.data
  )
    fail(400, "Invalid image data.");
  const type = bytes
    .subarray(0, 8)
    .equals(Buffer.from("89504e470d0a1a0a", "hex"))
    ? "image/png"
    : bytes.length >= 3 &&
        bytes[0] === 255 &&
        bytes[1] === 216 &&
        bytes[2] === 255
      ? "image/jpeg"
      : bytes.length >= 12 &&
          bytes.toString("ascii", 0, 4) === "RIFF" &&
          bytes.toString("ascii", 8, 12) === "WEBP"
        ? "image/webp"
        : "";
  if (!type || type !== data.mimeType)
    fail(
      400,
      "Only genuine JPEG, PNG and WebP images are supported. SVG files are not supported.",
    );
  return {
    bytes,
    mimeType: type,
    data: data.data,
    name: typeof data.name === "string" ? data.name.slice(0, 120) : "image",
  };
}

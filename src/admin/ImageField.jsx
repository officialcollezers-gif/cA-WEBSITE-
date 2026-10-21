import { useEffect, useRef, useState } from "react";
async function optimize(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choose a JPEG, PNG or WebP image.");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Choose an image smaller than 10 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(
      1,
      1600 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.82, 0.65, 0.5]) {
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/webp", quality),
      );
      if (blob && blob.size <= 1024 * 1024) return blob;
    }
    throw new Error("This image is still too large. Choose a smaller image.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
export default function ImageField({ label, value, onChange, onUploadState }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const callbacks = useRef({ onChange, onUploadState });
  const active = useRef(true);
  const controller = useRef(null);
  useEffect(() => {
    callbacks.current = { onChange, onUploadState };
  }, [onChange, onUploadState]);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      controller.current?.abort();
    };
  }, []);
  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    callbacks.current.onUploadState?.(1);
    const signal = new AbortController();
    controller.current = signal;
    try {
      const blob = await optimize(file);
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = () => reject(new Error("Could not read this image."));
        reader.readAsDataURL(blob);
      });
      if (!active.current || signal.signal.aborted) return;
      const response = await fetch("/api/media", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, mimeType: blob.type, name: file.name }),
        signal: signal.signal,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      if (active.current) {
        callbacks.current.onChange(result.url);
        setMessage(
          "Uploaded to Google Drive. Save your changes to publish this image.",
        );
      }
    } catch (e) {
      if (active.current && e.name !== "AbortError")
        setError(e.message || "Could not upload this image.");
    } finally {
      callbacks.current.onUploadState?.(-1);
      if (active.current) setBusy(false);
    }
  }
  return (
    <div className="admin-image-field">
      <label className="admin-field">
        <span>{label}</span>
        <input
          type="url"
          value={value || ""}
          disabled={busy}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
        />
      </label>
      <label className="admin-upload-button">
        {busy ? "Uploading…" : "Upload image to Drive"}
        <input
          aria-label={`Upload ${label.toLowerCase()}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={upload}
        />
      </label>
      <p className="admin-hint">
        JPEG, PNG or WebP. Images are optimized before upload. You can also
        paste an image URL.
      </p>
      {error && (
        <p className="admin-alert" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="admin-success" role="status">
          {message}
        </p>
      )}
      {value && (
        <img
          className="admin-image-preview"
          src={value}
          alt="Selected image preview"
        />
      )}
    </div>
  );
}

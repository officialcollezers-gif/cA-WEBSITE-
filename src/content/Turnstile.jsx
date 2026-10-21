import { apiUrl } from "./api";
import { useEffect, useRef, useState } from "react";
let loading;
function loadWidget() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading)
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        loading = null;
        reject(new Error("Spam protection could not load."));
      };
      document.head.appendChild(script);
    });
  return loading;
}
export default function Turnstile({ onToken, resetKey = 0 }) {
  const ref = useRef(null);
  const callback = useRef(onToken);
  const [error, setError] = useState("");
  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);
  useEffect(() => {
    let active = true;
    let widget;
    let api;
    fetch(apiUrl("/api/config"))
      .then((r) => {
        if (!r.ok) throw new Error("Spam protection is unavailable.");
        return r.json();
      })
      .then(async (config) => {
        if (!config.turnstileSiteKey)
          throw new Error(
            "Online enquiries are not configured yet. Please contact us directly.",
          );
        api = await loadWidget();
        if (active)
          widget = api.render(ref.current, {
            sitekey: config.turnstileSiteKey,
            callback: (token) => callback.current(token),
            "expired-callback": () => callback.current(""),
            "error-callback": () => callback.current(""),
          });
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
      if (widget !== undefined) api.remove(widget);
    };
  }, [resetKey]);
  return (
    <div>
      <div ref={ref} />
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

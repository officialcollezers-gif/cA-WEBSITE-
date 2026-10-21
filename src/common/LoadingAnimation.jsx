import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styling/common/loadingAnimation.css";

/* ---------- Config ---------- */

const WORDMARK_LETTERS = "RAHUL G & ASSOCIATES".split("");
const CAPTION = "FINANCIAL CLARITY. CONSIDERED ADVICE.";

// The first-visit intro (letters, dot, caption) needs ~950ms to play out.
// The loader never exits before that, whatever initialDuration is passed in.
const INTRO_DURATION = 1000;

// First visit gets a "curtain" exit, route changes a quick fade
const EXIT_DURATION = { initial: 600, route: 350 };

// Never keep a first-time visitor waiting longer than this for fonts/assets
const MAX_INITIAL_WAIT = 4000;

/* ---------- Helpers ---------- */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Resolves when the page's assets and web fonts are ready */
function waitForPageReady() {
  const loaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) =>
          window.addEventListener("load", resolve, { once: true })
        );

  const fonts = document.fonts?.ready ?? Promise.resolve();

  return Promise.all([loaded, fonts]);
}

/* ---------- Component ---------- */

export default function LoadingAnimation({
  initialDuration = 1100,
  routeDuration = 450,
}) {
  const { pathname } = useLocation();
  const isFirstLoad = useRef(true);

  // Lazy init: with reduced motion the loader is never rendered, not even for one frame
  const [loader, setLoader] = useState(() => ({
    phase: prefersReducedMotion() ? "hidden" : "visible", // hidden | visible | exiting
    initial: true,
    duration: initialDuration,
    key: 0,
  }));

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Reset the overlay when the reduced-motion preference changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoader((prev) =>
        prev.phase === "hidden" ? prev : { ...prev, phase: "hidden" }
      );
      return undefined;
    }

    const initial = isFirstLoad.current;
    const duration = initial
      ? Math.max(initialDuration, INTRO_DURATION)
      : routeDuration;

    let cancelled = false;
    const timers = [];
    const sleep = (ms) =>
      new Promise((resolve) => timers.push(window.setTimeout(resolve, ms)));

    // New key restarts the animations; a new route while exiting simply covers the page again
    // A route change starts a new timed transition overlay.
    setLoader((prev) => ({
      phase: "visible",
      initial,
      duration,
      key: prev.key + 1,
    }));

    (async () => {
      const minimum = sleep(duration);

      if (initial) {
        // Stay up at least `duration`, and until fonts/assets are ready (capped)
        await Promise.all([
          minimum,
          Promise.race([waitForPageReady(), sleep(MAX_INITIAL_WAIT)]),
        ]);
      } else {
        await minimum;
      }
      if (cancelled) return;

      setLoader((prev) => ({ ...prev, phase: "exiting" }));

      await sleep(initial ? EXIT_DURATION.initial : EXIT_DURATION.route);
      if (cancelled) return;

      isFirstLoad.current = false;
      setLoader((prev) => ({ ...prev, phase: "hidden" }));
    })();

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [pathname, initialDuration, routeDuration]);

  /* Block page scroll while the loader covers the screen */
  const covering = loader.phase !== "hidden";
  useEffect(() => {
    if (!covering) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [covering]);

  if (!covering) return null;

  const variant = loader.initial ? "initial" : "route";

  return (
    <div
      key={loader.key}
      className={[
        "boutique-loader",
        `boutique-loader--${variant}`,
        loader.phase === "exiting" ? "boutique-loader-exit" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        "--loader-duration": `${loader.duration}ms`,
        "--loader-exit": `${EXIT_DURATION[variant]}ms`,
      }}
      aria-hidden="true"
    >
      <div className="boutique-loader-content">
        <div className="boutique-loader-wordmark">
          {WORDMARK_LETTERS.map((letter, index) => (
            <span
              key={index}
              className="boutique-loader-letter"
              style={{ "--i": index }}
            >
              {letter === " " ? "\u00a0" : letter}
            </span>
          ))}
          <span
            className="boutique-loader-dot"
            style={{ "--i": WORDMARK_LETTERS.length }}
          >
            .
          </span>
        </div>

        <div className="boutique-loader-progress">
          <span />
        </div>

        <p>{CAPTION}</p>
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

import "../styling/common/scrollToTop.css";

const SHOW_AFTER = 350; // px scrolled before the button appears
const COMPLETE_AT = 99; // % scrolled at which the ring is considered "full"

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Element targeted by a URL hash like "#contact", if it exists */
function getHashTarget(hash) {
  if (!hash) return null;

  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null; // malformed percent-encoding
  }
}

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  const buttonRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [complete, setComplete] = useState(false);

  /* Scroll progress ring + visibility.
     Progress is written straight to a CSS variable (no re-render per scroll event);
     React state only changes when `visible` / `complete` actually flip. */
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const scrollTop = window.scrollY;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress =
        scrollable > 0
          ? Math.min(100, Math.max(0, (scrollTop / scrollable) * 100))
          : 0;

      buttonRef.current?.style.setProperty(
        "--scroll-progress",
        `${progress.toFixed(2)}%`
      );

      setVisible(scrollTop > SHOW_AFTER);
      setComplete(scrollable > 0 && progress >= COMPLETE_AT);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // Page height changes when content loads or the route changes
    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(schedule) : null;
    resizeObserver?.observe(document.body);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resizeObserver?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* New page -> start at the top, but respect #anchor links */
  useEffect(() => {
    const target = getHashTarget(hash);

    if (target) {
      target.scrollIntoView();
      return;
    }

    // "instant" so a site-wide `scroll-behavior: smooth` can't animate page changes
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "instant" : "smooth",
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={[
        "boutique-scroll-top",
        visible ? "visible" : "",
        complete ? "complete" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      aria-label="Scroll back to top"
      title="Back to top"
    >
      <span className="boutique-scroll-top-inner">
        <ArrowUp size={19} strokeWidth={1.8} aria-hidden="true" />
      </span>
    </button>
  );
}
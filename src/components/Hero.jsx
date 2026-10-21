import { useContent } from "../content/useContent";
import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calculator,
  FileText,
  MapPin,
  Receipt,
} from "lucide-react";

import "../styling/component/hero.css";

/* ---------- Content ---------- */

const DEFAULT_HERO = {
  eyebrow: "INDEPENDENT FINANCIAL & TAX ADVISORY",
  title: ["Clarity for every", "financial decision."],
  description:
    "Thoughtful tax, accounting, compliance and business advisory services — helping individuals and businesses navigate financial decisions with confidence.",
  primary: { label: "Explore our expertise", to: "/services" },
  secondary: { label: "Get in touch", to: "/contact" },
  location: "Based in Jaipur · Serving clients across India",
  approach: "Perspective. Precision. Progress.",
};

/*
  x / y  = position of the node inside the orbit (% of its box)
  line   = curve from the centre (50,50) to the node, in a 100x100 viewBox
*/
const SERVICES = [
  {
    number: "01",
    label: "Income Tax",
    short: "Income Tax",
    description: "Planning, returns and assessments",
    path: "/services/income-tax-advisory",
    icon: FileText,
    x: 22,
    y: 24,
    line: "M50 50 C 40 48, 28 40, 22 24",
  },
  {
    number: "02",
    label: "GST Services",
    short: "GST",
    description: "Registration, returns and compliance",
    path: "/services/gst-services",
    icon: Receipt,
    x: 76,
    y: 18,
    line: "M50 50 C 58 40, 70 34, 76 18",
  },
  {
    number: "03",
    label: "Accounting",
    short: "Accounting",
    description: "Bookkeeping and financial statements",
    path: "/services/accounting-bookkeeping",
    icon: Calculator,
    x: 80,
    y: 68,
    line: "M50 50 C 62 50, 74 56, 80 68",
  },
  {
    number: "04",
    label: "Business Registration",
    short: "Registration",
    description: "Company, LLP and proprietorship setup",
    path: "/services/business-registration",
    icon: Building2,
    x: 26,
    y: 80,
    line: "M50 50 C 44 62, 32 70, 26 80",
  },
];

const CYCLE_MS = 2800; // how long each service stays highlighted on its own

/* ---------- Helpers ---------- */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event) => setReduced(event.matches);

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/* ---------- Component ---------- */

export default function Hero() {
  const { settings } = useContent();
  const HERO = { ...DEFAULT_HERO, title: [settings.heroTitle, settings.heroAccent], description: settings.heroDescription, location: settings.location };
  const reducedMotion = usePrefersReducedMotion();
  const visualRef = useRef(null);

  const [hovered, setHovered] = useState(null); // tile the visitor points at / focuses
  const [cycle, setCycle] = useState(0); // service highlighted automatically

  /* Auto-spotlight: step through the services until the visitor interacts */
  useEffect(() => {
    if (reducedMotion || hovered !== null) return undefined;

    const id = window.setInterval(
      () => setCycle((current) => (current + 1) % SERVICES.length),
      CYCLE_MS
    );

    return () => window.clearInterval(id);
  }, [reducedMotion, hovered]);

  const auto = hovered === null && !reducedMotion;
  const active = hovered ?? (reducedMotion ? null : cycle);

  /* Pointer parallax + spotlight (mouse only; values are smoothed in CSS) */
  useEffect(() => {
    const node = visualRef.current;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    if (!node || reducedMotion || !finePointer) return undefined;

    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      node.style.setProperty("--px", x.toFixed(3));
      node.style.setProperty("--py", y.toFixed(3));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onMove = (event) => {
      const rect = node.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      schedule();
    };

    const onLeave = () => {
      x = 0;
      y = 0;
      schedule();
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);

    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  const lastLine = HERO.title.length - 1;
  const shownNumber = String((active ?? 0) + 1).padStart(2, "0");

  return (
    <section className="boutique-hero" aria-labelledby="hero-title">
      <div className="container boutique-hero-container">
        <div className="boutique-hero-main">
          {/* ---------- Copy ---------- */}
          <div className="boutique-hero-copy">
            <div className="boutique-hero-eyebrow">
              <span className="boutique-hero-eyebrow-line" aria-hidden="true" />
              <span>{HERO.eyebrow}</span>
            </div>

            <h1 id="hero-title" className="boutique-hero-title">
              {HERO.title.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 && " "}
                  <span className="boutique-hero-line">
                    <span
                      className="boutique-hero-line-inner"
                      style={{ "--i": index }}
                    >
                      {index === lastLine ? (
                        <em>
                          {line}
                          <svg
                            className="boutique-hero-underline"
                            viewBox="0 0 300 14"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path
                              d="M3 9 C 45 2, 80 13, 125 7 S 205 2, 250 8 S 288 11, 297 5"
                              pathLength="1"
                            />
                          </svg>
                        </em>
                      ) : (
                        line
                      )}
                    </span>
                  </span>
                </Fragment>
              ))}
            </h1>

            <p className="boutique-hero-description">{HERO.description}</p>

            <div className="boutique-hero-actions">
              <Link to={HERO.primary.to} className="boutique-hero-primary">
                <span>{HERO.primary.label}</span>
                <span className="boutique-hero-primary-chip" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              </Link>

              <Link to={HERO.secondary.to} className="boutique-hero-secondary">
                <span className="boutique-hero-secondary-label">
                  {HERO.secondary.label}
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <p className="boutique-hero-meta">
              <MapPin size={14} aria-hidden="true" />
              {HERO.location}
            </p>
          </div>

          {/* ---------- Visual: the service network (decorative) ---------- */}
          <div
            className="boutique-hero-visual"
            ref={visualRef}
            aria-hidden="true"
          >
            <div className="boutique-hero-visual-top">
              <span>RAHUL G & ASSOCIATES / ADVISORY</span>
              <span>{String(SERVICES.length).padStart(2, "0")} SERVICES</span>
            </div>

            <div className="boutique-hero-orbit">
              <div className="boutique-hero-rings">
                <span className="boutique-hero-ring ring-outer" />
                <span className="boutique-hero-ring ring-mid" />
                <span className="boutique-hero-ring ring-inner" />
              </div>

              <div className="boutique-hero-network">
                <svg
                  className="boutique-hero-lines"
                  viewBox="0 0 100 100"
                  focusable="false"
                >
                  {SERVICES.map((service, index) => (
                    <g
                      key={service.path}
                      className={active === index ? "is-active" : ""}
                      style={{ "--i": index }}
                    >
                      <path
                        className="line-base"
                        d={service.line}
                        pathLength="1"
                      />
                      <path
                        className="line-pulse"
                        d={service.line}
                        pathLength="1"
                      />
                    </g>
                  ))}
                </svg>

                <div className="boutique-hero-core">
                  RG<span>.</span>
                </div>

                {SERVICES.map((service, index) => {
                  const Icon = service.icon;

                  return (
                    <div
                      key={service.path}
                      className="boutique-hero-node-slot"
                      style={{ left: `${service.x}%`, top: `${service.y}%` }}
                    >
                      <span
                        className={`boutique-hero-node${
                          active === index ? " is-active" : ""
                        }`}
                        style={{ "--i": index }}
                      >
                        <span className="boutique-hero-node-icon">
                          <Icon size={13} strokeWidth={2} />
                        </span>
                        {service.short}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="boutique-hero-visual-bottom">
              <div>
                <span>OUR APPROACH</span>
                <p>{HERO.approach}</p>
              </div>

              <span className="boutique-hero-visual-index">
                {shownNumber} — {String(SERVICES.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* ---------- Service index (drives the visual above) ---------- */}
        <nav
          className={`boutique-hero-index${auto ? " is-auto" : ""}`}
          aria-label="Our services"
          style={{ "--cycle": `${CYCLE_MS}ms` }}
        >
          <ul role="list">
            {SERVICES.map((service, index) => (
              <li
                key={service.path}
                className={`boutique-hero-tile${
                  active === index ? " is-active" : ""
                }`}
                style={{ "--i": index }}
              >
                <Link
                  to={service.path}
                  onPointerEnter={() => setHovered(index)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                >
                  <span className="boutique-hero-tile-top">
                    <span className="boutique-hero-tile-number">
                      {service.number}
                    </span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                  <span className="boutique-hero-tile-name">{service.label}</span>
                  <span className="boutique-hero-tile-desc">
                    {service.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
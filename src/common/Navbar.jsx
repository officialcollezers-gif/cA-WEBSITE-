import { useContent } from "../content/useContent";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Landmark,
  ArrowUpRight,
  ChevronDown,
  X,
  Phone,
  ArrowRight,
} from "lucide-react";

import "../styling/common/navbar.css";

/* ---------- Static data ---------- */

const DEFAULT_BRAND = {
  name: "RAHUL G & ASSOCIATES",
  tagline: "ACCOUNTING • TAXATION • ADVISORY",
};




const DEFAULT_NAVIGATION = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "About Us",
    path: "/about",
  },
  {
    label: "Services",
    path: "/services",
    children: [
      {
        label: "Income Tax",
        path: "/services/income-tax-advisory",
      },
      {
        label: "GST Services",
        path: "/services/gst-services",
      },
      {
        label: "Accounting & Bookkeeping",
        path: "/services/accounting-bookkeeping",
      },
      {
        label: "Business Registration",
        path: "/services/business-registration",
      },
      {
        label: "Compliance Services",
        path: "/services/compliance-services",
      },
      {
        label: "Financial Advisory",
        path: "/services/financial-advisory",
      },
    ],
  },
  {
    label: "Blogs",
    path: "/blogs",
  },
  {
    label: "Contact",
    path: "/contact",
  },
];


/* Must match the max-width breakpoint in navbar.css */
const MOBILE_BREAKPOINT = 1050;
const SCROLL_THRESHOLD = 35;

const submenuId = (path) => `mobile-submenu-${path.replace(/\W+/g, "-").replace(/^-|-$/g, "")}`;

const isInSection = (pathname, path) =>
  pathname === path || pathname.startsWith(`${path}/`);

/* ---------- Component ---------- */

export default function Navbar() {
  const { settings, categories } = useContent();
  const BRAND = { ...DEFAULT_BRAND, name: settings.name };
  const PHONE = settings.phone;
  const NAVIGATION = useMemo(() => DEFAULT_NAVIGATION.map(item => item.path === "/services" ? { ...item, children: categories.map(c => ({ label: c.title, path: `/services/${c.slug}` })) } : item), [categories]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const { pathname } = useLocation();

  const progressRef = useRef(null);
  const drawerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const wasOpenRef = useRef(false);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setExpanded(null);
  }, []);

  const openMobile = useCallback(() => {
    // Pre-expand the section the visitor is currently in
    const current = NAVIGATION.find(
      (item) => item.children && isInSection(pathname, item.path)
    );
    setExpanded(current ? current.path : null);
    setMobileOpen(true);
  }, [pathname, NAVIGATION]);

  /* Scrolled state + scroll progress bar (rAF-throttled, no re-render for progress) */
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(y / max, 1) : 0;

      setScrolled(y > SCROLL_THRESHOLD);
      progressRef.current?.style.setProperty("--progress", progress.toFixed(4));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* Close drawer on route change */
  useEffect(() => {
    const frame = requestAnimationFrame(closeMobile);
    return () => cancelAnimationFrame(frame);
  }, [pathname, closeMobile]);

  /* Close drawer if the viewport grows to desktop size */
  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT + 1}px)`);
    const onChange = (event) => {
      if (event.matches) closeMobile();
    };

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [closeMobile]);

  /* Lock page scroll while the drawer is open (without layout shift) */
  useEffect(() => {
    if (!mobileOpen) return undefined;

    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [mobileOpen]);

  /* Keep the closed drawer out of the tab order / accessibility tree.
     Set via ref because the `inert` prop behaves differently in React 18 vs 19. */
  useEffect(() => {
    if (drawerRef.current) drawerRef.current.inert = !mobileOpen;
  }, [mobileOpen]);

  /* Focus management: move focus into the drawer, return it on close */
  useEffect(() => {
    if (mobileOpen) {
      wasOpenRef.current = true;
      closeButtonRef.current?.focus({ preventScroll: true });
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      menuButtonRef.current?.focus({ preventScroll: true });
    }
  }, [mobileOpen]);

  /* Keyboard: Escape closes drawer / dismisses dropdown, Tab is trapped in the drawer */
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        if (mobileOpen) {
          closeMobile();
        } else {
          const active = document.activeElement;
          if (active?.closest?.(".modern-nav-group")) active.blur();
        }
        return;
      }

      if (event.key !== "Tab" || !mobileOpen || !drawerRef.current) return;

      const focusable = [
        ...drawerRef.current.querySelectorAll("a[href], button:not([disabled])"),
      ].filter((el) => getComputedStyle(el).visibility !== "hidden");

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, closeMobile]);

  const toggleSection = (path) =>
    setExpanded((current) => (current === path ? null : path));

  return (
    <>
      <nav
        className={`modern-navbar${scrolled ? " is-scrolled" : ""}`}
        aria-label="Main navigation"
      >
        <div className="container modern-navbar-inner">
          <Link to="/" className="modern-brand" onClick={closeMobile}>
            <span className="modern-brand-icon">
              <Landmark size={25} strokeWidth={1.8} aria-hidden="true" />
            </span>

            <span className="modern-brand-text">
              <strong>{BRAND.name}</strong>
              <small>{BRAND.tagline}</small>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="modern-desktop-links">
            {NAVIGATION.map((item) => (
              <div className="modern-nav-group" key={item.path}>
                {/* NavLink adds the "active" class automatically (also for nested routes) */}
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className="modern-nav-link"
                  aria-haspopup={item.children ? "true" : undefined}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown
                      size={14}
                      className="modern-chevron"
                      aria-hidden="true"
                    />
                  )}
                </NavLink>

                {item.children && (
                  <div className="modern-dropdown">
                    <div className="modern-dropdown-heading">
                      <span>OUR SERVICES</span>
                      <p>Professional solutions for your needs</p>
                    </div>

                    {item.children.map((child, index) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className="modern-dropdown-link"
                        style={{ "--i": index }}
                      >
                        <span>{child.label}</span>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </NavLink>
                    ))}

                    <Link to="/services" className="modern-dropdown-all">
                      View All Services
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="modern-nav-actions">
            <Link to="/contact" className="modern-nav-cta">
              <span>Get Consultation</span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>

            <button
              ref={menuButtonRef}
              type="button"
              className={`modern-menu-button${mobileOpen ? " active" : ""}`}
              onClick={mobileOpen ? closeMobile : openMobile}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              aria-controls="modern-mobile-drawer"
            >
              <span className="modern-burger" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>

        {/* Scroll progress indicator */}
        <div ref={progressRef} className="modern-scroll-progress" aria-hidden="true" />
      </nav>

      {/* Mobile overlay */}
      <div
        className={`modern-mobile-overlay${mobileOpen ? " visible" : ""}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        ref={drawerRef}
        id="modern-mobile-drawer"
        className={`modern-mobile-drawer${mobileOpen ? " open" : ""}`}
        role="dialog"
        aria-modal={mobileOpen}
        aria-label="Mobile navigation"
      >
        <div className="modern-drawer-heading">
          <span>EXPLORE</span>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation"
          >
            <X size={21} aria-hidden="true" />
          </button>
        </div>

        <div className="modern-mobile-links">
          {NAVIGATION.map((item, index) => {
            const isOpen = expanded === item.path;

            return (
              <div
                key={item.path}
                className="modern-mobile-group"
                style={{ "--i": index }}
              >
                <div className="modern-mobile-row">
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    onClick={closeMobile}
                    className="modern-mobile-link"
                  >
                    {item.label}
                  </NavLink>

                  {item.children && (
                    <button
                      type="button"
                      className="modern-mobile-expand"
                      onClick={() => toggleSection(item.path)}
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label}`}
                      aria-expanded={isOpen}
                      aria-controls={submenuId(item.path)}
                    >
                      <ChevronDown size={18} aria-hidden="true" />
                    </button>
                  )}
                </div>

                {item.children && (
                  <div
                    id={submenuId(item.path)}
                    className={`modern-mobile-submenu${isOpen ? " open" : ""}`}
                  >
                    <div className="modern-mobile-submenu-inner">
                      <div className="modern-mobile-submenu-list">
                        {item.children.map((child) => (
                          <Link key={child.path} to={child.path} onClick={closeMobile}>
                            {child.label}
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="modern-mobile-bottom">
          <Link to="/contact" className="modern-mobile-cta" onClick={closeMobile}>
            Get Consultation
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>

          <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="modern-mobile-phone">
            <Phone size={17} aria-hidden="true" />
            {PHONE}
          </a>
        </div>
      </aside>
    </>
  );
}
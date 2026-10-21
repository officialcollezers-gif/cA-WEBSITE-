import { useContent } from "../content/useContent";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowUp,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import "../styling/common/footer.css";

/* ---------- Static data ---------- */

const DEFAULT_FOOTER_DATA = {
  logo: "RAHUL G & ASSOCIATES",
  company: "RAHUL G & ASSOCIATES",
  description:
    "Independent financial, taxation and business advisory services with a considered approach to every client relationship.",
  caption: "FINANCIAL CLARITY. CONSIDERED ADVICE.",
  signature: "BUILT ON TRUST. GUIDED BY CLARITY.",
  email: "hello@example.com",
  phone: "+91 98765 43210",
  location: "Jaipur, Rajasthan, India",
};

const EXPLORE_LINKS = [
  { label: "Home", path: "/" },
  { label: "Our Firm", path: "/about" },
  { label: "Our Expertise", path: "/services" },
  { label: "Categories", path: "/categories" },
  { label: "Insights", path: "/blogs" },
  { label: "Contact", path: "/contact" },
];



const LEGAL_LINKS = [
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms of Use", path: "/terms" },
];

/* ---------- Helpers ---------- */

/* Adds an "is-visible" flag once, the first time the element scrolls into view */
function useRevealOnce(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window));

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (!("IntersectionObserver" in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function scrollToTop() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
}

function FooterLinkList({ links }) {
  return (
    <ul>
      {links.map((link) => (
        <li key={link.path}>
          <Link to={link.path}>
            <span className="boutique-footer-link-label">{link.label}</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Component ---------- */

export default function Footer() {
  const { settings, categories } = useContent();
  const SERVICE_LINKS = categories.map(c => ({ label: c.title, path: `/services/${c.slug}` }));
  const FOOTER_DATA = { ...DEFAULT_FOOTER_DATA, ...settings, company: settings.name };
  const [footerRef, visible] = useRevealOnce();
  const year = new Date().getFullYear();

  const { logo, company, email, phone, location } = FOOTER_DATA;

  return (
    <footer
      ref={footerRef}
      className={`boutique-footer${visible ? " is-visible" : ""}`}
    >
      <div className="container">
        {/* Editorial CTA */}
        <div className="boutique-footer-cta">
          <div
            className="boutique-footer-eyebrow boutique-reveal"
            style={{ "--i": 0 }}
          >
            <span>HAVE SOMETHING IN MIND?</span>
            <span>LET'S TALK ABOUT IT</span>
          </div>

          <div
            className="boutique-footer-cta-content boutique-reveal"
            style={{ "--i": 1 }}
          >
            <h2>
              Let's make sense of
              <br />
              <em>your next move.</em>
            </h2>

            <Link to="/contact" className="boutique-footer-cta-button">
              <span>Start a conversation</span>
              <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Main footer */}
        <div className="boutique-footer-main">
          <div
            className="boutique-footer-brand boutique-reveal"
            style={{ "--i": 2 }}
          >
            <Link
              to="/"
              className="boutique-footer-logo"
              aria-label={`${company} home`}
            >
              {logo}
              <span aria-hidden="true">.</span>
            </Link>

            <p>{FOOTER_DATA.description}</p>

            <span className="boutique-footer-brand-caption">
              {FOOTER_DATA.caption}
            </span>
          </div>

          <nav
            className="boutique-footer-column boutique-reveal"
            style={{ "--i": 3 }}
            aria-labelledby="footer-explore"
          >
            <h3 id="footer-explore">Explore</h3>
            <FooterLinkList links={EXPLORE_LINKS} />
          </nav>

          <nav
            className="boutique-footer-column boutique-reveal"
            style={{ "--i": 4 }}
            aria-labelledby="footer-expertise"
          >
            <h3 id="footer-expertise">Expertise</h3>
            <FooterLinkList links={SERVICE_LINKS} />
          </nav>

          <div
            className="boutique-footer-column boutique-footer-contact boutique-reveal"
            style={{ "--i": 5 }}
          >
            <h3>Get in touch</h3>

            <address className="boutique-footer-contact-list">
              <a href={`mailto:${email}`}>
                <Mail size={16} aria-hidden="true" />
                <span>{email}</span>
              </a>

              <a href={`tel:${phone.replace(/\s/g, "")}`}>
                <Phone size={16} aria-hidden="true" />
                <span>{phone}</span>
              </a>

              <div className="boutique-footer-address">
                <MapPin size={16} aria-hidden="true" />
                <span>{location}</span>
              </div>
            </address>

            <Link to="/contact" className="boutique-footer-contact-link">
              Send an enquiry
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="boutique-footer-bottom boutique-reveal"
          style={{ "--i": 6 }}
        >
          <p>
            © {year} {company}. All rights reserved.
          </p>

          <nav className="boutique-footer-bottom-links" aria-label="Legal">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.path} to={link.path}>
                {link.label}
              </Link>
            ))}
          </nav>

          <span className="boutique-footer-signature">
            {FOOTER_DATA.signature}
          </span>

          <button
            type="button"
            className="boutique-footer-top"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <ArrowUp size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
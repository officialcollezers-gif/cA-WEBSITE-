import { useContent } from "../content/useContent";
import { useState } from "react";
import {
  Phone,
  Mail,
  Clock3,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Calculator,
  BriefcaseBusiness,
  Pause,
  Play,
} from "lucide-react";

import "../styling/common/header.css";

const HEADER_DATA = {
  label: "FINANCIAL EXPERTISE",
  phone: "+91 98765 43210",
  email: "hello@example.com",
  workingHours: "Mon - Sat: 10 AM - 6 PM",
  announcements: [
    { icon: Sparkles, text: "Smart Financial Solutions for Growing Businesses" },
    { icon: ShieldCheck, text: "Income Tax, GST & Regulatory Compliance" },
    { icon: Calculator, text: "Accounting, Bookkeeping & Tax Advisory" },
    { icon: BriefcaseBusiness, text: "Business Registration & Professional Support" },
  ],
};

/*
  The track holds two identical halves and slides left by exactly 50%,
  so the loop is seamless. Each half repeats the list so it is always
  wider than the ticker, even on large screens (no empty gap).
*/
const REPEATS_PER_HALF = 2;

const TICKER_ITEMS = Array.from(
  { length: REPEATS_PER_HALF },
  () => HEADER_DATA.announcements
).flat();

const TICKER_HALVES = [false, true]; // value = is this half decorative (aria-hidden)

function TickerHalf({ hidden }) {
  return (
    <div className="premium-ticker-group" aria-hidden={hidden || undefined}>
      {TICKER_ITEMS.map(({ icon: Icon, text }, index) => (
        <div className="premium-ticker-item" key={index}>
          <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
          <span>{text}</span>
          <span className="premium-ticker-separator" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

export default function Header() {
  // Hover / keyboard-focus pausing is handled in CSS (:hover, :focus-within).
  // State is only needed for the explicit pause button (WCAG 2.2.2).
  const [userPaused, setUserPaused] = useState(false);

  const { settings } = useContent();
  const { label, phone, email, workingHours } = { ...HEADER_DATA, ...settings };

  return (
    <header className="premium-header">
      <div className="premium-header-inner container">
        {/* Brand indicator */}
        <div className="premium-header-brand">
          <span className="premium-live-indicator" aria-hidden="true">
            <span className="premium-live-dot" />
          </span>
          <span className="premium-header-label">{label}</span>
        </div>

        {/* Animated announcement ticker */}
        <div
          className="premium-ticker"
          role="region"
          aria-label="Our professional services"
        >
          <div
            className={`premium-ticker-track${userPaused ? " is-paused" : ""}`}
          >
            {TICKER_HALVES.map((hidden) => (
              <TickerHalf key={String(hidden)} hidden={hidden} />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="premium-ticker-toggle"
          onClick={() => setUserPaused((prev) => !prev)}
          aria-pressed={userPaused}
          aria-label={userPaused ? "Play announcements" : "Pause announcements"}
        >
          {userPaused ? <Play size={12} /> : <Pause size={12} />}
        </button>

        {/* Contact information */}
        <div className="premium-header-actions">
          <div className="premium-header-hours">
            <Clock3 size={14} aria-hidden="true" />
            <span>{workingHours}</span>
          </div>

          <a
            className="premium-header-email"
            href={`mailto:${email}`}
            title={email}
            aria-label={`Email ${email}`}
          >
            <Mail size={16} aria-hidden="true" />
            <span>{email}</span>
          </a>

          <a
            className="premium-header-phone"
            href={`tel:${phone.replace(/\s/g, "")}`}
            aria-label={`Call ${phone}`}
          >
            <Phone size={14} aria-hidden="true" />
            <span>{phone}</span>
            <ArrowUpRight
              className="premium-header-phone-arrow"
              size={14}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
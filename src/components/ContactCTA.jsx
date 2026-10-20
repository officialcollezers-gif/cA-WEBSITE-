import { useContent } from "../content/useContent";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  MessageCircle,
  CalendarDays,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import "../styling/component/contactCTA.css";



const conversationPoints = [
  {
    icon: MessageCircle,
    text: "Tell us what you need help with",
  },
  {
    icon: CalendarDays,
    text: "Discuss the next steps for your requirements",
  },
  {
    icon: ShieldCheck,
    text: "Get clarity on the process and documentation",
  },
];

export default function ContactCTA() {
  const { settings } = useContent();
  const contactDetails = [
    { icon: Mail, label: 'Email us', value: settings.email, href: `mailto:${settings.email}` },
    { icon: Phone, label: 'Call us', value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, '')}` },
    { icon: MapPin, label: 'Our location', value: settings.location, href: null },
  ];
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window));

  // One staggered entrance, played once when the section scrolls into view
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`contact-cta ${visible ? "is-visible" : ""}`}
      aria-labelledby="contact-cta-title"
    >
      <div className="container contact-cta-container">
        <div className="contact-cta-main">
          <div className="contact-cta-eyebrow" data-reveal style={{ "--i": 0 }}>
            <span />
            <span>07 / Start a conversation</span>
          </div>

          <div className="contact-cta-copy">
            <h2 id="contact-cta-title" data-reveal style={{ "--i": 1 }}>
              Your next step
              <br />
              starts with a <em>conversation.</em>
            </h2>

            <p data-reveal style={{ "--i": 2 }}>
              Whether you need help with taxes, business compliance or
              accounting, let&apos;s understand your requirements and work out a
              practical way forward.
            </p>

            <Link
              to="/contact"
              className="contact-cta-primary"
              data-reveal
              style={{ "--i": 3 }}
            >
              <span>Discuss your requirements</span>
              <span className="contact-cta-primary-icon">
                <ArrowUpRight size={17} aria-hidden="true" />
              </span>
            </Link>
          </div>

          <div className="contact-cta-points">
            {conversationPoints.map((point, index) => {
              const Icon = point.icon;

              return (
                <div
                  className="contact-cta-point"
                  key={point.text}
                  data-reveal
                  style={{ "--i": 4 + index }}
                >
                  <span>
                    <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <p>{point.text}</p>
                </div>
              );
            })}
          </div>

          <div className="contact-cta-decoration" aria-hidden="true">
            <div className="contact-cta-orbit contact-cta-orbit-one" />
            <div className="contact-cta-orbit contact-cta-orbit-two" />
            <div className="contact-cta-orbit contact-cta-orbit-three" />
          </div>
        </div>

        <aside className="contact-cta-details">
          <div
            className="contact-cta-details-heading"
            data-reveal
            style={{ "--i": 2 }}
          >
            <span>Let&apos;s connect</span>
            <h3>A little clarity can go a long way.</h3>
            <p>
              Reach out with your query. We can discuss your situation and
              identify the appropriate next step.
            </p>
          </div>

          <div className="contact-cta-contact-list">
            {contactDetails.map((detail, index) => {
              const Icon = detail.icon;
              const content = (
                <>
                  <span className="contact-cta-contact-icon">
                    <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                  </span>

                  <span className="contact-cta-contact-copy">
                    <span>{detail.label}</span>
                    <strong>{detail.value}</strong>
                  </span>

                  {detail.href && (
                    <ArrowRight
                      className="contact-cta-contact-arrow"
                      size={16}
                      aria-hidden="true"
                    />
                  )}
                </>
              );

              return detail.href ? (
                <a
                  className="contact-cta-contact-item is-link"
                  href={detail.href}
                  key={detail.label}
                  data-reveal
                  style={{ "--i": 3 + index }}
                >
                  {content}
                </a>
              ) : (
                <div
                  className="contact-cta-contact-item"
                  key={detail.label}
                  data-reveal
                  style={{ "--i": 3 + index }}
                >
                  {content}
                </div>
              );
            })}
          </div>

          <div
            className="contact-cta-details-footer"
            data-reveal
            style={{ "--i": 6 }}
          >
            <span className="contact-cta-footer-mark">f.</span>
            <p>Professional guidance begins with understanding your needs.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
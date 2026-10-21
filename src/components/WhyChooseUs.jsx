import { useEffect, useRef, useState } from "react";
import {
  MessagesSquare,
  ClipboardCheck,
  MessageCircle,
  Handshake,
  ArrowUpRight,
} from "lucide-react";

import "../styling/component/whyChooseUs.css";

const reasons = [
  {
    number: "01",
    title: "Personal attention",
    description:
      "We start by understanding your financial requirements, business goals and current challenges.",
    icon: MessagesSquare,
  },
  {
    number: "02",
    title: "A structured process",
    description:
      "Keep your documents, compliance requirements and next steps organised through a clear process.",
    icon: ClipboardCheck,
  },
  {
    number: "03",
    title: "Clear communication",
    description:
      "Understand your financial obligations with straightforward explanations and practical guidance.",
    icon: MessageCircle,
  },
  {
    number: "04",
    title: "A long-term perspective",
    description:
      "Make informed financial decisions with your ongoing personal or business needs in mind.",
    icon: Handshake,
  },
];

export default function WhyChooseUs() {
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
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`why-choose-us ${visible ? "is-visible" : ""}`}
      aria-labelledby="why-choose-us-title"
    >
      <div className="container why-choose-us-container">
        <div className="why-choose-us-top" data-reveal style={{ "--i": 0 }}>
          <div className="why-choose-us-eyebrow">
            <span className="why-choose-us-eyebrow-line" />
            <span>05 / The RAHUL G & ASSOCIATES approach</span>
          </div>

          <span className="why-choose-us-note">
            Thoughtful advice. Clear direction.
          </span>
        </div>

        <div className="why-choose-us-intro">
          <div className="why-choose-us-heading">
            <h2 id="why-choose-us-title" data-reveal style={{ "--i": 1 }}>
              Good numbers.
              <br />
              <em>Clear decisions.</em>
            </h2>
          </div>

          <div
            className="why-choose-us-intro-copy"
            data-reveal
            style={{ "--i": 2 }}
          >
            <p>
              Financial support should make your next step clearer, not more
              complicated. Our approach focuses on understanding your needs and
              helping you navigate financial responsibilities with greater
              clarity.
            </p>
          </div>
        </div>

        <div className="why-choose-us-grid">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;

            return (
              <article
                className="why-choose-us-card"
                key={reason.number}
                data-reveal
                style={{ "--i": 3 + index }}
              >
                <div className="why-choose-us-card-top">
                  <span className="why-choose-us-icon">
                    <Icon size={21} strokeWidth={1.6} aria-hidden="true" />
                  </span>

                  <span className="why-choose-us-number">{reason.number}</span>
                </div>

                <h3>{reason.title}</h3>
                <p>{reason.description}</p>

                <span className="why-choose-us-card-rule" />
              </article>
            );
          })}
        </div>

        <div className="why-choose-us-bottom" data-reveal style={{ "--i": 7 }}>
          <p>
            Every financial situation is different. Start with a conversation
            about yours.
          </p>

          <a href="/contact" className="why-choose-us-link">
            <span>Let&apos;s talk</span>
            <span className="why-choose-us-link-icon">
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
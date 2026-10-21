import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ScanSearch, Compass, Handshake } from "lucide-react";

import "../styling/component/about.css";

const principles = [
  {
    number: "01",
    icon: ScanSearch,
    title: "Understand first",
    description:
      "Every individual and business has a different financial picture. We begin by understanding your needs before considering the next step."
  },
  {
    number: "02",
    icon: Compass,
    title: "Advise thoughtfully",
    description:
      "Taxation, accounting and compliance can be complex. Our aim is to make the important details clearer and more manageable."
  },
  {
    number: "03",
    icon: Handshake,
    title: "Build lasting trust",
    description:
      "Good advisory relationships rely on clear communication, careful work and a practical understanding of your priorities."
  }
];

export default function About() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window));

  // One orchestrated entrance, triggered once when the section scrolls into view
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
      className={`boutique-about ${visible ? "is-visible" : ""}`}
      aria-labelledby="about-title"
    >
      <div className="container boutique-about-container">
        <div className="boutique-about-heading" data-reveal style={{ "--i": 0 }}>
          <div className="boutique-about-label">
            <span className="boutique-about-label-line" />
            <span>02 / About RAHUL G & ASSOCIATES</span>
          </div>

          <p className="boutique-about-side-note">
            A considered approach to financial clarity.
          </p>
        </div>

        <div className="boutique-about-intro">
          <h2
            id="about-title"
            className="boutique-about-title"
            data-reveal
            style={{ "--i": 1 }}
          >
            Good advice starts with
            <br />
            <em>understanding.</em>
          </h2>

          <div
            className="boutique-about-intro-copy"
            data-reveal
            style={{ "--i": 2 }}
          >
            <p>
              Financial decisions deserve more than a checklist. They need
              context, careful thinking, and advice that makes sense for your
              circumstances.
            </p>

            <Link to="/about" className="boutique-about-link">
              <span>Discover our approach</span>
              <span className="boutique-about-link-icon">
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>

        <div className="boutique-about-principles">
          {principles.map((principle, index) => {
            const Icon = principle.icon;

            return (
              <article
                className="boutique-about-card"
                key={principle.number}
                data-reveal
                style={{ "--i": 3 + index }}
              >
                <div className="boutique-about-card-top">
                  <span className="boutique-about-number">
                    {principle.number}
                  </span>

                  <span className="boutique-about-icon-wrap">
                    <Icon
                      className="boutique-about-icon"
                      size={22}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <h3>{principle.title}</h3>
                <p>{principle.description}</p>

                <span className="boutique-about-card-rule" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
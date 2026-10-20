import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Quote,
  MessageSquareQuote,
} from "lucide-react";

import "../styling/component/testimonials.css";

const testimonials = [
  {
    quote:
      "Add an approved client testimonial here describing their experience with the firm's communication and service.",
    name: "Client name",
    role: "Client role or business type",
    initials: "CN",
  },
  {
    quote:
      "Add a genuine client review here about the support they received with their financial or compliance requirements.",
    name: "Client name",
    role: "Client role or business type",
    initials: "CN",
  },
  {
    quote:
      "Add an authorised client testimonial here highlighting a real experience working with the firm.",
    name: "Client name",
    role: "Client role or business type",
    initials: "CN",
  },
];

export default function Testimonials() {
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
      className={`testimonials-section ${visible ? "is-visible" : ""}`}
      aria-labelledby="testimonials-title"
    >
      <div className="container testimonials-container">
        <div className="testimonials-top" data-reveal style={{ "--i": 0 }}>
          <div className="testimonials-eyebrow">
            <span className="testimonials-eyebrow-line" />
            <span>06 / Client experiences</span>
          </div>

          <span className="testimonials-note">Relationships built on trust</span>
        </div>

        <div className="testimonials-intro">
          <div>
            <h2 id="testimonials-title" data-reveal style={{ "--i": 1 }}>
              Built on trust.
              <br />
              <em>Measured in clarity.</em>
            </h2>
          </div>

          <p data-reveal style={{ "--i": 2 }}>
            Every client relationship starts with understanding. We believe
            good financial guidance should leave you better informed about your
            next step.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <article
              className="testimonial-card"
              key={`${testimonial.role}-${index}`}
              data-reveal
              style={{ "--i": 3 + index }}
            >
              <span className="testimonial-quote-icon">
                <Quote size={20} strokeWidth={1.5} aria-hidden="true" />
              </span>

              <p className="testimonial-quote">“{testimonial.quote}”</p>

              <div className="testimonial-author">
                <div className="testimonial-avatar" aria-hidden="true">
                  {testimonial.initials}
                </div>

                <div className="testimonial-author-info">
                  <h3>{testimonial.name}</h3>
                  <p>{testimonial.role}</p>
                </div>
              </div>

              <span className="testimonial-card-rule" />
            </article>
          ))}
        </div>

        <div className="testimonials-bottom" data-reveal style={{ "--i": 6 }}>
          <div className="testimonials-disclaimer">
            <MessageSquareQuote size={17} strokeWidth={1.6} aria-hidden="true" />
            <p>
              Client feedback will be published here with permission from the
              respective clients.
            </p>
          </div>

          <div className="testimonials-controls" aria-hidden="true">
            <button type="button" tabIndex={-1} disabled>
              <ArrowLeft size={17} />
            </button>
            <button type="button" tabIndex={-1} disabled>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
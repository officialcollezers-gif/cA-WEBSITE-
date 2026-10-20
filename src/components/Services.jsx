import { useContent } from "../content/useContent";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";

import "../styling/component/services.css";



export default function Services() {
  const { categories: services } = useContent();
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
      { threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`boutique-services ${visible ? "is-visible" : ""}`}
      aria-labelledby="services-title"
    >
      <div className="container boutique-services-container">
        <div className="boutique-services-heading" data-reveal style={{ "--i": 0 }}>
          <div className="boutique-services-eyebrow">
            <span />
            <span>03 / Our expertise</span>
          </div>

          <span className="boutique-services-heading-note">
            Practical support. Considered advice.
          </span>
        </div>

        <div className="boutique-services-intro">
          <h2 id="services-title" data-reveal style={{ "--i": 1 }}>
            The right support for
            <br />
            <em>what comes next.</em>
          </h2>

          <div
            className="boutique-services-intro-copy"
            data-reveal
            style={{ "--i": 2 }}
          >
            <p>
              From everyday compliance to important business decisions,
              explore services designed to help you manage your financial
              responsibilities with clarity.
            </p>

            <Link to="/services" className="boutique-services-all-link">
              <span>View all services</span>
              <span className="boutique-services-all-icon">
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>

        <div className="boutique-services-grid">
          {services.map((service, index) => (
            <Link
              to={`/services/${service.slug}`}
              className="boutique-service-card"
              key={service.number}
              data-reveal
              style={{ "--i": 3 + index }}
            >
              <div className="boutique-service-image">
                <img src={service.image} alt={service.imageAlt} loading="lazy" />

                <span className="boutique-service-image-number">
                  {service.number}
                </span>

                <span className="boutique-service-card-arrow" aria-hidden="true">
                  <ArrowUpRight size={20} strokeWidth={1.6} />
                </span>
              </div>

              <div className="boutique-service-card-content">
                <span className="boutique-service-category">
                  {service.category}
                </span>

                <h3>{service.title}</h3>
                <p>{service.description}</p>

                <span className="boutique-service-card-link">
                  Explore service
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="boutique-services-bottom" data-reveal style={{ "--i": 7 }}>
          <span>Financial clarity starts with a conversation.</span>

          <Link to="/contact">
            Discuss your requirements
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
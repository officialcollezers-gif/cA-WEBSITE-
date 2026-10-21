import { useContent } from "../content/useContent";

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  ArrowRight,
  Calculator,
  Check,
  ShieldCheck,
  MessagesSquare,
  FileCheck2,
} from "lucide-react";

import "../styling/pages/services.css";

/* ==========================================
   SERVICES DATA
   ========================================== */



/* ==========================================
   OUR APPROACH DATA
   ========================================== */

const approach = [
  {
    number: "01",
    icon: MessagesSquare,
    title: "Understand",
    description:
      "We begin by discussing your requirements, priorities and current challenges.",
  },

  {
    number: "02",
    icon: FileCheck2,
    title: "Assess",
    description:
      "We review the relevant information and identify appropriate compliance or advisory needs.",
  },

  {
    number: "03",
    icon: ShieldCheck,
    title: "Assist",
    description:
      "We outline the scope of support and help you move forward with a structured plan.",
  },
];

/* ==========================================
   SCROLL REVEAL ANIMATION
   ========================================== */

function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;

    if (!root) return;

    root.classList.add("is-ready");

    const items = root.querySelectorAll(".sv-reveal");

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => {
        el.classList.add("is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    items.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return ref;
}

/* ==========================================
   ANIMATION HELPERS
   ========================================== */

const delay = (ms) => ({
  "--delay": `${ms}ms`,
});

const hideBrokenImage = (event) => {
  event.currentTarget.style.display = "none";
};

/* ==========================================
   SERVICES PAGE
   ========================================== */

export default function Services() {
  const { categories: services } = useContent();
  const pageRef = useReveal();

  return (
    <main className="services-page" ref={pageRef}>

      {/* ======================================
          HERO SECTION
      ====================================== */}

      <section className="services-page-hero">
        <div className="services-container">

          <div className="services-page-eyebrow">
            <span className="services-page-eyebrow-line" />
            What we do
          </div>

          <div className="services-page-hero-grid">

            <h1>
              Financial expertise.
              <br />
              <em>Practical solutions.</em>
            </h1>

            <div className="services-page-hero-right">

              <p>
                From everyday accounting to taxation and
                business compliance, we provide professional
                support designed around your requirements.
              </p>

              <a
                href="#services-list"
                className="services-page-text-link"
              >
                Explore our services
                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                />
              </a>

            </div>
          </div>
        </div>

        <div
          className="services-page-hero-decoration"
          aria-hidden="true"
        >
          Services
        </div>
      </section>

      {/* ======================================
          SERVICES SECTION
      ====================================== */}

      <section
        className="services-page-main"
        id="services-list"
      >
        <div className="services-container">

          <div className="services-page-section-heading sv-reveal">

            <div>
              <div className="services-page-section-label">
                <span className="services-page-label-dot" />
                Our expertise
              </div>

              <h2>
                Services built around
                <br />
                <em>your business needs.</em>
              </h2>
            </div>

            <p>
              Explore our core service areas and
              discover the specialised assistance
              available within each category.
            </p>

          </div>

          {/* SERVICES GRID */}

          <div className="services-page-grid">

            {services.map((service, index) => {
              const Icon = Calculator;

              const serviceUrl = `/services/${service.slug}`;

              return (
                <article
                  className="services-page-card sv-reveal"
                  key={service.slug}
                  style={delay((index % 3) * 110)}
                >

                  {/* CLICKABLE SERVICE IMAGE */}

                  <Link
                    to={serviceUrl}
                    className="services-page-card-image"
                    aria-label={`Explore ${service.title}`}
                  >
                    <img
                      src={service.image}
                      alt={service.imageAlt}
                      loading="lazy"
                      decoding="async"
                      onError={hideBrokenImage}
                    />
                  </Link>

                  {/* SERVICE CONTENT */}

                  <div className="services-page-card-body">

                    <div className="services-page-card-top">

                      <span className="services-page-card-category">
                        {service.category}
                      </span>

                      <div className="services-page-card-icon">
                        <Icon
                          size={19}
                          strokeWidth={1.6}
                          aria-hidden="true"
                        />
                      </div>

                    </div>

                    <h3>
                      <Link
                        to={serviceUrl}
                        className="services-page-card-title-link"
                      >
                        {service.title}
                      </Link>
                    </h3>

                    <p className="services-page-card-description">
                      {service.description}
                    </p>

                    {/* SERVICE HIGHLIGHTS */}

                    <ul className="services-page-card-features">

                      {(service.features || service.subServices.map(s => s.title).slice(0, 3)).map((feature) => (
                        <li key={feature}>

                          <Check
                            size={14}
                            strokeWidth={2}
                            aria-hidden="true"
                          />

                          <span>{feature}</span>

                        </li>
                      ))}

                    </ul>

                    {/* CATEGORY PAGE LINK */}

                    <Link
                      to={serviceUrl}
                      className="services-page-card-link"
                      aria-label={`View all ${service.title} sub-services`}
                    >
                      Explore Services

                      <ArrowUpRight
                        size={17}
                        aria-hidden="true"
                      />
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>
        </div>
      </section>

      {/* ======================================
          OUR APPROACH
      ====================================== */}

      <section className="services-page-approach">
        <div className="services-container">

          <div className="services-page-approach-layout">

            {/* APPROACH IMAGE */}

            <div className="services-page-approach-image sv-reveal">

              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80"
                alt="Professionals collaborating in an office"
                loading="lazy"
                decoding="async"
                onError={hideBrokenImage}
              />

              <div className="services-page-image-caption">

                <span>RAHUL G & ASSOCIATES</span>

                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                />

              </div>
            </div>

            {/* APPROACH CONTENT */}

            <div
              className="services-page-approach-content sv-reveal"
              style={delay(120)}
            >

              <span className="services-page-dark-kicker">
                Our approach
              </span>

              <h2>
                A clear process.
                <br />
                <em>Thoughtful guidance.</em>
              </h2>

              <p className="services-page-approach-intro">
                Every engagement begins with understanding
                your requirements and defining the right
                scope of assistance.
              </p>

              <div className="services-page-approach-steps">

                {approach.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div
                      className="services-page-approach-step"
                      key={step.number}
                    >

                      <span className="services-page-step-number">
                        {step.number}
                      </span>

                      <div className="services-page-step-copy">

                        <h3>{step.title}</h3>

                        <p>{step.description}</p>

                      </div>

                      <Icon
                        size={19}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />

                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================
          CONSULTATION CTA
      ====================================== */}

      <section className="services-page-cta">
        <div className="services-container">

          <div className="services-page-cta-inner sv-reveal">

            <div>

              <h2>
                Not sure where
                <br />
                <em>to begin?</em>
              </h2>

              <p>
                Tell us what you need. We can discuss
                the relevant services and possible next steps.
              </p>

            </div>

            <Link
              to="/contact"
              className="services-page-cta-button"
            >
              Get a consultation

              <ArrowUpRight
                size={18}
                aria-hidden="true"
              />
            </Link>

          </div>

          <div className="services-page-cta-bottom">

            <span>
              RAHUL G & ASSOCIATES · Accounting, taxation, advisory
            </span>

            <span>
              Professional support, clear direction

              <ArrowRight
                size={14}
                aria-hidden="true"
              />
            </span>

          </div>

        </div>
      </section>

    </main>
  );
}

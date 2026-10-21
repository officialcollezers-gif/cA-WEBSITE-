
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Calculator,
  ReceiptText,
  BookOpenCheck,
  Building2,
  ClipboardCheck,
  ChartNoAxesCombined,
  Check,
  ShieldCheck,
  MessageSquareText,
  FileCheck2,
} from "lucide-react";

import "../styling/pages/services.css";

const services = [
  {
    number: "01",
    icon: Calculator,
    category: "DIRECT TAXATION",
    title: "Income Tax Advisory",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Financial documents and calculator on an office desk",
    description:
      "Practical assistance with income tax compliance, return filing, tax planning and related advisory requirements.",
    features: [
      "Income tax return filing",
      "Tax planning and advisory",
      "TDS compliance assistance",
    ],
  },
  {
    number: "02",
    icon: ReceiptText,
    category: "INDIRECT TAXATION",
    title: "GST Services",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Professional reviewing business financial paperwork",
    description:
      "Support for GST registration, return filing, reconciliation and ongoing compliance for businesses.",
    features: [
      "GST registration",
      "GST returns and reconciliation",
      "Compliance advisory",
    ],
  },
  {
    number: "03",
    icon: BookOpenCheck,
    category: "FINANCIAL RECORDS",
    title: "Accounting & Bookkeeping",
    image:
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Accounting paperwork and financial calculations",
    description:
      "Organised accounting support to help businesses maintain reliable records and better financial visibility.",
    features: [
      "Bookkeeping assistance",
      "Financial statement preparation",
      "Accounting process support",
    ],
  },
  {
    number: "04",
    icon: Building2,
    category: "BUSINESS SETUP",
    title: "Business Registration",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Modern professional business office",
    description:
      "Guidance on selecting an appropriate business structure and completing applicable registration formalities.",
    features: [
      "Business structure guidance",
      "Registration documentation",
      "Startup compliance support",
    ],
  },
  {
    number: "05",
    icon: ClipboardCheck,
    category: "REGULATORY SUPPORT",
    title: "Compliance Services",
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Organised professional workspace for business planning",
    description:
      "Structured assistance with recurring filings, documentation and applicable business compliance requirements.",
    features: [
      "Compliance planning",
      "Documentation support",
      "Periodic filing assistance",
    ],
  },
  {
    number: "06",
    icon: ChartNoAxesCombined,
    category: "BUSINESS ADVISORY",
    title: "Financial Advisory",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Financial analytics and business performance charts",
    description:
      "Financial insight and practical advisory support to help businesses assess decisions with greater clarity.",
    features: [
      "Financial performance review",
      "Cash flow planning",
      "Business decision support",
    ],
  },
];

const approach = [
  {
    number: "01",
    icon: MessageSquareText,
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

export default function Services() {
  return (
    <main className="services-page">
      {/* HERO */}
      <section className="services-page-hero">
        <div className="container">
          <div className="services-page-eyebrow">
            <span className="services-page-eyebrow-line" />
            WHAT WE DO

            <span className="services-page-eyebrow-number">
              01 / SERVICES
            </span>
          </div>

          <div className="services-page-hero-grid">
            <div className="services-page-hero-content">
              <h1>
                Financial expertise.
                <br />
                <em>Practical solutions.</em>
              </h1>
            </div>

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
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </div>

        <div
          className="services-page-hero-decoration"
          aria-hidden="true"
        >
          SERVICES
        </div>
      </section>

      {/* SERVICES */}
      <section
        className="services-page-main"
        id="services-list"
      >
        <div className="container">
          <div className="services-page-section-heading">
            <div>
              <div className="services-page-section-label">
                <span className="services-page-label-dot" />
                OUR EXPERTISE
              </div>

              <h2>
                Services built around
                <br />
                <em>your business needs.</em>
              </h2>
            </div>

            <p>
              Explore our core service areas and connect
              with us to discuss the assistance that
              best suits your situation.
            </p>
          </div>

          <div className="services-page-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  className="services-page-card"
                  key={service.number}
                >
                  <div className="services-page-card-image">
                    <img
                      src={service.image}
                      alt={service.imageAlt}
                      loading="lazy"
                      decoding="async"
                    />

                    <span className="services-page-image-number">
                      {service.number} / 06
                    </span>
                  </div>

                  <div className="services-page-card-body">
                    <div className="services-page-card-top">
                      <span className="services-page-card-category">
                        {service.category}
                      </span>

                      <div className="services-page-card-icon">
                        <Icon size={19} strokeWidth={1.6} />
                      </div>
                    </div>

                    <h3>{service.title}</h3>

                    <p className="services-page-card-description">
                      {service.description}
                    </p>

                    <ul className="services-page-card-features">
                      {service.features.map((feature) => (
                        <li key={feature}>
                          <Check size={14} strokeWidth={2} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/contact"
                      className="services-page-card-link"
                      aria-label={`Enquire about ${service.title}`}
                    >
                      Discuss this service
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* EDITORIAL APPROACH */}
      <section className="services-page-approach">
        <div className="container">
          <div className="services-page-approach-layout">
            <div className="services-page-approach-image">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85"
                alt="Professionals collaborating around a meeting table"
                loading="lazy"
                decoding="async"
              />

              <div className="services-page-image-caption">
                <span>RAHUL G & ASSOCIATES / ADVISORY</span>
                <ArrowUpRight size={17} />
              </div>
            </div>

            <div className="services-page-approach-content">
              <span className="services-page-dark-kicker">
                OUR APPROACH
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

                      <Icon size={19} strokeWidth={1.5} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="services-page-cta">
        <div className="container">
          <div className="services-page-cta-inner">
            <div>
              <span className="services-page-section-label">
                LET'S CONNECT
              </span>

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
              Get Consultation
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="services-page-cta-bottom">
            <span>
              RAHUL G & ASSOCIATES / ACCOUNTING • TAXATION • ADVISORY
            </span>

            <span>
              PROFESSIONAL SUPPORT, CLEAR DIRECTION
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

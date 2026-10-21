import RichContent from "../content/RichContent";
import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileText,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

import { useContent } from "../content/useContent";
import ServiceEnquiryForm from "../components/services/ServiceEnquiryForm";

import "../styling/pages/sub-service-details.css";

/*
  These details are editorial defaults.
  Add service-specific content to servicesData.js
  to customise individual sub-service pages.
*/

const defaultProcess = [
  {
    title: "Initial consultation",
    description:
      "We discuss your requirements, understand your situation and identify the scope of assistance.",
  },
  {
    title: "Information review",
    description:
      "We review the relevant information and documentation provided by you.",
  },
  {
    title: "Professional assistance",
    description:
      "We assist with the agreed service based on the applicable requirements.",
  },
  {
    title: "Review and next steps",
    description:
      "We explain the outcome, any pending actions and relevant follow-up requirements.",
  },
];

const defaultFaqs = [
  {
    question: "How do I get started?",
    answer:
      "Submit the enquiry form with your contact details and a brief description of your requirements. We can then discuss the scope of assistance.",
  },
  {
    question: "What documents will I need?",
    answer:
      "The required documents depend on the service and your circumstances. We will explain the relevant requirements after an initial review.",
  },
  {
    question: "How long does the process take?",
    answer:
      "Timelines vary depending on the service, document readiness, applicable rules and processing by relevant authorities.",
  },
  {
    question: "How are professional fees determined?",
    answer:
      "Fees depend on the scope, complexity and work involved. The applicable fees can be discussed before engagement.",
  },
  {
    question: "Can I receive assistance remotely?",
    answer:
      "Many advisory and documentation activities can be coordinated remotely, subject to the service requirements.",
  },
];

/* Content is visible by default. "is-ready" is only added once JS is running,
   so the reveal animation can never leave the page blank. Re-runs when the
   route changes so newly rendered elements get observed too. */
function useReveal(routeKey) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    root.classList.add("is-ready");
    const items = root.querySelectorAll(".ssd-reveal:not(.is-visible)");

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [routeKey]);

  return ref;
}

const delay = (ms) => ({ "--delay": `${ms}ms` });

export default function SubServiceDetails() {
  const { categories: servicesData, loading } = useContent();
  const getServiceCategory = slug => servicesData.find(c => c.slug === slug);
  const getSubService = (category, slug) => getServiceCategory(category)?.subServices.find(s => s.slug === slug);

  const { categorySlug, serviceSlug } = useParams();

  const category = getServiceCategory(categorySlug);
  const service = getSubService(categorySlug, serviceSlug);
  const pageRef = useReveal(`${categorySlug}/${serviceSlug}`);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug, serviceSlug]);

  useEffect(() => {
    if (!category || !service) return;
    document.title = `${service.title} | ${category.title} | RAHUL G & ASSOCIATES`;
  }, [category, service]);

  if (loading) return <main className="cms-page">Loading service…</main>;

  if (!category || !service) {
    return (
      <main className="ssd-not-found">
        <div className="ssd-container">
          <span className="ssd-eyebrow">Not found</span>
          <h1>Service not found.</h1>
          <p>
            The service you are looking for may have been moved or is currently
            unavailable.
          </p>
          <Link to="/services">
            <ArrowLeft size={17} aria-hidden="true" />
            Back to services
          </Link>
        </div>
      </main>
    );
  }

  const process = service.process || defaultProcess;
  const faqs = service.faqs || defaultFaqs;

  const inclusions = service.inclusions || [
    "Initial requirement assessment",
    "Guidance on applicable procedures",
    "Review of relevant information",
    "Documentation assistance",
    "Support with the agreed scope of work",
    "Guidance on relevant next steps",
  ];

  const documents = service.documents || [
    "Basic contact and identification information, as applicable",
    "Relevant existing records or documents",
    "Information specific to your requirements",
    "Additional documents identified during consultation",
  ];

  const relatedServices = category.subServices
    .filter((item) => item.slug !== service.slug)
    .slice(0, 3);

  return (
    <main className="ssd-page" ref={pageRef}>
      {/* HERO */}
      <section className="ssd-hero">
        <div className="ssd-container">
          <nav className="ssd-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <Link to="/services">Services</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <Link to={`/services/${category.slug}`}>{category.title}</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page">{service.title}</span>
          </nav>

          <div className="ssd-hero-grid">
            <div className="ssd-hero-copy">
              <span className="ssd-eyebrow">
                <span className="ssd-dot" />
                {category.category}
              </span>

              <h1>{service.title}</h1>
              <p className="ssd-hero-lead">{service.description}</p>

              <div className="ssd-hero-actions">
                <a href="#enquiry-form" className="ssd-primary-button">
                  Enquire now
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>

                <a href="#service-overview" className="ssd-text-button">
                  Explore details
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>

              <div className="ssd-hero-note">
                <ShieldCheck size={17} aria-hidden="true" />
                <span>Professional assistance tailored to your requirements</span>
              </div>
            </div>

            <div className="ssd-hero-visual">
              <img
                key={service.slug}
                src={service.image || category.image}
                alt={service.imageAlt || `${service.title} professional advisory`}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = category.image;
                }}
              />

              <div className="ssd-hero-image-caption">
                <span>{service.title}</span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="ssd-overview" id="service-overview">
        <div className="ssd-container">
          <div className="ssd-overview-grid">
            <div className="ssd-overview-heading ssd-reveal">
              <span className="ssd-eyebrow">
                <span className="ssd-dot" />
                Service overview
              </span>
              <h2>
                Understand the
                <br />
                <em>service.</em>
              </h2>
            </div>

            <div className="ssd-overview-content ssd-reveal" style={delay(120)}>
              <h3>
                Professional assistance with {service.title.toLowerCase()}.
              </h3>

              <p>{service.overview || service.description}</p>
              <RichContent html={service.contentHtml} />

              <p>
                Our approach starts with understanding your circumstances,
                reviewing the relevant requirements and defining an appropriate
                scope of work. We aim to make the process clear and organised.
              </p>

              <a href="#enquiry-form" className="ssd-inline-link">
                Discuss your requirements
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* INCLUSIONS */}
      <section className="ssd-inclusions">
        <div className="ssd-container">
          <div className="ssd-section-heading ssd-reveal">
            <div>
              <span className="ssd-eyebrow">
                <span className="ssd-dot" />
                What's included
              </span>
              <h2>
                How we can
                <br />
                <em>assist you.</em>
              </h2>
            </div>

            <p>
              The exact scope of assistance will depend on your requirements and
              the agreed engagement.
            </p>
          </div>

          <div className="ssd-inclusions-grid">
            {inclusions.map((item, index) => (
              <div
                className="ssd-inclusion-item ssd-reveal"
                key={item}
                style={delay((index % 3) * 100)}
              >
                <div className="ssd-inclusion-icon">
                  <Check size={18} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCUMENTS */}
      <section className="ssd-documents">
        <div className="ssd-container">
          <div className="ssd-documents-layout">
            <div className="ssd-documents-intro ssd-reveal">
              <span className="ssd-eyebrow">
                <span className="ssd-dot" />
                Getting prepared
              </span>

              <h2>
                Information &amp;
                <br />
                <em>documentation.</em>
              </h2>

              <p>
                Requirements vary by service. The following provides an initial
                guide to the information that may be relevant.
              </p>

              <div className="ssd-documents-symbol" aria-hidden="true">
                <FileText size={40} strokeWidth={1.2} />
              </div>
            </div>

            <div className="ssd-documents-list ssd-reveal" style={delay(120)}>
              {documents.map((document) => (
                <div className="ssd-document-row" key={document}>
                  <ClipboardCheck size={19} strokeWidth={1.5} aria-hidden="true" />
                  <p>{document}</p>
                </div>
              ))}

              <p className="ssd-documents-disclaimer">
                This is an indicative list, not a complete document checklist.
                We will confirm the applicable requirements during consultation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS (numbers stay: these steps happen in order) */}
      <section className="ssd-process">
        <div className="ssd-container">
          <div className="ssd-section-heading ssd-reveal">
            <div>
              <span className="ssd-eyebrow">
                <span className="ssd-dot" />
                Our process
              </span>

              <h2>
                A simple, structured
                <br />
                <em>approach.</em>
              </h2>
            </div>

            <p>
              From the initial discussion to the agreed deliverables, we focus
              on clear communication.
            </p>
          </div>

          <div className="ssd-process-grid">
            {process.map((step, index) => (
              <div
                className="ssd-process-card ssd-reveal"
                key={step.title}
                style={delay(index * 110)}
              >
                <span className="ssd-process-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="ssd-process-card-bottom">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ssd-faq">
        <div className="ssd-container">
          <div className="ssd-faq-layout">
            <div className="ssd-faq-heading ssd-reveal">
              <span className="ssd-eyebrow">
                <span className="ssd-dot" />
                Frequently asked questions
              </span>

              <h2>
                Questions,
                <br />
                <em>answered.</em>
              </h2>

              <p>Some common questions about getting started with this service.</p>
            </div>

            <div className="ssd-faq-list ssd-reveal" style={delay(120)}>
              {faqs.map((faq) => (
                <details className="ssd-faq-item" key={faq.question}>
                  <summary>
                    <span>{faq.question}</span>
                    <span className="ssd-faq-toggle" aria-hidden="true">+</span>
                  </summary>

                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ENQUIRY */}
      <section className="ssd-enquiry-section">
        <div className="ssd-container">
          <div className="ssd-enquiry-layout">
            <div className="ssd-enquiry-copy ssd-reveal">
              <span className="ssd-eyebrow">
                <span className="ssd-dot" />
                Start a conversation
              </span>

              <h2>
                Let's discuss
                <br />
                <em>your requirements.</em>
              </h2>

              <p>
                Interested in {service.title.toLowerCase()}? Share a few details
                and we can discuss how to move forward.
              </p>

              <div className="ssd-enquiry-points">
                <div>
                  <MessageSquareText size={20} aria-hidden="true" />
                  <span>Clear initial communication</span>
                </div>
                <div>
                  <ClipboardCheck size={20} aria-hidden="true" />
                  <span>Requirement-focused discussion</span>
                </div>
                <div>
                  <ShieldCheck size={20} aria-hidden="true" />
                  <span>Professional guidance</span>
                </div>
              </div>
            </div>

            <div className="ssd-enquiry-form-wrap ssd-reveal" style={delay(120)}>
              <ServiceEnquiryForm category={category} service={service} />
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      {relatedServices.length > 0 && (
        <section className="ssd-related">
          <div className="ssd-container">
            <div className="ssd-related-heading ssd-reveal">
              <div>
                <span className="ssd-eyebrow">
                  <span className="ssd-dot" />
                  Explore more
                </span>
                <h2>Related services.</h2>
              </div>

              <Link to={`/services/${category.slug}`}>
                View all
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <div className="ssd-related-grid">
              {relatedServices.map((item, index) => (
                <Link
                  to={`/services/${category.slug}/${item.slug}`}
                  className="ssd-related-card ssd-reveal"
                  style={delay(index * 110)}
                  key={item.slug}
                >
                  <span>{category.category}</span>
                  <h3>{item.title}</h3>
                  <ArrowUpRight size={20} aria-hidden="true" />
                </Link>
              ))}
            </div>

            <Link to={`/services/${category.slug}`} className="ssd-back-link">
              <ArrowLeft size={16} aria-hidden="true" />
              Back to {category.title}
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
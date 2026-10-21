import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Building2,
  Calculator,
  ReceiptText,
  ClipboardCheck,
  ShieldCheck,
  ChartNoAxesCombined,
  ChevronRight,
} from "lucide-react";

import { useContent } from "../content/useContent";

import "../styling/pages/service-category.css";

const iconMap = {
  "file-text": FileText,
  building: Building2,
  "building-2": Building2,
  calculator: Calculator,
  receipt: ReceiptText,
  "receipt-text": ReceiptText,
  clipboard: ClipboardCheck,
  "clipboard-check": ClipboardCheck,
  shield: ShieldCheck,
  "shield-check": ShieldCheck,
  chart: ChartNoAxesCombined,
  "chart-no-axes-combined": ChartNoAxesCombined,
};

const commitments = [
  "Requirement-focused assistance",
  "Clear communication",
  "Organised documentation",
  "Practical professional guidance",
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
    const items = root.querySelectorAll(".sc-reveal:not(.is-visible)");

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

export default function ServiceCategory() {
  const { categories: servicesData, loading } = useContent();
  const getServiceCategory = slug => servicesData.find(c => c.slug === slug);

  const { categorySlug } = useParams();
  const category = getServiceCategory(categorySlug);
  const pageRef = useReveal(categorySlug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug]);

  useEffect(() => {
    if (category) document.title = `${category.title} | RAHUL G & ASSOCIATES`;
  }, [category]);

  if (loading) return <main className="cms-page">Loading services…</main>;

  if (!category) {
    return (
      <main className="service-category-not-found">
        <div className="sc-container">
          <span className="service-category-kicker">Service unavailable</span>
          <h1>Service not found</h1>
          <p>The requested service category could not be found.</p>
          <Link to="/services">
            <ArrowLeft size={17} aria-hidden="true" />
            Back to all services
          </Link>
        </div>
      </main>
    );
  }

  const otherServices = servicesData.filter(
    (service) => service.slug !== category.slug
  );

  return (
    <main className="service-category-page" ref={pageRef}>
      {/* HERO */}
      <section className="service-category-hero">
        <div className="sc-container">
          <nav className="service-category-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <Link to="/services">Services</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page">{category.title}</span>
          </nav>

          <div className="service-category-hero-grid">
            <div className="service-category-hero-content">
              <span className="service-category-kicker">
                <span className="service-category-dot" />
                {category.category}
              </span>

              <h1>{category.title}</h1>
              <p className="service-category-subtitle">{category.subtitle}</p>
              <p className="service-category-lead">{category.description}</p>

              <div className="service-category-hero-actions">
                <a href="#sub-services" className="service-category-primary-button">
                  Explore services
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>

                <Link to="/contact" className="service-category-secondary-link">
                  Talk to an advisor
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="service-category-hero-note">
                <Check size={15} aria-hidden="true" />
                <span>
                  Practical guidance for your business and financial requirements
                </span>
              </div>
            </div>

            <div className="service-category-hero-image">
              <img
                src={category.image}
                alt={`${category.title} advisory services`}
                loading="eager"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <div className="service-category-image-overlay">
                <span>RAHUL G & ASSOCIATES</span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUB-SERVICES */}
      <section className="service-category-services" id="sub-services">
        <div className="sc-container">
          <div className="service-category-section-heading sc-reveal">
            <div>
              <span className="service-category-kicker">
                <span className="service-category-dot" />
                What we offer
              </span>

              <h2>
                Explore our
                <br />
                <em>specialised services.</em>
              </h2>
            </div>

            <p>
              Choose the service that best matches your requirements. Explore
              its details, documents, process and dedicated enquiry form.
            </p>
          </div>

          <div className="service-category-services-grid">
            {category.subServices.map((service, index) => {
              const Icon = iconMap[service.icon] || FileText;

              return (
                <Link
                  key={service.slug}
                  to={`/services/${category.slug}/${service.slug}`}
                  className="service-category-service-card sc-reveal"
                  style={delay((index % 3) * 110)}
                  aria-label={`View ${service.title} details`}
                >
                  <div className="service-category-card-image">
                    <img
                      src={service.image || category.image}
                      alt={service.imageAlt || `${service.title} service`}
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = category.image;
                      }}
                    />
                  </div>

                  <div className="service-category-card-content">
                    <div className="service-category-card-top">
                      <span>{category.category}</span>
                      <div className="service-category-card-icon">
                        <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
                      </div>
                    </div>

                    <h3>{service.title}</h3>
                    <p>{service.description}</p>

                    <div className="service-category-card-footer">
                      <span>View service details</span>
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <Link to="/services" className="service-category-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Explore all service categories
          </Link>
        </div>
      </section>

      {/* COMMITMENT */}
      <section className="service-category-benefits">
        <div className="sc-container">
          <div className="service-category-benefits-grid">
            <div className="service-category-benefits-content sc-reveal">
              <span className="service-category-benefits-kicker">
                Our commitment
              </span>

              <h2>
                Professional support.
                <br />
                <em>Personal attention.</em>
              </h2>

              <p>
                We focus on understanding your requirements, explaining the
                relevant process and delivering structured professional
                assistance.
              </p>
            </div>

            <div className="service-category-benefits-list sc-reveal" style={delay(120)}>
              {commitments.map((item) => (
                <div className="service-category-benefit-item" key={item}>
                  <span className="service-category-benefit-icon">
                    <Check size={17} aria-hidden="true" />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RELATED CATEGORIES */}
      {otherServices.length > 0 && (
        <section className="service-category-related">
          <div className="sc-container">
            <div className="service-category-related-heading sc-reveal">
              <div>
                <span className="service-category-kicker">
                  <span className="service-category-dot" />
                  More expertise
                </span>

                <h2>
                  Explore other <em>services.</em>
                </h2>
              </div>

              <Link to="/services" className="service-category-related-all">
                View all services
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="service-category-related-grid">
              {otherServices.slice(0, 3).map((service, index) => (
                <Link
                  key={service.slug}
                  to={`/services/${service.slug}`}
                  className="service-category-related-card sc-reveal"
                  style={delay(index * 110)}
                >
                  <span>{service.category}</span>
                  <h3>{service.title}</h3>
                  <ArrowUpRight size={19} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="service-category-cta">
        <div className="sc-container">
          <div className="service-category-cta-inner sc-reveal">
            <div>
              <h2>
                Need help choosing
                <br />
                <em>the right service?</em>
              </h2>

              <p>
                Share your requirements and we can discuss the appropriate next
                steps.
              </p>
            </div>

            <Link to="/contact" className="service-category-cta-button">
              Get a consultation
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
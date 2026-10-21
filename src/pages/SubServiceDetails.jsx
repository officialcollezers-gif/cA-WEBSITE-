import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import RichContent from "../content/RichContent";
import { useContent } from "../content/useContent";
import "../styling/pages/sub-service-details.css";

export default function SubServiceDetails() {
  const { categories, loading } = useContent();
  const { categorySlug, serviceSlug } = useParams();
  const category = categories.find((item) => item.slug === categorySlug);
  const service = category?.subServices.find((item) => item.slug === serviceSlug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug, serviceSlug]);

  useEffect(() => {
    if (category && service)
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

  return (
    <main className="ssd-page ssd-html-page">
      <header className="ssd-html-header">
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
          <h1>{service.title}</h1>
        </div>
      </header>
      {service.contentHtml && (
        <section className="ssd-html-body" aria-label={`${service.title} details`}>
          <div className="ssd-container">
            <div className="ssd-service-article">
              <RichContent html={service.contentHtml} />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

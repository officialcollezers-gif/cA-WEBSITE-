import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  X,
  CalendarDays,
  Clock3,
} from "lucide-react";

import { useContent } from "../content/useContent";

import "../styling/pages/blogs.css";

const ALL = "All Articles";

function formatDate(date) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// If a photo fails to load, hide it and let the tinted background show.
const hideBrokenImage = (event) => {
  event.currentTarget.style.display = "none";
};

/* Content is visible by default. "is-ready" is only added once JS is running,
   so the reveal animation can never leave the page blank. Only the static
   sections use this; article cards animate on mount with CSS instead, so
   filtering never leaves a card hidden. */
function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    root.classList.add("is-ready");
    const items = root.querySelectorAll(".bl-reveal");

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
  }, []);

  return ref;
}

export default function Blogs() {
  const { blogs: blogsData } = useContent();
  const blogCategories = [ALL, ...new Set(blogsData.map(b => b.category))];
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [search, setSearch] = useState("");
  const pageRef = useReveal();

  const featuredBlog = blogsData.find((blog) => blog.featured) || blogsData[0];

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return blogsData.filter((blog) => {
      const matchesCategory =
        activeCategory === ALL || blog.category === activeCategory;

      const matchesSearch =
        !query ||
        blog.title?.toLowerCase().includes(query) ||
        blog.excerpt?.toLowerCase().includes(query) ||
        blog.category?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, blogsData]);

  const clearFilters = () => {
    setSearch("");
    setActiveCategory(ALL);
  };

  const hasFilters = search.trim() !== "" || activeCategory !== ALL;

  return (
    <main className="blogs-page" ref={pageRef}>
      {/* HERO */}
      <section className="blogs-hero">
        <div className="blogs-container">
          <span className="blogs-kicker">
            <span className="blogs-dot" />
            Insights &amp; knowledge
          </span>

          <h1>
            Financial clarity.
            <br />
            <em>Thoughtful insights.</em>
          </h1>

          <p>
            Explore practical articles on taxation, accounting, business
            compliance and financial management.
          </p>
        </div>

        <div className="blogs-hero-decoration" aria-hidden="true">
          Journal
        </div>
      </section>

      {/* FEATURED */}
      {featuredBlog && (
        <section className="blogs-featured">
          <div className="blogs-container">
            <div className="blogs-section-top bl-reveal">
              <span className="blogs-kicker">
                <span className="blogs-dot" />
                Editor's pick
              </span>
            </div>

            <Link
              to={`/blogs/${featuredBlog.slug}`}
              className="blogs-featured-card bl-reveal"
              style={{ "--delay": "100ms" }}
            >
              <div className="blogs-featured-image">
                <img
                  src={featuredBlog.image}
                  alt={featuredBlog.title}
                  decoding="async"
                  onError={hideBrokenImage}
                />
              </div>

              <div className="blogs-featured-content">
                <span className="blogs-category">{featuredBlog.category}</span>

                <h2>{featuredBlog.title}</h2>
                <p>{featuredBlog.excerpt}</p>

                <div className="blogs-meta">
                  {formatDate(featuredBlog.date) && (
                    <span>
                      <CalendarDays size={14} aria-hidden="true" />
                      {formatDate(featuredBlog.date)}
                    </span>
                  )}

                  {featuredBlog.readTime && (
                    <span>
                      <Clock3 size={14} aria-hidden="true" />
                      {featuredBlog.readTime}
                    </span>
                  )}
                </div>

                <span className="blogs-featured-link">
                  Read article
                  <ArrowUpRight size={18} aria-hidden="true" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* LISTING */}
      <section className="blogs-listing">
        <div className="blogs-container">
          <div className="blogs-listing-heading bl-reveal">
            <div>
              <span className="blogs-kicker">
                <span className="blogs-dot" />
                The journal
              </span>

              <h2>
                Latest <em>articles.</em>
              </h2>
            </div>

            <p>
              Ideas, guidance and perspectives for individuals and growing
              businesses.
            </p>
          </div>

          <div className="blogs-toolbar">
            <div className="blogs-filters" role="group" aria-label="Filter by category">
              {blogCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={activeCategory === category ? "active" : ""}
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="blogs-search">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search articles..."
                aria-label="Search articles"
              />
              {search && (
                <button
                  type="button"
                  className="blogs-search-clear"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </label>
          </div>

          <p className="blogs-count" role="status" aria-live="polite">
            {filteredBlogs.length}{" "}
            {filteredBlogs.length === 1 ? "article" : "articles"}
            {hasFilters && (
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </p>

          {filteredBlogs.length > 0 ? (
            <div className="blogs-grid">
              {filteredBlogs.map((blog, index) => (
                <article
                  key={blog.slug}
                  className="blogs-card"
                  style={{ "--i": Math.min(index, 8) }}
                >
                  <Link to={`/blogs/${blog.slug}`} className="blogs-card-image" tabIndex={-1} aria-hidden="true">
                    <img
                      src={blog.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={hideBrokenImage}
                    />
                  </Link>

                  <div className="blogs-card-body">
                    <span className="blogs-category">{blog.category}</span>

                    <h3>
                      <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                    </h3>

                    <p>{blog.excerpt}</p>

                    <div className="blogs-card-bottom">
                      <span>{blog.readTime}</span>

                      <Link to={`/blogs/${blog.slug}`} aria-label={`Read ${blog.title}`}>
                        <ArrowUpRight size={19} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="blogs-empty">
              <h3>No articles found</h3>
              <p>Try another keyword or select a different category.</p>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="blogs-cta">
        <div className="blogs-container blogs-cta-inner bl-reveal">
          <div>
            <h2>
              Need more than
              <em> an article?</em>
            </h2>

            <p>
              Discuss your specific accounting, taxation or business
              requirements with our team.
            </p>
          </div>

          <Link to="/contact">
            Get a consultation
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
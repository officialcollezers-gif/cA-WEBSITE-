import BlogDetails from "../pages/BlogDetails";
import ContentPage from "../pages/ContentPage";

import { Routes, Route, Link } from "react-router-dom";

// ==========================================
// MAIN PAGES
// ==========================================

import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Contact from "../pages/Contact";
import Blogs from "../pages/Blogs";

// ==========================================
// SERVICE PAGES
// ==========================================

import ServiceCategory from "../pages/ServiceCategory";
import SubServiceDetails from "../pages/SubServiceDetails";

// ==========================================
// TEMPORARY / COMING SOON PAGE
// ==========================================

function ComingSoon({ title, description }) {
  return (
    <main
      className="container"
      style={{
        padding: "100px 0",
        minHeight: "65vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          color: "#0c8575",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginBottom: "15px",
        }}
      >
        RAHUL G & ASSOCIATES
      </span>

      <h1
        style={{
          color: "#183d37",
          fontSize: "clamp(36px, 5vw, 60px)",
          fontWeight: 500,
          letterSpacing: "-2px",
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {title}
      </h1>

      <p
        style={{
          margin: "20px 0 30px",
          maxWidth: "500px",
          color: "#68776f",
          fontSize: "14px",
          lineHeight: 1.8,
        }}
      >
        {description ||
          "This page is currently under development. Please check back soon."}
      </p>

      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 20px",
          background: "#183d37",
          color: "#ffffff",
          textDecoration: "none",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        Back to Home
        <span aria-hidden="true">↗</span>
      </Link>
    </main>
  );
}

// ==========================================
// APPLICATION ROUTES
// ==========================================

export default function AppRoutes() {
  return (
    <Routes>

      {/* =====================================
          01. HOME PAGE
      ===================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      {/* =====================================
          02. ABOUT US PAGE
      ===================================== */}

      <Route
        path="/about"
        element={<ContentPage id="about" fallback={<About />} />}
      />

      {/* =====================================
          03. SERVICES MAIN PAGE
      ===================================== */}

      <Route
        path="/services"
        element={<Services />}
      />

      {/* =====================================
          04. MAIN SERVICE CATEGORY PAGES

          Examples:

          /services/income-tax-advisory

          /services/gst-services

          /services/accounting-bookkeeping

          /services/business-registration

          /services/compliance-services

          /services/financial-advisory
      ===================================== */}

      <Route
        path="/services/:categorySlug"
        element={<ServiceCategory />}
      />

      {/* =====================================
          05. INDIVIDUAL SUB-SERVICE PAGES

          Examples:

          /services/income-tax-advisory/individual-income-tax-return-filing

          /services/gst-services/gst-registration

          /services/accounting-bookkeeping/monthly-bookkeeping

          /services/business-registration/llp-registration

          /services/compliance-services/roc-annual-filing

          /services/financial-advisory/cash-flow-planning

          Each page includes:
          - Service details
          - Scope of assistance
          - Documentation
          - Process
          - FAQs
          - Dedicated enquiry form
      ===================================== */}

      <Route
        path="/services/:categorySlug/:serviceSlug"
        element={<SubServiceDetails />}
      />

      {/* =====================================
          06. CATEGORIES
      ===================================== */}

      <Route
        path="/categories"
        element={
          <ComingSoon
            title="Categories"
            description="Explore our professional service categories. This section is currently under development."
          />
        }
      />

      <Route
        path="/categories/:slug"
        element={
          <ComingSoon
            title="Category Details"
            description="Detailed category information will be available soon."
          />
        }
      />

      {/* =====================================
          07. BLOGS
      ===================================== */}

      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blogs/:slug" element={<BlogDetails />} />
      <Route path="/pages/:id" element={<ContentPage />} />

      {/* =====================================
          08. CONTACT PAGE
      ===================================== */}

      <Route
        path="/contact"
        element={<Contact />}
      />

      {/* =====================================
          09. PRIVACY POLICY
      ===================================== */}

      <Route
        path="/privacy-policy"
        element={<ContentPage id="privacy-policy" fallback={
          <ComingSoon
            title="Privacy Policy"
            description="Our privacy policy is currently being prepared."
          />
        } />}
      />

      {/* =====================================
          10. TERMS OF USE
      ===================================== */}

      <Route
        path="/terms"
        element={<ContentPage id="terms" fallback={
          <ComingSoon
            title="Terms of Use"
            description="Our website terms and conditions are currently being prepared."
          />
        } />}
      />

      {/* =====================================
          11. 404 — PAGE NOT FOUND
      ===================================== */}

      <Route
        path="*"
        element={
          <ComingSoon
            title="404 — Page Not Found"
            description="The page you are looking for does not exist or may have been moved. Return to our homepage to continue exploring."
          />
        }
      />

    </Routes>
  );
}

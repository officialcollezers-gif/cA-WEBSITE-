import { apiUrl } from "../content/api";
import Turnstile from "../content/Turnstile";
import { useContent } from "../content/useContent";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Clock3,
  ShieldCheck,
  Check,
  MessageSquareText,
} from "lucide-react";

import "../styling/pages/contact.css";

const CONTACT_EMAIL = "hello@yourdomain.com";



const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  service: "",
  message: "",
};

const DEFAULT_CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email us",
    title: CONTACT_EMAIL,
    description: "For enquiries and general correspondence",
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: Phone,
    label: "Call us",
    title: "+91 XXXXX XXXXX",
    description: "Monday to Saturday, 10 AM – 6 PM",
    href: null,
  },
  {
    icon: MapPin,
    label: "Location",
    title: "Jaipur, Rajasthan",
    description: "India",
    href: null,
  },
];

const steps = [
  {
    number: "01",
    title: "Share your requirements",
    description: "Tell us about your business, tax, or accounting enquiry.",
  },
  {
    number: "02",
    title: "Discuss your situation",
    description:
      "We review the context and identify what information may be needed.",
  },
  {
    number: "03",
    title: "Understand your options",
    description:
      "We explain the potential next steps and the scope of assistance.",
  },
];

/* ---------- validation ---------- */
const validators = {
  fullName: (v) => (v.trim() ? "" : "Please enter your full name."),
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? ""
      : "Please enter a valid email address.",
  phone: (v) => {
    const digits = v.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13
      ? ""
      : "Please enter a valid phone number.";
  },
  service: (v) => (v ? "" : "Please select a service."),
  message: (v) =>
    v.trim().length >= 15 ? "" : "Please provide at least 15 characters.",
};

function validateForm(form) {
  const errors = {};
  Object.keys(validators).forEach((key) => {
    const msg = validators[key](form[key]);
    if (msg) errors[key] = msg;
  });
  return errors;
}

/* ---------- scroll cp-reveal hook ---------- */
function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    root.classList.add("is-ready");
    const items = root.querySelectorAll(".cp-reveal");

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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function Contact() {
  const { settings, categories } = useContent();
  const services = [...categories.map(c => c.title), 'Other Enquiry'];
  const contactInfo = DEFAULT_CONTACT_INFO.map(item => item.icon === Mail ? { ...item, title: settings.email, href: `mailto:${settings.email}` } : item.icon === Phone ? { ...item, title: settings.phone, href: `tel:${settings.phone.replace(/\s/g, '')}`, description: settings.workingHours } : { ...item, title: settings.location });
  const [challengeToken, setChallengeToken] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // { text, mailto }
  const pageRef = useReveal();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setStatus(null);
  };

  // Validate a field when the user leaves it
  const handleBlur = (event) => {
    const { name, value } = event.target;
    setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus(null);
      // Move focus to the first invalid field
      const firstKey = Object.keys(nextErrors)[0];
      document.getElementById(`contact-${firstKey}`)?.focus();
      return;
    }

    if (busy) return;
    if (!consent || !challengeToken) { setStatus({ text: 'Please agree to be contacted and complete the spam check.' }); return; }
    setBusy(true);
    try {
      const response = await fetch(apiUrl('/api/enquiries'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, name: form.fullName, source: '/contact', consent, challengeToken }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your enquiry could not be submitted.');
      setStatus({ text: 'Thank you. Your enquiry has been saved and our team will be in touch.' });
      setForm(initialForm); setConsent(false);
    } catch (e) { setStatus({ text: e.message }); }
    finally { setBusy(false); setChallengeToken(''); setResetKey(k => k + 1); }
  };

  const field = (name) => ({
    id: `contact-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    onBlur: handleBlur,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
    required: true,
  });

  const fieldError = (name) =>
    errors[name] ? (
      <small id={`contact-${name}-error`} className="contact-field-error" role="alert">
        {errors[name]}
      </small>
    ) : null;

  return (
    <main className="contact-page" ref={pageRef}>
      {/* HERO */}
      <section className="contact-page-hero">
        <div className="container">
          <div className="contact-page-eyebrow">
            <span className="contact-page-eyebrow-line" />
            Get in touch
          </div>

          <div className="contact-page-hero-grid">
            <div className="contact-page-hero-left">
              <h1>
                Good conversations.
                <br />
                <em>Better decisions.</em>
              </h1>
            </div>

            <div className="contact-page-hero-right">
              <p>
                Have a question about taxation, accounting, or business
                compliance? Tell us what you need, and let's explore the right
                next step.
              </p>

              <a href="#contact-enquiry" className="contact-page-hero-link">
                Start your enquiry
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </div>

        <div className="contact-page-hero-decoration" aria-hidden="true">
          Contact
        </div>
      </section>

      {/* FORM + INFO */}
      <section className="contact-page-main" id="contact-enquiry">
        <div className="container contact-page-main-grid">
          <div className="contact-page-form-column cp-reveal">
            <div className="contact-page-section-label">
              <span className="contact-page-label-dot" />
              Send an enquiry
            </div>

            <h2>
              Tell us a little
              <br />
              <em>about your needs.</em>
            </h2>

            <p className="contact-page-form-intro">
              Share a few details about your requirements. We can then discuss
              the appropriate next steps.
            </p>

            <form className="contact-enquiry-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form-row">
                <div className="contact-form-field">
                  <label htmlFor="contact-fullName">
                    Full name <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    maxLength={100}
                    {...field("fullName")}
                  />
                  {fieldError("fullName")}
                </div>

                <div className="contact-form-field">
                  <label htmlFor="contact-email">
                    Email address <span>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={254}
                    {...field("email")}
                  />
                  {fieldError("email")}
                </div>
              </div>

              <div className="contact-form-row">
                <div className="contact-form-field">
                  <label htmlFor="contact-phone">
                    Phone number <span>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={20}
                    {...field("phone")}
                  />
                  {fieldError("phone")}
                </div>

                <div className="contact-form-field">
                  <label htmlFor="contact-service">
                    Service required <span>*</span>
                  </label>
                  <select {...field("service")}>
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                  {fieldError("service")}
                </div>
              </div>

              <div className="contact-form-field">
                <label htmlFor="contact-message">
                  How can we help? <span>*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Briefly describe your requirements..."
                  maxLength={2000}
                  {...field("message")}
                />
                <div className="contact-form-field-footer">
                  {fieldError("message") || (
                    <small>Please avoid sharing sensitive financial documents here.</small>
                  )}
                  <small>{form.message.length}/2000</small>
                </div>
              </div>

              <label><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /> I agree to be contacted about this enquiry.</label>
              <Turnstile onToken={setChallengeToken} resetKey={resetKey} />
              <button className="contact-form-submit" type="submit" disabled={busy}>
                <span>{busy ? "Submitting…" : "Send enquiry"}</span>
                <ArrowUpRight size={18} />
              </button>

              {status && (
                <div className="contact-form-status" role="status">
                  {status.text}
                  <br />

                </div>
              )}

              <p className="contact-form-disclaimer">
                <ShieldCheck size={15} />
                <span>
                  Your information should only be submitted through an approved
                  and secure enquiry channel.
                </span>
              </p>
            </form>
          </div>

          <aside className="contact-page-info-column cp-reveal" style={{ "--delay": "150ms" }}>
            <div className="contact-page-info-header">
              <span>Other ways to connect</span>
              <MessageSquareText size={21} strokeWidth={1.5} />
            </div>

            <h3>
              Prefer a more
              <br />
              <em>direct conversation?</em>
            </h3>

            <p className="contact-page-info-description">
              Reach out through the contact details below. We look forward to
              understanding your requirements.
            </p>

            <div className="contact-page-info-list">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="contact-page-info-item" key={item.label}>
                    <div className="contact-page-info-icon">
                      <Icon size={20} strokeWidth={1.6} />
                    </div>

                    <div className="contact-page-info-text">
                      <span>{item.label}</span>
                      {item.href ? (
                        <a href={item.href}>{item.title}</a>
                      ) : (
                        <strong>{item.title}</strong>
                      )}
                      <p>{item.description}</p>
                    </div>

                    {item.href && <ArrowUpRight size={16} aria-hidden="true" />}
                  </div>
                );
              })}
            </div>

            <div className="contact-page-availability">
              <Clock3 size={17} />
              <div>
                <strong>Office hours</strong>
                <p>{settings.workingHours}</p>
              </div>
            </div>

            <div className="contact-page-info-graphic" aria-hidden="true">
              <div className="contact-page-graphic-circle circle-one" />
              <div className="contact-page-graphic-circle circle-two" />
              <div className="contact-page-graphic-circle circle-three" />
              <span>RAHUL G & ASSOCIATES</span>
            </div>
          </aside>
        </div>
      </section>

      {/* PROCESS */}
      <section className="contact-page-process">
        <div className="container">
          <div className="contact-page-process-heading cp-reveal">
            <div>
              <span className="contact-page-process-kicker">A simple start</span>
              <h2>
                What happens <em>next?</em>
              </h2>
            </div>

            <p>
              A straightforward process to help you move from questions to a
              clearer plan.
            </p>
          </div>

          <div className="contact-page-process-grid">
            {steps.map((step, index) => (
              <article
                className="contact-page-process-card cp-reveal"
                key={step.number}
                style={{ "--delay": `${index * 120}ms` }}
              >
                <div className="contact-page-process-top">
                  <span>{step.number}</span>
                  <Check size={18} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
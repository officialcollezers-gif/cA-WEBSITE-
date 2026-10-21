import { apiUrl } from "../../content/api";
import Turnstile from "../../content/Turnstile";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  clientType: "",
  message: "",
  consent: false,
};

export default function ServiceEnquiryForm({ category, service }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const endpoint = apiUrl('/api/enquiries');
  const [challengeToken, setChallengeToken] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (status === "error") {
      setStatus("idle");
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "loading") return;

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setStatus("error");
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!form.consent || !challengeToken) {
      setStatus("error");
      setError("Please agree to be contacted and complete the spam check.");
      return;
    }

    if (!endpoint) {
      setStatus("error");
      setError(
        "Online enquiries are not configured yet. Please use the Contact page."
      );
      return;
    }

    setStatus("loading");
    setError("");

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      clientType: form.clientType,
      message: form.message.trim(),
      category: category.title,
      categorySlug: category.slug,
      service: service.title,
      serviceSlug: service.slug,
      source: window.location.pathname,
      consent: form.consent,
      challengeToken,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit your enquiry.");

      setStatus("success");
      setForm(initialForm);
    } catch (e) {
      setStatus("error");
      setError(e.message);
    } finally { setChallengeToken(''); setResetKey(k => k + 1); }
  };

  return (
    <div className="ssd-form-panel" id="enquiry-form">
      <div className="ssd-form-heading">
        <span className="ssd-eyebrow">LET'S CONNECT</span>
        <h2>
          Request a <em>consultation.</em>
        </h2>
        <p>
          Tell us a little about your requirements. Our team can
          discuss the appropriate next steps with you.
        </p>
      </div>

      {status === "success" ? (
        <div className="ssd-form-success" role="status">
          <CheckCircle2 size={30} />
          <h3>Enquiry submitted</h3>
          <p>
            Thank you. Your enquiry has been received.
            We will get in touch using the details provided.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
          >
            Send another enquiry
          </button>
        </div>
      ) : (
        <form className="ssd-form" onSubmit={handleSubmit}>
          <div className="ssd-form-grid">
            <div className="ssd-field">
              <label htmlFor="ssd-name">Full name *</label>
              <input
                id="ssd-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={updateField}
                maxLength={100}
                required
              />
            </div>

            <div className="ssd-field">
              <label htmlFor="ssd-phone">Mobile number *</label>
              <input
                id="ssd-phone"
                name="phone"
                type="tel"
                autoComplete="tel-national"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={updateField}
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                required
              />
            </div>

            <div className="ssd-field">
              <label htmlFor="ssd-email">Email address *</label>
              <input
                id="ssd-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={updateField}
                maxLength={254}
                required
              />
            </div>

            <div className="ssd-field">
              <label htmlFor="ssd-client-type">
                I am enquiring as *
              </label>
              <select
                id="ssd-client-type"
                name="clientType"
                value={form.clientType}
                onChange={updateField}
                required
              >
                <option value="">Select an option</option>
                <option value="Individual">Individual</option>
                <option value="Professional">Professional</option>
                <option value="Business">Business</option>
                <option value="Startup">Startup</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="ssd-field">
            <label htmlFor="ssd-service">Selected service</label>
            <input
              id="ssd-service"
              type="text"
              value={service.title}
              readOnly
            />
          </div>

          <div className="ssd-field">
            <label htmlFor="ssd-message">
              Tell us about your requirements *
            </label>
            <textarea
              id="ssd-message"
              name="message"
              rows={5}
              placeholder="Briefly describe the assistance you need..."
              value={form.message}
              onChange={updateField}
              minLength={10}
              maxLength={2000}
              required
            />
          </div>

          <label className="ssd-consent">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={updateField}
              required
            />
            <span>
              I agree to be contacted regarding this enquiry.
              I understand that submitting this form does not
              establish a professional engagement.
            </span>
          </label>

          {status === "error" && (
            <div className="ssd-form-error" role="alert">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <Turnstile onToken={setChallengeToken} resetKey={resetKey} />
          <button
            className="ssd-submit"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading"
              ? "Submitting..."
              : "Submit Enquiry"}
            <ArrowUpRight size={18} />
          </button>

          <p className="ssd-form-footnote">
            Your information will be used to respond to your enquiry.
            Please do not include PAN, Aadhaar numbers, passwords,
            or other sensitive documents in this form.
          </p>
        </form>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Layers,
  Inbox,
  Plus,
  Save,
  LogOut,
  ExternalLink,
  Trash2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import RichContent from "../content/RichContent";
import "./admin.css";
async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}
const post = (data) =>
  request("/api/admin", { method: "POST", body: JSON.stringify(data) });
const tabs = [
  ["overview", "Overview", LayoutDashboard],
  ["blogs", "Articles", FileText],
  ["categories", "Services", Layers],
  ["pages", "Pages", FileText],
  ["settings", "Site settings", Settings],
  ["enquiries", "Enquiries", Inbox],
];
const newRecord = (kind) =>
  kind === "blogs"
    ? {
        id: "",
        title: "",
        excerpt: "",
        category: "",
        author: "",
        date: new Date().toISOString().slice(0, 10),
        readTime: "5 min read",
        image: "",
        contentHtml: "",
        status: "draft",
        featured: false,
      }
    : kind === "categories"
      ? {
          id: "",
          title: "",
          category: "",
          subtitle: "",
          description: "",
          number: "",
          image: "",
          subServices: [],
          status: "draft",
        }
      : { id: "", title: "", contentHtml: "", status: "draft" };
const newService = () => ({
  slug: "",
  title: "",
  description: "",
  overview: "",
  image: "",
  imageAlt: "",
  contentHtml: "",
  inclusions: [],
  documents: [],
  faqs: [],
});
function Field({ label, value, onChange, area = false, ...props }) {
  const Tag = area ? "textarea" : "input";
  return (
    <label className="admin-field">
      <span>{label}</span>
      <Tag
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </label>
  );
}
function HtmlEditor({ value, onChange }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="admin-html">
      <div className="admin-section-heading">
        <h3>Page content</h3>
        <button type="button" onClick={() => setPreview(!preview)}>
          {preview ? "Edit HTML" : "Preview"}
        </button>
      </div>
      {preview ? (
        <div className="admin-preview">
          <RichContent html={value} />
        </div>
      ) : (
        <Field
          label="HTML content"
          area
          rows={12}
          value={value}
          onChange={onChange}
          placeholder="<h2>Heading</h2><p>Your content…</p>"
        />
      )}
      <p className="admin-hint">
        Headings, paragraphs, lists, links, images and tables are supported.
        Scripts and unsafe HTML are removed.
      </p>
    </div>
  );
}
function GoogleLogin({ clientId, onLogin, onError }) {
  const ref = useRef(null);
  const callback = useRef(onLogin);
  const errorCallback = useRef(onError);
  useEffect(() => {
    callback.current = onLogin;
    errorCallback.current = onError;
  }, [onLogin, onError]);
  useEffect(() => {
    if (!clientId) return;
    let active = true;
    const render = () => {
      if (!active) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (result) => {
          try {
            await request("/api/auth", {
              method: "POST",
              body: JSON.stringify({ credential: result.credential }),
            });
            callback.current();
          } catch (e) {
            errorCallback.current(e.message);
          }
        },
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        width: 280,
      });
    };
    let script;
    if (window.google?.accounts) render();
    else {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = render;
      script.onerror = () =>
        errorCallback.current(
          "Google sign-in could not load. Check your connection.",
        );
      document.head.appendChild(script);
    }
    return () => {
      active = false;
      if (script) script.remove();
    };
  }, [clientId]);
  return <div ref={ref} />;
}
function ServiceEditor({ record, setRecord }) {
  const [selected, setSelected] = useState(0);
  const services = record.subServices || [];
  const current = services[selected];
  const update = (key, value) =>
    setRecord({
      ...record,
      subServices: services.map((s, i) =>
        i === selected ? { ...s, [key]: value } : s,
      ),
    });
  return (
    <section className="admin-subservices">
      <div className="admin-section-heading">
        <h3>Individual services ({services.length})</h3>
        <button
          type="button"
          onClick={() => {
            setRecord({ ...record, subServices: [...services, newService()] });
            setSelected(services.length);
          }}
        >
          <Plus size={15} /> Add service
        </button>
      </div>
      <div className="admin-chips">
        {services.map((s, i) => (
          <button
            type="button"
            className={selected === i ? "active" : ""}
            key={i}
            onClick={() => setSelected(i)}
          >
            {s.title || "New service"}
          </button>
        ))}
      </div>
      {current && (
        <div className="admin-service-fields">
          <div className="admin-form-grid">
            <Field
              label="Service title"
              required
              value={current.title}
              onChange={(v) => update("title", v)}
            />
            <Field
              label="Service URL slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={current.slug}
              onChange={(v) => update("slug", v)}
            />
            <Field
              label="Image URL"
              value={current.image}
              onChange={(v) => update("image", v)}
            />
            <Field
              label="Image description"
              value={current.imageAlt}
              onChange={(v) => update("imageAlt", v)}
            />
          </div>
          <Field
            label="Short description"
            area
            value={current.description}
            onChange={(v) => update("description", v)}
          />
          <Field
            label="Overview"
            area
            value={current.overview}
            onChange={(v) => update("overview", v)}
          />
          <HtmlEditor
            value={current.contentHtml}
            onChange={(v) => update("contentHtml", v)}
          />
          <div className="admin-form-grid">
            <Field
              label="Inclusions — one per line"
              area
              rows={6}
              value={current.inclusions?.join("\n")}
              onChange={(v) => update("inclusions", v.split("\n"))}
            />
            <Field
              label="Documents — one per line"
              area
              rows={6}
              value={current.documents?.join("\n")}
              onChange={(v) => update("documents", v.split("\n"))}
            />
          </div>
          <div className="admin-section-heading">
            <h4>Frequently asked questions</h4>
            <button
              type="button"
              onClick={() =>
                update("faqs", [
                  ...(current.faqs || []),
                  { question: "", answer: "" },
                ])
              }
            >
              Add question
            </button>
          </div>
          {current.faqs?.map((faq, i) => (
            <div className="admin-faq" key={i}>
              <Field
                label={`Question ${i + 1}`}
                value={faq.question}
                onChange={(v) =>
                  update(
                    "faqs",
                    current.faqs.map((f, j) =>
                      j === i ? { ...f, question: v } : f,
                    ),
                  )
                }
              />
              <Field
                label="Answer"
                area
                value={faq.answer}
                onChange={(v) =>
                  update(
                    "faqs",
                    current.faqs.map((f, j) =>
                      j === i ? { ...f, answer: v } : f,
                    ),
                  )
                }
              />
              <button
                type="button"
                onClick={() =>
                  update(
                    "faqs",
                    current.faqs.filter((_, j) => j !== i),
                  )
                }
              >
                Remove question
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-danger"
            onClick={() => {
              if (
                window.confirm(
                  "Remove this service from the category? Save the category to apply.",
                )
              ) {
                setRecord({
                  ...record,
                  subServices: services.filter((_, i) => i !== selected),
                });
                setSelected(0);
              }
            }}
          >
            Remove service
          </button>
        </div>
      )}
    </section>
  );
}
export default function Admin() {
  const [auth, setAuth] = useState(null);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");
  const [record, setRecord] = useState(null);
  const [originalId, setOriginalId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  async function load() {
    const session = await request("/api/auth");
    setAuth(session);
    if (session.user) setData(await request("/api/admin"));
  }
  useEffect(() => {
    let active = true;
    request("/api/auth")
      .then(async (session) => {
        if (!active) return;
        setAuth(session);
        if (session.user) {
          const next = await request("/api/admin");
          if (active) setData(next);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const warn = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const updateRecord = (value) => {
    setRecord(value);
    setDirty(true);
    setMessage("");
  };
  const changeTab = (value) => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setTab(value);
    setRecord(null);
    setOriginalId(null);
    setDirty(false);
    setError("");
    setMessage("");
    setSearch("");
    if (value === "settings") {
      setRecord(structuredClone(data.content.settings));
      setOriginalId("site");
    }
  };
  async function action(fn) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save(event) {
    event.preventDefault();
    await action(async () => {
      await post({ action: "save", kind: tab, record });
      setData(await request("/api/admin"));
      setOriginalId(record.id);
      setDirty(false);
      setMessage(
        "Saved to Google Sheets. Public pages refresh within 60 seconds.",
      );
    });
  }
  const open = (r) => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setRecord(structuredClone(r));
    setOriginalId(r.id);
    setDirty(false);
    setError("");
    setMessage("");
  };
  const field = (key, label, props = {}) => (
    <Field
      key={key}
      label={label}
      value={record[key]}
      onChange={(v) => updateRecord({ ...record, [key]: v })}
      {...props}
    />
  );
  const ready = data?.configured && data?.initialized;
  if (!auth?.user)
    return (
      <main className="admin-login">
        <div className="admin-login-card">
          <span className="admin-eyebrow">FINCORE / CONTENT STUDIO</span>
          <h1>
            A little clarity.
            <br />
            <em>Behind the scenes.</em>
          </h1>
          <p>Manage your website, articles and enquiries in one place.</p>
          {!auth && !error ? (
            <p>Checking sign-in…</p>
          ) : auth?.clientId ? (
            <GoogleLogin
              clientId={auth.clientId}
              onLogin={() => load().catch((e) => setError(e.message))}
              onError={setError}
            />
          ) : (
            <p className="admin-alert">
              Google sign-in needs configuration. Follow SETUP.md to add the
              Google client ID, administrator email and session secret.
            </p>
          )}
          {error && (
            <p className="admin-alert" role="alert">
              {error}
            </p>
          )}
          <Link to="/">← Back to website</Link>
        </div>
        <div className="admin-login-art">
          <span>
            Perspective.
            <br />
            Precision.
            <br />
            <em>Progress.</em>
          </span>
        </div>
      </main>
    );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/">
          fin<span>core.</span>
          <small>CONTENT STUDIO</small>
        </Link>
        <nav aria-label="Admin navigation">
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              disabled={!data || busy}
              className={tab === id ? "active" : ""}
              onClick={() => changeTab(id)}
            >
              <Icon size={18} />
              {label}
              {id === "enquiries" && (
                <small>{data?.enquiries.length || 0}</small>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link to="/" target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> View website
          </Link>
          <small>{auth.user}</small>
          <button
            disabled={busy}
            onClick={() => {
              if (
                dirty &&
                !window.confirm("Discard unsaved changes and sign out?")
              )
                return;
              action(async () => {
                await request("/api/auth", { method: "DELETE" });
                setAuth(null);
                setData(null);
                setDirty(false);
                await load();
              });
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">YOUR WEBSITE, AT A GLANCE</span>
            <h1>{tabs.find((t) => t[0] === tab)?.[1]}</h1>
          </div>
          <span className={`admin-connection ${ready ? "connected" : ""}`}>
            <span />
            {ready ? "Google Sheets connected" : "Setup required"}
          </span>
        </header>
        {error && (
          <div className="admin-alert" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="admin-success" role="status">
            {message}
          </div>
        )}
        {!data ? (
          <div className="admin-panel">
            <p>Loading your workspace…</p>
            <button onClick={() => action(load)}>Retry</button>
          </div>
        ) : (
          <>
            {!ready && (
              <section className="admin-setup">
                <h2>Connect your content home.</h2>
                <p>
                  {data.configured
                    ? "Your Google credentials are configured. Create the content tabs and import the starter website data."
                    : "Add the Google Sheet ID and service account credentials to your server environment. SETUP.md walks through the steps."}
                </p>
                <button
                  disabled={busy || !data.configured}
                  onClick={() =>
                    action(async () => {
                      await post({ action: "initialize" });
                      await load();
                      setMessage(
                        "Google Sheet initialized. Your starter content is ready to edit.",
                      );
                    })
                  }
                >
                  Initialize Google Sheet
                </button>
                <p className="admin-hint">
                  Adds Content and Enquiries tabs. Existing content records are
                  preserved.
                </p>
              </section>
            )}
            {tab === "overview" && (
              <>
                <section className="admin-welcome">
                  <span className="admin-eyebrow">MAKE IT YOURS</span>
                  <h2>
                    Good content.
                    <br />
                    <em>Lasting impressions.</em>
                  </h2>
                  <p>Keep your expertise current and your visitors informed.</p>
                  <button onClick={() => changeTab("blogs")}>
                    Manage articles <FileText size={16} />
                  </button>
                </section>
                <div className="admin-stats">
                  {[
                    ["Articles", data.content.blogs.length, "blogs"],
                    [
                      "Service categories",
                      data.content.categories.length,
                      "categories",
                    ],
                    ["Enquiries", data.enquiries.length, "enquiries"],
                  ].map(([label, count, id]) => (
                    <button key={id} onClick={() => changeTab(id)}>
                      <span>{label}</span>
                      <strong>{count.toString().padStart(2, "0")}</strong>
                      <span>View all →</span>
                    </button>
                  ))}
                </div>
                <section className="admin-panel">
                  <h2>From draft to published.</h2>
                  <p>
                    Edit an article, service or page, preview its content, then
                    choose Published and save. Drafts stay private.
                  </p>
                  <p>
                    Images use HTTPS URLs. Changes are saved in your Google
                    Sheet; the public website refreshes every minute.
                  </p>
                </section>
              </>
            )}
            {tab === "enquiries" && (
              <section className="admin-panel">
                <div className="admin-section-heading">
                  <h2>Incoming enquiries</h2>
                  <button disabled={busy} onClick={() => action(load)}>
                    <RefreshCw size={15} /> Refresh
                  </button>
                </div>
                {!data.enquiries.length && (
                  <p>
                    No enquiries yet. New website submissions will appear here.
                  </p>
                )}
                {data.enquiries.map((e) => (
                  <article className="admin-enquiry" key={e.id}>
                    <div>
                      <h3>{e.name}</h3>
                      <small>{new Date(e.createdAt).toLocaleString()}</small>
                    </div>
                    <p>
                      {e.service} {e.category && ` / ${e.category}`}
                    </p>
                    <p>
                      <a href={`mailto:${e.email}`}>{e.email}</a> · {e.phone}
                    </p>
                    <p className="admin-message">{e.message}</p>
                    <small>Source: {e.source}</small>
                  </article>
                ))}
              </section>
            )}
            {["blogs", "categories", "pages"].includes(tab) && !record && (
              <section className="admin-panel">
                <div className="admin-section-heading">
                  <input
                    aria-label="Search content"
                    placeholder="Search by title…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button
                    className="admin-primary"
                    disabled={!ready || busy}
                    onClick={() => {
                      setRecord(newRecord(tab));
                      setOriginalId(null);
                      setDirty(true);
                    }}
                  >
                    <Plus size={16} /> New{" "}
                    {tab === "blogs"
                      ? "article"
                      : tab === "categories"
                        ? "category"
                        : "page"}
                  </button>
                </div>
                <div className="admin-list">
                  {data.content[tab]
                    .filter((r) =>
                      r.title.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((r) => (
                      <button key={r.id} onClick={() => open(r)}>
                        <div>
                          <strong>{r.title}</strong>
                          <small>
                            /{tab === "categories" ? "services" : tab}/{r.id}
                          </small>
                        </div>
                        <span className={`admin-status ${r.status}`}>
                          {r.status}
                        </span>
                        <span> Edit →</span>
                      </button>
                    ))}
                </div>
                {data.content[tab].length === 0 && (
                  <p>No content yet. Create your first item.</p>
                )}
              </section>
            )}
            {record && (
              <form className="admin-panel admin-editor" onSubmit={save}>
                <div className="admin-section-heading">
                  <button type="button" onClick={() => changeTab(tab)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <div className="admin-editor-actions">
                    {originalId && tab !== "settings" && (
                      <button
                        type="button"
                        className="admin-danger"
                        disabled={!ready || busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Delete this item? It will be removed from the website.",
                            )
                          )
                            action(async () => {
                              await post({
                                action: "delete",
                                kind: tab,
                                record,
                              });
                              await load();
                              setRecord(null);
                              setDirty(false);
                              setMessage("Item deleted.");
                            });
                        }}
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    )}
                    <button
                      className="admin-primary"
                      type="submit"
                      disabled={!ready || busy}
                    >
                      <Save size={16} />
                      {busy ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </div>
                {tab === "settings" ? (
                  <>
                    <h2>Your business details</h2>
                    <div className="admin-form-grid">
                      {[
                        ["name", "Business name"],
                        ["email", "Contact email"],
                        ["phone", "Phone number"],
                        ["location", "Location"],
                        ["workingHours", "Office hours"],
                        ["heroTitle", "Homepage heading"],
                        ["heroAccent", "Homepage accent heading"],
                      ].map(([key, label]) => field(key, label))}
                    </div>
                    {field("heroDescription", "Homepage description", {
                      area: true,
                      rows: 4,
                    })}
                  </>
                ) : (
                  <>
                    <div className="admin-form-grid">
                      {field("title", "Title", {
                        required: true,
                        maxLength: 250,
                      })}
                      {field("id", "URL slug", {
                        required: true,
                        disabled: !!originalId,
                        pattern: "[a-z0-9]+(-[a-z0-9]+)*",
                      })}
                      <label className="admin-field">
                        <span>Visibility</span>
                        <select
                          value={record.status}
                          onChange={(e) =>
                            updateRecord({ ...record, status: e.target.value })
                          }
                        >
                          <option value="draft">Draft — private</option>
                          <option value="published">Published — public</option>
                        </select>
                      </label>
                      {tab !== "pages" &&
                        field("image", "Cover image URL", {
                          placeholder: "https://…",
                        })}
                    </div>
                    {tab === "blogs" && (
                      <>
                        <div className="admin-form-grid">
                          {field("category", "Category")}
                          {field("author", "Author")}
                          {field("date", "Date", { type: "date" })}
                          {field("readTime", "Reading time")}
                          <label>
                            <input
                              type="checkbox"
                              checked={!!record.featured}
                              onChange={(e) =>
                                updateRecord({
                                  ...record,
                                  featured: e.target.checked,
                                })
                              }
                            />{" "}
                            Featured article
                          </label>
                        </div>
                        {field("excerpt", "Short introduction", { area: true })}
                      </>
                    )}
                    {tab === "categories" && (
                      <>
                        <div className="admin-form-grid">
                          {field("category", "Category label")}
                          {field("number", "Display number")}
                          {field("subtitle", "Subtitle")}
                        </div>
                        {field("description", "Description", { area: true })}
                        <ServiceEditor
                          key={originalId || "new"}
                          record={record}
                          setRecord={updateRecord}
                        />
                      </>
                    )}
                    {tab !== "categories" && (
                      <HtmlEditor
                        value={record.contentHtml}
                        onChange={(v) =>
                          updateRecord({ ...record, contentHtml: v })
                        }
                      />
                    )}
                    {tab === "pages" && (
                      <p className="admin-hint">
                        Use about, privacy-policy or terms to update those
                        existing pages. Other slugs appear at /pages/your-slug.
                      </p>
                    )}
                  </>
                )}
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}

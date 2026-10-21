import { rebrandLegacyContent } from "./branding.js";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sanitizeHtml = require("./generated/sanitizer.cjs").default;
import { servicesData } from "../src/data/servicesData.js";
import { blogsData } from "../src/data/blogsData.js";

export const defaults = {
  settings: {
    id: "site",
    name: "RAHUL G & ASSOCIATES",
    email: "hello@example.com",
    phone: "+91 98765 43210",
    location: "Jaipur, Rajasthan, India",
    workingHours: "Mon - Sat: 10 AM - 6 PM",
    heroTitle: "Clarity for every",
    heroAccent: "financial decision.",
    heroDescription:
      "Thoughtful tax, accounting, compliance and business advisory services — helping individuals and businesses navigate financial decisions with confidence.",
  },
  categories: servicesData.map((c) => ({
    ...c,
    id: c.slug,
    status: "published",
  })),
  blogs: blogsData.map((b) => ({
    ...b,
    id: b.slug,
    status: "published",
    contentHtml: b.sections
      .map(
        (s) =>
          `<h2>${s.heading}</h2>${s.paragraphs.map((p) => `<p>${p}</p>`).join("")}`,
      )
      .join(""),
  })),
  pages: ["about", "privacy-policy", "terms"].map((id) => ({
    id,
    title:
      id === "about"
        ? "About us"
        : id === "terms"
          ? "Terms of Use"
          : "Privacy Policy",
    contentHtml: "",
    status: "draft",
  })),
};
export const html = (value) =>
  sanitizeHtml(value || "", {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
const text = (v, max = 1000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const required = (v, name) => {
  if (!v)
    throw Object.assign(new Error(`${name} is required.`), { status: 400 });
  return v;
};
const image = (v) => {
  const s = text(v, 2000);
  const localImage =
    process.env.NODE_ENV !== "production" &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(s);
  if (s && !localImage && !/^https:\/\//i.test(s) && !/^\/(?!\/)/.test(s))
    throw Object.assign(
      new Error("Images must use HTTPS URLs or local paths."),
      { status: 400 },
    );
  return s;
};
const list = (v) =>
  Array.isArray(v)
    ? v
        .slice(0, 50)
        .map((x) => text(x))
        .filter(Boolean)
    : [];
const slug = (v) =>
  required(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v || "") ? v : "",
    "A lowercase URL slug",
  );
export function validateRecord(kind, raw) {
  if (!raw || typeof raw !== "object")
    throw Object.assign(new Error("Invalid content."), { status: 400 });
  const id = kind === "settings" ? "site" : slug(raw.id);
  if (kind === "settings")
    return {
      id,
      ...Object.fromEntries(
        [
          "name",
          "email",
          "phone",
          "location",
          "workingHours",
          "heroTitle",
          "heroAccent",
          "heroDescription",
        ].map((k) => [k, text(raw[k])]),
      ),
    };
  const base = {
    id,
    title: required(text(raw.title, 250), "Title"),
    status: raw.status === "published" ? "published" : "draft",
    contentHtml: html(text(raw.contentHtml, 35000)),
  };
  if (kind === "pages") return base;
  if (kind === "blogs")
    return {
      ...base,
      slug: id,
      excerpt: text(raw.excerpt),
      image: image(raw.image),
      category: text(raw.category, 100),
      author: text(raw.author, 100),
      date: /^\d{4}-\d{2}-\d{2}$/.test(raw.date)
        ? raw.date
        : new Date().toISOString().slice(0, 10),
      readTime: text(raw.readTime, 40),
      featured: !!raw.featured,
    };
  if (kind === "categories") {
    const subServices = (Array.isArray(raw.subServices) ? raw.subServices : [])
      .slice(0, 100)
      .map((s) => ({
        slug: slug(s.slug),
        title: required(text(s.title, 250), "Service title"),
        description: text(s.description),
        image: image(s.image),
        imageAlt: text(s.imageAlt),
        overview: text(s.overview, 5000),
        contentHtml: html(text(s.contentHtml, 15000)),
        inclusions: list(s.inclusions),
        documents: list(s.documents),
        faqs: (Array.isArray(s.faqs) ? s.faqs : []).slice(0, 30).map((f) => ({
          question: text(f.question),
          answer: text(f.answer, 3000),
        })),
      }));
    if (new Set(subServices.map((s) => s.slug)).size !== subServices.length)
      throw Object.assign(
        new Error("Service slugs must be unique within a category."),
        { status: 400 },
      );
    return {
      ...base,
      slug: id,
      number: text(raw.number, 5),
      category: text(raw.category, 100),
      subtitle: text(raw.subtitle),
      description: text(raw.description),
      image: image(raw.image),
      features: list(raw.features),
      subServices,
    };
  }
  throw Object.assign(new Error("Unknown content type."), { status: 400 });
}
export function assemble(rows, publicOnly = false) {
  const result = {
    settings: defaults.settings,
    categories: [],
    blogs: [],
    pages: [],
  };
  const records = new Map();
  for (const [kind, id, json] of rows) {
    if (!["settings", "categories", "blogs", "pages"].includes(kind)) continue;
    try {
      records.set(`${kind}:${id}`, {
        kind,
        value: rebrandLegacyContent(JSON.parse(json)),
      });
    } catch {
      throw new Error("Invalid content row in Google Sheets.");
    }
  }
  for (const { kind, value } of records.values()) {
    if (kind === "settings") result.settings = value;
    else if (!value.deleted && (!publicOnly || value.status === "published"))
      result[kind].push(value);
  }
  return result;
}

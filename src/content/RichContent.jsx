import DOMPurify from "dompurify";
export default function RichContent({ html = "" }) {
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "iframe", "form", "input", "button"],
    FORBID_ATTR: ["id"],
  });
  return (
    <div className="rich-content" dangerouslySetInnerHTML={{ __html: clean }} />
  );
}

import DOMPurify from "dompurify";
export default function RichContent({ html = "" }) {
  const fragment = DOMPurify.sanitize(html, {
    RETURN_DOM_FRAGMENT: true,
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "iframe", "form", "input", "button"],
    FORBID_ATTR: ["id"],
  });
  // Darken the two legacy template text tokens on their light surfaces.
  // This also fixes copies already saved in Sheets without rewriting content.
  const textColors = {
    "rgb(8, 127, 112)": "#086354",
    "rgb(101, 121, 111)": "#52645b",
  };
  for (const element of fragment.querySelectorAll("[style]")) {
    const replacement = textColors[element.style.color];
    if (replacement) element.style.color = replacement;
  }
  const container = document.createElement("div");
  container.appendChild(fragment);
  const clean = container.innerHTML;
  return (
    <div className="rich-content" dangerouslySetInnerHTML={{ __html: clean }} />
  );
}

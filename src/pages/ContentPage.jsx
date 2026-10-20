import { useParams } from "react-router-dom";
import { useContent } from "../content/useContent";
import RichContent from "../content/RichContent";
export default function ContentPage({ id, fallback }) {
  const params = useParams();
  const pageId = id || params.id;
  const { pages, loading } = useContent();
  const page = pages.find((p) => p.id === pageId);
  if (loading) return <main className="cms-page">Loading…</main>;
  return page ? (
    <main className="cms-page">
      <h1>{page.title}</h1>
      <RichContent html={page.contentHtml} />
    </main>
  ) : (
    fallback || (
      <main className="cms-page">
        <h1>Page not found</h1>
      </main>
    )
  );
}

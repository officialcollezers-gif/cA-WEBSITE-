import { Link, useParams } from "react-router-dom";
import { useContent } from "../content/useContent";
import RichContent from "../content/RichContent";
export default function BlogDetails() {
  const { slug } = useParams();
  const { blogs, loading } = useContent();
  const blog = blogs.find((b) => b.slug === slug);
  if (loading) return <main className="cms-page">Loading article…</main>;
  if (!blog)
    return (
      <main className="cms-page">
        <h1>Article not found</h1>
        <Link to="/blogs">Back to articles</Link>
      </main>
    );
  return (
    <main className="cms-page">
      <Link to="/blogs">← All articles</Link>
      <p>
        {blog.category} · {blog.date} · {blog.readTime}
      </p>
      <h1>{blog.title}</h1>
      <p>{blog.author}</p>
      {blog.image && (
        <img className="cms-cover" src={blog.image} alt={blog.title} />
      )}
      <p>{blog.excerpt}</p>
      {blog.contentHtml ? (
        <RichContent html={blog.contentHtml} />
      ) : (
        blog.sections?.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))
      )}
    </main>
  );
}

import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useContent } from '../content/useContent';
export default function ServiceCategories() {
  const { categories } = useContent();
  return <section className="cms-page"><h2>Explore our expertise.</h2><div className="cms-category-grid">{categories.map(c => <Link key={c.slug} to={`/services/${c.slug}`}><span>{c.number}</span><h3>{c.title}</h3><p>{c.subtitle || c.description}</p><ArrowUpRight size={20} /></Link>)}</div></section>;
}

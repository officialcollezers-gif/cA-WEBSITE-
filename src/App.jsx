import { BrowserRouter, useLocation } from 'react-router-dom';
import Header from './common/Header';
import Navbar from './common/Navbar';
import Footer from './common/Footer';
import LoadingAnimation from './common/LoadingAnimation';
import ScrollToTop from './common/ScrollToTop';
import AppRoutes from './navigation/AppRoutes';
import Admin from './admin/Admin';
import { ContentProvider } from './content/ContentContext';
import { useContent } from './content/useContent';
import './styling/global.css';
import './styling/responsive.css';
import './styling/cms.css';
function Site() {
  const location = useLocation(); const { error } = useContent();
  if (import.meta.env.VITE_APP_MODE === 'admin') return <Admin />;
  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) {
    if (import.meta.env.VITE_APP_MODE === 'public') return <main className="cms-page"><h1>Administration</h1>{import.meta.env.VITE_ADMIN_URL ? <a href={import.meta.env.VITE_ADMIN_URL}>Open the admin panel</a> : <p>The admin panel is hosted separately.</p>}</main>;
    return <Admin />;
  }
  return <div className="public-site"><LoadingAnimation initialDuration={850} routeDuration={220} /><Header /><Navbar />{error && <p className="cms-notice" role="status">{error}</p>}<AppRoutes /><Footer /><ScrollToTop /></div>;
}
export default function App() { return <BrowserRouter><ContentProvider><Site /></ContentProvider></BrowserRouter>; }

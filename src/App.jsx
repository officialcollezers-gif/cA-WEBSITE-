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
  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) return <Admin />;
  return <><LoadingAnimation initialDuration={1100} routeDuration={450} /><Header /><Navbar />{error && <p className="cms-notice" role="status">{error}</p>}<AppRoutes /><Footer /><ScrollToTop /></>;
}
export default function App() { return <BrowserRouter><ContentProvider><Site /></ContentProvider></BrowserRouter>; }

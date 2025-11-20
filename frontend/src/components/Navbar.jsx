import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Vigil<span>Safe</span>
      </Link>

      <ul className="navbar-links">
        <li><Link to="/">{t('nav.home')}</Link></li>
        <li><Link to="/report">{t('nav.report')}</Link></li>
        <li><Link to="/library">{t('nav.library')}</Link></li>
        <li><Link to="/analytics">{t('nav.analytics')}</Link></li>
        <li><Link to="/guidance">{t('nav.guidance')}</Link></li>

        {user ? (
          <>
            <li><Link to="/dashboard">{t('nav.dashboard')}</Link></li>
            <li>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', padding: '0.2rem 0.75rem', fontSize: '0.85rem' }}
              >
                {t('nav.logout')}
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">{t('nav.login')}</Link></li>
            <li><Link to="/register">{t('nav.register')}</Link></li>
          </>
        )}

        <li>
          <button className="lang-toggle" onClick={toggleLang}>
            {lang === 'en' ? 'Español' : 'English'}
          </button>
        </li>
      </ul>
    </nav>
  );
}

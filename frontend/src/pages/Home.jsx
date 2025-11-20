import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="container">
      <div className="hero">
        <h1>VigilSafe / VigilSeguro</h1>
        <p>{t('home.hero_subtitle')}</p>
        <div className="hero-btns">
          <Link to="/report" className="btn btn-accent btn-lg">
            {t('home.cta_report')}
          </Link>
          <Link
            to="/login"
            className="btn btn-lg"
            style={{ border: '2px solid rgba(255,255,255,0.6)', color: 'white', background: 'transparent' }}
          >
            {t('home.cta_login')}
          </Link>
        </div>
      </div>

      <div className="features">
        <div className="card feature-card">
          <div className="feature-icon">🔒</div>
          <h3>{t('home.feature_1_title')}</h3>
          <p>{t('home.feature_1_desc')}</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">🤖</div>
          <h3>{t('home.feature_2_title')}</h3>
          <p>{t('home.feature_2_desc')}</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">📊</div>
          <h3>{t('home.feature_3_title')}</h3>
          <p>{t('home.feature_3_desc')}</p>
        </div>
      </div>
    </div>
  );
}

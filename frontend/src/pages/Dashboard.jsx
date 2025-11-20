import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { statsAPI, incidentsAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [total, setTotal] = useState(0);
  const [severityStats, setSeverityStats] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    incidentsAPI.list({ per_page: 5 })
      .then(({ data }) => { setRecent(data.incidents); setTotal(data.total); })
      .catch(console.error);

    statsAPI.severityDist()
      .then(({ data }) => setSeverityStats(data))
      .catch(console.error);
  }, []);

  const getSev = (s) => severityStats.find(x => x.severity === s)?.count ?? 0;

  return (
    <div className="container">
      <h1 className="page-title">
        {t('nav.dashboard')}{user ? ` — ${user.username}` : ''}
      </h1>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-number">{total}</div>
          <div className="stat-label">{t('dashboard.total')}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number" style={{ color: 'var(--high)' }}>{getSev('high')}</div>
          <div className="stat-label">{t('severity.high')} Severity</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number" style={{ color: 'var(--medium)' }}>{getSev('medium')}</div>
          <div className="stat-label">{t('severity.medium')} Severity</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number" style={{ color: 'var(--low)' }}>{getSev('low')}</div>
          <div className="stat-label">{t('severity.low')} Severity</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link to="/report" className="btn btn-primary">{t('nav.report')}</Link>
        <Link to="/analytics" className="btn btn-outline">{t('nav.analytics')}</Link>
        <Link to="/library" className="btn btn-outline">{t('nav.library')}</Link>
      </div>

      {recent.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
            {t('dashboard.recent')}
          </h2>
          <div className="incidents-grid">
            {recent.map(incident => (
              <div key={incident.id} className="card incident-card">
                <div className="incident-header">
                  <span className="incident-category">{t(`report.categories.${incident.category}`)}</span>
                  <span className={`badge badge-${incident.severity}`}>{t(`severity.${incident.severity}`)}</span>
                </div>
                <p className="incident-desc">
                  {incident.description.length > 160
                    ? incident.description.substring(0, 160) + '...'
                    : incident.description}
                </p>
                <div className="incident-footer">
                  {incident.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">{tag.replace(/_/g, ' ')}</span>
                  ))}
                  <span className="incident-date">{new Date(incident.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

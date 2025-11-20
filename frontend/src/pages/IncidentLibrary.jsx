import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { incidentsAPI } from '../services/api';

export default function IncidentLibrary() {
  const { t } = useLanguage();
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', severity: '' });

  useEffect(() => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.severity) params.severity = filters.severity;

    setLoading(true);
    incidentsAPI.list(params)
      .then(({ data }) => { setIncidents(data.incidents); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="container">
      <h1 className="page-title">{t('library.title')} {total > 0 && <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-light)' }}>({total})</span>}</h1>

      <div className="filters">
        <select
          className="form-select"
          value={filters.category}
          onChange={e => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">{t('library.filter_category')}</option>
          {['work', 'school', 'community', 'family'].map(c => (
            <option key={c} value={c}>{t(`report.categories.${c}`)}</option>
          ))}
        </select>

        <select
          className="form-select"
          value={filters.severity}
          onChange={e => setFilters({ ...filters, severity: e.target.value })}
        >
          <option value="">{t('library.filter_severity')}</option>
          {['low', 'medium', 'high'].map(s => (
            <option key={s} value={s}>{t(`severity.${s}`)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : incidents.length === 0 ? (
        <div className="empty-state">{t('library.no_incidents')}</div>
      ) : (
        <div className="incidents-grid">
          {incidents.map(incident => (
            <div key={incident.id} className="card incident-card">
              <div className="incident-header">
                <span className="incident-category">{t(`report.categories.${incident.category}`)}</span>
                <span className={`badge badge-${incident.severity}`}>{t(`severity.${incident.severity}`)}</span>
              </div>
              <p className="incident-desc">
                {incident.description.length > 220
                  ? incident.description.substring(0, 220) + '...'
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
      )}
    </div>
  );
}

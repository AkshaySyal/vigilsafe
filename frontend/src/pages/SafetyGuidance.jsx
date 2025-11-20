import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function SafetyGuidance() {
  const { lang, t } = useLanguage();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/guidance/?lang=${lang}`)
      .then(({ data }) => setSections(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang]);

  return (
    <div className="container" style={{ maxWidth: 780 }}>
      <h1 className="page-title">{t('guidance.title')}</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem', lineHeight: 1.6 }}>
        {t('guidance.subtitle')}
      </p>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {sections.map(section => (
            <div key={section.id} className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>{section.icon}</span> {section.title}
              </h2>
              <ol style={{ paddingLeft: '1.25rem', display: 'grid', gap: '0.6rem' }}>
                {section.steps.map((step, i) => (
                  <li key={i} style={{ color: 'var(--text-light)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f7fafc' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
          {t('guidance.privacy_title')}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-light)', lineHeight: 1.65 }}>
          {t('guidance.privacy_body')}
        </p>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-light)', lineHeight: 1.65, marginTop: '0.75rem' }}>
          {t('guidance.terms_body')}
        </p>
      </div>
    </div>
  );
}

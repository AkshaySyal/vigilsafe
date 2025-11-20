import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { incidentsAPI, uploadsAPI } from '../services/api';

const CATEGORIES = ['work', 'school', 'community', 'family'];
const TYPES = ['harassment', 'bullying', 'hazard', 'threat', 'discrimination', 'violence', 'other'];

export default function ReportIncident() {
  const { t } = useLanguage();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    category: 'work',
    incident_type: 'harassment',
    description: '',
    location_descriptor: '',
    is_anonymous: false,
    image_url: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setForm({ category: 'work', incident_type: 'harassment', description: '', location_descriptor: '', is_anonymous: false, image_url: null });
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress('');
    setAnalysis(null);
    setSuccess(false);
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm(f => ({ ...f, image_url: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let image_url = null;

      if (imageFile) {
        setUploadProgress('Uploading image...');
        const { data: uploadData } = await uploadsAPI.image(imageFile);
        image_url = uploadData.image_url;
        setUploadProgress('Image uploaded.');
      }

      const payload = { ...form, image_url };
      const { data } = await incidentsAPI.create(payload);
      setAnalysis(data.analysis);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  if (success) {
    return (
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ color: 'var(--low)', marginBottom: '1rem', fontSize: '1.2rem' }}>
            {t('report.success')}
          </h3>

          {analysis && (
            <div className="analysis-box">
              <h4>{t('report.ai_analysis')}</h4>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>{t('report.severity')}:</strong>{' '}
                <span className={`badge badge-${analysis.severity}`}>{t(`severity.${analysis.severity}`)}</span>
              </p>
              {analysis.tags?.length > 0 && (
                <p>
                  <strong>{t('report.tags')}:</strong>{' '}
                  {analysis.tags.map(tag => <span key={tag} className="tag">{tag.replace(/_/g, ' ')}</span>)}
                </p>
              )}
              {analysis.keywords?.length > 0 && (
                <p style={{ marginTop: '0.5rem' }}>
                  <strong>{t('report.keywords')}:</strong>{' '}
                  {analysis.keywords.slice(0, 8).map(kw => <span key={kw} className="tag">{kw}</span>)}
                </p>
              )}
              {analysis.summary && (
                <p style={{ marginTop: '0.75rem', fontStyle: 'italic', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  "{analysis.summary}"
                </p>
              )}
            </div>
          )}

          <button className="btn btn-primary" style={{ marginTop: '1.75rem' }} onClick={reset}>
            {t('report.report_another')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 680 }}>
      <h1 className="page-title">{t('report.title')}</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('report.category')}</label>
            <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{t(`report.categories.${c}`)}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('report.type')}</label>
            <select className="form-select" value={form.incident_type} onChange={e => setForm({ ...form, incident_type: e.target.value })}>
              {TYPES.map(type => <option key={type} value={type}>{t(`report.types.${type}`)}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('report.description')} *</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder={t('report.description_hint')}
              rows={5}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('report.location')}</label>
            <input
              type="text"
              className="form-input"
              value={form.location_descriptor}
              onChange={e => setForm({ ...form, location_descriptor: e.target.value })}
              placeholder={t('report.location_hint')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('report.attach_photo')}</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => fileRef.current.click()}
                style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
              >
                {imageFile ? imageFile.name : t('report.choose_photo')}
              </button>
              {imageFile && (
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); fileRef.current.value = ''; }}
                  style={{ background: 'none', border: 'none', color: 'var(--high)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  ✕ Remove
                </button>
              )}
            </div>
            {imagePreview && (
              <img src={imagePreview} alt="preview" style={{ marginTop: '0.75rem', maxWidth: '200px', borderRadius: '8px', border: '1px solid var(--border)' }} />
            )}
            <p className="form-hint">{t('report.photo_hint')}</p>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm({ ...form, is_anonymous: e.target.checked })} />
              {t('report.anonymous')}
            </label>
          </div>

          {uploadProgress && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>{uploadProgress}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : t('report.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

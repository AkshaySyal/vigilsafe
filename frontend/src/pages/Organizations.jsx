import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { orgsAPI } from '../services/api';

const ROLE_COLORS = { admin: 'var(--high)', reporter: 'var(--medium)', viewer: '#888' };
const ORG_TYPES = ['workplace', 'school', 'community', 'family'];

export default function Organizations() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [orgs, setOrgs] = useState([]);
  const [members, setMembers] = useState([]);
  const [createName, setCreateName] = useState('');
  const [createType, setCreateType] = useState('community');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      orgsAPI.list().then(({ data }) => setOrgs(data)).catch(() => {});
      if (user.org_id) {
        orgsAPI.members(user.org_id).then(({ data }) => setMembers(data)).catch(() => {});
      }
    }
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!createName.trim()) return setError(t('org.name_required'));
    setLoading(true);
    try {
      await orgsAPI.create({ name: createName.trim(), type: createType });
      await refreshUser();
      setSuccess(t('org.created'));
      setCreateName('');
    } catch {
      setError(t('org.create_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (orgId) => {
    setError(''); setSuccess('');
    try {
      await orgsAPI.join(orgId);
      await refreshUser();
      setSuccess(t('org.joined'));
    } catch {
      setError(t('org.join_error'));
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await orgsAPI.setRole(user.org_id, userId, newRole);
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m));
      setSuccess(t('org.role_updated'));
    } catch {
      setError(t('org.role_error'));
    }
  };

  if (!user) {
    return (
      <div className="container">
        <p style={{ color: 'var(--text-muted)', marginTop: '2rem' }}>{t('org.login_required')}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">{t('org.title')}</h1>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', color: '#166534' }}>{success}</div>}

      {/* Current org status */}
      {user.org_id ? (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{t('org.your_org')}</div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                {orgs.find(o => o.id === user.org_id)?.name ?? `Org #${user.org_id}`}
              </div>
            </div>
            <span style={{ marginLeft: 'auto', padding: '0.3rem 0.9rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', background: ROLE_COLORS[user.role] + '22', color: ROLE_COLORS[user.role], border: `1px solid ${ROLE_COLORS[user.role]}` }}>
              {user.role}
            </span>
          </div>
          {user.role === 'viewer' && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{t('org.viewer_notice')}</p>
          )}
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>{t('org.no_org')}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* Create org */}
        {!user.org_id && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary)' }}>{t('org.create_title')}</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">{t('org.name')}</label>
                <input
                  className="form-input"
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  placeholder={t('org.name_placeholder')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('org.type')}</label>
                <select className="form-input" value={createType} onChange={e => setCreateType(e.target.value)}>
                  {ORG_TYPES.map(type => (
                    <option key={type} value={type}>{t(`report.categories.${type === 'workplace' ? 'work' : type}`)}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? '...' : t('org.create_btn')}
              </button>
            </form>
          </div>
        )}

        {/* Join org */}
        {!user.org_id && orgs.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary)' }}>{t('org.join_title')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {orgs.map(org => (
                <div key={org.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-secondary, #f8f9fa)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{org.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{org.type}</div>
                  </div>
                  <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.3rem 0.9rem' }} onClick={() => handleJoin(org.id)}>
                    {t('org.join_btn')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin: member management */}
        {user.org_id && user.role === 'admin' && members.length > 0 && (
          <div className="card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary)' }}>{t('org.members_title')}</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border, #e5e7eb)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('org.member_name')}</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('org.member_email')}</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('org.member_role')}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id} style={{ borderBottom: '1px solid var(--border, #e5e7eb)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>{member.username}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{member.email}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        {member.id === user.id ? (
                          <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.82rem', background: ROLE_COLORS[member.role] + '22', color: ROLE_COLORS[member.role] }}>{member.role}</span>
                        ) : (
                          <select
                            value={member.role}
                            onChange={e => handleRoleChange(member.id, e.target.value)}
                            style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border, #e5e7eb)', fontSize: '0.85rem', background: 'white', cursor: 'pointer' }}
                          >
                            <option value="viewer">viewer</option>
                            <option value="reporter">reporter</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Non-admin view: just show members */}
        {user.org_id && user.role !== 'admin' && members.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary)' }}>{t('org.members_title')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {members.map(member => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary, #f8f9fa)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{member.username}</span>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, background: ROLE_COLORS[member.role] + '22', color: ROLE_COLORS[member.role] }}>{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

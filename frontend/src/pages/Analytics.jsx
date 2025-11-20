import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { statsAPI } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = { low: '#38a169', medium: '#d69e2e', high: '#e53e3e' };
const BAR_COLORS = ['#0f4c75', '#1b6ca8', '#00b4d8', '#90e0ef'];

export default function Analytics() {
  const { t } = useLanguage();
  const [byCategory, setByCategory] = useState([]);
  const [overTime, setOverTime] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const [severityDist, setSeverityDist] = useState([]);

  useEffect(() => {
    statsAPI.byCategory().then(({ data }) => setByCategory(data)).catch(console.error);
    statsAPI.overTime().then(({ data }) => setOverTime(data)).catch(console.error);
    statsAPI.topTags().then(({ data }) => setTopTags(data)).catch(console.error);
    statsAPI.severityDist().then(({ data }) => setSeverityDist(data)).catch(console.error);
  }, []);

  const empty = <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem 0', fontSize: '0.9rem' }}>No data yet — submit some incidents first.</p>;

  return (
    <div className="container">
      <h1 className="page-title">{t('analytics.title')}</h1>

      <div className="charts-grid">
        <div className="card chart-card">
          <h3 className="chart-title">{t('analytics.by_category')}</h3>
          {byCategory.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f4c75" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">{t('analytics.severity_dist')}</h3>
          {severityDist.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={severityDist} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={85} label>
                  {severityDist.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[entry.severity] || BAR_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">{t('analytics.over_time')}</h3>
          {overTime.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={overTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#00b4d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">{t('analytics.top_tags')}</h3>
          {topTags.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topTags} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="tag" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1b6ca8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

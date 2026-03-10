import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const COLORS = ['#7c4dbb', '#c8870a', '#3abf8f', '#e05c7a', '#4a3080', '#f5c842'];

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card animate-fadeIn" style={{ '--accent': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLang();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stories/dashboard')
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="dashboard-page">
      <div style={{ display:'flex', justifyContent:'center', padding:'80px' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-page">
      <div className="container">
        <div style={{ color:'var(--clr-rose)', textAlign:'center', padding:'60px', fontWeight:600 }}>{error}</div>
      </div>
    </div>
  );

  const { summary, charts } = data || {};

  // Dil dağılımı için label
  const langData = (charts?.languageDistribution || []).map(d => ({
    name: d._id === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English',
    value: d.count,
  }));

  // Süre dağılımı
  const durationData = (charts?.durationDistribution || []).map(d => ({
    name: d._id === 'short' ? 'Kısa' : d._id === 'medium' ? 'Orta' : 'Uzun',
    value: d.count,
  }));

  // Yaş dağılımı
  const ageData = (charts?.ageDistribution || []).map(d => ({
    name: `${d._id} yaş`,
    count: d.count,
  }));

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dash-header animate-fadeIn">
          <h1 className="dash-title">{t.dashboard.title}</h1>
          <p className="dash-subtitle">Merhaba {user?.username}! 👋 {t.dashboard.subtitle}</p>
        </div>

        {/* Stat cards */}
        <div className="stat-cards">
          <StatCard icon="📚" label={t.dashboard.totalStories}
            value={summary?.totalStories ?? 0} color="var(--clr-magic)" />
          <StatCard icon="🌍" label={t.dashboard.publicStories}
            value={summary?.publicStories ?? 0} color="var(--clr-mint)" />
          <StatCard icon="⭐" label={t.dashboard.avgRating}
            value={summary?.avgRating > 0 ? `${summary.avgRating}/5` : '—'} color="var(--clr-gold)" />
        </div>

        {/* Charts grid */}
        <div className="charts-grid">

          {/* Stories per day — Bar chart */}
          <div className="chart-card animate-fadeIn">
            <h3 className="chart-title">📅 {t.dashboard.storiesPerDay}</h3>
            {charts?.storiesPerDay?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={charts.storiesPerDay} margin={{ top:8, right:8, bottom:8, left:-10 }}>
                  <XAxis dataKey="date" tick={{ fontSize:11, fill:'var(--clr-ink-muted)' }} />
                  <YAxis tick={{ fontSize:11, fill:'var(--clr-ink-muted)' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:8 }}
                    labelStyle={{ fontWeight:700 }}
                  />
                  <Bar dataKey="count" fill="var(--clr-magic)" radius={[6,6,0,0]} name="Hikaye" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="chart-empty">Henüz veri yok</div>}
          </div>

          {/* Language distribution — Pie */}
          <div className="chart-card animate-fadeIn">
            <h3 className="chart-title">🌐 {t.dashboard.languageDist}</h3>
            {langData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={langData} cx="50%" cy="50%" outerRadius={80}
                    dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                    labelLine={false}>
                    {langData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="chart-empty">Henüz veri yok</div>}
          </div>

          {/* Age distribution — Bar */}
          <div className="chart-card animate-fadeIn">
            <h3 className="chart-title">👶 {t.dashboard.ageDist}</h3>
            {ageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ageData} margin={{ top:8, right:8, bottom:8, left:-10 }}>
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--clr-ink-muted)' }} />
                  <YAxis tick={{ fontSize:11, fill:'var(--clr-ink-muted)' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:8 }} />
                  <Bar dataKey="count" fill="var(--clr-gold)" radius={[6,6,0,0]} name="Hikaye" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="chart-empty">Henüz veri yok</div>}
          </div>

          {/* Duration distribution — Pie */}
          <div className="chart-card animate-fadeIn">
            <h3 className="chart-title">⏱ {t.dashboard.durationDist}</h3>
            {durationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={durationData} cx="50%" cy="50%" outerRadius={80}
                    dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {durationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="chart-empty">Henüz veri yok</div>}
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const COLORS_BAR  = ['#7c3aed', '#7c3aed', '#7c3aed', '#7c3aed', '#7c3aed', '#7c3aed', '#7c3aed'];
const COLORS_LANG = ['#7c3aed', '#06b6d4'];
const COLORS_AGE  = ['#f59e0b', '#ec4899', '#10b981', '#f97316', '#06b6d4'];
const COLORS_DUR  = ['#ec4899', '#f97316', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="dash-tooltip">
        {label && <p className="dash-tooltip-label">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomBar = (props) => {
  const { x, y, width, height, fill } = props;
  return (
    <rect x={x} y={y} width={width} height={height}
      rx={6} ry={6} fill={fill} />
  );
};

function StatCard({ label, sublabel, value, color, index }) {
  return (
    <div className="stat-card animate-fadeIn" style={{ '--accent': color, animationDelay: `${index * 0.1}s` }}>
      <div className="stat-card-bar" style={{ background: color }} />
      <div className="stat-card-body">
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
        {sublabel && <div className="stat-sublabel">{sublabel}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLang();
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/stories/dashboard')
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-page">
      <div className="container">
        <div style={{ color: 'var(--clr-rose)', textAlign: 'center', padding: '60px', fontWeight: 600 }}>{error}</div>
      </div>
    </div>
  );

  const { summary, charts } = data || {};

  const langData = (charts?.languageDistribution || []).map(d => ({
    name: d._id === 'tr' ? 'Türkçe' : 'English',
    value: d.count,
  }));

  const durationData = (charts?.durationDistribution || []).map(d => ({
    name: d._id === 'short' ? 'Kısa (0-2 dk)' : d._id === 'medium' ? 'Orta (2-5 dk)' : 'Uzun (5 dk+)',
    value: d.count,
  }));

  const ageData = (charts?.ageDistribution || []).map(d => {
    const age = d._id;
    let label = `${age} Yaş`;
    if (age <= 4) label = '3-4 Yaş';
    else if (age <= 6) label = '5-6 Yaş';
    else if (age <= 8) label = '7-8 Yaş';
    else if (age <= 10) label = '9-10 Yaş';
    else label = '11+ Yaş';
    return { name: label, count: d.count };
  });

  const barData = charts?.storiesPerDay || [];

  return (
    <div className="dashboard-page">
      <div className="container">

        {/* Header */}
        <div className="dash-header animate-fadeIn">
          <h1 className="dash-title">{t.dashboard?.title || 'İstatistikler'}</h1>
          <p className="dash-subtitle">Merhaba {user?.username}! {t.dashboard?.subtitle || 'İstatistiklerin aşağıda'}</p>
        </div>

        {/* Stat kartları */}
        <div className="stat-cards">
          <StatCard index={0}
            label="Toplam Hikaye"
            sublabel="Oluşturulan tüm hikayelerin toplam sayısı"
            value={summary?.totalStories ?? 0}
            color="#7c3aed"
          />
          <StatCard index={1}
            label="Paylaşılan"
            sublabel="Topluluk ile paylaşılan hikayelerin sayısı"
            value={summary?.publicStories ?? 0}
            color="#06b6d4"
          />
          <StatCard index={2}
            label="Ortalama Puan"
            sublabel="Hikayelere verilen ortalama puan"
            value={summary?.avgRating > 0 ? `${summary.avgRating}/5` : '—'}
            color="#f59e0b"
          />
        </div>

        {/* Grafikler */}
        <div className="charts-grid">

          {/* Son 7 Gün — Bar */}
          <div className="chart-card animate-fadeIn">
            <div className="chart-card-header">
              <h3 className="chart-title">Son 7 Günlük Hikayeler</h3>
              <p className="chart-desc">Son 7 günde oluşturulan hikaye sayısı</p>
            </div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 16, right: 8, bottom: 8, left: -10 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--clr-ink-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--clr-ink-muted)' }} allowDecimals={false}
                    label={{ value: 'Hikaye Sayısı', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10, fill: 'var(--clr-ink-muted)' } }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Hikaye" radius={[6, 6, 0, 0]} fill="#7c3aed" maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="chart-empty">Henüz veri yok</div>}
          </div>

          {/* Dil Dağılımı — Pie */}
          <div className="chart-card animate-fadeIn">
            <div className="chart-card-header">
              <h3 className="chart-title">Dil Dağılımı</h3>
              <p className="chart-desc">Hikayelerin yazıldığı dillere göre dağılım</p>
            </div>
            {langData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={langData} cx="50%" cy="50%"
                    outerRadius={85} innerRadius={0}
                    dataKey="value"
                    label={false}
                    labelLine={false}
                  >
                    {langData.map((_, i) => (
                      <Cell key={i} fill={COLORS_LANG[i % COLORS_LANG.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="chart-empty">Henüz veri yok</div>}
          </div>

          {/* Yaş Dağılımı — Bar */}
          <div className="chart-card animate-fadeIn">
            <div className="chart-card-header">
              <h3 className="chart-title">Yaş Dağılımı</h3>
              <p className="chart-desc">Hikayeleri oluşturan kullanıcıların yaş gruplarına göre dağılımı</p>
            </div>
            {ageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ageData} margin={{ top: 16, right: 8, bottom: 8, left: -10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--clr-ink-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--clr-ink-muted)' }} allowDecimals={false}
                    label={{ value: 'Kullanıcı Sayısı', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10, fill: 'var(--clr-ink-muted)' } }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Hikaye" radius={[6, 6, 0, 0]} maxBarSize={28}>
                    {ageData.map((_, i) => (
                      <Cell key={i} fill={COLORS_AGE[i % COLORS_AGE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="chart-empty">Henüz veri yok</div>}
          </div>

          {/* Süre Dağılımı — Pie */}
          <div className="chart-card animate-fadeIn">
            <div className="chart-card-header">
              <h3 className="chart-title">Süre Dağılımı</h3>
              <p className="chart-desc">Hikayelerin okuma süresine göre dağılımı</p>
            </div>
            {durationData.length > 0 ? (
              <div style={{ position: 'relative' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={durationData} cx="50%" cy="45%"
                      outerRadius={85} innerRadius={42}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {durationData.map((_, i) => (
                        <Cell key={i} fill={COLORS_DUR[i % COLORS_DUR.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Ortada saat ikonu */}
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -62%)',
                  pointerEvents: 'none',
                }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="13" stroke="rgba(150,130,200,0.5)" strokeWidth="2" fill="none"/>
                    <line x1="16" y1="8" x2="16" y2="16" stroke="rgba(150,130,200,0.8)" strokeWidth="2.2" strokeLinecap="round"/>
                    <line x1="16" y1="16" x2="21" y2="19" stroke="rgba(150,130,200,0.8)" strokeWidth="2.2" strokeLinecap="round"/>
                    <circle cx="16" cy="16" r="1.8" fill="rgba(150,130,200,0.9)"/>
                    <line x1="16" y1="4" x2="16" y2="6" stroke="rgba(150,130,200,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="16" y1="26" x2="16" y2="28" stroke="rgba(150,130,200,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="4" y1="16" x2="6" y2="16" stroke="rgba(150,130,200,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="26" y1="16" x2="28" y2="16" stroke="rgba(150,130,200,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            ) : <div className="chart-empty">Henüz veri yok</div>}
          </div>

        </div>
      </div>
    </div>
  );
}
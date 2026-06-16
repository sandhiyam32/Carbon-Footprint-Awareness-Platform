import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">🌿</div>;

  const trendData = data?.monthly_trend?.slice().reverse().map(e => ({
    name: `${MONTHS[e.month - 1]} ${e.year}`,
    total: e.total_emission,
    transport: e.transport_emission,
    electricity: e.electricity_emission,
    food: e.food_emission,
    waste: e.waste_emission,
  })) || [];

  const pieData = data ? Object.entries(data.category_breakdown).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    value: Math.round(v * 10) / 10
  })).filter(d => d.value > 0) : [];

  const compareData = [
    { name: 'You', value: data?.current_emission || 0 },
    { name: 'National Avg', value: data?.national_avg || 400 },
    { name: 'Global Avg', value: data?.global_avg || 333 },
  ];

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Welcome back, {user?.first_name || user?.username}! 👋</h2>
          <p className="text-gray text-sm">Here's your carbon footprint overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/calculator')}>
          + Log Entry
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <span className="stat-icon">🌍</span>
          <div className="stat-value">{data?.current_emission?.toFixed(1) || '—'}</div>
          <div className="stat-label">kg CO₂ this month</div>
          <div className={`stat-change ${data?.reduction_percent >= 0 ? 'positive' : 'negative'}`}>
            {data?.reduction_percent >= 0 ? '↓' : '↑'} {Math.abs(data?.reduction_percent || 0)}% vs last month
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div className="stat-value">{data?.yearly_emission?.toFixed(0) || '—'}</div>
          <div className="stat-label">kg CO₂ this year</div>
          <div className="stat-change positive">Annual total</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏭</span>
          <div className="stat-value">{data?.national_avg || 400}</div>
          <div className="stat-label">National avg (kg/mo)</div>
          <div className={`stat-change ${(data?.current_emission || 0) < data?.national_avg ? 'positive' : 'negative'}`}>
            {(data?.current_emission || 0) < data?.national_avg ? '✓ Below average' : '⚠ Above average'}
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🌐</span>
          <div className="stat-value">{data?.global_avg || 333}</div>
          <div className="stat-label">Global avg (kg/mo)</div>
          <div className={`stat-change ${(data?.current_emission || 0) < data?.global_avg ? 'positive' : 'negative'}`}>
            {(data?.current_emission || 0) < data?.global_avg ? '✓ Below global' : '⚠ Above global'}
          </div>
        </div>
      </div>

      {!data?.current_emission && (
        <div className="card" style={{ marginBottom: '24px', textAlign: 'center', padding: '32px' }}>
          <span style={{ fontSize: '48px' }}>📊</span>
          <h3 style={{ marginTop: '12px', color: '#374151' }}>No data yet!</h3>
          <p style={{ color: '#6b7280', margin: '8px 0 20px' }}>Log your first carbon entry to see your personalized dashboard.</p>
          <button className="btn btn-primary" onClick={() => navigate('/calculator')}>Start Tracking 🌱</button>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-title">📈 Monthly Emission Trend</div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v.toFixed(1)} kg CO₂`, 'Emission']} />
                <Area type="monotone" dataKey="total" stroke="#22c55e" fill="url(#colorTotal)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <span className="empty-icon">📊</span>
              <p>Log entries to see trends</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">🍕 Emission Breakdown</div>
          {pieData.length > 0 ? (
            <div style={{ padding: '8px 0' }}>
              {pieData.map((item, i) => {
                const total = pieData.reduce((s, d) => s + d.value, 0);
                const pct = total > 0 ? Math.round(item.value / total * 100) : 0;
                return (
                  <div key={item.name} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                        {['🚗','⚡','💧','🥗','♻️'][i]} {item.name}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: COLORS[i % COLORS.length] }}>
                        {item.value} kg &nbsp;<span style={{ color: '#9ca3af', fontWeight: 400 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '4px',
                        width: `${pct}%`,
                        background: COLORS[i % COLORS.length],
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Total</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a' }}>
                  {pieData.reduce((s, d) => s + d.value, 0).toFixed(1)} kg CO₂
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <span className="empty-icon">🍕</span>
              <p>Log entries to see breakdown</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">📊 Your Footprint vs Averages (kg CO₂/month)</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={compareData} barSize={60}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `${v} kg CO₂`} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {compareData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

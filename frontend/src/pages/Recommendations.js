import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/recommendations/').then(res => setRecs(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">🌿</div>;

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Personalized Recommendations</h2>
          <p className="text-gray text-sm">AI-powered suggestions based on your lifestyle data</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {[
          { icon: '🌱', label: 'Eco Score', value: recs.length <= 2 ? 'Excellent' : recs.length <= 4 ? 'Good' : 'Needs Work', color: recs.length <= 2 ? '#16a34a' : recs.length <= 4 ? '#f59e0b' : '#dc2626' },
          { icon: '💡', label: 'Active Tips', value: recs.length, color: '#3b82f6' },
          { icon: '🎯', label: 'Potential Savings', value: `${recs.filter(r => r.impact === 'high').length * 25 + recs.filter(r => r.impact === 'medium').length * 15}%`, color: '#16a34a' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">🎯 Your Action Plan</div>
        {recs.map((rec, i) => (
          <div key={i} className={`recommendation-card impact-${rec.impact}`}>
            <span className="rec-icon">{rec.icon}</span>
            <div className="rec-content">
              <h4>{rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}</h4>
              <p>{rec.tip}</p>
              <span className={`badge badge-${rec.impact === 'high' ? 'red' : rec.impact === 'medium' ? 'yellow' : 'green'}`} style={{ marginTop: '8px' }}>
                {rec.impact.toUpperCase()} IMPACT
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-title">📚 Quick Eco Tips</div>
        <div className="grid-2">
          {[
            { icon: '🚲', tip: 'Cycle for trips under 5km. Saves up to 4.5kg CO₂/trip.' },
            { icon: '🌡️', tip: 'Lower thermostat by 1°C in winter. Saves 10% on heating.' },
            { icon: '🛒', tip: 'Buy local produce. Reduces food miles by up to 90%.' },
            { icon: '🔌', tip: 'Unplug devices when not in use. Saves 10% electricity.' },
            { icon: '🌿', tip: 'Plant a tree. A single tree absorbs ~22kg CO₂/year.' },
            { icon: '💧', tip: '5-minute showers save ~45 liters vs 10-minute showers.' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px', background: '#f0fdf4', borderRadius: '8px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px' }}>{t.icon}</span>
              <p style={{ fontSize: '14px', color: '#374151' }}>{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

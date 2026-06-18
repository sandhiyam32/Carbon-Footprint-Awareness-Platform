import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', target_emission: '', current_emission: '', deadline: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/goals/'), api.get('/badges/')]).then(([g, b]) => {
      setGoals(g.data.results || g.data);
      setBadges(b.data.results || b.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/goals/', form);
      setGoals(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ title: '', target_emission: '', current_emission: '', deadline: '' });
      toast.success('Goal created! 🎯');
    } catch { toast.error('Failed to create goal'); }
  };

  const handleDelete = async id => {
    await api.delete(`/goals/${id}/`);
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Goal removed');
  };

  if (loading) return <div className="loading">🌿</div>;

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Goals & Achievements</h2>
          <p className="text-gray text-sm">Set targets and earn badges</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-title">🎯 Create New Goal</div>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Goal Title</label>
                <input className="form-input" placeholder="e.g. Reduce transport emissions" required
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input type="date" className="form-input" required
                  value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Emission (kg CO₂/month)</label>
                <input type="number" className="form-input" placeholder="150" required
                  value={form.target_emission} onChange={e => setForm(p => ({ ...p, target_emission: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Current Emission (kg CO₂/month)</label>
                <input type="number" className="form-input" placeholder="300"
                  value={form.current_emission} onChange={e => setForm(p => ({ ...p, current_emission: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Save Goal 🎯</button>
          </form>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {goals.length === 0 ? (
          <div className="card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '48px' }}>
            <span style={{ fontSize: '48px' }}>🎯</span>
            <h3 style={{ margin: '12px 0 8px', color: '#374151' }}>No goals yet</h3>
            <p style={{ color: '#6b7280' }}>Set your first carbon reduction goal!</p>
          </div>
        ) : goals.map(goal => {
          const progress = goal.current_emission > 0
            ? Math.min(100, Math.max(0, Math.round((1 - goal.target_emission / goal.current_emission) * 100)))
            : 0;
          const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
          return (
            <div className="card" key={goal.id}>
              <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{goal.title}</h3>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(goal.id)}>✕</button>
              </div>
              <div className="flex gap-4 mb-4" style={{ fontSize: 13, color: '#6b7280' }}>
                <span>🎯 Target: <strong>{goal.target_emission} kg</strong></span>
                <span>📍 Current: <strong>{goal.current_emission} kg</strong></span>
                <span>📅 {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}</span>
              </div>
              <div className="flex justify-between text-sm mb-4" style={{ marginBottom: '4px' }}>
                <span>Progress</span><span>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              {goal.achieved && <span className="badge badge-green" style={{ marginTop: '10px' }}>✓ Achieved!</span>}
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title">🏆 Badges & Achievements</div>
        {badges.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🏅</span>
            <h3>No badges yet</h3>
            <p>Log entries and complete challenges to earn badges!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {badges.map(b => (
              <div key={b.id} style={{ textAlign: 'center', padding: '20px', background: '#f0fdf4', borderRadius: '12px', minWidth: '120px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>{b.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#166534' }}>{b.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{b.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

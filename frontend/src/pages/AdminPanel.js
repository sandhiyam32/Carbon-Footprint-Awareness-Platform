import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [challengeForm, setChallengeForm] = useState({ title: '', description: '', points: 10, duration_days: 7 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_staff) { navigate('/'); return; }
    Promise.all([api.get('/admin/stats/'), api.get('/admin/users/')]).then(([s, u]) => {
      setStats(s.data);
      setUsers(u.data.results || u.data);
    }).finally(() => setLoading(false));
  }, [user, navigate]);

  const handleAddChallenge = async e => {
    e.preventDefault();
    try {
      await api.post('/challenges/', challengeForm);
      toast.success('Challenge created!');
      setChallengeForm({ title: '', description: '', points: 10, duration_days: 7 });
    } catch { toast.error('Failed to create challenge'); }
  };

  if (loading) return <div className="loading">🌿</div>;
  if (!user?.is_staff) return null;

  const statsCards = [
    { icon: '👥', label: 'Total Users', value: stats?.total_users },
    { icon: '📊', label: 'Total Entries', value: stats?.total_entries },
    { icon: '📰', label: 'Articles', value: stats?.total_articles },
    { icon: '🏆', label: 'Challenges', value: stats?.total_challenges },
    { icon: '💬', label: 'Forum Posts', value: stats?.total_posts },
    { icon: '🌍', label: 'Avg Emission', value: `${stats?.avg_emission?.toFixed(1)} kg` },
  ];

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>🛡️ Admin Panel</h2>
          <p className="text-gray text-sm">Platform management and analytics</p>
        </div>
      </div>

      <div className="tabs">
        {['overview', 'users', 'challenges'].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Users' : '🏆 Challenges'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {statsCards.map(s => (
              <div className="stat-card" key={s.label}>
                <span className="stat-icon">{s.icon}</span>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">📈 Platform Stats</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[
                { name: 'Users', value: stats?.total_users },
                { name: 'Entries', value: stats?.total_entries },
                { name: 'Articles', value: stats?.total_articles },
                { name: 'Challenges', value: stats?.total_challenges },
                { name: 'Posts', value: stats?.total_posts },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="card-title">👥 Registered Users</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'Username', 'Name', 'Email', 'Admin', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', color: '#9ca3af' }}>{i + 1}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>@{u.username}</td>
                  <td style={{ padding: '12px' }}>{u.first_name} {u.last_name}</td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    {u.is_admin ? <span className="badge badge-blue">Admin</span> : <span className="badge badge-green">User</span>}
                  </td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="card">
          <div className="card-title">🏆 Create Eco-Challenge</div>
          <form onSubmit={handleAddChallenge}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Challenge Title</label>
                <input className="form-input" required value={challengeForm.title}
                  onChange={e => setChallengeForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. No-Car Week" />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (days)</label>
                <input type="number" className="form-input" value={challengeForm.duration_days}
                  onChange={e => setChallengeForm(p => ({ ...p, duration_days: parseInt(e.target.value) }))} min={1} max={365} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" required value={challengeForm.description}
                onChange={e => setChallengeForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the challenge..." style={{ minHeight: '80px' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Points Reward: <strong>{challengeForm.points}</strong></label>
              <input type="range" className="form-range" min={5} max={100} value={challengeForm.points}
                onChange={e => setChallengeForm(p => ({ ...p, points: parseInt(e.target.value) }))} />
            </div>
            <button type="submit" className="btn btn-primary">Create Challenge 🏆</button>
          </form>
        </div>
      )}
    </div>
  );
}

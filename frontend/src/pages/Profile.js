import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [loading, setLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' });

  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.patch('/profile/', form);
      updateUser(data);
      toast.success('Profile updated! ✅');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const initial = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div>
      <div className="section-header">
        <h2>My Profile</h2>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: 700, color: 'white'
            }}>{initial}</div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '18px' }}>{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>@{user?.username}</p>
              {user?.is_staff && <span className="badge badge-blue" style={{ marginTop: '4px' }}>Admin</span>}
            </div>
          </div>

          <div className="card-title">✏️ Edit Profile</div>
          <form onSubmit={handleUpdate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about your eco journey..." style={{ minHeight: '80px' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Saving...' : '✅ Save Changes'}
            </button>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-title">📊 Account Stats</div>
            {[
              { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' },
              { label: 'Username', value: `@${user?.username}` },
              { label: 'Email', value: user?.email || 'Not set' },
              { label: 'Account type', value: user?.is_staff ? 'Administrator' : 'Regular User' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>{s.label}</span>
                <span style={{ fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">🌿 Eco Identity</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { icon: '🌱', label: 'Eco Explorer', desc: 'Started tracking' },
                { icon: '♻️', label: 'Recycler', desc: 'Eco conscious' },
                { icon: '🌍', label: 'Climate Aware', desc: 'Learning' },
                { icon: '💚', label: 'Green Heart', desc: 'Community member' },
              ].map((b, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '16px', background: '#f0fdf4', borderRadius: '10px' }}>
                  <div style={{ fontSize: '28px' }}>{b.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#166534', marginTop: '6px' }}>{b.label}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

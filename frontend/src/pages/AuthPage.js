import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

export default function AuthPage({ defaultTab = 'login', onSuccess }) {
  const [tab, setTab] = useState(defaultTab);
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.username, form.password);
        toast.success('Welcome back! 🌿');
      } else {
        await register(form);
        toast.success('Account created! Welcome to EcoTrack 🌍');
      }
      if (onSuccess) onSuccess();
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: 'unset', background: 'transparent', padding: 0 }}>
      <div className="auth-card" style={{ maxWidth: '100%' }}>
        <div className="auth-logo">
          <span className="logo-emoji">🌿</span>
          <h1>Carbon Footprint Platform</h1>
          <p>Track, reduce, and celebrate your eco-journey</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Login</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="grid-2" style={{ gap: '12px', marginBottom: '0' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input name="first_name" className="form-input" value={form.first_name} onChange={handleChange} placeholder="John" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input name="last_name" className="form-input" value={form.last_name} onChange={handleChange} placeholder="Doe" />
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Username</label>
            <input name="username" className="form-input" value={form.username} onChange={handleChange} placeholder="Enter username" required />
          </div>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} placeholder="john@example.com" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? '⏳ Please wait...' : tab === 'login' ? '🌿 Login' : '🌍 Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

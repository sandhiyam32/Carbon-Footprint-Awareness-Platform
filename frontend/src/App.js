import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Recommendations from './pages/Recommendations';
import Goals from './pages/Goals';
import Education from './pages/Education';
import Community from './pages/Community';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">🌿</div>;
  return user ? children : <Navigate to="/" />;
};

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">🌿</div>;

  return (
    <Routes>
      {/* Public landing page - always accessible */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />

      {/* Protected app routes */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="goals" element={<Goals />} />
        <Route path="education" element={<Education />} />
        <Route path="community" element={<Community />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

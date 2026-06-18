import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdCalculate, MdLightbulb, MdFlag, MdSchool,
  MdPeople, MdBarChart, MdPerson, MdAdminPanelSettings, MdLogout, MdMenu, MdClose, MdEco
} from 'react-icons/md';

const navItems = [
  { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
  { to: '/calculator', icon: <MdCalculate />, label: 'Calculator' },
  { to: '/recommendations', icon: <MdLightbulb />, label: 'Recommendations' },
  { to: '/goals', icon: <MdFlag />, label: 'Goals & Badges' },
  { to: '/education', icon: <MdSchool />, label: 'Education Hub' },
  { to: '/community', icon: <MdPeople />, label: 'Community' },
  { to: '/reports', icon: <MdBarChart />, label: 'Reports' },
  { to: '/profile', icon: <MdPerson />, label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initial = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon"><MdEco /></span>
          <h2>Carbon Footprint<br />Platform</h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
          {user?.is_staff && (
            <>
              <div className="nav-section-title">Admin</div>
              <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <MdAdminPanelSettings /> Admin Panel
              </NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout}>
            <MdLogout /> Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="flex items-center gap-2">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <MdClose /> : <MdMenu />}
            </button>
            <span className="topbar-title">🌿 EcoTrack</span>
          </div>
          <div className="topbar-right">
            <div className="user-avatar" onClick={() => navigate('/profile')} title={user?.username}>
              {initial}
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

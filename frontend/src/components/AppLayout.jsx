import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const AppLayout = ({ children, title, subtitle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const roleClass = user?.role === 'Admin'
    ? 'role-admin'
    : user?.role === 'Club Coordinator'
    ? 'role-coordinator'
    : 'role-student';

  return (
    <div className="app-layout">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="app-main">
        {/* Top Bar */}
        <header className="app-topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <i className="bi bi-list" style={{ fontSize: '1.2rem' }} />
          </button>

          <div style={{ flex: 1, paddingLeft: '0.75rem' }}>
            {title && <div className="topbar-page-title">{title}</div>}
            {subtitle && <div className="topbar-breadcrumb">{subtitle}</div>}
          </div>

          {/* User info in topbar -> links to /profile */}
          <Link
            to="/profile"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              textDecoration: 'none', cursor: 'pointer',
            }}
            title="View Profile"
          >
            <div style={{ textAlign: 'right', display: 'none' }} className="d-sm-block">
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
              <span className={`badge role-badge ${roleClass}`} style={{ fontSize: '0.65rem' }}>{user?.role}</span>
            </div>
            <div className="user-avatar user-avatar-sm">{initials}</div>
          </Link>
        </header>

        {/* Main Content */}
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

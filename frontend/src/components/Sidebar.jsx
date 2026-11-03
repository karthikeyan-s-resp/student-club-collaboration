import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.stopPropagation();
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const navItemClass = ({ isActive }) =>
    `sidebar-nav-link${isActive ? ' active' : ''}`;

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay${mobileOpen ? ' open' : ''}`}
        onClick={onClose}
      />

      <aside className={`app-sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Brand */}
        <NavLink to="/dashboard" className="sidebar-brand" onClick={handleNavClick}>
          <div className="sidebar-brand-icon">
            <i className="bi bi-mortarboard-fill" />
          </div>
          <span className="sidebar-brand-text">CampusClubs</span>
        </NavLink>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Main */}
          <div className="sidebar-section-label">Main</div>
          <NavLink to="/dashboard" end className={navItemClass} onClick={handleNavClick}>
            <i className="bi bi-grid-1x2" />
            Dashboard
          </NavLink>
          <NavLink to="/clubs" className={navItemClass} onClick={handleNavClick}>
            <i className="bi bi-collection" />
            Discover Clubs
          </NavLink>
          <NavLink to="/events" className={navItemClass} onClick={handleNavClick}>
            <i className="bi bi-calendar3" />
            Campus Events
          </NavLink>
          <NavLink to="/my-activities" className={navItemClass} onClick={handleNavClick}>
            <i className="bi bi-person-badge" />
            My Activities
          </NavLink>
          <NavLink to="/announcements" className={navItemClass} onClick={handleNavClick}>
            <i className="bi bi-bell" />
            Announcements
          </NavLink>
          <NavLink to="/profile" className={navItemClass} onClick={handleNavClick}>
            <i className="bi bi-person-circle" />
            My Profile
          </NavLink>

          {/* Coordinator Tools */}
          {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
            <>
              <div className="sidebar-section-label">Coordinator</div>
              <NavLink to="/coordinator/manage-requests" className={navItemClass} onClick={handleNavClick}>
                <i className="bi bi-person-check" />
                Member Requests
              </NavLink>
              <NavLink to="/collaborations" className={navItemClass} onClick={handleNavClick}>
                <i className="bi bi-diagram-3" />
                Collaborations
              </NavLink>
            </>
          )}

          {/* Admin */}
          {user?.role === 'Admin' && (
            <>
              <div className="sidebar-section-label">Administration</div>
              <NavLink to="/admin" className={navItemClass} onClick={handleNavClick}>
                <i className="bi bi-shield-shaded" />
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        {/* User Footer */}
        <div className="sidebar-user">
          <Link
            to="/profile"
            onClick={handleNavClick}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              flex: 1, minWidth: 0, textDecoration: 'none',
            }}
            title="View Profile"
          >
            <div className="user-avatar user-avatar-sm">
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.role}
              </div>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: 'none', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem',
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'var(--transition-fast)', flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger-border)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <i className="bi bi-box-arrow-right" style={{ fontSize: '0.875rem' }} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

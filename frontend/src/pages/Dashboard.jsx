import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';

// Loading skeleton for stat cards
const StatSkeleton = () => (
  <div className="stat-card">
    <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
      <div className="skeleton skeleton-title" style={{ width: '40%' }} />
    </div>
  </div>
);

const EventRowSkeleton = () => (
  <div className="event-row" style={{ opacity: 0.6 }}>
    <div className="skeleton" style={{ width: 48, height: 52, borderRadius: 10, flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-text" style={{ width: '70%', marginBottom: 6 }} />
      <div className="skeleton skeleton-text" style={{ width: '50%', height: '0.7rem' }} />
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, eventsRes, announcementsRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/events?timeFilter=upcoming'),
        API.get('/announcements'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (eventsRes.data.success) setUpcomingEvents(eventsRes.data.data.slice(0, 4));
      if (announcementsRes.data.success) setAnnouncements(announcementsRes.data.data.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Clubs',
      value: stats?.totalClubs ?? 0,
      icon: 'bi-collection-fill',
      iconClass: 'stat-icon-indigo',
      trend: 'Active clubs',
    },
    {
      label: 'Upcoming Events',
      value: stats?.upcomingEvents ?? 0,
      icon: 'bi-calendar-event-fill',
      iconClass: 'stat-icon-green',
      trend: 'Scheduled',
    },
    {
      label: 'My Memberships',
      value: stats?.myMembershipsCount ?? 0,
      icon: 'bi-patch-check-fill',
      iconClass: 'stat-icon-violet',
      trend: 'Approved',
    },
    {
      label: 'Events Registered',
      value: stats?.myRegisteredEventsCount ?? 0,
      icon: 'bi-ticket-perforated-fill',
      iconClass: 'stat-icon-amber',
      trend: 'Confirmed',
    },
  ];

  const priorityBarClass = (priority) => {
    if (priority === 'Urgent') return 'priority-urgent';
    if (priority === 'Important') return 'priority-important';
    return 'priority-normal';
  };

  const priorityBadgeClass = (priority) => {
    if (priority === 'Urgent') return 'priority-badge-urgent';
    if (priority === 'Important') return 'priority-badge-important';
    return 'priority-badge-normal';
  };

  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout title="Dashboard" subtitle="Home · Overview">
      {/* Welcome Banner */}
      <div className="welcome-banner mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div className="welcome-badge">
              <i className="bi bi-stars" /> Academic Session 2026
            </div>
            <h2 className="welcome-title">{greeting()}, {user?.name?.split(' ')[0]}! 👋</h2>
            <p className="welcome-subtitle">
              Welcome to the Student Club Collaboration Platform. Explore clubs, engage in events, and collaborate across campus.
            </p>
          </div>
          <div className="welcome-actions" style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <Link to="/clubs" className="btn btn-white btn-sm">
              <i className="bi bi-compass me-1" /> Explore Clubs
            </Link>
            <Link to="/events" className="btn btn-ghost-white btn-sm">
              <i className="bi bi-calendar-check me-1" /> View Events
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div className="col-6 col-lg-3" key={i}><StatSkeleton /></div>
            ))
          : statCards.map((card) => (
              <div className="col-6 col-lg-3" key={card.label}>
                <div className="stat-card">
                  <div className={`stat-icon ${card.iconClass}`}>
                    <i className={`bi ${card.icon}`} />
                  </div>
                  <div>
                    <div className="stat-label">{card.label}</div>
                    <div className="stat-value">{card.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{card.trend}</div>
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {/* Coordinator Action Notice */}
      {!loading && (user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
        (stats?.pendingClubRequestsCount > 0 || stats?.pendingCollabsCount > 0) && (
          <div className="coordinator-action-notice">
            <div>
              <i className="bi bi-bell-fill me-2" style={{ color: 'var(--info)' }} />
              <strong style={{ color: '#1e40af', fontWeight: 700 }}>Actions Required </strong>
              <span className="coordinator-action-notice-text">
                You have <strong>{stats?.pendingClubRequestsCount || 0}</strong> pending membership requests
                and <strong>{stats?.pendingCollabsCount || 0}</strong> collaboration proposals awaiting your review.
              </span>
            </div>
            <Link to="/coordinator/manage-requests" className="btn btn-sm btn-primary">
              Review Now <i className="bi bi-arrow-right ms-1" />
            </Link>
          </div>
        )
      )}

      {/* Two Column: Events & Announcements */}
      <div className="row g-4">
        {/* Upcoming Events */}
        <div className="col-12 col-xl-7">
          <div className="section-card h-100">
            <div className="section-card-header">
              <span className="section-card-title">
                <i className="bi bi-calendar4-week" /> Upcoming Events
              </span>
              <Link to="/events" className="section-view-all">
                View all <i className="bi bi-arrow-right" />
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {Array(3).fill(0).map((_, i) => <EventRowSkeleton key={i} />)}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem 2rem' }}>
                <div className="empty-state-icon"><i className="bi bi-calendar-x" /></div>
                <h5>No upcoming events</h5>
                <p>Events from campus clubs will appear here once scheduled.</p>
                <Link to="/events" className="btn btn-sm btn-outline-primary">Browse Events</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {upcomingEvents.map((evt) => {
                  const d = new Date(evt.date);
                  return (
                    <div key={evt._id} className="event-row">
                      <div className="event-date-badge">
                        <span className="day">{d.getDate()}</span>
                        <span className="month">{d.toLocaleString('en', { month: 'short' })}</span>
                      </div>
                      <div className="event-info">
                        <h6>{evt.title}</h6>
                        <div className="event-meta">
                          <span><i className="bi bi-clock" />{evt.time}</span>
                          <span><i className="bi bi-geo-alt" />{evt.venue}</span>
                          {evt.club?.name && <span><i className="bi bi-collection" />{evt.club.name}</span>}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <span className="badge" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid var(--primary-border)', fontSize: '0.68rem' }}>
                          {evt.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Latest Announcements */}
        <div className="col-12 col-xl-5">
          <div className="section-card h-100">
            <div className="section-card-header">
              <span className="section-card-title">
                <i className="bi bi-megaphone" /> Club Notices
              </span>
              <Link to="/announcements" className="section-view-all">
                View all <i className="bi bi-arrow-right" />
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="skeleton" style={{ width: 4, borderRadius: 100, flexShrink: 0, minHeight: 70 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                      <div className="skeleton skeleton-text" style={{ width: '90%', height: '0.7rem' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem 2rem' }}>
                <div className="empty-state-icon"><i className="bi bi-megaphone" /></div>
                <h5>No announcements</h5>
                <p>Club notices and updates will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {announcements.map((item) => (
                  <div key={item._id} className="announcement-card" style={{ padding: '0.875rem 1rem' }}>
                    <div className={`announcement-priority-bar ${priorityBarClass(item.priority)}`} />
                    <div className="announcement-body">
                      <div className="announcement-meta">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {item.club?.name || 'General'}
                        </span>
                        <span className={`badge ${priorityBadgeClass(item.priority)}`}>{item.priority}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-card mt-4">
        <div className="section-card-title mb-3"><i className="bi bi-lightning-charge-fill" /> Quick Actions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {[
            { to: '/clubs', icon: 'bi-compass', label: 'Explore Clubs', desc: 'Find your community', color: 'var(--primary-bg)', iconColor: 'var(--primary)' },
            { to: '/events', icon: 'bi-calendar-plus', label: 'View Events', desc: 'Upcoming activities', color: 'var(--success-bg)', iconColor: 'var(--success)' },
            { to: '/my-activities', icon: 'bi-person-badge', label: 'My Activities', desc: 'Track memberships', color: 'var(--violet-bg)', iconColor: 'var(--violet)' },
            { to: '/announcements', icon: 'bi-bell', label: 'Announcements', desc: 'Latest notices', color: 'var(--warning-bg)', iconColor: 'var(--warning)' },
          ].map(({ to, icon, label, desc, color, iconColor }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1.25rem',
                background: color,
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'var(--transition)',
                flex: '1 1 180px',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.8)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, fontSize: '1.1rem', flexShrink: 0 }}>
                <i className={`bi ${icon}`} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

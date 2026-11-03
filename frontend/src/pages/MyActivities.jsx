import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const MyActivities = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('memberships');
  const [memberships, setMemberships] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [memRes, regRes] = await Promise.all([
        API.get('/memberships/my-requests'),
        API.get('/events/my-registrations'),
      ]);
      if (memRes.data.success) setMemberships(memRes.data.data);
      if (regRes.data.success) setRegistrations(regRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    Approved: { cls: 'status-approved', icon: 'bi-check-circle-fill', label: 'Approved' },
    Pending: { cls: 'status-pending', icon: 'bi-hourglass-split', label: 'Pending Review' },
    Rejected: { cls: 'status-rejected', icon: 'bi-x-circle-fill', label: 'Rejected' },
    Confirmed: { cls: 'status-approved', icon: 'bi-ticket-perforated-fill', label: 'Confirmed' },
  };

  return (
    <AppLayout title="My Activities" subtitle="Memberships & Event Registrations">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>My Campus Activities</h2>
          <p>Track your club memberships, application reviews, and event registrations</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Club Memberships', value: memberships.length, icon: 'bi-collection-fill', iconClass: 'stat-icon-indigo', sub: `${memberships.filter(m => m.status === 'Approved').length} approved` },
          { label: 'Pending Requests', value: memberships.filter(m => m.status === 'Pending').length, icon: 'bi-hourglass-split', iconClass: 'stat-icon-amber', sub: 'Awaiting review' },
          { label: 'Event Registrations', value: registrations.length, icon: 'bi-ticket-perforated-fill', iconClass: 'stat-icon-green', sub: 'Events joined' },
        ].map(card => (
          <div className="col-12 col-sm-4" key={card.label}>
            <div className="stat-card">
              <div className={`stat-icon ${card.iconClass}`}><i className={`bi ${card.icon}`} /></div>
              <div>
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">{card.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{card.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
        {[
          { id: 'memberships', label: 'Club Memberships', icon: 'bi-collection', count: memberships.length },
          { id: 'events', label: 'Event Registrations', icon: 'bi-ticket-perforated', count: registrations.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.625rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'var(--transition-fast)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: -1,
            }}
          >
            <i className={`bi ${tab.icon}`} />
            {tab.label}
            <span style={{
              background: activeTab === tab.id ? 'var(--primary-bg)' : 'var(--bg-hover)',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              borderRadius: 100, padding: '0.1em 0.6em', fontSize: '0.72rem', fontWeight: 700,
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                <div className="skeleton skeleton-text" style={{ width: '25%', height: '0.7rem' }} />
              </div>
              <div className="skeleton" style={{ width: 80, height: 26, borderRadius: 100 }} />
            </div>
          ))}
        </div>
      ) : activeTab === 'memberships' ? (
        memberships.length === 0 ? (
          <div className="section-card">
            <div className="empty-state">
              <div className="empty-state-icon"><i className="bi bi-person-x" /></div>
              <h5>No Club Memberships</h5>
              <p>You haven't requested to join any clubs yet. Explore the club directory to find your community!</p>
              <Link to="/clubs" className="btn btn-sm btn-primary"><i className="bi bi-compass me-1" />Discover Clubs</Link>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Club</th>
                  <th>Category</th>
                  <th>Applied On</th>
                  <th>Role in Club</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map(m => {
                  const sc = statusConfig[m.status] || statusConfig.Pending;
                  return (
                    <tr key={m._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <img
                            src={m.club?.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=100&q=80'}
                            alt=""
                            style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.club?.name || 'Club'}</div>
                            {m.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: 200 }} className="text-ellipsis">"{m.notes}"</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                          {m.club?.category || 'General'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {new Date(m.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{m.roleInClub}</td>
                      <td>
                        <span className={`status-badge ${sc.cls}`}>
                          <i className={`bi ${sc.icon}`} /> {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        registrations.length === 0 ? (
          <div className="section-card">
            <div className="empty-state">
              <div className="empty-state-icon"><i className="bi bi-ticket" /></div>
              <h5>No Event Registrations</h5>
              <p>You haven't registered for any campus events yet. Explore upcoming events and register now!</p>
              <Link to="/events" className="btn btn-sm btn-primary"><i className="bi bi-calendar-event me-1" />Explore Events</Link>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {registrations.map(reg => {
              const sc = statusConfig[reg.status] || statusConfig.Confirmed;
              const d = reg.event ? new Date(reg.event.date) : null;
              return (
                <div key={reg._id} className="col-12 col-md-6">
                  <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    borderLeft: '4px solid var(--primary)',
                    transition: 'var(--transition)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderLeftColor = 'var(--primary-dark)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderLeftColor = 'var(--primary)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                      <span style={{
                        background: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid var(--primary-border)',
                        borderRadius: 100, padding: '0.2em 0.7em', fontSize: '0.72rem', fontWeight: 700,
                      }}>
                        {reg.event?.club?.name || 'Campus Event'}
                      </span>
                      <span className={`status-badge ${sc.cls}`}>
                        <i className={`bi ${sc.icon}`} /> {reg.status}
                      </span>
                    </div>

                    <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
                      {reg.event?.title || 'Event Title'}
                    </h5>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                      {d && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i className="bi bi-calendar3" style={{ color: 'var(--primary)' }} />
                          {d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {reg.event?.venue && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i className="bi bi-geo-alt" style={{ color: 'var(--primary)' }} />
                          {reg.event.venue}
                        </span>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TICKET</span>
                      <span style={{
                        fontFamily: 'monospace', background: 'var(--text-primary)', color: '#fff',
                        borderRadius: 6, padding: '0.25rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em',
                      }}>
                        {reg.ticketNumber}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </AppLayout>
  );
};

export default MyActivities;

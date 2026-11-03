import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import API from '../api/client';
import { useToast } from '../context/ToastContext';

const AdminPanel = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deletingClubId, setDeletingClubId] = useState(null);
  const [confirmDeleteClub, setConfirmDeleteClub] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [clubSearch, setClubSearch] = useState('');

  useEffect(() => { fetchAdminData(); }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, clubsRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/admin/users'),
        API.get('/clubs'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (clubsRes.data.success) setClubs(clubsRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      const res = await API.put(`/dashboard/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        addToast(`User role updated to ${newRole}!`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user role', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteClub = async (clubId) => {
    setDeletingClubId(clubId);
    try {
      const res = await API.delete(`/clubs/${clubId}`);
      if (res.data.success) {
        addToast('Club deleted successfully!', 'info');
        fetchAdminData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete club', 'error');
    } finally {
      setDeletingClubId(null);
      setConfirmDeleteClub(null);
    }
  };

  const adminStats = [
    { label: 'Registered Users', value: stats?.totalUsers || 0, icon: 'bi-people-fill', color: 'var(--primary)', bg: 'var(--primary-bg)', border: 'var(--primary-border)' },
    { label: 'Campus Clubs', value: stats?.totalClubs || 0, icon: 'bi-collection-fill', color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)' },
    { label: 'Total Events', value: stats?.totalEvents || 0, icon: 'bi-calendar-event-fill', color: 'var(--violet)', bg: 'var(--violet-bg)', border: 'rgba(124,58,237,0.2)' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents || 0, icon: 'bi-calendar-check-fill', color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning-border)' },
    { label: 'Pending Requests', value: stats?.pendingClubRequestsCount || 0, icon: 'bi-hourglass-split', color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'var(--danger-border)' },
    { label: 'Active Collaborations', value: stats?.pendingCollabsCount || 0, icon: 'bi-diagram-3-fill', color: 'var(--info)', bg: 'var(--info-bg)', border: '#bfdbfe' },
  ];

  const roleConfig = {
    Admin: { cls: 'role-admin', label: 'Admin' },
    'Club Coordinator': { cls: 'role-coordinator', label: 'Coordinator' },
    Student: { cls: 'role-student', label: 'Student' },
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.department?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredClubs = clubs.filter(c =>
    c.name?.toLowerCase().includes(clubSearch.toLowerCase()) ||
    c.category?.toLowerCase().includes(clubSearch.toLowerCase()) ||
    c.coordinator?.name?.toLowerCase().includes(clubSearch.toLowerCase())
  );

  const sections = [
    { id: 'overview', label: 'Overview', icon: 'bi-grid-1x2' },
    { id: 'users', label: `Users (${users.length})`, icon: 'bi-people' },
    { id: 'clubs', label: `Clubs (${clubs.length})`, icon: 'bi-collection' },
  ];

  return (
    <AppLayout title="Admin Panel" subtitle="System Administration & Governance">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>System Administration</h2>
          <p>Manage users, clubs, and view platform statistics</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
          borderRadius: 'var(--radius-md)', padding: '0.5rem 0.875rem',
        }}>
          <i className="bi bi-shield-shaded" style={{ color: 'var(--danger)' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#991b1b' }}>Admin Access</span>
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)' }}>
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            style={{
              padding: '0.625rem 1.25rem',
              border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem',
              color: activeSection === sec.id ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeSection === sec.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'var(--transition-fast)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: -1,
            }}
          >
            <i className={`bi ${sec.icon}`} />{sec.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <>
          <div className="row g-3 mb-4">
            {adminStats.map(card => (
              <div className="col-6 col-md-4 col-lg-2" key={card.label}>
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                  textAlign: 'center', transition: 'var(--transition)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = card.border; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  <div style={{
                    width: 48, height: 48, background: card.bg,
                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', color: card.color, margin: '0 auto 0.75rem',
                  }}>
                    <i className={`bi ${card.icon}`} />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', lineHeight: 1 }}>
                    {loading ? <span className="skeleton" style={{ width: 40, height: 28, display: 'inline-block', borderRadius: 6 }} /> : card.value}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {card.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary info */}
          <div style={{ background: 'var(--primary-bg)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: 44, height: 44, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', flexShrink: 0 }}>
              <i className="bi bi-info-circle-fill" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 2 }}>Platform Health Overview</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                The platform currently has {stats?.totalUsers || 0} users across {stats?.totalClubs || 0} active clubs with {stats?.upcomingEvents || 0} upcoming events. Use the tabs above to manage users and clubs.
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users Section */}
      {activeSection === 'users' && (
        <>
          {/* User Search */}
          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search users by name, email, or department..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {loading ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '25%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '35%', height: '0.7rem' }} />
                  </div>
                  <div className="skeleton" style={{ width: 120, height: 32, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Current Role</th>
                    <th style={{ textAlign: 'right' }}>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const rc = roleConfig[u.role] || roleConfig.Student;
                    const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
                    return (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="user-avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', flexShrink: 0 }}>{initials}</div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{u.department || 'N/A'}</td>
                        <td>
                          <span style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 100, padding: '0.15em 0.65em', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {u.year || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge role-badge ${rc.cls}`}>{rc.label}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            {updatingUserId === u._id && <span className="spinner-border spinner-border-sm" style={{ color: 'var(--primary)' }} />}
                            <select
                              className="form-select form-select-sm"
                              value={u.role}
                              onChange={e => handleRoleChange(u._id, e.target.value)}
                              disabled={updatingUserId === u._id}
                              style={{ width: 'auto', fontSize: '0.8rem' }}
                            >
                              <option value="Student">Student</option>
                              <option value="Club Coordinator">Club Coordinator</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No users found matching "{userSearch}"
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Clubs Section */}
      {activeSection === 'clubs' && (
        <>
          {/* Club Search */}
          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search clubs by name, category, or coordinator..."
              value={clubSearch}
              onChange={e => setClubSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {loading ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '30%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '20%', height: '0.7rem' }} />
                  </div>
                  <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Club</th>
                    <th>Category</th>
                    <th>Coordinator</th>
                    <th>Contact</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClubs.map(c => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 10, overflow: 'hidden',
                            background: 'var(--primary-bg)', flexShrink: 0, border: '1px solid var(--border-color)',
                          }}>
                            {c.image
                              ? <img src={c.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--primary)' }}>
                                  <i className="bi bi-collection" />
                                </div>}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Est. {c.establishedYear || 2022}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                          {c.category}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {c.coordinator?.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.contactEmail || 'N/A'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setConfirmDeleteClub(c)}
                          className="btn btn-sm btn-outline-danger"
                          title="Delete Club"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredClubs.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No clubs found matching "{clubSearch}"
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Club Confirmation Modal */}
      {confirmDeleteClub && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Club</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmDeleteClub(null)} />
              </div>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ width: 48, height: 48, background: 'var(--danger-bg)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontSize: '1.3rem', flexShrink: 0 }}>
                    <i className="bi bi-exclamation-triangle-fill" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Delete "{confirmDeleteClub.name}"?</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      This will permanently delete the club and all related records including memberships, events, and announcements. This action cannot be undone.
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setConfirmDeleteClub(null)}>Cancel</button>
                <button
                  className="btn"
                  onClick={() => handleDeleteClub(confirmDeleteClub._id)}
                  disabled={deletingClubId === confirmDeleteClub._id}
                  style={{ background: 'var(--danger)', color: '#fff', border: 'none', fontWeight: 600 }}
                >
                  {deletingClubId === confirmDeleteClub._id
                    ? <><span className="spinner-border spinner-border-sm me-2" />Deleting...</>
                    : <><i className="bi bi-trash me-1" />Delete Club</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AdminPanel;

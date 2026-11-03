import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Announcements = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({ title: '', content: '', club: '', priority: 'Normal' });

  useEffect(() => {
    fetchAnnouncements();
    if (user?.role === 'Club Coordinator' || user?.role === 'Admin') fetchClubs();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get('/announcements');
      if (res.data.success) setAnnouncements(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchClubs = async () => {
    try {
      const res = await API.get('/clubs');
      if (res.data.success) {
        let userClubs = res.data.data;
        if (user.role !== 'Admin') {
          userClubs = userClubs.filter(c => c.coordinator?._id === user._id || c.coordinator === user._id);
        }
        setClubs(userClubs);
        if (userClubs.length > 0) setFormData(prev => ({ ...prev, club: userClubs[0]._id }));
      }
    } catch (err) { console.error(err); }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await API.post('/announcements', formData);
      if (res.data.success) {
        addToast('Announcement broadcasted to campus!', 'success');
        setShowModal(false);
        setFormData({ title: '', content: '', club: clubs[0]?._id || '', priority: 'Normal' });
        fetchAnnouncements();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to post announcement', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await API.delete(`/announcements/${id}`);
      if (res.data.success) {
        addToast('Announcement removed', 'info');
        fetchAnnouncements();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete announcement', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const priorityConfig = {
    Urgent: { barClass: 'priority-urgent', badgeClass: 'priority-badge-urgent', icon: 'bi-exclamation-triangle-fill' },
    Important: { barClass: 'priority-important', badgeClass: 'priority-badge-important', icon: 'bi-exclamation-circle-fill' },
    Normal: { barClass: 'priority-normal', badgeClass: 'priority-badge-normal', icon: 'bi-info-circle-fill' },
  };

  return (
    <AppLayout title="Announcements" subtitle="Club Notices & Updates">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>Campus Club Announcements</h2>
          <p>Stay updated on auditions, workshops, schedules, and club notifications</p>
        </div>
        {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <i className="bi bi-megaphone-fill me-2" /> Post Announcement
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem' }}>
              <div className="skeleton" style={{ width: 4, borderRadius: 100, minHeight: 80, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: '30%', marginBottom: 8 }} />
                <div className="skeleton skeleton-title" style={{ width: '60%' }} />
                <div className="skeleton skeleton-text" style={{ width: '90%' }} />
                <div className="skeleton skeleton-text" style={{ width: '70%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">
            <div className="empty-state-icon"><i className="bi bi-bell-slash" /></div>
            <h5>No Announcements Yet</h5>
            <p>Important club broadcasts will appear here. Check back soon!</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {announcements.map((item) => {
            const config = priorityConfig[item.priority] || priorityConfig.Normal;
            const canDelete = user?.role === 'Admin' || item.postedBy?._id === user?._id || item.postedBy === user?._id;
            return (
              <div key={item._id} className="announcement-card">
                <div className={`announcement-priority-bar ${config.barClass}`} />
                <div className="announcement-body">
                  <div className="announcement-meta">
                    <span style={{
                      background: 'var(--primary-bg)', border: '1px solid var(--primary-border)',
                      color: 'var(--primary)', borderRadius: 100, padding: '0.2em 0.75em',
                      fontSize: '0.72rem', fontWeight: 700,
                    }}>
                      {item.club?.name || 'General Club'}
                    </span>
                    <span className={`badge ${config.badgeClass}`}>
                      <i className={`bi ${config.icon} me-1`} />{item.priority}
                    </span>
                  </div>

                  <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                    {item.title}
                  </h5>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.875rem' }}>
                    {item.content}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.625rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span><i className="bi bi-person me-1" />Posted by <strong style={{ color: 'var(--text-secondary)' }}>{item.postedBy?.name || 'Club Lead'}</strong></span>
                      <span><i className="bi bi-clock me-1" />{new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => setConfirmDelete(item._id)}
                        style={{
                          background: 'none', border: '1px solid var(--border-color)',
                          borderRadius: 8, padding: '0.3rem 0.55rem',
                          color: 'var(--text-muted)', cursor: 'pointer',
                          transition: 'var(--transition-fast)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger-border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        title="Delete announcement"
                      >
                        <i className="bi bi-trash" style={{ fontSize: '0.8rem' }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Announcement</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmDelete(null)} />
              </div>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--danger-bg)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontSize: '1.25rem', flexShrink: 0 }}>
                    <i className="bi bi-trash" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Remove this announcement?</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      This notice will be permanently removed and all students will lose access to it.
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button
                  className="btn"
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deletingId === confirmDelete}
                  style={{ background: 'var(--danger)', color: '#fff', border: 'none', fontWeight: 600 }}
                >
                  {deletingId === confirmDelete ? <><span className="spinner-border spinner-border-sm me-2" />Deleting...</> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Announcement Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Publish Club Announcement</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handlePostSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-7">
                      <label className="form-label">Publish Under Club</label>
                      <select className="form-select" value={formData.club}
                        onChange={e => setFormData({ ...formData, club: e.target.value })} required>
                        {clubs.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-5">
                      <label className="form-label">Priority Level</label>
                      <select className="form-select" value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                        <option value="Normal">🔵 Normal</option>
                        <option value="Important">🟡 Important</option>
                        <option value="Urgent">🔴 Urgent</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Announcement Title</label>
                      <input type="text" className="form-control" placeholder="e.g. Workshop Venue Relocation Notice"
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Notice Content</label>
                      <textarea className="form-control" rows="4"
                        placeholder="Enter detailed notification message for students..."
                        value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitLoading}>
                    {submitLoading ? <><span className="spinner-border spinner-border-sm me-2" />Broadcasting...</> : <><i className="bi bi-megaphone me-1" />Broadcast Notice</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Announcements;

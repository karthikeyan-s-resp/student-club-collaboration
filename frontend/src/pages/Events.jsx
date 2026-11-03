import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EventCardSkeleton = () => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
    <div className="skeleton" style={{ height: 180, borderRadius: 0 }} />
    <div style={{ padding: '1.25rem' }}>
      <div className="skeleton skeleton-title" style={{ width: '75%' }} />
      <div className="skeleton skeleton-text" style={{ width: '55%', marginBottom: 4 }} />
      <div className="skeleton skeleton-text" style={{ width: '65%' }} />
      <div className="skeleton skeleton-text" style={{ width: '100%', marginTop: 12 }} />
      <div className="skeleton skeleton-text" style={{ width: '90%' }} />
    </div>
  </div>
);

const categoryColors = {
  Workshop: { bg: 'var(--info-bg)', color: 'var(--info)' },
  Hackathon: { bg: 'var(--violet-bg)', color: 'var(--violet)' },
  Competition: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
  Cultural: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  Seminar: { bg: 'var(--primary-bg)', color: 'var(--primary)' },
  'Sports Meet': { bg: 'var(--success-bg)', color: 'var(--success)' },
};

const Events = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', club: '', date: '',
    time: '10:00 AM - 01:00 PM', venue: '', category: 'Workshop',
    maxParticipants: 100, image: '',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
    if (user?.role === 'Club Coordinator' || user?.role === 'Admin') fetchUserClubs();
  }, [timeFilter, search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/events?timeFilter=${timeFilter}&search=${encodeURIComponent(search)}`);
      if (res.data.success) setEvents(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMyRegistrations = async () => {
    try {
      const res = await API.get('/events/my-registrations');
      if (res.data.success) setMyRegistrations(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchUserClubs = async () => {
    try {
      const res = await API.get('/clubs');
      if (res.data.success) {
        setMyClubs(user.role === 'Admin'
          ? res.data.data
          : res.data.data.filter(c => c.coordinator?._id === user._id || c.coordinator === user._id));
      }
    } catch (err) { console.error(err); }
  };

  const isUserRegistered = (eventId) =>
    myRegistrations.some(r => r.event && (r.event._id === eventId || r.event === eventId));

  const handleRegister = async (eventId) => {
    setRegisteringId(eventId);
    try {
      const res = await API.post(`/events/${eventId}/register`);
      if (res.data.success) {
        addToast('Successfully registered! Check My Activities for your ticket.', 'success');
        fetchEvents();
        fetchMyRegistrations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to register for event', 'error');
    } finally {
      setRegisteringId(null);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData({
      title: '', description: '', club: myClubs[0]?._id || '',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '10:00 AM - 01:00 PM', venue: '', category: 'Workshop',
      maxParticipants: 100, image: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (evt) => {
    setIsEditing(true);
    setCurrentEventId(evt._id);
    setFormData({
      title: evt.title, description: evt.description,
      club: evt.club?._id || evt.club,
      date: new Date(evt.date).toISOString().split('T')[0],
      time: evt.time, venue: evt.venue, category: evt.category,
      maxParticipants: evt.maxParticipants || 100, image: evt.image || '',
    });
    setShowModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    setDeletingId(eventId);
    try {
      const res = await API.delete(`/events/${eventId}`);
      if (res.data.success) {
        addToast('Event deleted successfully!', 'info');
        fetchEvents();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete event', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (isEditing) {
        const res = await API.put(`/events/${currentEventId}`, formData);
        if (res.data.success) addToast('Event updated successfully!', 'success');
      } else {
        const res = await API.post('/events', formData);
        if (res.data.success) addToast('Event published successfully!', 'success');
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save event', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const getCategoryStyle = (cat) =>
    categoryColors[cat] || { bg: 'var(--primary-bg)', color: 'var(--primary)' };

  return (
    <AppLayout title="Campus Events" subtitle="Events & Workshops">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>Campus Events & Workshops</h2>
          <p>Participate in hackathons, workshops, sports meets, and cultural celebrations</p>
        </div>
        {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
          <button onClick={handleOpenCreateModal} className="btn btn-primary">
            <i className="bi bi-calendar-plus me-2" /> Host Event
          </button>
        )}
      </div>

      {/* Search & Time Filter */}
      <div className="search-bar-container">
        <div className="search-input-group">
          <i className="bi bi-search" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search events by name or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="time-filter-tabs">
          <button
            className={`time-filter-tab${timeFilter === 'upcoming' ? ' active' : ''}`}
            onClick={() => setTimeFilter('upcoming')}
          >
            <i className="bi bi-calendar-event me-1" /> Upcoming
          </button>
          <button
            className={`time-filter-tab${timeFilter === 'past' ? ' active' : ''}`}
            onClick={() => setTimeFilter('past')}
          >
            <i className="bi bi-clock-history me-1" /> Past
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 500 }}>
          {events.length} {timeFilter} event{events.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="row g-4">
          {Array(4).fill(0).map((_, i) => (
            <div className="col-12 col-lg-6" key={i}><EventCardSkeleton /></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">
            <div className="empty-state-icon"><i className="bi bi-calendar-x" /></div>
            <h5>No {timeFilter} events</h5>
            <p>Check back soon for new club activities and campus schedules.</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {events.map((evt) => {
            const registered = isUserRegistered(evt._id);
            const isPast = new Date(evt.date) < new Date();
            const canManage = user?.role === 'Admin' || evt.createdBy?._id === user?._id || evt.createdBy === user?._id;
            const catStyle = getCategoryStyle(evt.category);
            const d = new Date(evt.date);
            const fillPct = evt.maxParticipants > 0 ? Math.min(100, Math.round(((evt.registeredCount || 0) / evt.maxParticipants) * 100)) : 0;

            return (
              <div key={evt._id} className="col-12 col-lg-6">
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  height: '100%',
                  transition: 'var(--transition)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--primary-border)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = ''; }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: 180, overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={evt.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'}
                      alt={evt.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                    {/* Category badge */}
                    <span style={{
                      position: 'absolute', top: 12, left: 12,
                      background: catStyle.bg, color: catStyle.color,
                      border: `1px solid ${catStyle.color}30`,
                      borderRadius: 100, padding: '0.22em 0.75em',
                      fontSize: '0.68rem', fontWeight: 700,
                      backdropFilter: 'blur(4px)',
                    }}>
                      {evt.category}
                    </span>
                    {/* Club badge */}
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      borderRadius: 100, padding: '0.22em 0.75em',
                      fontSize: '0.68rem', fontWeight: 600,
                      backdropFilter: 'blur(4px)',
                    }}>
                      {evt.club?.name || 'Club'}
                    </span>
                    {/* Date overlay bottom-left */}
                    <div style={{
                      position: 'absolute', bottom: 12, left: 12,
                      background: '#fff', borderRadius: 10,
                      padding: '0.3rem 0.7rem', textAlign: 'center',
                      boxShadow: 'var(--shadow-md)',
                    }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{d.getDate()}</div>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {d.toLocaleString('en', { month: 'short' })} {d.getFullYear()}
                      </div>
                    </div>
                    {isPast && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: 100, padding: '0.35rem 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                          CONCLUDED
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{evt.title}</h5>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <i className="bi bi-clock text-primary" style={{ color: 'var(--primary)' }} /> {evt.time}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <i className="bi bi-geo-alt" style={{ color: 'var(--primary)' }} /> {evt.venue}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', flex: 1, lineHeight: 1.55, marginBottom: '1rem',
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {evt.description}
                    </p>

                    {/* Capacity bar */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                        <span><i className="bi bi-people me-1" />{evt.registeredCount || 0} / {evt.maxParticipants || 100} registered</span>
                        <span>{fillPct}% full</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 100,
                          background: fillPct >= 90 ? 'var(--danger)' : fillPct >= 70 ? 'var(--warning)' : 'var(--success)',
                          width: `${fillPct}%`, transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.875rem', borderTop: '1px solid var(--border-color)' }}>
                      {canManage ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenEditModal(evt)} className="btn btn-sm btn-outline-secondary" title="Edit Event">
                            <i className="bi bi-pencil" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(evt._id)}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Event"
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      ) : <div />}

                      <div>
                        {isPast ? (
                          <span className="status-badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                            Event Concluded
                          </span>
                        ) : registered ? (
                          <span className="status-badge status-approved">
                            <i className="bi bi-check-circle-fill" /> Registered
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRegister(evt._id)}
                            className="btn btn-sm btn-primary"
                            disabled={registeringId === evt._id}
                          >
                            {registeringId === evt._id
                              ? <><span className="spinner-border spinner-border-sm me-1" />Registering...</>
                              : <><i className="bi bi-ticket-perforated me-1" />Register Now</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Event</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmDelete(null)} />
              </div>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--danger-bg)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontSize: '1.25rem', flexShrink: 0 }}>
                    <i className="bi bi-trash" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Are you sure?</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      This action cannot be undone. The event and all registrations will be permanently deleted.
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteEvent(confirmDelete)}
                  disabled={deletingId === confirmDelete}
                  style={{ background: 'var(--danger)', border: 'none', fontWeight: 600 }}
                >
                  {deletingId === confirmDelete ? <><span className="spinner-border spinner-border-sm me-2" />Deleting...</> : 'Delete Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? 'Edit Event Details' : 'Host New Campus Event'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmitModal}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label">Event Title</label>
                      <input type="text" className="form-control" placeholder="e.g. Annual Web Development Hackathon"
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label">Organizing Club</label>
                      <select className="form-select" value={formData.club} onChange={e => setFormData({ ...formData, club: e.target.value })} required>
                        <option value="">Select Club</option>
                        {myClubs.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label">Time Interval</label>
                      <input type="text" className="form-control" placeholder="10:00 AM - 01:00 PM"
                        value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label">Category</label>
                      <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        {['Workshop', 'Hackathon', 'Competition', 'Cultural', 'Seminar', 'Sports Meet'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Venue / Hall</label>
                      <input type="text" className="form-control" placeholder="e.g. Main Auditorium or CS Lab 3"
                        value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Max Participant Capacity</label>
                      <input type="number" className="form-control" min="1"
                        value={formData.maxParticipants} onChange={e => setFormData({ ...formData, maxParticipants: Number(e.target.value) })} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Banner Image URL <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                      <input type="url" className="form-control" placeholder="https://images.unsplash.com/..."
                        value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description & Agenda</label>
                      <textarea className="form-control" rows="3"
                        placeholder="Outline the schedule, speaker details, and what participants can expect..."
                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={modalLoading}>
                    {modalLoading
                      ? <><span className="spinner-border spinner-border-sm me-2" />{isEditing ? 'Saving...' : 'Publishing...'}</>
                      : <><i className={`bi ${isEditing ? 'bi-check2' : 'bi-send'} me-1`} />{isEditing ? 'Save Changes' : 'Publish Event'}</>}
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

export default Events;

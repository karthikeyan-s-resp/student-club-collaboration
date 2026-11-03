import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Arts & Media', 'Social & Community'];

const categoryImages = {
  Technical: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
  Cultural: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
  'Arts & Media': 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?auto=format&fit=crop&w=600&q=80',
  'Social & Community': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
};

const ClubCardSkeleton = () => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
    <div className="skeleton" style={{ height: 160, borderRadius: 0 }} />
    <div style={{ padding: '1.25rem' }}>
      <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 8 }} />
      <div className="skeleton skeleton-title" style={{ width: '70%' }} />
      <div className="skeleton skeleton-text" style={{ width: '50%' }} />
      <div className="skeleton skeleton-text" style={{ width: '90%', marginTop: 12 }} />
      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
    </div>
  </div>
);

const Clubs = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [clubs, setClubs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [myMemberships, setMyMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningClub, setJoiningClub] = useState(null); // club object for join modal
  const [requestNotes, setRequestNotes] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Coordinator create club modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClub, setNewClub] = useState({ name: '', description: '', category: 'Technical', contactEmail: '', image: '' });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchClubs();
    fetchMyMemberships();
  }, [selectedCategory, search]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      let url = `/clubs?search=${encodeURIComponent(search)}`;
      if (selectedCategory !== 'All') url += `&category=${encodeURIComponent(selectedCategory)}`;
      const res = await API.get(url);
      if (res.data.success) setClubs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMemberships = async () => {
    try {
      const res = await API.get('/memberships/my-requests');
      if (res.data.success) setMyMemberships(res.data.data);
    } catch (err) { console.error(err); }
  };

  const getMembershipStatus = (clubId) => {
    const mem = myMemberships.find(m => m.club && (m.club._id === clubId || m.club === clubId));
    return mem ? mem.status : null;
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joiningClub) return;
    setSubmitLoading(true);
    try {
      const res = await API.post('/memberships/request', { clubId: joiningClub._id, notes: requestNotes });
      if (res.data.success) {
        addToast('Membership request submitted successfully!', 'success');
        setJoiningClub(null);
        setRequestNotes('');
        fetchMyMemberships();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit membership request', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreateClubSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await API.post('/clubs', newClub);
      if (res.data.success) {
        addToast('Club created successfully!', 'success');
        setShowCreateModal(false);
        setNewClub({ name: '', description: '', category: 'Technical', contactEmail: '', image: '' });
        fetchClubs();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create club', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const MembershipButton = ({ club }) => {
    const status = getMembershipStatus(club._id);
    const isCoordinator = club.coordinator?._id === user?._id || club.coordinator === user?._id;

    if (isCoordinator) {
      return <span className="status-badge status-member"><i className="bi bi-star-fill" /> You lead this</span>;
    }
    if (status === 'Approved') {
      return <span className="status-badge status-approved"><i className="bi bi-check-circle-fill" /> Member</span>;
    }
    if (status === 'Pending') {
      return <span className="status-badge status-pending"><i className="bi bi-hourglass-split" /> Pending</span>;
    }
    if (status === 'Rejected') {
      return <span className="status-badge status-rejected"><i className="bi bi-x-circle" /> Rejected</span>;
    }
    return (
      <button
        onClick={() => setJoiningClub(club)}
        className="btn btn-sm btn-primary"
        style={{ fontSize: '0.78rem' }}
      >
        <i className="bi bi-plus me-1" /> Join Club
      </button>
    );
  };

  return (
    <AppLayout title="Club Directory" subtitle="Discover & Join Clubs">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>Campus Student Clubs</h2>
          <p>Discover communities, join chapters, and collaborate across disciplines</p>
        </div>
        {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <i className="bi bi-plus-circle me-2" /> Create Club
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="search-bar-container">
        <div className="search-input-group">
          <i className="bi bi-search" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search clubs by name or keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-pill${selectedCategory === cat ? ' active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 500 }}>
          Showing {clubs.length} club{clubs.length !== 1 ? 's' : ''}
          {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          {search ? ` matching "${search}"` : ''}
        </div>
      )}

      {/* Club Grid */}
      {loading ? (
        <div className="row g-4">
          {Array(6).fill(0).map((_, i) => (
            <div className="col-12 col-md-6 col-xl-4" key={i}><ClubCardSkeleton /></div>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">
            <div className="empty-state-icon"><i className="bi bi-search" /></div>
            <h5>No clubs found</h5>
            <p>Try adjusting your search keywords or category filter.</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="btn btn-sm btn-outline-primary">
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {clubs.map((club) => (
            <div key={club._id} className="col-12 col-md-6 col-xl-4">
              <div className="club-card">
                <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                  <img
                    src={club.image || categoryImages[club.category] || categoryImages.default}
                    alt={club.name}
                    className="club-card-image"
                    style={{ transition: 'transform 0.4s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
                  }} />
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    color: '#fff', borderRadius: 100, padding: '0.2em 0.75em',
                    fontSize: '0.68rem', fontWeight: 700,
                  }}>
                    {club.category}
                  </span>
                </div>

                <div className="club-card-body">
                  <div className="club-card-name">{club.name}</div>
                  <div className="club-card-coordinator">
                    <i className="bi bi-person-badge me-1" />
                    {club.coordinator?.name || 'Club Lead'}
                  </div>
                  <p className="club-card-description">
                    {club.description.length > 120
                      ? `${club.description.substring(0, 120)}...`
                      : club.description}
                  </p>

                  <div className="club-card-footer">
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="bi bi-envelope" />
                      <span className="text-ellipsis" style={{ maxWidth: 140 }}>
                        {club.contactEmail || 'club@college.edu'}
                      </span>
                    </div>
                    <MembershipButton club={club} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join Club Modal */}
      {joiningClub && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title">Join {joiningClub.name}</h5>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Send a membership request to the club coordinator
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setJoiningClub(null)} />
              </div>
              <form onSubmit={handleJoinSubmit}>
                <div className="modal-body">
                  <div style={{
                    background: 'var(--primary-bg)', border: '1px solid var(--primary-border)',
                    borderRadius: 'var(--radius-md)', padding: '0.875rem', marginBottom: '1rem',
                    fontSize: '0.825rem', color: 'var(--primary)',
                  }}>
                    <i className="bi bi-info-circle me-1" />
                    Introduce yourself and explain why you want to join <strong>{joiningClub.name}</strong>.
                  </div>
                  <div>
                    <label className="form-label">Statement of Interest & Skills</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="e.g. I am a 2nd year CS student skilled in React and UI design. I'm excited to contribute to club projects and workshops!"
                      value={requestNotes}
                      onChange={e => setRequestNotes(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setJoiningClub(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitLoading}>
                    {submitLoading ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</> : <><i className="bi bi-send me-1" />Submit Request</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Club Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Register New Student Club</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>
              <form onSubmit={handleCreateClubSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Club Name</label>
                      <input type="text" className="form-control" placeholder="e.g. Artificial Intelligence Club"
                        value={newClub.name} onChange={e => setNewClub({ ...newClub, name: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Category</label>
                      <select className="form-select" value={newClub.category} onChange={e => setNewClub({ ...newClub, category: e.target.value })}>
                        <option value="Technical">Technical</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Sports">Sports</option>
                        <option value="Arts & Media">Arts & Media</option>
                        <option value="Social & Community">Social & Community</option>
                        <option value="Academic">Academic</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Contact Email</label>
                      <input type="email" className="form-control" placeholder="club@college.edu"
                        value={newClub.contactEmail} onChange={e => setNewClub({ ...newClub, contactEmail: e.target.value })} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Banner Image URL <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                      <input type="url" className="form-control" placeholder="https://images.unsplash.com/..."
                        value={newClub.image} onChange={e => setNewClub({ ...newClub, image: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description & Vision</label>
                      <textarea className="form-control" rows="3"
                        placeholder="What is this club about and what activities will you conduct?"
                        value={newClub.description} onChange={e => setNewClub({ ...newClub, description: e.target.value })} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={createLoading}>
                    {createLoading ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : <><i className="bi bi-plus-circle me-1" />Create Club</>}
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

export default Clubs;

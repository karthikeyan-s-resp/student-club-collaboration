import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Collaborations = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [collabs, setCollabs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [respondingId, setRespondingId] = useState(null);

  // Response modal
  const [responseModal, setResponseModal] = useState(null); // { collabId, status }
  const [responseMessage, setResponseMessage] = useState('');

  const [formData, setFormData] = useState({
    fromClubId: '', toClubId: '', proposedEventTitle: '', description: '', proposedDate: '',
  });

  useEffect(() => {
    fetchCollaborations();
    fetchClubs();
  }, []);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const res = await API.get('/collaborations');
      if (res.data.success) setCollabs(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchClubs = async () => {
    try {
      const res = await API.get('/clubs');
      if (res.data.success) setAllClubs(res.data.data);
    } catch (err) { console.error(err); }
  };

  const myCoordinatedClubs = allClubs.filter(
    c => user.role === 'Admin' || c.coordinator?._id === user._id || c.coordinator === user._id
  );

  const handleOpenModal = () => {
    if (myCoordinatedClubs.length === 0) {
      addToast('You must be a coordinator of at least one club to propose a collaboration.', 'warning');
      return;
    }
    setFormData({
      fromClubId: myCoordinatedClubs[0]._id,
      toClubId: allClubs.find(c => c._id !== myCoordinatedClubs[0]._id)?._id || '',
      proposedEventTitle: '', description: '',
      proposedDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (formData.fromClubId === formData.toClubId) {
      addToast('Cannot propose collaboration with your own club!', 'error');
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await API.post('/collaborations', formData);
      if (res.data.success) {
        addToast('Collaboration request sent successfully!', 'success');
        setShowModal(false);
        fetchCollaborations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send collaboration request', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!responseModal) return;
    setRespondingId(responseModal.collabId);
    try {
      const res = await API.put(`/collaborations/${responseModal.collabId}/respond`, {
        status: responseModal.status,
        responseMessage,
      });
      if (res.data.success) {
        addToast(`Collaboration proposal ${responseModal.status.toLowerCase()}!`, 'success');
        setResponseModal(null);
        setResponseMessage('');
        fetchCollaborations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to respond', 'error');
    } finally {
      setRespondingId(null);
    }
  };

  const statusConfig = {
    Accepted: { cls: 'status-accepted', icon: 'bi-check-circle-fill' },
    Pending: { cls: 'status-pending', icon: 'bi-hourglass-split' },
    Rejected: { cls: 'status-rejected', icon: 'bi-x-circle-fill' },
  };

  return (
    <AppLayout title="Collaborations" subtitle="Inter-Club Collaboration Proposals">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>Inter-Club Collaborations</h2>
          <p>Foster campus innovation by partnering with other clubs for mega symposiums and fests</p>
        </div>
        {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
          <button onClick={handleOpenModal} className="btn btn-primary">
            <i className="bi bi-send-plus me-2" /> Propose Collaboration
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 12 }} />
              <div className="skeleton skeleton-title" style={{ width: '60%' }} />
              <div className="skeleton skeleton-text" style={{ width: '80%' }} />
              <div className="skeleton skeleton-text" style={{ width: '70%' }} />
            </div>
          ))}
        </div>
      ) : collabs.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">
            <div className="empty-state-icon"><i className="bi bi-diagram-3" /></div>
            <h5>No Collaboration Proposals Yet</h5>
            <p>Inter-club collaboration proposals will appear here once initiated.</p>
            {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
              <button onClick={handleOpenModal} className="btn btn-sm btn-primary">
                <i className="bi bi-plus me-1" /> Propose First Collaboration
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {collabs.map((collab) => {
            const sc = statusConfig[collab.status] || statusConfig.Pending;
            const canRespond = user.role === 'Admin';

            return (
              <div key={collab._id} className="collab-card">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="collab-clubs-row">
                    <div className="collab-club-badge">
                      <i className="bi bi-collection me-1" style={{ opacity: 0.7 }} />{collab.fromClub?.name}
                    </div>
                    <div className="collab-arrow">
                      <i className="bi bi-arrow-left-right" />
                    </div>
                    <div style={{
                      background: 'var(--bg-hover)', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', padding: '0.4rem 0.9rem',
                      fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)',
                    }}>
                      <i className="bi bi-collection me-1" style={{ opacity: 0.6 }} />{collab.toClub?.name}
                    </div>
                  </div>

                  <span className={`status-badge ${sc.cls}`}>
                    <i className={`bi ${sc.icon}`} /> {collab.status}
                  </span>
                </div>

                {/* Title & Description */}
                <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {collab.proposedEventTitle}
                </h5>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {collab.description}
                </p>

                {/* Meta info */}
                <div style={{
                  background: 'var(--bg-base)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem',
                  display: 'flex', flexWrap: 'wrap', gap: '1.25rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{ fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Proposed Date:</span>{' '}
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {collab.proposedDate ? new Date(collab.proposedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'To be determined'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Initiated By:</span>{' '}
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{collab.initiatedBy?.name || 'Club Coordinator'}</span>
                  </div>
                  {collab.responseMessage && (
                    <div style={{ fontSize: '0.8125rem', width: '100%' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Response Note:</span>{' '}
                      <span style={{ color: 'var(--primary)', fontWeight: 500, fontStyle: 'italic' }}>"{collab.responseMessage}"</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {collab.status === 'Pending' && canRespond && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem' }}>
                    <button
                      onClick={() => setResponseModal({ collabId: collab._id, status: 'Accepted' })}
                      className="btn btn-sm btn-success"
                      style={{ fontWeight: 600 }}
                    >
                      <i className="bi bi-check-circle me-1" /> Accept Proposal
                    </button>
                    <button
                      onClick={() => setResponseModal({ collabId: collab._id, status: 'Rejected' })}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <i className="bi bi-x-circle me-1" /> Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Response Modal */}
      {responseModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 480 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {responseModal.status === 'Accepted' ? '✅ Accept Collaboration' : '❌ Decline Collaboration'}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setResponseModal(null); setResponseMessage(''); }} />
              </div>
              <div className="modal-body">
                <div style={{
                  background: responseModal.status === 'Accepted' ? 'var(--success-bg)' : 'var(--danger-bg)',
                  border: `1px solid ${responseModal.status === 'Accepted' ? 'var(--success-border)' : 'var(--danger-border)'}`,
                  borderRadius: 'var(--radius-md)', padding: '0.875rem', marginBottom: '1rem',
                  fontSize: '0.875rem', color: responseModal.status === 'Accepted' ? '#065f46' : '#991b1b',
                }}>
                  {responseModal.status === 'Accepted'
                    ? 'You are about to accept this collaboration proposal. The requesting club will be notified.'
                    : 'You are about to decline this collaboration proposal. The requesting club will be notified.'}
                </div>
                <div>
                  <label className="form-label">Response Message <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Add an optional note about your decision..."
                    value={responseMessage}
                    onChange={e => setResponseMessage(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => { setResponseModal(null); setResponseMessage(''); }}>Cancel</button>
                <button
                  className="btn"
                  onClick={handleRespond}
                  disabled={!!respondingId}
                  style={{
                    background: responseModal.status === 'Accepted' ? 'var(--success)' : 'var(--danger)',
                    color: '#fff', border: 'none', fontWeight: 600,
                  }}
                >
                  {respondingId
                    ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
                    : responseModal.status === 'Accepted'
                    ? <><i className="bi bi-check2 me-1" />Confirm Accept</>
                    : <><i className="bi bi-x me-1" />Confirm Decline</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Propose Collaboration Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Inter-Club Collaboration Proposal</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">From Club (Your Club)</label>
                      <select className="form-select" value={formData.fromClubId}
                        onChange={e => setFormData({ ...formData, fromClubId: e.target.value })} required>
                        {myCoordinatedClubs.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Target Club (Invited Club)</label>
                      <select className="form-select" value={formData.toClubId}
                        onChange={e => setFormData({ ...formData, toClubId: e.target.value })} required>
                        <option value="">Select Target Club</option>
                        {allClubs.filter(c => c._id !== formData.fromClubId).map(c => (
                          <option key={c._id} value={c._id}>{c.name} ({c.category})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-8">
                      <label className="form-label">Joint Event / Project Title</label>
                      <input type="text" className="form-control" placeholder="e.g. AI-Powered Autonomous Rover Hackathon"
                        value={formData.proposedEventTitle}
                        onChange={e => setFormData({ ...formData, proposedEventTitle: e.target.value })} required />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label">Target Date</label>
                      <input type="date" className="form-control" value={formData.proposedDate}
                        onChange={e => setFormData({ ...formData, proposedDate: e.target.value })} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Collaboration Scope & Benefits</label>
                      <textarea className="form-control" rows="3"
                        placeholder="Detail how both clubs will contribute, division of responsibilities, and expected student participation..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitLoading}>
                    {submitLoading ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : <><i className="bi bi-send me-1" />Send Proposal</>}
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

export default Collaborations;

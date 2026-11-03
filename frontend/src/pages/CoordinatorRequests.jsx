import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CoordinatorRequests = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchCoordinatedClubs(); }, []);
  useEffect(() => { if (selectedClubId) fetchRequests(selectedClubId); }, [selectedClubId]);

  const fetchCoordinatedClubs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/clubs');
      if (res.data.success) {
        let userClubs = res.data.data;
        if (user.role !== 'Admin') {
          userClubs = userClubs.filter(c => c.coordinator?._id === user._id || c.coordinator === user._id);
        }
        setClubs(userClubs);
        if (userClubs.length > 0) setSelectedClubId(userClubs[0]._id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchRequests = async (clubId) => {
    try {
      setLoading(true);
      const res = await API.get(`/memberships/club/${clubId}`);
      if (res.data.success) setRequests(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      const res = await API.put(`/memberships/${requestId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(`Membership request ${newStatus.toLowerCase()}!`, newStatus === 'Approved' ? 'success' : 'warning');
        fetchRequests(selectedClubId);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusConfig = {
    Approved: { cls: 'status-approved', icon: 'bi-check-circle-fill' },
    Pending: { cls: 'status-pending', icon: 'bi-hourglass-split' },
    Rejected: { cls: 'status-rejected', icon: 'bi-x-circle-fill' },
  };

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;

  return (
    <AppLayout title="Membership Requests" subtitle="Review & Approve Applications">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>Club Membership Reviews</h2>
          <p>Review, approve, or decline student applications submitted for your clubs</p>
        </div>
      </div>

      {/* Club Selector */}
      {clubs.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">
            <div className="empty-state-icon"><i className="bi bi-collection" /></div>
            <h5>No Clubs Assigned</h5>
            <p>You don't have any clubs assigned to manage. Contact an administrator to get started.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Club filter + quick stats */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                <i className="bi bi-collection me-1" /> Select Club:
              </label>
              <select
                className="form-select"
                value={selectedClubId}
                onChange={e => setSelectedClubId(e.target.value)}
                style={{ width: 'auto', minWidth: 200 }}
              >
                {clubs.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.category})</option>
                ))}
              </select>
            </div>
            {!loading && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-md)', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>
                  <i className="bi bi-hourglass-split me-1" />{pendingCount} Pending
                </div>
                <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#065f46' }}>
                  <i className="bi bi-check-circle-fill me-1" />{approvedCount} Approved
                </div>
              </div>
            )}
          </div>

          {/* Requests Table */}
          {loading ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {Array(4).fill(0).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '30%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '20%', height: '0.7rem' }} />
                  </div>
                  <div className="skeleton" style={{ width: 100, height: 32, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="section-card">
              <div className="empty-state">
                <div className="empty-state-icon"><i className="bi bi-inbox" /></div>
                <h5>No Applications</h5>
                <p>No pending or historical student applications for this club.</p>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Department & Year</th>
                    <th>Statement / Notes</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => {
                    const sc = statusConfig[r.status] || statusConfig.Pending;
                    const initials = r.user?.name
                      ? r.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'U';
                    return (
                      <tr key={r._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="user-avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', flexShrink: 0 }}>{initials}</div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.user?.name || 'Applicant'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{r.user?.department || 'N/A'}</div>
                          <span style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', borderRadius: 100, padding: '0.1em 0.6em', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {r.user?.year || 'Student'}
                          </span>
                        </td>
                        <td style={{ maxWidth: 240 }}>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: r.notes ? 'normal' : 'italic' }}>
                            {r.notes || 'No statement provided'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td>
                          <span className={`status-badge ${sc.cls}`}>
                            <i className={`bi ${sc.icon}`} /> {r.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            {r.status !== 'Approved' && (
                              <button
                                onClick={() => handleUpdateStatus(r._id, 'Approved')}
                                className="btn btn-sm btn-success"
                                disabled={updatingId === r._id}
                                style={{ fontWeight: 600, fontSize: '0.78rem' }}
                              >
                                {updatingId === r._id
                                  ? <span className="spinner-border spinner-border-sm" />
                                  : <><i className="bi bi-check2 me-1" />Approve</>}
                              </button>
                            )}
                            {r.status !== 'Rejected' && (
                              <button
                                onClick={() => handleUpdateStatus(r._id, 'Rejected')}
                                className="btn btn-sm btn-outline-danger"
                                disabled={updatingId === r._id}
                                style={{ fontSize: '0.78rem' }}
                              >
                                <i className="bi bi-x me-1" />Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default CoordinatorRequests;

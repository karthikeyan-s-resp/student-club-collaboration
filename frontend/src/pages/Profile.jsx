import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEFAULT_SKILLS = [
  'Web Development', 'React', 'Node.js', 'Python', 'UI/UX Design',
  'Event Management', 'Public Speaking', 'Robotics', 'Machine Learning',
  'Graphic Design', 'Photography', 'Content Writing', 'Competitive Programming'
];

const Profile = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [profileData, setProfileData] = useState(user || {});
  const [memberships, setMemberships] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local skills & interests preferences
  const [selectedSkills, setSelectedSkills] = useState(() => {
    try {
      const saved = localStorage.getItem(`skills_${user?._id || 'guest'}`);
      return saved ? JSON.parse(saved) : ['Web Development', 'UI/UX Design', 'Event Management'];
    } catch {
      return ['Web Development', 'UI/UX Design'];
    }
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfileAndActivities();
  }, []);

  const fetchProfileAndActivities = async () => {
    try {
      setLoading(true);
      const [meRes, memRes, regRes] = await Promise.all([
        API.get('/auth/me').catch(() => ({ data: { success: false } })),
        API.get('/memberships/my-requests').catch(() => ({ data: { success: false } })),
        API.get('/events/my-registrations').catch(() => ({ data: { success: false } })),
      ]);

      if (meRes.data?.success) setProfileData(meRes.data.data);
      if (memRes.data?.success) setMemberships(memRes.data.data);
      if (regRes.data?.success) setRegistrations(regRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    let updated;
    if (selectedSkills.includes(skill)) {
      updated = selectedSkills.filter(s => s !== skill);
    } else {
      updated = [...selectedSkills, skill];
    }
    setSelectedSkills(updated);
    localStorage.setItem(`skills_${user?._id || 'guest'}`, JSON.stringify(updated));
    addToast(`Skills updated!`, 'success', 2000);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (selectedSkills.includes(trimmed)) {
      addToast('Skill already in list', 'info');
      setNewSkill('');
      return;
    }
    const updated = [...selectedSkills, trimmed];
    setSelectedSkills(updated);
    localStorage.setItem(`skills_${user?._id || 'guest'}`, JSON.stringify(updated));
    setNewSkill('');
    addToast(`Added "${trimmed}" to your interests`, 'success');
  };

  const initials = profileData?.name
    ? profileData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const roleClass = profileData?.role === 'Admin'
    ? 'role-admin'
    : profileData?.role === 'Club Coordinator'
    ? 'role-coordinator'
    : 'role-student';

  const approvedMemberships = memberships.filter(m => m.status === 'Approved');

  return (
    <AppLayout title="My Profile" subtitle="Account Details & Academic Persona">
      {/* Profile Hero Card */}
      <div className="section-card mb-4" style={{ overflow: 'hidden', padding: 0 }}>
        {/* Banner */}
        <div style={{
          height: 140,
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 16, right: 20,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
            borderRadius: 100, padding: '0.3em 0.9em', fontSize: '0.75rem', fontWeight: 700,
          }}>
            <i className="bi bi-shield-check me-1" /> Verified Campus Account
          </div>
        </div>

        {/* User Info Bar */}
        <div style={{ padding: '0 2rem 2rem', marginTop: -45, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{
                width: 90, height: 90,
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                border: '4px solid #fff',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '2rem', fontWeight: 800,
                fontFamily: 'var(--font-heading)',
              }}>
                {initials}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {profileData?.name || 'Student Name'}
                  </h3>
                  <span className={`badge role-badge ${roleClass}`} style={{ fontSize: '0.75rem' }}>
                    {profileData?.role || 'Student'}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: 4 }}>
                  <span><i className="bi bi-envelope me-1" />{profileData?.email}</span>
                  <span><i className="bi bi-building me-1" />{profileData?.department || 'Computer Science'}</span>
                  <span><i className="bi bi-mortarboard me-1" />{profileData?.year || '1st Year'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <Link to="/my-activities" className="btn btn-sm btn-primary">
                <i className="bi bi-ticket-perforated me-1" /> My Activities
              </Link>
              <Link to="/clubs" className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-compass me-1" /> Explore Clubs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Details, Activities, Skills */}
      <div className="row g-4">
        {/* Left Column: Personal Information & Activity Stats */}
        <div className="col-12 col-lg-6">
          <div className="section-card mb-4">
            <div className="section-card-title mb-3">
              <i className="bi bi-person-lines-fill" /> Academic & Personal Details
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Full Name', value: profileData?.name, icon: 'bi-person' },
                { label: 'College Email', value: profileData?.email, icon: 'bi-envelope-at' },
                { label: 'Department / Major', value: profileData?.department || 'Computer Science & Engineering', icon: 'bi-building' },
                { label: 'Academic Standing', value: profileData?.year || '1st Year Undergraduate', icon: 'bi-mortarboard' },
                { label: 'Platform Role', value: profileData?.role || 'Student', icon: 'bi-shield-check' },
                { label: 'Member Since', value: profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Session 2026', icon: 'bi-calendar3' },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem', background: 'var(--bg-base)',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <i className={`bi ${icon}`} style={{ color: 'var(--primary)', fontSize: '0.95rem' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Snapshot */}
          <div className="section-card">
            <div className="section-card-title mb-3">
              <i className="bi bi-bar-chart-fill" /> Campus Engagement Snapshot
            </div>
            <div className="row g-3">
              <div className="col-6">
                <div style={{
                  background: 'var(--primary-bg)', border: '1px solid var(--primary-border)',
                  borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {approvedMemberships.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase' }}>
                    Active Club Memberships
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div style={{
                  background: 'var(--success-bg)', border: '1px solid var(--success-border)',
                  borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
                    {registrations.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                    Events Registered
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skills, Interests & Connected Clubs */}
        <div className="col-12 col-lg-6">
          {/* Skills & Interests Card */}
          <div className="section-card mb-4">
            <div className="section-card-title mb-2">
              <i className="bi bi-stars" /> Skills & Student Interests
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select your passions to personalize event recommendations and club collaborations.
            </p>

            {/* Selected skills pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {DEFAULT_SKILLS.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    style={{
                      background: isSelected ? 'var(--primary)' : 'var(--bg-base)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: 100,
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                    }}
                  >
                    <i className={`bi ${isSelected ? 'bi-check2' : 'bi-plus'}`} />
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Add custom interest form */}
            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Add another skill or passion..."
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-sm btn-outline-primary" style={{ whiteSpace: 'nowrap' }}>
                <i className="bi bi-plus-lg me-1" /> Add
              </button>
            </form>
          </div>

          {/* My Joined Clubs Preview */}
          <div className="section-card">
            <div className="section-card-header mb-3">
              <span className="section-card-title">
                <i className="bi bi-collection-fill" /> My Clubs
              </span>
              <Link to="/my-activities" className="section-view-all">
                Manage all <i className="bi bi-arrow-right" />
              </Link>
            </div>

            {approvedMemberships.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                <i className="bi bi-collection fs-3 d-block mb-2" />
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>No approved club memberships yet</div>
                <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
                  Browse the directory to find and join student chapters.
                </div>
                <Link to="/clubs" className="btn btn-sm btn-outline-primary mt-3">
                  Browse Clubs
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {approvedMemberships.slice(0, 4).map(m => (
                  <div
                    key={m._id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem 1rem', background: 'var(--bg-base)',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={m.club?.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{m.club?.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.club?.category}</div>
                      </div>
                    </div>
                    <span className="badge" style={{ background: 'var(--success-bg)', color: '#065f46', border: '1px solid var(--success-border)' }}>
                      Active Member
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;

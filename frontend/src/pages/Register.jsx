import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science',
    year: '1st Year',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        year: formData.year,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Branding */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{
              width: 44, height: 44, background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', color: '#fff',
            }}>
              <i className="bi bi-mortarboard-fill" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.02em' }}>
              CampusClubs
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Start your journey<br />on campus.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Create your free account and connect with student clubs, attend events, and collaborate with peers.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontWeight: 600 }}>PLATFORM STATS</div>
            {[
              ['Active Clubs', '12+'],
              ['Campus Events', '30+'],
              ['Registered Students', '200+'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>{label}</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="auth-right" style={{ overflowY: 'auto' }}>
        <div className="auth-form-container">
          <div className="d-flex d-lg-none align-items-center gap-2 mb-4">
            <div className="sidebar-brand-icon" style={{ width: 32, height: 32, fontSize: '0.9rem' }}>
              <i className="bi bi-mortarboard-fill" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>CampusClubs</span>
          </div>

          <h2 className="auth-form-title">Create your account</h2>
          <p className="auth-form-subtitle">Join the CampusClubs community today</p>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-exclamation-triangle-fill" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" name="name" placeholder="e.g. Arjun Kumar"
                  value={formData.name} onChange={handleChange} required />
              </div>

              <div className="col-12">
                <label className="form-label">College Email</label>
                <input type="email" className="form-control" name="email" placeholder="student@college.edu"
                  value={formData.email} onChange={handleChange} required />
              </div>

              <div className="col-12">
                <label className="form-label">Academic Year</label>
                <select className="form-select" name="year" value={formData.year} onChange={handleChange}>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Department</label>
                <input type="text" className="form-control" name="department" placeholder="e.g. Computer Science & Engg"
                  value={formData.department} onChange={handleChange} required />
              </div>

              <div className="col-6">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    name="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="input-group-text" onClick={() => setShowPassword(v => !v)} style={{ cursor: 'pointer' }}>
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>

              <div className="col-6">
                <label className="form-label">Confirm Password</label>
                <div className="input-group">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="form-control"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="input-group-text" onClick={() => setShowConfirm(v => !v)} style={{ cursor: 'pointer' }}>
                    <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>

              <div className="col-12 mt-1">
                <button type="submit" disabled={loading} className="btn btn-primary w-100 py-2" style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
                  ) : (
                    <><i className="bi bi-person-plus-fill me-2" />Create Account</>
                  )}
                </button>
              </div>
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

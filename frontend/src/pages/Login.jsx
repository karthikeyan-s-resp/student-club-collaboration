import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  const features = [
    { icon: 'bi-people-fill', text: 'Join & manage student clubs' },
    { icon: 'bi-calendar-event-fill', text: 'Register for campus events' },
    { icon: 'bi-diagram-3-fill', text: 'Inter-club collaborations' },
    { icon: 'bi-megaphone-fill', text: 'Real-time announcements' },
  ];

  return (
    <div className="auth-page">
      {/* Left Branding Panel */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div
              style={{
                width: 44, height: 44,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', color: '#fff',
                backdropFilter: 'blur(4px)',
              }}
            >
              <i className="bi bi-mortarboard-fill" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.02em' }}>
              CampusClubs
            </span>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 100, padding: '0.25rem 0.875rem', marginBottom: '1rem',
                fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)',
              }}
            >
              <i className="bi bi-stars" /> Academic Session 2026
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
              Your Campus.<br />Your Community.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.6 }}>
              The all-in-one platform for student clubs, events, and inter-club collaboration at your university.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 32, height: 32, background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', color: '#fff', flexShrink: 0,
                }}>
                  <i className={`bi ${f.icon}`} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right">
        <div className="auth-form-container">
          {/* Mobile brand */}
          <div className="d-flex d-lg-none align-items-center gap-2 mb-4">
            <div className="sidebar-brand-icon" style={{ width: 32, height: 32, fontSize: '0.9rem' }}>
              <i className="bi bi-mortarboard-fill" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>CampusClubs</span>
          </div>

          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-subtitle">Sign in to your account to continue</p>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-exclamation-triangle-fill" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label">College Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope" /></span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="student@college.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock" /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ borderRadius: '0 !important' }}
                />
                <button
                  type="button"
                  className="input-group-text"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ cursor: 'pointer', borderLeft: 'none' }}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 py-2 mb-3"
              style={{ fontWeight: 700, fontSize: '0.9375rem' }}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-2" />Sign In</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </p>

          {/* Demo Credentials */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem' }}>
              Quick Demo Login
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { label: '🎓 Student', email: 'emma.student@college.edu', cls: 'btn-outline-secondary' },
                { label: '🚀 Coordinator', email: 'alex.coding@college.edu', cls: 'btn-outline-primary' },
                { label: '🛡️ Admin', email: 'admin@college.edu', cls: 'btn-outline-danger' },
              ].map(({ label, email: demoEmail, cls }) => (
                <button
                  key={demoEmail}
                  type="button"
                  onClick={() => quickFill(demoEmail)}
                  className={`btn btn-sm ${cls}`}
                  style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.45rem' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

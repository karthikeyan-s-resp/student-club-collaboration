// Student Club Collaboration Platform - Single-page React Bundle
const { useState, useEffect, createContext, useContext } = React;

// -------------------------------------------------------------
// 1. API Client
// -------------------------------------------------------------
const API_URL = 'http://localhost:5000/api';

const api = {
  getToken: () => localStorage.getItem('token'),
  getHeaders: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  get: async (endpoint) => {
    return axios.get(`${API_URL}${endpoint}`, { headers: api.getHeaders() });
  },
  post: async (endpoint, data) => {
    return axios.post(`${API_URL}${endpoint}`, data, { headers: api.getHeaders() });
  },
  put: async (endpoint, data) => {
    return axios.put(`${API_URL}${endpoint}`, data, { headers: api.getHeaders() });
  },
  delete: async (endpoint) => {
    return axios.delete(`${API_URL}${endpoint}`, { headers: api.getHeaders() });
  },
};

// -------------------------------------------------------------
// 2. Auth Context
// -------------------------------------------------------------
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const u = res.data.data;
      localStorage.setItem('token', u.token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return u;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      const u = res.data.data;
      localStorage.setItem('token', u.token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return u;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// -------------------------------------------------------------
// 3. Navbar Component
// -------------------------------------------------------------
const Navbar = ({ currentTab, setTab }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm py-2">
      <div className="container-fluid px-lg-4">
        <div
          className="navbar-brand d-flex align-items-center gap-2 fw-bold"
          style={{ cursor: 'pointer' }}
          onClick={() => setTab('dashboard')}
        >
          <span className="badge bg-white text-primary fs-5 px-2 py-1 shadow-sm">
            <i className="bi bi-mortarboard-fill"></i>
          </span>
          <span>CampusClubs</span>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#topNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="topNav">
          {user && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-1">
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link border-0 text-start ${currentTab === 'dashboard' ? 'active fw-bold' : ''}`}
                  onClick={() => setTab('dashboard')}
                >
                  <i className="bi bi-grid-1x2 me-1"></i> Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link border-0 text-start ${currentTab === 'clubs' ? 'active fw-bold' : ''}`}
                  onClick={() => setTab('clubs')}
                >
                  <i className="bi bi-people me-1"></i> Clubs
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link border-0 text-start ${currentTab === 'events' ? 'active fw-bold' : ''}`}
                  onClick={() => setTab('events')}
                >
                  <i className="bi bi-calendar-event me-1"></i> Events
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link border-0 text-start ${currentTab === 'announcements' ? 'active fw-bold' : ''}`}
                  onClick={() => setTab('announcements')}
                >
                  <i className="bi bi-megaphone me-1"></i> Announcements
                </button>
              </li>

              {(user.role === 'Club Coordinator' || user.role === 'Admin') && (
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link border-0 text-start ${currentTab === 'collaborations' ? 'active fw-bold' : ''}`}
                    onClick={() => setTab('collaborations')}
                  >
                    <i className="bi bi-diagram-3 me-1"></i> Collaborations
                  </button>
                </li>
              )}

              {user.role === 'Admin' && (
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link border-0 text-start ${currentTab === 'admin' ? 'active fw-bold' : ''}`}
                    onClick={() => setTab('admin')}
                  >
                    <i className="bi bi-shield-check me-1"></i> Admin Panel
                  </button>
                </li>
              )}
            </ul>
          )}

          <div className="d-flex align-items-center gap-3 ms-auto">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <div className="text-end d-none d-sm-block text-white">
                  <div className="fw-semibold small">{user.name}</div>
                  <span className="badge bg-light text-primary py-1 px-2 border-0">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 shadow-sm"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <button
                  onClick={() => setTab('login')}
                  className={`btn btn-sm ${currentTab === 'login' ? 'btn-light text-primary' : 'btn-outline-light'}`}
                >
                  Login
                </button>
                <button
                  onClick={() => setTab('register')}
                  className={`btn btn-sm ${currentTab === 'register' ? 'btn-light text-primary' : 'btn-outline-light'}`}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// -------------------------------------------------------------
// 4. Sidebar Component
// -------------------------------------------------------------
const Sidebar = ({ currentTab, setTab }) => {
  const { user } = useAuth();

  return (
    <div className="card shadow-sm border-0 rounded-4 p-3 bg-white mb-4">
      <div className="d-flex align-items-center gap-3 pb-3 border-bottom mb-3">
        <div
          className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
          style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h6 className="mb-0 fw-bold">{user?.name}</h6>
          <small className="text-muted d-block">{user?.email}</small>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle mt-1">
            {user?.role}
          </span>
        </div>
      </div>

      <nav className="nav flex-column gap-1">
        <button
          onClick={() => setTab('dashboard')}
          className={`nav-link text-start btn btn-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium ${
            currentTab === 'dashboard' ? 'bg-primary text-white shadow-sm' : 'text-secondary'
          }`}
        >
          <i className="bi bi-speedometer2"></i> Dashboard
        </button>

        <button
          onClick={() => setTab('clubs')}
          className={`nav-link text-start btn btn-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium ${
            currentTab === 'clubs' ? 'bg-primary text-white shadow-sm' : 'text-secondary'
          }`}
        >
          <i className="bi bi-collection"></i> Discover Clubs
        </button>

        <button
          onClick={() => setTab('events')}
          className={`nav-link text-start btn btn-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium ${
            currentTab === 'events' ? 'bg-primary text-white shadow-sm' : 'text-secondary'
          }`}
        >
          <i className="bi bi-calendar3"></i> Campus Events
        </button>

        <button
          onClick={() => setTab('my-activities')}
          className={`nav-link text-start btn btn-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium ${
            currentTab === 'my-activities' ? 'bg-primary text-white shadow-sm' : 'text-secondary'
          }`}
        >
          <i className="bi bi-person-badge"></i> My Memberships & Events
        </button>

        <button
          onClick={() => setTab('announcements')}
          className={`nav-link text-start btn btn-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium ${
            currentTab === 'announcements' ? 'bg-primary text-white shadow-sm' : 'text-secondary'
          }`}
        >
          <i className="bi bi-bell"></i> Notice Board
        </button>

        {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
          <>
            <div className="text-uppercase text-muted fw-bold small mt-3 px-3">
              Coordinator Tools
            </div>
            <button
              onClick={() => setTab('coordinator-requests')}
              className={`nav-link text-start btn btn-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium ${
                currentTab === 'coordinator-requests' ? 'bg-primary text-white shadow-sm' : 'text-secondary'
              }`}
            >
              <i className="bi bi-person-check"></i> Membership Approvals
            </button>

            <button
              onClick={() => setTab('collaborations')}
              className={`nav-link text-start btn btn-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium ${
                currentTab === 'collaborations' ? 'bg-primary text-white shadow-sm' : 'text-secondary'
              }`}
            >
              <i className="bi bi-arrows-angle-contract"></i> Inter-Club Collaborations
            </button>
          </>
        )}

        {user?.role === 'Admin' && (
          <>
            <div className="text-uppercase text-muted fw-bold small mt-3 px-3">
              System Admin
            </div>
            <button
              onClick={() => setTab('admin')}
              className={`nav-link text-start btn btn-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium ${
                currentTab === 'admin' ? 'bg-primary text-white shadow-sm' : 'text-secondary'
              }`}
            >
              <i className="bi bi-shield-shaded"></i> Admin Control Center
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

// -------------------------------------------------------------
// 5. Login Component
// -------------------------------------------------------------
const LoginView = ({ setTab }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setTab('dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-primary text-white p-4 text-center">
              <div className="badge bg-white text-primary fs-3 p-2 rounded-circle mb-2 shadow-sm">
                <i className="bi bi-mortarboard-fill"></i>
              </div>
              <h4 className="fw-bold mb-1">CampusClubs Portal</h4>
              <p className="small mb-0 opacity-75">Student Club Collaboration Platform</p>
            </div>

            <div className="card-body p-4 p-md-5">
              <h5 className="fw-bold text-dark mb-4 text-center">Welcome Back! Sign In</h5>

              {error && (
                <div className="alert alert-danger py-2 d-flex align-items-center gap-2 small rounded-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">College Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="student@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0 ps-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm mb-3"
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                  )}
                  Sign In
                </button>
              </form>

              <div className="text-center small mb-4">
                Don't have an account?{' '}
                <button
                  onClick={() => setTab('register')}
                  className="btn btn-link p-0 small fw-semibold text-primary text-decoration-none"
                >
                  Register here
                </button>
              </div>

              <div className="border-top pt-3">
                <p className="text-muted small fw-bold mb-2 text-center text-uppercase">
                  ⚡ Quick Demo Login (Click to fill)
                </p>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <button
                    type="button"
                    onClick={() => quickFill('emma.student@college.edu')}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('alex.coding@college.edu')}
                    className="btn btn-outline-primary btn-sm"
                  >
                    🚀 Coordinator
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('admin@college.edu')}
                    className="btn btn-outline-danger btn-sm"
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 6. Register Component
// -------------------------------------------------------------
const RegisterView = ({ setTab }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
    department: 'Computer Science',
    year: '1st Year',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await register(formData);
      setTab('dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-6">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-primary text-white p-4 text-center">
              <h4 className="fw-bold mb-1">Create Student Account</h4>
              <p className="small mb-0 opacity-75">Join campus clubs, participate in events and innovate</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {error && (
                <div className="alert alert-danger py-2 d-flex align-items-center gap-2 small rounded-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="e.g. Karthik Raj"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">College Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="student@college.edu"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Role</label>
                    <select
                      className="form-select"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="Student">Student</option>
                      <option value="Club Coordinator">Club Coordinator</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Academic Year</label>
                    <select
                      className="form-select"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      name="department"
                      placeholder="e.g. Computer Science & Engg"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm"
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : (
                        <i className="bi bi-person-plus-fill me-2"></i>
                      )}
                      Register Account
                    </button>
                  </div>
                </div>
              </form>

              <div className="text-center small mt-4">
                Already registered?{' '}
                <button
                  onClick={() => setTab('login')}
                  className="btn btn-link p-0 small fw-semibold text-primary text-decoration-none"
                >
                  Sign in here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 7. Dashboard Component
// -------------------------------------------------------------
const DashboardView = ({ setTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, eventsRes, annRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/events?timeFilter=upcoming'),
        api.get('/announcements'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (eventsRes.data.success) setUpcomingEvents(eventsRes.data.data.slice(0, 3));
      if (annRes.data.success) setAnnouncements(annRes.data.data.slice(0, 3));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          <Sidebar currentTab="dashboard" setTab={setTab} />
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <div
            className="card border-0 rounded-4 shadow-sm text-white p-4 mb-4"
            style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}
          >
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <span className="badge bg-white text-primary mb-2 px-3 py-1 fw-bold">Academic Session 2026</span>
                <h3 className="fw-bold mb-1">Hello, {user?.name}! 👋</h3>
                <p className="mb-0 opacity-75">
                  Welcome to the College Club Collaboration Platform. Explore clubs, engage in campus events, and collaborate.
                </p>
              </div>
              <div className="d-flex gap-2">
                <button onClick={() => setTab('clubs')} className="btn btn-light text-primary fw-semibold shadow-sm">
                  <i className="bi bi-compass me-1"></i> Explore Clubs
                </button>
                <button onClick={() => setTab('events')} className="btn btn-outline-light fw-semibold">
                  <i className="bi bi-calendar-check me-1"></i> Events
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <>
              <div className="row g-3 mb-4">
                <div className="col-6 col-lg-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-muted small fw-semibold">Total Clubs</div>
                        <h3 className="fw-bold text-primary mb-0 mt-1">{stats?.totalClubs || 0}</h3>
                      </div>
                      <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4">
                        <i className="bi bi-people-fill fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-lg-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-muted small fw-semibold">Upcoming Events</div>
                        <h3 className="fw-bold text-success mb-0 mt-1">{stats?.upcomingEvents || 0}</h3>
                      </div>
                      <div className="bg-success bg-opacity-10 text-success p-3 rounded-4">
                        <i className="bi bi-calendar-event-fill fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-lg-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-muted small fw-semibold">My Memberships</div>
                        <h3 className="fw-bold text-info mb-0 mt-1">{stats?.myMembershipsCount || 0}</h3>
                      </div>
                      <div className="bg-info bg-opacity-10 text-info p-3 rounded-4">
                        <i className="bi bi-patch-check-fill fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-lg-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-muted small fw-semibold">Events Registered</div>
                        <h3 className="fw-bold text-warning mb-0 mt-1">{stats?.myRegisteredEventsCount || 0}</h3>
                      </div>
                      <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-4">
                        <i className="bi bi-ticket-perforated-fill fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
                <div className="alert alert-info border-0 shadow-sm rounded-4 d-flex align-items-center justify-content-between mb-4 p-3">
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-info-circle-fill fs-3 text-info"></i>
                    <div>
                      <strong className="d-block">Coordinator Action Required</strong>
                      <span className="small">
                        You have {stats?.pendingClubRequestsCount || 0} pending membership requests and {stats?.pendingCollabsCount || 0} pending inter-club proposals.
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setTab('coordinator-requests')} className="btn btn-sm btn-info text-white fw-bold">
                    Review Requests
                  </button>
                </div>
              )}

              <div className="row g-4">
                <div className="col-12 col-lg-7">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0">
                        <i className="bi bi-calendar4-week text-primary me-2"></i>
                        Next Upcoming Events
                      </h5>
                      <button onClick={() => setTab('events')} className="btn btn-link p-0 text-decoration-none small fw-semibold text-primary">
                        View All <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>

                    {upcomingEvents.length === 0 ? (
                      <div className="text-center py-4 text-muted">No upcoming events scheduled.</div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {upcomingEvents.map((evt) => (
                          <div key={evt._id} className="p-3 rounded-3 border bg-light d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                  {evt.club?.name || 'Club'}
                                </span>
                                <span className="badge bg-secondary-subtle text-secondary">{evt.category}</span>
                              </div>
                              <h6 className="fw-bold mb-1 text-dark">{evt.title}</h6>
                              <div className="text-muted small d-flex flex-wrap gap-3">
                                <span><i className="bi bi-calendar3 me-1"></i>{new Date(evt.date).toLocaleDateString()}</span>
                                <span><i className="bi bi-geo-alt me-1"></i>{evt.venue}</span>
                              </div>
                            </div>
                            <button onClick={() => setTab('events')} className="btn btn-sm btn-outline-primary fw-semibold text-nowrap">
                              Details & Register
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 col-lg-5">
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0">
                        <i className="bi bi-megaphone text-danger me-2"></i>
                        Club Notices
                      </h5>
                      <button onClick={() => setTab('announcements')} className="btn btn-link p-0 text-decoration-none small fw-semibold text-primary">
                        All <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>

                    {announcements.length === 0 ? (
                      <div className="text-center py-4 text-muted">No notices posted yet.</div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {announcements.map((item) => (
                          <div key={item._id} className="p-3 rounded-3 border-start border-4 border-primary bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-bold small text-primary">{item.club?.name}</span>
                              <span className={`badge ${item.priority === 'Urgent' ? 'bg-danger' : item.priority === 'Important' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                {item.priority}
                              </span>
                            </div>
                            <h6 className="fw-bold mb-1 text-dark small">{item.title}</h6>
                            <p className="text-muted small mb-0 text-truncate">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 8. Clubs Component
// -------------------------------------------------------------
const ClubsView = ({ setTab }) => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [categories] = useState(['All', 'Technical', 'Cultural', 'Sports', 'Arts & Media', 'Social & Community']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [myMemberships, setMyMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClubForModal, setSelectedClubForModal] = useState(null);
  const [requestNotes, setRequestNotes] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClub, setNewClub] = useState({ name: '', description: '', category: 'Technical', contactEmail: '', image: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchClubs();
    fetchMyMemberships();
  }, [selectedCategory, search]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      let url = `/clubs?search=${encodeURIComponent(search)}`;
      if (selectedCategory !== 'All') url += `&category=${encodeURIComponent(selectedCategory)}`;
      const res = await api.get(url);
      if (res.data.success) setClubs(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMemberships = async () => {
    try {
      const res = await api.get('/memberships/my-requests');
      if (res.data.success) setMyMemberships(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getMembershipStatus = (clubId) => {
    const mem = myMemberships.find((m) => m.club && (m.club._id === clubId || m.club === clubId));
    return mem ? mem.status : null;
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/memberships/request', {
        clubId: selectedClubForModal._id,
        notes: requestNotes,
      });
      if (res.data.success) {
        setMessage({ text: 'Membership request submitted successfully!', type: 'success' });
        setSelectedClubForModal(null);
        setRequestNotes('');
        fetchMyMemberships();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to request membership', type: 'danger' });
    }
  };

  const handleCreateClubSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/clubs', newClub);
      if (res.data.success) {
        setMessage({ text: 'Club created successfully!', type: 'success' });
        setShowCreateModal(false);
        setNewClub({ name: '', description: '', category: 'Technical', contactEmail: '', image: '' });
        fetchClubs();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create club', type: 'danger' });
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          <Sidebar currentTab="clubs" setTab={setTab} />
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
              <div>
                <h4 className="fw-bold mb-1">Campus Student Clubs</h4>
                <p className="text-muted small mb-0">Discover passion communities, join technical chapters, or initiate collaborations.</p>
              </div>

              {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary fw-semibold shadow-sm d-flex align-items-center gap-2">
                  <i className="bi bi-plus-circle"></i> Create New Club
                </button>
              )}
            </div>

            {message.text && (
              <div className={`alert alert-${message.type} alert-dismissible fade show rounded-3`} role="alert">
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
              </div>
            )}

            <div className="row g-2">
              <div className="col-12 col-md-7">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search clubs by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12 col-md-5">
                <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>Category: {c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : clubs.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <h5 className="fw-bold">No clubs found</h5>
              <p className="text-muted small">Try tweaking your search keywords or filter.</p>
            </div>
          ) : (
            <div className="row g-4">
              {clubs.map((club) => {
                const status = getMembershipStatus(club._id);
                const isCoordinator = club.coordinator?._id === user?._id || club.coordinator === user?._id;

                return (
                  <div key={club._id} className="col-12 col-md-6 col-xl-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white d-flex flex-column">
                      <div style={{ height: '170px' }} className="position-relative">
                        <img
                          src={club.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80'}
                          alt={club.name}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                        />
                        <span className="badge bg-dark bg-opacity-75 position-absolute top-0 end-0 m-3 px-2 py-1 shadow-sm">
                          {club.category}
                        </span>
                      </div>

                      <div className="card-body p-4 d-flex flex-column flex-grow-1">
                        <div className="mb-2">
                          <h5 className="fw-bold text-dark mb-1">{club.name}</h5>
                          <small className="text-muted d-block">
                            <i className="bi bi-person-badge me-1"></i>
                            Lead: {club.coordinator?.name || 'Club Lead'}
                          </small>
                        </div>

                        <p className="text-muted small flex-grow-1 mb-3" style={{ minHeight: '60px' }}>
                          {club.description.length > 120 ? `${club.description.substring(0, 120)}...` : club.description}
                        </p>

                        <div className="border-top pt-3 d-flex align-items-center justify-content-between mt-auto">
                          <div className="small text-muted">
                            <i className="bi bi-envelope me-1"></i>
                            {club.contactEmail || 'club@college.edu'}
                          </div>

                          {isCoordinator ? (
                            <span className="badge bg-primary px-3 py-2">You Lead This</span>
                          ) : status === 'Approved' ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-semibold">
                              <i className="bi bi-check2-circle me-1"></i> Member
                            </span>
                          ) : status === 'Pending' ? (
                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 fw-semibold">
                              <i className="bi bi-hourglass-split me-1"></i> Requested
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedClubForModal(club)}
                              className="btn btn-sm btn-outline-primary fw-semibold rounded-3 px-3"
                            >
                              Join Club
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Join Request Modal */}
      {selectedClubForModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Request to Join {selectedClubForModal.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedClubForModal(null)}></button>
              </div>
              <form onSubmit={handleJoinSubmit}>
                <div className="modal-body py-3">
                  <label className="form-label small fw-semibold">Statement of Interest / Skills</label>
                  <textarea
                    className="form-control rounded-3"
                    rows="3"
                    placeholder="Describe your interests and how you would like to contribute..."
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setSelectedClubForModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-semibold">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Club Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Register New Student Club</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateClubSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Club Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newClub.name}
                      onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category</label>
                    <select
                      className="form-select"
                      value={newClub.category}
                      onChange={(e) => setNewClub({ ...newClub, category: e.target.value })}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Arts & Media">Arts & Media</option>
                      <option value="Social & Community">Social & Community</option>
                      <option value="Academic">Academic</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Contact Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newClub.contactEmail}
                      onChange={(e) => setNewClub({ ...newClub, contactEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newClub.description}
                      onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-semibold">Create Club</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 9. Events Component
// -------------------------------------------------------------
const EventsView = ({ setTab }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    club: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00 AM - 01:00 PM',
    venue: '',
    category: 'Workshop',
    maxParticipants: 100,
    image: '',
  });

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
    if (user?.role === 'Club Coordinator' || user?.role === 'Admin') {
      fetchUserClubs();
    }
  }, [timeFilter, search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events?timeFilter=${timeFilter}&search=${encodeURIComponent(search)}`);
      if (res.data.success) setEvents(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const res = await api.get('/events/my-registrations');
      if (res.data.success) setMyRegistrations(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserClubs = async () => {
    try {
      const res = await api.get('/clubs');
      if (res.data.success) {
        if (user.role === 'Admin') {
          setMyClubs(res.data.data);
        } else {
          setMyClubs(res.data.data.filter((c) => c.coordinator?._id === user._id || c.coordinator === user._id));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isUserRegistered = (eventId) => {
    return myRegistrations.some((r) => r.event && (r.event._id === eventId || r.event === eventId));
  };

  const handleRegister = async (eventId) => {
    try {
      const res = await api.post(`/events/${eventId}/register`);
      if (res.data.success) {
        setMessage({ text: 'Registered successfully! Ticket confirmed.', type: 'success' });
        fetchEvents();
        fetchMyRegistrations();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Registration failed', type: 'danger' });
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      club: myClubs[0]?._id || '',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '10:00 AM - 01:00 PM',
      venue: '',
      category: 'Workshop',
      maxParticipants: 100,
      image: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (evt) => {
    setIsEditing(true);
    setCurrentEventId(evt._id);
    setFormData({
      title: evt.title,
      description: evt.description,
      club: evt.club?._id || evt.club,
      date: new Date(evt.date).toISOString().split('T')[0],
      time: evt.time,
      venue: evt.venue,
      category: evt.category,
      maxParticipants: evt.maxParticipants || 100,
      image: evt.image || '',
    });
    setShowModal(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.data.success) {
        setMessage({ text: 'Event deleted successfully!', type: 'success' });
        fetchEvents();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Delete failed', type: 'danger' });
    }
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/events/${currentEventId}`, formData);
        setMessage({ text: 'Event updated successfully!', type: 'success' });
      } else {
        await api.post('/events', formData);
        setMessage({ text: 'Event published successfully!', type: 'success' });
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save event', type: 'danger' });
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          <Sidebar currentTab="events" setTab={setTab} />
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-3">
              <div>
                <h4 className="fw-bold mb-1">Campus Events & Workshops</h4>
                <p className="text-muted small mb-0">Join hackathons, tech talks, sports leagues, and cultural jams.</p>
              </div>

              {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
                <button onClick={handleOpenCreateModal} className="btn btn-primary fw-semibold shadow-sm d-flex align-items-center gap-2">
                  <i className="bi bi-calendar-plus"></i> Host New Event
                </button>
              )}
            </div>

            {message.text && (
              <div className={`alert alert-${message.type} alert-dismissible fade show rounded-3`} role="alert">
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
              </div>
            )}

            <div className="row g-2">
              <div className="col-12 col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search events by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="btn-group w-100">
                  <button
                    className={`btn ${timeFilter === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setTimeFilter('upcoming')}
                  >
                    Upcoming
                  </button>
                  <button
                    className={`btn ${timeFilter === 'past' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setTimeFilter('past')}
                  >
                    Past Events
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <h5 className="fw-bold">No {timeFilter} events found</h5>
              <p className="text-muted small">Stay tuned for campus announcements.</p>
            </div>
          ) : (
            <div className="row g-4">
              {events.map((evt) => {
                const registered = isUserRegistered(evt._id);
                const isPast = new Date(evt.date) < new Date();
                const canManage = user?.role === 'Admin' || evt.createdBy?._id === user?._id || evt.createdBy === user?._id;

                return (
                  <div key={evt._id} className="col-12 col-lg-6">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white d-flex flex-column">
                      <div className="position-relative" style={{ height: '180px' }}>
                        <img
                          src={evt.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'}
                          alt={evt.title}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                        />
                        <span className="badge bg-primary position-absolute top-0 start-0 m-3 px-2 py-1 shadow-sm">
                          {evt.category}
                        </span>
                        <span className="badge bg-dark bg-opacity-75 position-absolute top-0 end-0 m-3 px-2 py-1 shadow-sm">
                          {evt.club?.name || 'Club'}
                        </span>
                      </div>

                      <div className="card-body p-4 d-flex flex-column flex-grow-1">
                        <h5 className="fw-bold text-dark mb-2">{evt.title}</h5>
                        <div className="d-flex flex-wrap gap-3 small text-muted mb-3">
                          <span><i className="bi bi-calendar3 text-primary me-1"></i>{new Date(evt.date).toLocaleDateString()}</span>
                          <span><i className="bi bi-clock text-primary me-1"></i>{evt.time}</span>
                          <span><i className="bi bi-geo-alt text-primary me-1"></i>{evt.venue}</span>
                        </div>
                        <p className="text-muted small mb-3 flex-grow-1">{evt.description}</p>

                        <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                          <div className="small text-muted">
                            <i className="bi bi-people me-1"></i>
                            <strong>{evt.registeredCount || 0}</strong> / {evt.maxParticipants || 100} Registered
                          </div>

                          <div className="d-flex gap-2">
                            {canManage && (
                              <>
                                <button onClick={() => handleOpenEditModal(evt)} className="btn btn-sm btn-outline-secondary rounded-3" title="Edit">
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button onClick={() => handleDeleteEvent(evt._id)} className="btn btn-sm btn-outline-danger rounded-3" title="Delete">
                                  <i className="bi bi-trash"></i>
                                </button>
                              </>
                            )}

                            {isPast ? (
                              <span className="badge bg-secondary-subtle text-secondary px-3 py-2">Concluded</span>
                            ) : registered ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-semibold">
                                <i className="bi bi-check-circle me-1"></i> Registered
                              </span>
                            ) : (
                              <button onClick={() => handleRegister(evt._id)} className="btn btn-sm btn-primary fw-semibold rounded-3 px-3 shadow-sm">
                                Register Now
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
        </div>
      </div>

      {/* Host / Edit Event Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{isEditing ? 'Edit Event Details' : 'Host New Campus Event'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitModal}>
                <div className="modal-body py-3">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold">Event Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Organizing Club</label>
                      <select
                        className="form-select"
                        value={formData.club}
                        onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                        required
                      >
                        <option value="">Select Club</option>
                        {myClubs.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Time</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Workshop">Workshop</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Competition">Competition</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Sports Meet">Sports Meet</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Venue</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Capacity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-semibold">
                    {isEditing ? 'Save Changes' : 'Publish Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 10. My Activities Component
// -------------------------------------------------------------
const MyActivitiesView = ({ setTab }) => {
  const [activeSubTab, setActiveSubTab] = useState('memberships');
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
        api.get('/memberships/my-requests'),
        api.get('/events/my-registrations'),
      ]);
      if (memRes.data.success) setMemberships(memRes.data.data);
      if (regRes.data.success) setRegistrations(regRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          <Sidebar currentTab="my-activities" setTab={setTab} />
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h4 className="fw-bold mb-1">My Campus Activities</h4>
            <p className="text-muted small mb-3">Track your club memberships and event registration passes.</p>

            <ul className="nav nav-pills gap-2 border-bottom pb-3">
              <li className="nav-item">
                <button
                  className={`nav-link rounded-3 fw-semibold ${activeSubTab === 'memberships' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('memberships')}
                >
                  <i className="bi bi-people me-1"></i> Club Memberships ({memberships.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link rounded-3 fw-semibold ${activeSubTab === 'events' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('events')}
                >
                  <i className="bi bi-ticket-perforated me-1"></i> Event Registrations ({registrations.length})
                </button>
              </li>
            </ul>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : activeSubTab === 'memberships' ? (
            memberships.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <h6 className="fw-bold">No Club Memberships</h6>
                <p className="text-muted small">You haven't requested to join any clubs yet.</p>
                <div>
                  <button onClick={() => setTab('clubs')} className="btn btn-primary btn-sm rounded-3">Discover Clubs</button>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Club</th>
                        <th>Category</th>
                        <th>Applied On</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberships.map((m) => (
                        <tr key={m._id}>
                          <td>
                            <div className="fw-bold text-dark">{m.club?.name || 'Club'}</div>
                            <small className="text-muted">{m.notes || 'No note'}</small>
                          </td>
                          <td><span className="badge bg-secondary-subtle text-secondary">{m.club?.category}</span></td>
                          <td className="small text-muted">{new Date(m.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge px-3 py-2 ${m.status === 'Approved' ? 'bg-success-subtle text-success border border-success-subtle' : m.status === 'Pending' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-danger-subtle text-danger'}`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            registrations.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <h6 className="fw-bold">No Event Registrations</h6>
                <p className="text-muted small">You haven't registered for any events yet.</p>
                <div>
                  <button onClick={() => setTab('events')} className="btn btn-primary btn-sm rounded-3">Explore Events</button>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {registrations.map((reg) => (
                  <div key={reg._id} className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-5 border-primary">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                          {reg.event?.club?.name || 'Campus Event'}
                        </span>
                        <span className="badge bg-success-subtle text-success">{reg.status}</span>
                      </div>
                      <h5 className="fw-bold mb-2 text-dark">{reg.event?.title || 'Event'}</h5>
                      <div className="small text-muted mb-3">
                        <div><i className="bi bi-calendar3 me-1 text-primary"></i> {reg.event ? new Date(reg.event.date).toLocaleDateString() : 'N/A'}</div>
                        <div><i className="bi bi-geo-alt me-1 text-primary"></i> {reg.event?.venue}</div>
                      </div>
                      <div className="border-top pt-2 d-flex justify-content-between align-items-center">
                        <small className="text-muted">Ticket Pass:</small>
                        <span className="badge bg-dark font-monospace px-2 py-1">{reg.ticketNumber}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 11. Coordinator Requests Component
// -------------------------------------------------------------
const CoordinatorRequestsView = ({ setTab }) => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchCoordinatedClubs();
  }, []);

  useEffect(() => {
    if (selectedClubId) fetchRequests(selectedClubId);
  }, [selectedClubId]);

  const fetchCoordinatedClubs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clubs');
      if (res.data.success) {
        let userClubs = res.data.data;
        if (user.role !== 'Admin') {
          userClubs = userClubs.filter((c) => c.coordinator?._id === user._id || c.coordinator === user._id);
        }
        setClubs(userClubs);
        if (userClubs.length > 0) setSelectedClubId(userClubs[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async (clubId) => {
    try {
      setLoading(true);
      const res = await api.get(`/memberships/club/${clubId}`);
      if (res.data.success) setRequests(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await api.put(`/memberships/${requestId}/status`, { status: newStatus });
      if (res.data.success) {
        setMessage({ text: `Request marked as ${newStatus}!`, type: 'success' });
        fetchRequests(selectedClubId);
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Update failed', type: 'danger' });
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          <Sidebar currentTab="coordinator-requests" setTab={setTab} />
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h4 className="fw-bold mb-1">Club Membership Reviews</h4>
            <p className="text-muted small mb-3">Review, approve or reject applications submitted for your clubs.</p>

            {message.text && (
              <div className={`alert alert-${message.type} alert-dismissible fade show rounded-3`} role="alert">
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
              </div>
            )}

            {clubs.length > 0 ? (
              <div className="d-flex align-items-center gap-2">
                <label className="fw-semibold small text-muted text-nowrap">Club:</label>
                <select className="form-select rounded-3 w-auto" value={selectedClubId} onChange={(e) => setSelectedClubId(e.target.value)}>
                  {clubs.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="alert alert-warning rounded-3 small">You do not lead any clubs yet.</div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <h5 className="fw-bold">No Membership Requests</h5>
              <p className="text-muted small">No pending student requests for this club.</p>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Applicant</th>
                      <th>Department & Year</th>
                      <th>Statement</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <div className="fw-bold text-dark">{r.user?.name}</div>
                          <small className="text-muted">{r.user?.email}</small>
                        </td>
                        <td>
                          <div className="small fw-semibold">{r.user?.department}</div>
                          <span className="badge bg-light text-dark border">{r.user?.year}</span>
                        </td>
                        <td className="small">{r.notes || 'None'}</td>
                        <td>
                          <span className={`badge px-3 py-2 ${r.status === 'Approved' ? 'bg-success-subtle text-success' : r.status === 'Pending' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-danger-subtle text-danger'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            {r.status !== 'Approved' && (
                              <button onClick={() => handleUpdateStatus(r._id, 'Approved')} className="btn btn-sm btn-success rounded-3 fw-semibold">
                                Approve
                              </button>
                            )}
                            {r.status !== 'Rejected' && (
                              <button onClick={() => handleUpdateStatus(r._id, 'Rejected')} className="btn btn-sm btn-outline-danger rounded-3">
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 12. Collaborations Component
// -------------------------------------------------------------
const CollaborationsView = ({ setTab }) => {
  const { user } = useAuth();
  const [collabs, setCollabs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    fromClubId: '',
    toClubId: '',
    proposedEventTitle: '',
    description: '',
    proposedDate: '',
  });

  useEffect(() => {
    fetchCollaborations();
    fetchClubs();
  }, []);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collaborations');
      if (res.data.success) setCollabs(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await api.get('/clubs');
      if (res.data.success) setAllClubs(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const myCoordinatedClubs = allClubs.filter(
    (c) => user.role === 'Admin' || c.coordinator?._id === user._id || c.coordinator === user._id
  );

  const handleOpenModal = () => {
    if (myCoordinatedClubs.length === 0) {
      setMessage({ text: 'You must be coordinator of at least one club.', type: 'warning' });
      return;
    }
    setFormData({
      fromClubId: myCoordinatedClubs[0]._id,
      toClubId: allClubs.find((c) => c._id !== myCoordinatedClubs[0]._id)?._id || '',
      proposedEventTitle: '',
      description: '',
      proposedDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/collaborations', formData);
      if (res.data.success) {
        setMessage({ text: 'Proposal sent successfully!', type: 'success' });
        setShowModal(false);
        fetchCollaborations();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to send proposal', type: 'danger' });
    }
  };

  const handleRespond = async (id, status) => {
    const note = prompt(`Enter optional note for ${status.toLowerCase()} this proposal:`);
    if (note === null) return;
    try {
      const res = await api.put(`/collaborations/${id}/respond`, { status, responseMessage: note });
      if (res.data.success) {
        setMessage({ text: `Collaboration marked as ${status}!`, type: 'success' });
        fetchCollaborations();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update', type: 'danger' });
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          <Sidebar currentTab="collaborations" setTab={setTab} />
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
              <div>
                <h4 className="fw-bold mb-1">Inter-Club Collaborations</h4>
                <p className="text-muted small mb-0">Partner with other clubs for joint hackathons, fests, and workshops.</p>
              </div>

              {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
                <button onClick={handleOpenModal} className="btn btn-primary fw-semibold shadow-sm d-flex align-items-center gap-2">
                  <i className="bi bi-send-plus"></i> Propose Collaboration
                </button>
              )}
            </div>

            {message.text && (
              <div className={`alert alert-${message.type} alert-dismissible fade show rounded-3 mt-3 mb-0`} role="alert">
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : collabs.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <h5 className="fw-bold">No Collaboration Proposals Yet</h5>
              <p className="text-muted small">Collaborations between clubs will appear here.</p>
            </div>
          ) : (
            <div className="row g-4">
              {collabs.map((collab) => {
                const isRecipient = user.role === 'Admin' || collab.toClub?.coordinator?._id === user._id || collab.toClub?.coordinator === user._id;

                return (
                  <div key={collab._id} className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 pb-3 border-bottom">
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                          <span className="badge bg-primary px-3 py-2 fs-6">{collab.fromClub?.name}</span>
                          <i className="bi bi-arrow-left-right text-muted fs-5"></i>
                          <span className="badge bg-dark px-3 py-2 fs-6">{collab.toClub?.name}</span>
                        </div>
                        <span className={`badge px-3 py-2 ${collab.status === 'Accepted' ? 'bg-success-subtle text-success border border-success-subtle' : collab.status === 'Pending' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-danger-subtle text-danger'}`}>
                          Status: {collab.status}
                        </span>
                      </div>

                      <h5 className="fw-bold text-dark mb-2">{collab.proposedEventTitle}</h5>
                      <p className="text-muted small mb-3">{collab.description}</p>

                      <div className="d-flex flex-wrap gap-4 small text-muted mb-3 bg-light p-3 rounded-3">
                        <div><strong>Schedule: </strong>{collab.proposedDate ? new Date(collab.proposedDate).toLocaleDateString() : 'TBD'}</div>
                        <div><strong>Initiator: </strong>{collab.initiatedBy?.name || 'Coordinator'}</div>
                        {collab.responseMessage && (
                          <div className="w-100 mt-1 text-primary"><strong>Response Note: </strong>"{collab.responseMessage}"</div>
                        )}
                      </div>

                      {collab.status === 'Pending' && isRecipient && (
                        <div className="d-flex justify-content-end gap-2 pt-2">
                          <button onClick={() => handleRespond(collab._id, 'Accepted')} className="btn btn-sm btn-success fw-semibold px-3 rounded-3">
                            Accept Proposal
                          </button>
                          <button onClick={() => handleRespond(collab._id, 'Rejected')} className="btn btn-sm btn-outline-danger fw-semibold px-3 rounded-3">
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Propose Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Propose Inter-Club Collaboration</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body py-3">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">From Club</label>
                      <select className="form-select" value={formData.fromClubId} onChange={(e) => setFormData({ ...formData, fromClubId: e.target.value })} required>
                        {myCoordinatedClubs.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Target Club</label>
                      <select className="form-select" value={formData.toClubId} onChange={(e) => setFormData({ ...formData, toClubId: e.target.value })} required>
                        <option value="">Select Target Club</option>
                        {allClubs.filter((c) => c._id !== formData.fromClubId).map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold">Event / Project Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.proposedEventTitle}
                        onChange={(e) => setFormData({ ...formData, proposedEventTitle: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.proposedDate}
                        onChange={(e) => setFormData({ ...formData, proposedDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Scope & Deliverables</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-semibold">Send Proposal</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 13. Announcements Component
// -------------------------------------------------------------
const AnnouncementsView = ({ setTab }) => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({ title: '', content: '', club: '', priority: 'Normal' });

  useEffect(() => {
    fetchAnnouncements();
    if (user?.role === 'Club Coordinator' || user?.role === 'Admin') fetchClubs();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      if (res.data.success) setAnnouncements(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await api.get('/clubs');
      if (res.data.success) {
        let userClubs = res.data.data;
        if (user.role !== 'Admin') {
          userClubs = userClubs.filter((c) => c.coordinator?._id === user._id || c.coordinator === user._id);
        }
        setClubs(userClubs);
        if (userClubs.length > 0) setFormData((prev) => ({ ...prev, club: userClubs[0]._id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/announcements', formData);
      if (res.data.success) {
        setMessage({ text: 'Announcement published successfully!', type: 'success' });
        setShowModal(false);
        setFormData({ title: '', content: '', club: clubs[0]?._id || '', priority: 'Normal' });
        fetchAnnouncements();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Publish failed', type: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete notice?')) return;
    try {
      const res = await api.delete(`/announcements/${id}`);
      if (res.data.success) {
        setMessage({ text: 'Notice deleted', type: 'info' });
        fetchAnnouncements();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Delete failed', type: 'danger' });
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          <Sidebar currentTab="announcements" setTab={setTab} />
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
              <div>
                <h4 className="fw-bold mb-1">Campus Announcements</h4>
                <p className="text-muted small mb-0">Stay informed on schedules, room changes, and tryout notifications.</p>
              </div>

              {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
                <button onClick={() => setShowModal(true)} className="btn btn-primary fw-semibold shadow-sm d-flex align-items-center gap-2">
                  <i className="bi bi-megaphone-fill"></i> Post Announcement
                </button>
              )}
            </div>

            {message.text && (
              <div className={`alert alert-${message.type} alert-dismissible fade show rounded-3 mt-3 mb-0`} role="alert">
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <h5 className="fw-bold">No Announcements Yet</h5>
              <p className="text-muted small">Club notices will be broadcast here.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {announcements.map((item) => {
                const canDelete = user?.role === 'Admin' || item.postedBy?._id === user?._id || item.postedBy === user?._id;

                return (
                  <div key={item._id} className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 fw-bold">
                          {item.club?.name || 'General Club'}
                        </span>
                        <span className={`badge ${item.priority === 'Urgent' ? 'bg-danger' : item.priority === 'Important' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {item.priority}
                        </span>
                      </div>
                      {canDelete && (
                        <button onClick={() => handleDelete(item._id)} className="btn btn-sm btn-outline-danger border-0 rounded-circle">
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                    <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                    <p className="text-muted small mb-3">{item.content}</p>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top small text-muted">
                      <div><i className="bi bi-person me-1"></i> Posted by {item.postedBy?.name || 'Coordinator'}</div>
                      <div><i className="bi bi-clock me-1"></i> {new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Publish Club Announcement</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handlePostSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Club</label>
                    <select className="form-select" value={formData.club} onChange={(e) => setFormData({ ...formData, club: e.target.value })} required>
                      {clubs.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Priority</label>
                    <select className="form-select" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Content</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-3" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-semibold">Broadcast</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 14. Admin Panel Component
// -------------------------------------------------------------
const AdminPanelView = ({ setTab }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, clubsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/admin/users'),
        api.get('/clubs'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (clubsRes.data.success) setClubs(clubsRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/dashboard/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setMessage({ text: `Role updated to ${newRole}!`, type: 'success' });
        fetchAdminData();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Update failed', type: 'danger' });
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Delete this club?')) return;
    try {
      const res = await api.delete(`/clubs/${clubId}`);
      if (res.data.success) {
        setMessage({ text: 'Club deleted successfully!', type: 'info' });
        fetchAdminData();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Delete failed', type: 'danger' });
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      <div className="row g-4">
        <div className="col-12 col-md-4 col-lg-3">
          <Sidebar currentTab="admin" setTab={setTab} />
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h4 className="fw-bold mb-1">
              <i className="bi bi-shield-shaded text-primary me-2"></i>
              System Administration
            </h4>
            <p className="text-muted small mb-0">Manage users, coordinator roles, clubs and platform metrics.</p>

            {message.text && (
              <div className={`alert alert-${message.type} alert-dismissible fade show rounded-3 mt-3 mb-0`} role="alert">
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
              </div>
            )}
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <span className="text-muted small fw-semibold">Users</span>
                <h3 className="fw-bold text-primary mb-0 mt-1">{stats?.totalUsers || 0}</h3>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <span className="text-muted small fw-semibold">Clubs</span>
                <h3 className="fw-bold text-success mb-0 mt-1">{stats?.totalClubs || 0}</h3>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <span className="text-muted small fw-semibold">Events</span>
                <h3 className="fw-bold text-info mb-0 mt-1">{stats?.totalEvents || 0}</h3>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <span className="text-muted small fw-semibold">Upcoming</span>
                <h3 className="fw-bold text-warning mb-0 mt-1">{stats?.upcomingEvents || 0}</h3>
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h5 className="fw-bold mb-3">User Directory & Role Assignment</h5>
            {loading ? (
              <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Elevate / Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="fw-bold text-dark">{u.name}</div>
                          <small className="text-muted">{u.email}</small>
                        </td>
                        <td className="small">{u.department}</td>
                        <td>
                          <span className={`badge ${u.role === 'Admin' ? 'bg-danger' : u.role === 'Club Coordinator' ? 'bg-primary' : 'bg-secondary'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm w-auto rounded-3"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          >
                            <option value="Student">Student</option>
                            <option value="Club Coordinator">Club Coordinator</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Club Management */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-3">Campus Clubs</h5>
            {loading ? (
              <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Club</th>
                      <th>Category</th>
                      <th>Coordinator</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubs.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <div className="fw-bold text-dark">{c.name}</div>
                          <small className="text-muted">{c.contactEmail}</small>
                        </td>
                        <td><span className="badge bg-secondary-subtle text-secondary">{c.category}</span></td>
                        <td className="small">{c.coordinator?.name || 'Unassigned'}</td>
                        <td className="text-end">
                          <button onClick={() => handleDeleteClub(c._id)} className="btn btn-sm btn-outline-danger rounded-3">
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 15. Main Root App
// -------------------------------------------------------------
function App() {
  const [currentTab, setTab] = useState('dashboard');
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && currentTab !== 'register') {
      setTab('login');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar currentTab={currentTab} setTab={setTab} />
      <main className="flex-grow-1">
        {currentTab === 'login' && <LoginView setTab={setTab} />}
        {currentTab === 'register' && <RegisterView setTab={setTab} />}
        {currentTab === 'dashboard' && <DashboardView setTab={setTab} />}
        {currentTab === 'clubs' && <ClubsView setTab={setTab} />}
        {currentTab === 'events' && <EventsView setTab={setTab} />}
        {currentTab === 'my-activities' && <MyActivitiesView setTab={setTab} />}
        {currentTab === 'coordinator-requests' && <CoordinatorRequestsView setTab={setTab} />}
        {currentTab === 'collaborations' && <CollaborationsView setTab={setTab} />}
        {currentTab === 'announcements' && <AnnouncementsView setTab={setTab} />}
        {currentTab === 'admin' && <AdminPanelView setTab={setTab} />}
      </main>
      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        Student Club Collaboration Platform &copy; 2026 College Full Stack Project.
      </footer>
    </div>
  );
}

// Render root
ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

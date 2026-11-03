import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm py-2">
      <div className="container-fluid px-lg-4">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/dashboard">
          <span className="badge bg-white text-primary fs-5 px-2 py-1 shadow-sm">
            <i className="bi bi-mortarboard-fill"></i>
          </span>
          <span>CampusClubs</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#topNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="topNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-1">
            <li className="nav-item">
              <NavLink className="nav-link" to="/dashboard">
                <i className="bi bi-grid-1x2 me-1"></i> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/clubs">
                <i className="bi bi-people me-1"></i> Clubs
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/events">
                <i className="bi bi-calendar-event me-1"></i> Events
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/announcements">
                <i className="bi bi-megaphone me-1"></i> Announcements
              </NavLink>
            </li>

            {(user?.role === 'Club Coordinator' || user?.role === 'Admin') && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/collaborations">
                  <i className="bi bi-diagram-3 me-1"></i> Collaborations
                </NavLink>
              </li>
            )}

            {user?.role === 'Admin' && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  <i className="bi bi-shield-check me-1"></i> Admin Panel
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <div className="text-end d-none d-sm-block text-white">
                  <div className="fw-semibold small">{user.name}</div>
                  <span className="badge bg-light text-primary py-1 px-2 border-0">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 shadow-sm"
                  title="Sign out of your account"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm">Login</Link>
                <Link to="/register" className="btn btn-light btn-sm text-primary fw-semibold">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

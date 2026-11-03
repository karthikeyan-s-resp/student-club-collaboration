import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger shadow-sm p-4 rounded-4">
          <i className="bi bi-shield-lock-fill fs-1 text-danger d-block mb-3"></i>
          <h4 className="fw-bold">Access Denied</h4>
          <p className="text-muted">You do not have the required permissions ({allowedRoles.join(' or ')}) to view this section.</p>
          <a href="/dashboard" className="btn btn-primary mt-2">Return to Dashboard</a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

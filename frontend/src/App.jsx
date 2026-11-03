import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import Events from './pages/Events';
import MyActivities from './pages/MyActivities';
import CoordinatorRequests from './pages/CoordinatorRequests';
import Collaborations from './pages/Collaborations';
import Announcements from './pages/Announcements';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import './styles/custom.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes for All Authenticated Users */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/my-activities" element={<ProtectedRoute><MyActivities /></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Coordinator and Admin Routes */}
            <Route
              path="/coordinator/manage-requests"
              element={
                <ProtectedRoute allowedRoles={['Club Coordinator', 'Admin']}>
                  <CoordinatorRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collaborations"
              element={
                <ProtectedRoute allowedRoles={['Club Coordinator', 'Admin']}>
                  <Collaborations />
                </ProtectedRoute>
              }
            />

            {/* Admin Exclusive Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

import axios from 'axios';

const API = axios.create({
  // A relative URL lets Vite proxy development requests to port 5000 and
  // can be overridden for a deployed backend with VITE_API_URL.
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add auth token automatically to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear localStorage and redirect if not already on login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

import axios from 'axios';

/**
 * Base URL resolution:
 *  - Development: '/api' → Vite proxy → http://localhost:5000/api
 *  - Production:  VITE_API_URL env var (e.g. https://lihiket-api.onrender.com/api)
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s for regular requests
  withCredentials: false,
});

// ── Separate instance for file uploads (longer timeout) ───────────────────────
export const uploadApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10 * 60 * 1000, // 10 min for file uploads
  withCredentials: false,
});

// ── Request: attach JWT token ─────────────────────────────────────────────────
const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
api.interceptors.request.use(attachToken);
uploadApi.interceptors.request.use(attachToken);

// ── Response: global error handling ──────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    // 401 — session expired or invalid token
    if (status === 401) {
      const wasLoggedIn = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (wasLoggedIn && !window.location.pathname.startsWith('/login')) {
        window.dispatchEvent(new CustomEvent('auth:logout'));
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    // 429 — rate limited
    if (status === 429) {
      return Promise.reject(new Error('Too many requests — please wait a moment.'));
    }

    // 403 — forbidden
    if (status === 403) {
      return Promise.reject(
        new Error(err.response?.data?.message || 'You do not have permission to do that.')
      );
    }

    // Network / timeout / other
    let message = err.response?.data?.message;
    if (message && typeof message === 'object') message = JSON.stringify(message);
    if (!message) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        message = 'Cannot connect to server. Check your connection.';
      } else if (err.code === 'ECONNABORTED') {
        message = 'Request timed out. Please try again.';
      } else {
        message = typeof err.message === 'string'
          ? err.message
          : 'Something went wrong. Please try again.';
      }
    }
    return Promise.reject(new Error(String(message)));
  }
);

export default api;

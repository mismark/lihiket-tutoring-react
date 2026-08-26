import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request: attach token ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: handle errors globally ─────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    // ── 401 Unauthorized: token missing, expired, or invalid ─────────────────
    // Clear credentials and redirect to login so the user re-authenticates.
    // We use window.location instead of React Router here because this
    // interceptor lives outside the component tree.
    if (status === 401) {
      const wasLoggedIn = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if the user had a session (avoid redirect loops on the
      // login page itself or on public routes that return 401).
      if (wasLoggedIn && !window.location.pathname.startsWith('/login')) {
        // Dispatch a custom event so React providers (ChatContext, etc.) can
        // stop their intervals immediately without waiting for a re-render.
        window.dispatchEvent(new CustomEvent('auth:logout'));
        window.location.href = '/login';
      }

      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    // ── 429 Too Many Requests ────────────────────────────────────────────────
    if (status === 429) {
      return Promise.reject(
        new Error('Too many requests — please wait a moment and try again.')
      );
    }

    // ── 403 Forbidden ─────────────────────────────────────────────────────────
    if (status === 403) {
      return Promise.reject(
        new Error(err.response?.data?.message || 'You do not have permission to do that.')
      );
    }

    // ── Network / timeout ─────────────────────────────────────────────────────
    let message = err.response?.data?.message;
    if (message && typeof message === 'object') message = JSON.stringify(message);

    if (!message) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        message = 'Cannot connect to server. Make sure the backend is running.';
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

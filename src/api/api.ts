import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: normalize errors ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    // Auto-logout on 401 (token expired / invalid)
    if (status === 401) {
      removeToken();
      // Soft redirect — let AuthContext handle the UI state on next render
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    // Attach a clean message so hooks can display it directly
    const normalizedError = new Error(message) as any;
    normalizedError.status = status;
    normalizedError.details = error.response?.data?.error?.details ?? [];
    return Promise.reject(normalizedError);
  }
);

export default api;

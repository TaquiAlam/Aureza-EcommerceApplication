import axios from 'axios';
import { handleApiError } from '../utils/errorUtils';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach Bearer JWT token if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => {
    // If an API request receives an HTML string (due to SPA fallback when backend is unreachable), treat as error
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
      return Promise.reject(new Error('Backend API returned HTML instead of JSON. Check backend connection.'));
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // Auto-toast for server errors (500+) — these are never the user's fault
    if (status && status >= 500) {
      handleApiError(error, { toastId: 'server-error' });
    }

    // 401 — don't redirect automatically, let pages/contexts handle it
    // All other errors are passed through for page-level handling

    return Promise.reject(error);
  }
);

export default api;

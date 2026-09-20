import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
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
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling auth errors & SPA fallback HTML detection
api.interceptors.response.use(
  (response) => {
    // If an API request receives an HTML string (due to SPA fallback when backend is unreachable), treat as error
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
      return Promise.reject(new Error('Backend API returned HTML instead of JSON. Check backend connection.'));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // User is not authenticated — don't redirect automatically
    }
    return Promise.reject(error);
  }
);

export default api;

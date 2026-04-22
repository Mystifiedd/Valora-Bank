import axios from 'axios';
import { emitAuthEvent } from '../utils/authEvents';
import { isTokenExpired } from '../utils/token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    if (isTokenExpired(token)) {
      emitAuthEvent('logout', { reason: 'token_expired' });
      return Promise.reject(new Error('Token expired'));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't trigger logout for auth endpoints — 401 there means bad credentials, not expired session
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthEndpoint) {
        emitAuthEvent('logout', { reason: 'unauthorized' });
      }
    }
    return Promise.reject(error);
  }
);

export default api;

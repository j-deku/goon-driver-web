/* eslint-disable no-unused-vars */
// axiosInstanceAdmin.js
import axios from 'axios';
import mitt from 'mitt';
import { toast } from 'react-toastify';

export const emitter = mitt();

const AUTH_ENDPOINTS = [
  '/api/admin/login',
  '/api/admin/logout',
  '/api/admin/refresh-token',
  '/api/admin/me',
];

const shouldBypassRefresh = (url = '') =>
  AUTH_ENDPOINTS.some((p) => url.endsWith(p) && !url.endsWith('/me')); // allow /me to trigger refresh

const isAccessTokenProblem = (status, code) =>
  status === 401 && (
    !code ||
    code === 'ACCESS_TOKEN_EXPIRED' ||
    code === 'ACCESS_TOKEN_INVALID' ||
    code === 'UNAUTHENTICATED'
  );

const isHardAuthFailureCode = (code) =>
  code === 'INVALID_SESSION' ||
  code === 'JWT_INVALID' ||
  code === 'REFRESH_INVALID';

const axiosInstanceAdmin = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// -----------------------------
// Refresh orchestration
// -----------------------------
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(success) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

// Dedicated client WITHOUT interceptors to avoid loops
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// -----------------------------
// Optional: simple network awareness + retry
// -----------------------------
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { isOnline = true; });
  window.addEventListener('offline', () => { isOnline = false; });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// -----------------------------
// Logging (optional)
// -----------------------------
axiosInstanceAdmin.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

// -----------------------------
// Response interceptor
// -----------------------------
axiosInstanceAdmin.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
    if (duration > 3000) {
      console.warn(`Slow API response: ${response.config.url} took ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const res = error.response;
    const status = res?.status;
    const code = res?.data?.code;
    const url = originalRequest?.url || '';

    // 1) Pure network / CORS error: retry a few times, then bubble up (NO logout)
    if (!res) {
      const retries = originalRequest._networkRetries || 0;
      if (retries < 3 && !originalRequest.skipRetry) {
        originalRequest._networkRetries = retries + 1;
        const delay = Math.min(1000 * Math.pow(2, retries), 5000);
        await sleep(delay);
        return axiosInstanceAdmin(originalRequest);
      }
      // bubble up so slice can "soft" handle
      return Promise.reject({
        ...error,
        _classified: true,
        __type: 'NETWORK_ERROR',
      });
    }

    // 2) If it's an auth endpoint itself, do not try refreshing
    if (shouldBypassRefresh(url)) {
      return Promise.reject({
        ...error,
        _classified: true,
        __type: status === 401 ? 'AUTH_ERROR' : 'SERVER_ERROR',
      });
    }

    // 3) 401 → attempt refresh once
    if (isAccessTokenProblem(status, code) && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue request
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((success) => {
            if (success) resolve(axiosInstanceAdmin(originalRequest));
            else reject({ ...error, refreshFailed: true, _classified: true, __type: 'AUTH_ERROR' });
          });
        });
      }

      isRefreshing = true;
      try {
        await refreshClient.post('/api/admin/refresh-token', {}, { withCredentials: true });
        isRefreshing = false;
        onRefreshed(true);
        emitter.emit('tokenRefreshed');
        return axiosInstanceAdmin(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshed(false);
        // Bubble to slice → it will HARD logout
        return Promise.reject({
          ...error,
          refreshFailed: true,
          _classified: true,
          __type: 'AUTH_ERROR',
        });
      }
    }

    // 4) Hard auth failures (invalid session / refresh invalid)
    if (isHardAuthFailureCode(code)) {
      return Promise.reject({
        ...error,
        refreshFailed: true,
        _classified: true,
        __type: 'AUTH_ERROR',
      });
    }

    // 5) Everything else → bubble as SERVER_ERROR (UI stays logged-in)
    return Promise.reject({
      ...error,
      _classified: true,
      __type: 'SERVER_ERROR',
    });
  }
);

export function cleanupAndRedirect(msg = 'Session expired. Please log in again.') {
  ["role", "adminEmail", "adminId"].forEach((key) => localStorage.removeItem(key));
  sessionStorage.clear();
  toast.error(msg);
  window.location.href = `${import.meta.env.VITE_AUTH_LINK1}/login`;
}

export default axiosInstanceAdmin;

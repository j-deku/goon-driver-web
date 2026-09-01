/* eslint-disable no-unused-vars */
import axios from 'axios';

// -----------------------------
// Constants / helpers
// -----------------------------
const AUTH_ENDPOINTS = [
  '/api/user/logout',
  '/api/user/refresh-token',
  '/api/user/login',
];

const shouldBypassRefresh = (url = '') =>
  AUTH_ENDPOINTS.some((p) => url.endsWith(p));

const isAccessTokenProblem = (status, code) =>
  status === 401 && (
    !code || // legacy/no code
    code === 'ACCESS_TOKEN_EXPIRED' ||
    code === 'ACCESS_TOKEN_INVALID' ||
    code === 'UNAUTHENTICATED'
  );

const isHardAuthFailureCode = (code) =>
  code === 'INVALID_SESSION' ||
  code === 'JWT_INVALID' ||
  code === 'REFRESH_INVALID';

// -----------------------------
// Axios instance
// -----------------------------
const axiosInstance = axios.create({
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

// -----------------------------
// Network awareness + backoff
// -----------------------------
let isOnline = navigator.onLine;
let networkErrorShown = false;

window.addEventListener('online', () => {
  isOnline = true;
  networkErrorShown = false;
});

window.addEventListener('offline', () => {
  isOnline = false;
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// -----------------------------
// Request interceptor
// -----------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };

    if (!isOnline && !config.skipOfflineCheck) {
      return Promise.reject(new Error('No internet connection'));
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------
// Response interceptor
// -----------------------------
axiosInstance.interceptors.response.use(
  (response) => {
    const endTime = Date.now();
    const duration = endTime - (response.config.metadata?.startTime || endTime);
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

    if (!res) {
      const retries = originalRequest._networkRetries || 0;

      if (retries < 3 && !originalRequest.skipRetry) {
        originalRequest._networkRetries = retries + 1;
        const delay = Math.min(1000 * Math.pow(2, retries), 5000);
        await sleep(delay);
        return axiosInstance(originalRequest);
      }

      if (!networkErrorShown) {
        networkErrorShown = true;
        setTimeout(() => { networkErrorShown = false; }, 5000);
      }

      return Promise.reject(error);
    }
    if (shouldBypassRefresh(url)) {
      return Promise.reject(error);
    }
    if (isAccessTokenProblem(status, code) && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((success) => {
            if (success) resolve(axiosInstance(originalRequest));
            else reject({ ...error, refreshFailed: true });
          });
        });
      }

      // Start refresh
      isRefreshing = true;

          try {
        await axiosInstance.post('/api/user/refresh-token', {}, { withCredentials: true });
        onRefreshed(true);
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        onRefreshed(false);
        isRefreshing = false;

        const status = refreshError?.response?.status;
        const code = refreshError?.response?.data?.code;

        const isHardFailure = (status === 401 || status === 403) && isHardAuthFailureCode(code);

        return Promise.reject({ ...error, refreshFailed: isHardFailure }); // ✅ Only hard-fail on true auth issue
      }
    }

    if (isHardAuthFailureCode(code)) {
      return Promise.reject({ ...error, refreshFailed: true });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

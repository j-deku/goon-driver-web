/* eslint-disable no-unused-vars */
// src/.../axiosInstanceDriver.js
import axios from 'axios';
import mitt from 'mitt';

export const emitter = mitt();

const AUTH_ENDPOINTS = [
  '/api/driver/login', 
  '/api/driver/logout',
  '/api/driver/refresh-token',
]; 

const shouldBypassRefresh = (url = '') =>
  AUTH_ENDPOINTS.some((p) => url.endsWith(p));

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

const axiosInstanceDriver = axios.create({
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

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// -----------------------------
// Optional: network retry
// -----------------------------
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// -----------------------------
// Interceptors
// -----------------------------
axiosInstanceDriver.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config || {};
    const res = error.response;
    const status = res?.status;
    const code = res?.data?.code;
    const url = originalRequest?.url || '';

    // 1) Network / CORS / no-response
    if (!res) {
      const retries = originalRequest._networkRetries || 0;
      if (retries < 3 && !originalRequest.skipRetry) {
        originalRequest._networkRetries = retries + 1;
        const delay = Math.min(1000 * Math.pow(2, retries), 5000);
        await sleep(delay);
        return axiosInstanceDriver(originalRequest);
      }
      return Promise.reject({
        ...error,
        _classified: true,
        __type: 'NETWORK_ERROR',
      });
    }

    // 2) Don't refresh on auth endpoints to avoid loops
    if (shouldBypassRefresh(url)) {
      return Promise.reject({
        ...error,
        _classified: true,
        __type: status === 401 ? 'AUTH_ERROR' : 'SERVER_ERROR',
      });
    }

    // 3) 401 access token problem → try refresh once
    if (isAccessTokenProblem(status, code) && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((success) => {
            if (success) resolve(axiosInstanceDriver(originalRequest));
            else reject({ ...error, refreshFailed: true, _classified: true, __type: 'AUTH_ERROR' });
          });
        });
      }

      isRefreshing = true;
      try {
        await refreshClient.post('/api/driver/refresh-token', {}, { withCredentials: true });
        isRefreshing = false;
        onRefreshed(true);
        emitter.emit('tokenRefreshed');
        return axiosInstanceDriver(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        onRefreshed(false);
        return Promise.reject({
          ...error,
          refreshFailed: true,
          _classified: true,
          __type: 'AUTH_ERROR',
        });
      }
    }

    // 4) Hard auth failures
    if (isHardAuthFailureCode(code)) {
      return Promise.reject({
        ...error,
        refreshFailed: true,
        _classified: true,
        __type: 'AUTH_ERROR',
      });
    }

    // 5) Everything else → bubble up
    return Promise.reject({
      ...error,
      _classified: true,
      __type: 'SERVER_ERROR',
    });
  }
);

export default axiosInstanceDriver;

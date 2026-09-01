// src/axiosInstance.js
import axios from 'axios';
import persistentQueue from './src/offline/persistentQueue';

const axiosInstanceNetwork = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const isRetryableNetworkError = (error) => {
  // Network down / DNS / CORS / timeout
  if (!navigator.onLine) return true;
  if (error.code === 'ERR_NETWORK') return true;
  if (error.message?.includes('Network Error')) return true;
  return false;
};

axiosInstanceNetwork.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalConfig = error.config || {};

    if (isRetryableNetworkError(error)) {
      // Store the request for later.
      await persistentQueue.enqueue(originalConfig);

      // Return a resolved "marker" so UI can choose to ignore error UI.
      return Promise.resolve({ queued: true, offline: true });
    }

    return Promise.reject(error);
  }
);

export default axiosInstanceNetwork;

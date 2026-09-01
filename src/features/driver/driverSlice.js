/* eslint-disable no-extra-boolean-cast */
/* eslint-disable no-unused-vars */
// src/.../driverSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstanceDriver from '../../../axiosInstanceDriver';

export const AUTH_STATUS = {
  UNKNOWN: 'unknown',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
};

const initialState = {
  isAuthenticated: !!localStorage.getItem('driverId'),
  authChecked: false,
  authStatus: !!localStorage.getItem('driverId') ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNKNOWN,

  userRoles: [],
  userId: localStorage.getItem('driverId') || null,
  driverInfo: null,

  isLoading: false,
  error: null,
  needsReauth: false,
  lastFetchTime: null,
};

export const fetchDriverInfo = createAsyncThunk(
  'driver/fetchDriverInfo',
  async (_, thunkAPI) => {
    try {
      const { data } = await axiosInstanceDriver.get('/api/driver/me', { withCredentials: true });
      // use data.driver when your API returns { driver: {...} }
      return data.driver ?? data;
    } catch (error) {
      const classified = error?._classified ? error : {};
      const type = classified.__type || 'SERVER_ERROR';
      return thunkAPI.rejectWithValue({
        message: error?.response?.data?.message || error?.message || 'Failed to fetch driver info',
        type,
        refreshFailed: error?.refreshFailed === true,
      });
    }
  }
);

export const driverLogout = createAsyncThunk('driver/logout', async (_, thunkAPI) => {
  try {
    await axiosInstanceDriver.post('/api/driver/logout', {}, { withCredentials: true });
  } catch (e) {
    console.warn('Driver logout request failed, clearing anyway:', e?.message);
  } finally {
    ["token", "role", "driverEmail", "driverId"].forEach((key) => localStorage.removeItem(key));
  }
  return true;
});

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    clearDriver(state) {
      state.isAuthenticated = false;
      state.authChecked = true;
      state.authStatus = AUTH_STATUS.UNAUTHENTICATED;
      state.userRoles = [];
      state.userId = null;
      state.driverInfo = null;
      state.isLoading = false;
      state.error = null;
      state.needsReauth = false;
    },
    setAuthChecked(state, action) {
      state.authChecked = action.payload;
    },
    softDriverAuthError(state, action) {
      state.needsReauth = true;
      state.error = action.payload || 'Authentication error';
      state.authStatus = AUTH_STATUS.AUTHENTICATED;
    },
    clearDriverError(state) {
      state.error = null;
    },
    restoreDriverFromStorage(state) {
      const id = localStorage.getItem('driverId');
      if (id) {
        state.userId = id;
        state.isAuthenticated = true;
        state.authStatus = AUTH_STATUS.AUTHENTICATED;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDriverInfo.fulfilled, (state, { payload }) => {
        state.driverInfo = payload;
        state.userId = payload.userId || payload._id || null;
        state.userRoles = Array.isArray(payload.roles) ? payload.roles : [payload.roles].filter(Boolean);

        state.isAuthenticated = Boolean(state.userId);
        state.authStatus = state.isAuthenticated ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNKNOWN;

        state.isLoading = false;
        state.authChecked = true;
        state.needsReauth = false;
        state.lastFetchTime = Date.now();

        if (state.userId) {
          localStorage.setItem('driverId', state.userId);
        }
      })
      .addCase(fetchDriverInfo.rejected, (state, { payload }) => {
        const { type, refreshFailed } = payload || {};
        state.isLoading = false;
        state.authChecked = true;
        state.error = payload?.message || 'Failed to fetch driver info';
        state.lastFetchTime = Date.now();

        if (type === 'AUTH_ERROR' && refreshFailed) {
          // HARD logout
          state.driverInfo = null;
          state.userId = null;
          state.userRoles = [];
          state.isAuthenticated = false;
          state.authStatus = AUTH_STATUS.UNAUTHENTICATED;
          state.needsReauth = true;
          localStorage.removeItem('driverId');
        } else {
          // NETWORK/SERVER → soft keep
          state.isAuthenticated = !!state.userId;
          state.authStatus = state.isAuthenticated ? AUTH_STATUS.AUTHENTICATED : state.authStatus;
          state.needsReauth = false;
        }
      })
      .addCase(driverLogout.fulfilled, (state) => {
        state.driverInfo = null;
        state.userId = null;
        state.userRoles = [];
        state.isAuthenticated = false;
        state.authChecked = true;
        state.authStatus = AUTH_STATUS.UNAUTHENTICATED;
        state.isLoading = false;
        state.needsReauth = false;
        state.error = null;
        state.lastFetchTime = null;
      });
  },
});

export const {
  clearDriver,
  setAuthChecked,
  softDriverAuthError,
  clearDriverError,
  restoreDriverFromStorage,
} = driverSlice.actions;

export const selectDriverInfo = (state) => state.driver.driverInfo;
export const selectDriverId = (state) => state.driver.userId;
export const selectDriverRoles = (state) => state.driver.userRoles;
export const selectIsDriverAuthenticated = (state) => state.driver.isAuthenticated;
export const selectDriverAuthChecked = (state) => state.driver.authChecked;
export const selectDriverLoading = (state) => state.driver.isLoading;
export const selectDriverNeedsReauth = (state) => state.driver.needsReauth;
export const selectDriverAuthStatus = (state) => state.driver.authStatus;

export default driverSlice.reducer;

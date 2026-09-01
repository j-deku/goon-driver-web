/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-boolean-cast */
// adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstanceAdmin from '../../../axiosInstanceAdmin';

export const AUTH_STATUS = {
  UNKNOWN: 'unknown',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
};

const initialState = {
  isAuthenticated: !!localStorage.getItem('adminId'),
  authChecked: false,
  authStatus: !!localStorage.getItem('adminId') ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNKNOWN,
  recaptchaPassed: false,

  userRoles: [],
  userId: localStorage.getItem('adminId') || null,
  adminInfo: null,

  error: null,
  needsReauth: false,   // show banner but keep UI working
  lastFetchTime: null,
};

export const fetchAdminInfo = createAsyncThunk(
  'admin/fetchAdminInfo',
  async (_, thunkAPI) => {
    try {
      const { data } = await axiosInstanceAdmin.get('/api/admin/me', { withCredentials: true });
      return data;
    } catch (error) {
      const classified = error?._classified ? error : {};
      const type = classified.__type || 'SERVER_ERROR';
      return thunkAPI.rejectWithValue({
        message: error?.response?.data?.message || error?.message || 'Failed to fetch admin info',
        type,
        refreshFailed: error?.refreshFailed === true,
      });
    }
  }
);

export const adminLogout = createAsyncThunk('admin/logout', async (_, thunkAPI) => {
  try {
    await axiosInstanceAdmin.post('/api/admin/logout', {}, { withCredentials: true });
    ["token", "role", "adminEmail", "adminId"].forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    // We still clear local state
    ["token", "role", "adminEmail", "adminId"].forEach((key) => localStorage.removeItem(key));
  }
  return true;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminAuth(state, action) {
      const { userId, roles, adminInfo } = action.payload || {};
      state.isAuthenticated = true;
      state.authChecked = true;
      state.authStatus = AUTH_STATUS.AUTHENTICATED;
      state.userId = userId || null;
      state.userRoles = Array.isArray(roles) ? roles : [roles].filter(Boolean);
      state.adminInfo = adminInfo || null;
      state.error = null;
      state.needsReauth = false;

      if (userId) localStorage.setItem("adminId", userId);
    },
    setRecaptchaPassed(state, action) {
      state.recaptchaPassed = action.payload;
    },
    softAuthError(state, action) {
      state.needsReauth = true;
      state.error = action.payload || 'Authentication error';
      state.authStatus = AUTH_STATUS.AUTHENTICATED; // keep UI usable
    },
    clearAdmin(state) {
      state.isAuthenticated = false;
      state.authChecked = true;
      state.authStatus = AUTH_STATUS.UNAUTHENTICATED;
      state.userRoles = [];
      state.userId = null;
      state.adminInfo = null;
      state.error = null;
      state.needsReauth = false;
    },
    restoreAdminFromStorage(state) {
      const adminId = localStorage.getItem('adminId');
      if (adminId) {
        state.isAuthenticated = true;
        state.authChecked = false;
        state.authStatus = AUTH_STATUS.AUTHENTICATED;
        state.userId = adminId;
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminInfo
      .addCase(fetchAdminInfo.pending, (state) => {
        state.authChecked = false;
        state.error = null;
      })
      .addCase(fetchAdminInfo.fulfilled, (state, { payload }) => {
        const adminData = payload.admin ?? payload;
        state.adminInfo = adminData;
        state.userId = adminData.id || adminData._id || null;
        state.userRoles = Array.isArray(adminData.roles) ? adminData.roles : [adminData.roles].filter(Boolean);

        state.isAuthenticated = Boolean(state.userId);
        state.authStatus = state.isAuthenticated ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNKNOWN;

        state.authChecked = true;
        state.needsReauth = false;
        state.error = null;
        state.lastFetchTime = Date.now();

        if (state.userId) {
          localStorage.setItem('adminId', state.userId);
        }
      })
      .addCase(fetchAdminInfo.rejected, (state, { payload }) => {
        const { type, refreshFailed } = payload || {};
        state.authChecked = true;
        state.error = payload?.message || 'Failed to fetch admin info';
        state.lastFetchTime = Date.now();

        if (type === 'AUTH_ERROR' && refreshFailed) {
          // HARD logout
          state.adminInfo = null;
          state.userId = null;
          state.userRoles = [];
          state.isAuthenticated = false;
          state.authStatus = AUTH_STATUS.UNAUTHENTICATED;
          state.needsReauth = true;
          ["adminId"].forEach((key) => localStorage.removeItem(key));
        } else {
          // NETWORK / SERVER error → keep user, soft handle
          state.isAuthenticated = !!state.userId;
          state.authStatus = state.isAuthenticated ? AUTH_STATUS.AUTHENTICATED : state.authStatus;
          state.needsReauth = false;
        }
      })

      // adminLogout
      .addCase(adminLogout.fulfilled, (state) => {
        state.adminInfo = null;
        state.userId = null;
        state.userRoles = [];
        state.isAuthenticated = false;
        state.authChecked = true;
        state.authStatus = AUTH_STATUS.UNAUTHENTICATED;
        state.needsReauth = false;
        state.error = null;
        state.lastFetchTime = null;
      });
  },
});

export const {
  setRecaptchaPassed,
  softAuthError,
  clearAdmin,
  restoreAdminFromStorage,
  clearError,
  setAdminAuth,
} = adminSlice.actions;

// Selectors
export const selectAdminInfo = (state) => state.admin.adminInfo;
export const selectAdminId = (state) => state.admin.userId;
export const selectAdminRoles = (state) => state.admin.userRoles;
export const selectIsAdminAuthenticated = (state) => state.admin.isAuthenticated;
export const selectAdminAuthChecked = (state) => state.admin.authChecked;
export const selectAdminAuthStatus = (state) => state.admin.authStatus;
export const selectAdminNeedsReauth = (state) => state.admin.needsReauth;

export default adminSlice.reducer;

/* eslint-disable no-extra-boolean-cast */
/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../axiosInstance';

export const AUTH_STATUS = {
  UNKNOWN: 'unknown',
  AUTHENTICATED: 'authenticated',
  REFRESHING: 'refreshing',
  UNAUTHENTICATED: 'unauthenticated',
};

const initialState = {
  user: null,
  lastGoodUser: null,
  userId: localStorage.getItem("userId") || null,
  userRoles: [],
  status: 'idle',
  error: null,
  isAuthenticated: !!localStorage.getItem("userId"),
  authStatus: !!localStorage.getItem("userId") ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNKNOWN,
  needsReauth: false, // <-- UI can show “please re-login” but don’t nuke state yet
  lastFetchTime: null,
  isOnline: navigator.onLine,
};

export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (_, thunkAPI) => {
    try {
      const { data } = await axiosInstance.get(`/api/user/me`, { withCredentials: true });
      return data;
    } catch (error) {
      const status = error?.response?.status;

      // No response => network / CORS / server down
      if (!error.response) {
        return thunkAPI.rejectWithValue({
          message: error.message || 'Network error',
          type: 'NETWORK_ERROR',
          maintainAuth: true
        });
      }

      if (status === 401 || status === 403) {
        // Let slice decide how to react (if refresh failed, this will become hard-logout)
        return thunkAPI.rejectWithValue({
          message: 'Authentication failed',
          type: 'AUTH_ERROR',
          maintainAuth: false,
          refreshFailed: error.refreshFailed === true, // bubbled from axios
        });
      }

      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || error.message,
        type: 'SERVER_ERROR',
        maintainAuth: true
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, thunkAPI) => {
    try {
      await axiosInstance.post(`/api/user/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.warn('Logout request failed, but clearing local state anyway:', error?.message);
    } finally {
      localStorage.removeItem("userId");
    }
    return true;
  }
);

export const recoverSession = createAsyncThunk(
  'user/recoverSession',
  async (_, thunkAPI) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return thunkAPI.rejectWithValue({ message: 'No stored session' });

    try {
      const { data } = await axiosInstance.get(`/api/user/me`, { withCredentials: true });
      return data;
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        // Real auth failure only if refresh also failed (axios sets refreshFailed)
        return thunkAPI.rejectWithValue({
          message: 'Unauthorized',
          code: status,
          refreshFailed: error.refreshFailed === true,
        });
      }
      // Network / 5xx: keep user, mark needsReauth = false
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || error.message,
        code: status,
        refreshFailed: false,
      });
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    hardLogout: (state) => {
      state.user = null;
      state.lastGoodUser = null;
      state.userId = null;
      state.userRoles = [];
      state.status = 'idle';
      state.error = null;
      state.isAuthenticated = false;
      state.authStatus = AUTH_STATUS.UNAUTHENTICATED;
      state.needsReauth = false;
      state.lastFetchTime = null;
      localStorage.removeItem('userId');
    },
    clearUser: (state) => {
    state.user = null;
    state.userId = null;
    state.userRoles = [];
    state.isAuthenticated = false;
    state.authStatus = AUTH_STATUS.UNAUTHENTICATED;
    state.needsReauth = false;
    localStorage.removeItem('userId');
  },
    softAuthError: (state, action) => {
      // Show banner, keep user cached
      state.needsReauth = true;
      state.error = action.payload?.message || 'Authentication error';
      state.authStatus = AUTH_STATUS.AUTHENTICATED; // still allow UI
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    restoreUserState: (state) => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        state.userId = userId;
        state.isAuthenticated = true;
        state.authStatus = AUTH_STATUS.AUTHENTICATED;

        // 🔹 Hydrate roles from persisted user JSON in localStorage
        try {
          const persistedState = JSON.parse(localStorage.getItem("persist:root"));
          if (persistedState?.user) {
            const parsedUser = JSON.parse(persistedState.user);
            if (Array.isArray(parsedUser.roles)) {
              state.userRoles = parsedUser.roles.map((r) => r.toLowerCase());
            }
          }
        } catch (err) {
          console.warn("Failed to hydrate user roles from storage:", err);
        }

        // 🔹 Fallback to lastGoodUser
        if (state.userRoles.length === 0 && state.lastGoodUser?.roles) {
          state.userRoles = state.lastGoodUser.roles.map((r) => r.toLowerCase());
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUserInfo
      .addCase(fetchUserInfo.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, { payload }) => {
        const userData = payload.user ?? payload;

        state.user = userData;
        state.lastGoodUser = userData;
        state.userId = userData.id || userData._id || null;
        state.userRoles = userData.roles || [];
        state.status = 'succeeded';
        state.isAuthenticated = Boolean(state.userId);
        state.authStatus = state.isAuthenticated ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNKNOWN;
        state.needsReauth = false;
        state.lastFetchTime = Date.now();

        if (state.userId) {
          localStorage.setItem("userId", state.userId);
        }
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        const errorPayload = action.payload || {};
        state.status = 'failed';
        state.error = errorPayload.message || 'Failed to fetch user info';
        state.lastFetchTime = Date.now();

        const { type, maintainAuth, refreshFailed } = errorPayload;

        if ((type === 'AUTH_ERROR') && refreshFailed) {
          // Hard logout only if refresh also failed
          state.user = null;
          state.lastGoodUser = null;
          state.userId = null;
          state.userRoles = [];
          state.isAuthenticated = false;
          state.authStatus = AUTH_STATUS.UNAUTHENTICATED;
          state.needsReauth = true;
          localStorage.removeItem("userId");
        } else {
          // Keep user; mark soft
          state.needsReauth = false;
          state.authStatus = state.isAuthenticated ? AUTH_STATUS.AUTHENTICATED : state.authStatus;
        }
      })

      // recoverSession
      .addCase(recoverSession.pending, (state) => {
        state.authStatus = state.isAuthenticated ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNKNOWN;
        state.status = 'loading';
      })
      .addCase(recoverSession.fulfilled, (state, { payload }) => {
        const userData = payload.user ?? payload;

        state.user = userData;
        state.lastGoodUser = userData;
        state.userId = userData.id || userData._id || null;
        state.userRoles = userData.roles || [];
        state.status = 'succeeded';
        state.error = null;
        state.isAuthenticated = Boolean(state.userId);
        state.authStatus = state.isAuthenticated ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNKNOWN;
        state.needsReauth = false;
        state.lastFetchTime = Date.now();
      })
      .addCase(recoverSession.rejected, (state, action) => {
        const { type, refreshFailed, code } = action.payload || {};
        state.status = 'failed';
        state.error = action.payload?.message;

        if ((type === 'AUTH_ERROR') && refreshFailed) {
          // Hard logout
          state.user = null;
          state.lastGoodUser = null;
          state.userId = null;
          state.userRoles = [];
          state.isAuthenticated = false;
          state.authStatus = AUTH_STATUS.UNAUTHENTICATED;
          state.needsReauth = true;
          localStorage.removeItem('userId');
        } else {
          // Keep stale user around; app stays logged-in
          state.authStatus = state.isAuthenticated ? AUTH_STATUS.AUTHENTICATED : state.authStatus;
          state.needsReauth = false;
        }
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.lastGoodUser = null;
        state.userId = null;
        state.userRoles = [];
        state.status = 'idle';
        state.error = null;
        state.isAuthenticated = false;
        state.authStatus = AUTH_STATUS.UNAUTHENTICATED;
        state.lastFetchTime = null;
        state.needsReauth = false;
      });
  },
});

export const {
  hardLogout,
  clearUser,
  softAuthError,
  setOnlineStatus,
  restoreUserState,
  clearError
} = userSlice.actions;

// selectors
export const selectUser = (state) => state.user.user || state.user.lastGoodUser;
export const selectUserId = (state) => state.user.userId;
export const selectUserRoles = (state) => state.user.userRoles; 
export const selectUserStatus = (state) => state.user.status;
export const selectUserError = (state) => state.user.error;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectIsOnline = (state) => state.user.isOnline;
export const selectAuthStatus = (state) => state.user.authStatus;
export const selectNeedsReauth = (state) => state.user.needsReauth;
export const selectLastFetchTime = (state) => state.user.lastFetchTime;
export const selectIsUserLoaded = (state) => Boolean(state.user.user || state.user.lastGoodUser);


export const selectShouldRefreshUser = (state) => {
  const lastFetch = state.user.lastFetchTime;
  const now = Date.now();
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  return !lastFetch || (now - lastFetch) > FIFTEEN_MINUTES;
};

export default userSlice.reducer;

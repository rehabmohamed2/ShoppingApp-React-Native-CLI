import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, StorageKeys } from '@/types';
import { StorageUtils } from '@/utils/storage';

// Define the superadmin username (you can change this)
const SUPERADMIN_USERNAME = 'emilys'; // Using one of the DummyJSON test users

// DON'T restore auth from storage in initial state
// We'll handle session restoration separately to control lock behavior
const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  superAdminUsername: SUPERADMIN_USERNAME,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Persist to storage
      StorageUtils.setString(StorageKeys.AUTH_TOKEN, action.payload.token);
      StorageUtils.setObject(StorageKeys.USER, action.payload.user);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear storage
      StorageUtils.delete(StorageKeys.AUTH_TOKEN);
      StorageUtils.delete(StorageKeys.USER);
    },
    clearError: (state) => {
      state.error = null;
    },
    restoreSession: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError, restoreSession } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsSuperAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.username === state.auth.superAdminUsername;

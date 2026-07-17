import { createSlice } from '@reduxjs/toolkit';
import apiService from 'src/services/api';
import axios from 'axios';

const TOKEN_KEY = import.meta.env.VITE_TOKEN_NAME || 'auth_user';

const getInitialUser = () => {
  const savedUser = localStorage.getItem(TOKEN_KEY);
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      if (user && user.token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
      } else {
        axios.defaults.headers.common["Authorization"] = null;
      }
    } catch (e) {
      console.warn("Failed to parse initial user token:", e);
    }
  }
  return savedUser ? JSON.parse(savedUser) : null;
};

const initialState = {
  user: getInitialUser(),
  isAuthenticated: !!getInitialUser(),
  error: null,
  loading: false,
  registerMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      localStorage.setItem(TOKEN_KEY, JSON.stringify(action.payload));
      
      // Explicitly set authorization header
      if (action.payload && action.payload.token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${action.payload.token}`;
      } else {
        axios.defaults.headers.common["Authorization"] = null;
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      axios.defaults.headers.common["Authorization"] = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
      // Clear authorization header on logout
      axios.defaults.headers.common["Authorization"] = null;
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.registerMessage = action.payload; // approval message from API
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRegisterMessage: (state) => {
      state.registerMessage = null;
    },
    updateToken: (state, action) => {
      if (state.user) {
        state.user.token = action.payload;
        localStorage.setItem(TOKEN_KEY, JSON.stringify(state.user));
        // Explicitly set authorization header for axios common headers
        axios.defaults.headers.common["Authorization"] = `Bearer ${action.payload}`;
      }
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  clearError,
  clearRegisterMessage,
  updateToken
} = authSlice.actions;

// Async real API auth actions
export const loginUser = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    const { email, password } = credentials;

    // Check default admin credentials fallback for local offline testing
    if (email === 'admin@admin.com' && password === 'admin123') {
      const user = {
        id: '1',
        name: 'Alex Mercer',
        email: 'admin@admin.com',
        role: 'admin',
        token: 'mock_token_123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      };
      dispatch(loginSuccess(user));
      return { success: true, data: user };
    }

    // Call the real Home/login endpoint matching lms-ui request structure
    const response = await apiService.post('Home/login', {
      userName: email,
      password: password
    });

    if (response && response.data) {
      const loginData = response.data;

      // API returns { token, logo, customer, user: { id, userName, ... } }
      // Flatten into one object so state.auth.user has all fields at the top level:
      // → user?.id, user?.userName, user?.token, user?.logo all work directly
      const userInfo = {
        ...(loginData.user || {}),   // spread actual user fields (id, userName, nickName, roleId, roleName, ...)
        token:    loginData.token    || loginData.user?.token,
        logo:     loginData.logo,
        customer: loginData.customer,
      };

      dispatch(loginSuccess(userInfo));
      return { success: true, data: userInfo };
    } else {
      throw new Error(response?.message || 'Invalid credentials or missing login data');
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Login failed';
    dispatch(loginFailure(errorMsg));
    return { success: false, error: errorMsg };
  }
};

export const registerUser = (userData) => async (dispatch) => {
  dispatch(registerStart());
  try {
    const response = await apiService.post('User/register', {
      userName: userData.userName,
      password: userData.password,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      nickName: userData.nickName,
    });

    // API returns a message string — display it as the approval notice
    const message = response?.message || response || 'Registration submitted. Awaiting admin approval.';
    dispatch(registerSuccess(message));
    return { success: true, message };
  } catch (error) {
    // error.message is set by the interceptor for validation errors (e.g. "Password: must be ≥6 chars")
    // Always prefer it over error.response.data which may be a raw object
    const rawData = error.response?.data;
    const errorMsg =
      error.message ||
      (typeof rawData === 'string' ? rawData : null) ||
      rawData?.message ||
      'Registration failed. Please try again.';
    dispatch(registerFailure(errorMsg));
    return { success: false, error: errorMsg };
  }
};

export default authSlice.reducer;

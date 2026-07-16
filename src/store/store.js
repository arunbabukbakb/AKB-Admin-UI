import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import themeReducer from './themeSlice';
import roleReducer from './roleSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    theme: themeReducer,
    roles: roleReducer,
    notifications: notificationReducer,
  },
});

export default store;

import { createSlice } from '@reduxjs/toolkit';

const loadNotifications = () => {
  try {
    const serialized = localStorage.getItem('notifications');
    return serialized ? JSON.parse(serialized) : [];
  } catch (e) {
    return [];
  }
};

const saveNotifications = (notifications) => {
  try {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (e) {
    // Ignore write errors
  }
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: loadNotifications(),
    unreadCount: loadNotifications().filter(n => !n.read).length
  },
  reducers: {
    addNotification: (state, action) => {
      // Expecting payload: { id, title, body, date, read: false, url, type }
      state.list.unshift(action.payload);
      state.unreadCount = state.list.filter(n => !n.read).length;
      saveNotifications(state.list);
    },
    markAsRead: (state, action) => {
      const id = action.payload;
      const notif = state.list.find(n => n.id === id);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = state.list.filter(n => !n.read).length;
        saveNotifications(state.list);
      }
    },
    markAllAsRead: (state) => {
      state.list.forEach(n => n.read = true);
      state.unreadCount = 0;
      saveNotifications(state.list);
    },
    clearAllNotifications: (state) => {
      state.list = [];
      state.unreadCount = 0;
      saveNotifications([]);
    }
  }
});

export const { addNotification, markAsRead, markAllAsRead, clearAllNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;

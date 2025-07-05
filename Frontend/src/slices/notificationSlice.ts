import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        // You could add a 'read' property to the notification interface if needed
      }
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearAllNotifications,
  markAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;

export const showSuccessNotification = (title: string, message: string, duration = 5000) => 
  addNotification({ type: 'success', title, message, duration });

export const showErrorNotification = (title: string, message: string, duration = 7000) => 
  addNotification({ type: 'error', title, message, duration });

export const showWarningNotification = (title: string, message: string, duration = 6000) => 
  addNotification({ type: 'warning', title, message, duration });

export const showInfoNotification = (title: string, message: string, duration = 5000) => 
  addNotification({ type: 'info', title, message, duration });

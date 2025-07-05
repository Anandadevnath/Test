import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../slices/uiSlice';
import notificationReducer from '../slices/notificationSlice';
import bookReducer from '../slices/bookSlice';
import borrowReducer from '../slices/borrowSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    notifications: notificationReducer,
    books: bookReducer,
    borrow: borrowReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

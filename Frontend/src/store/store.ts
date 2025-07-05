import { configureStore } from '@reduxjs/toolkit';
import bookSlice from '../slices/bookSlice';
import borrowSlice from '../slices/borrowSlice';
import notificationSlice from '../slices/notificationSlice';
import uiSlice from '../slices/uiSlice';

export const store = configureStore({
  reducer: {
    books: bookSlice,
    borrow: borrowSlice,
    notifications: notificationSlice,
    ui: uiSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

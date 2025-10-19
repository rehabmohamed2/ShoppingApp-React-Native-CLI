import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import lockReducer from './slices/lockSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    lock: lockReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

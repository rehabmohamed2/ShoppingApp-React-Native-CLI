import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LockState } from '@/types';

const initialState: LockState = {
  isLocked: false,
  lastActivityTime: Date.now(),
};

const lockSlice = createSlice({
  name: 'lock',
  initialState,
  reducers: {
    lockApp: (state) => {
      state.isLocked = true;
    },
    unlockApp: (state) => {
      state.isLocked = false;
      state.lastActivityTime = Date.now();
    },
    updateActivityTime: (state) => {
      state.lastActivityTime = Date.now();
    },
  },
});

export const { lockApp, unlockApp, updateActivityTime } = lockSlice.actions;

export default lockSlice.reducer;

// Selectors
export const selectIsLocked = (state: { lock: LockState }) => state.lock.isLocked;
export const selectLastActivityTime = (state: { lock: LockState }) => state.lock.lastActivityTime;

import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppDispatch, useAppSelector } from './useRedux';
import { lockApp, updateActivityTime, selectLastActivityTime, selectIsLocked } from '@/store/slices/lockSlice';
import { selectIsAuthenticated } from '@/store/slices/authSlice';

const INACTIVITY_TIMEOUT = 10000; // 10 seconds in milliseconds

export const useAutoLock = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLocked = useAppSelector(selectIsLocked);
  const lastActivityTime = useAppSelector(selectLastActivityTime);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Reset the inactivity timer on user activity
  const resetInactivityTimer = useCallback(() => {
    // Only reset if authenticated and not locked
    if (!isAuthenticated || isLocked) return;

    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Update activity time
    dispatch(updateActivityTime());

    // Start new timer
    inactivityTimerRef.current = setTimeout(() => {
      dispatch(lockApp());
    }, INACTIVITY_TIMEOUT);
  }, [isAuthenticated, isLocked, dispatch]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    if (!isAuthenticated) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // App is going to background - lock immediately
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
          inactivityTimerRef.current = null;
        }
        dispatch(lockApp());
      }

      // App is coming to foreground - check if should lock based on elapsed time
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const now = Date.now();
        const elapsed = now - lastActivityTime;

        if (elapsed > INACTIVITY_TIMEOUT) {
          dispatch(lockApp());
        } else if (!isLocked) {
          // Restart timer with remaining time
          resetInactivityTimer();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, lastActivityTime, isLocked, dispatch, resetInactivityTimer]);

  // Start inactivity timer when unlocked
  useEffect(() => {
    if (isAuthenticated && !isLocked) {
      resetInactivityTimer();
    } else {
      // Clear timer when locked or not authenticated
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [isAuthenticated, isLocked, resetInactivityTimer]);

  // Export the reset function so ActivityTracker can use it
  return { resetInactivityTimer };
};

import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAutoLock } from '@/hooks/useAutoLock';

interface ActivityTrackerProps {
  children: ReactNode;
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ children }) => {
  const { resetInactivityTimer } = useAutoLock();

  // Use onStartShouldSetResponderCapture to detect all touches without blocking them
  const handleTouchCapture = () => {
    resetInactivityTimer();
    return false; // Don't claim the responder, let children handle the touch
  };

  return (
    <View
      style={styles.container}
      onStartShouldSetResponderCapture={handleTouchCapture}
      onMoveShouldSetResponderCapture={handleTouchCapture}
      onResponderMove={resetInactivityTimer}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ActivityTracker;

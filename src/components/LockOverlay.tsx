import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useAppSelector } from '@/hooks/useRedux';
import { selectIsLocked } from '@/store/slices/lockSlice';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import BiometricUnlockScreen from '@/screens/BiometricUnlockScreen';

const LockOverlay = () => {
  const isLocked = useAppSelector(selectIsLocked);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Only show lock overlay if user is authenticated AND locked
  // This prevents showing lock screen before login
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Modal
      visible={isLocked}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      hardwareAccelerated
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <BiometricUnlockScreen />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default LockOverlay;

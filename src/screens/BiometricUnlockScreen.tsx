import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { unlockApp } from '@/store/slices/lockSlice';
import { selectUser } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';
import biometricService from '@/services/biometricService';

interface BiometricUnlockScreenProps {
  onPasswordFallback?: () => void;
}

const BiometricUnlockScreen: React.FC<BiometricUnlockScreenProps> = ({ onPasswordFallback }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    checkBiometricAndAuthenticate();
  }, []);

  const checkBiometricAndAuthenticate = async () => {
    const { available, biometryType } = await biometricService.isBiometricAvailable();

    if (available && biometryType) {
      setBiometricType(biometricService.getBiometryTypeName(biometryType));
      // Don't auto-trigger, let user tap the button
    } else {
      // Biometric not available, show password fallback immediately
      setBiometricType('');
      setShowPasswordFallback(true);
    }
  };

  const attemptBiometricAuth = async () => {
    const result = await biometricService.authenticate('Unlock the app');

    if (result.success) {
      dispatch(unlockApp());
    } else {
      // Biometric failed or cancelled, show password fallback
      setShowPasswordFallback(true);
    }
  };

  const handlePasswordUnlock = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (!user?.username) {
      Alert.alert('Error', 'User information not found');
      return;
    }

    setIsLoading(true);

    try {
      // Verify password by calling the login API with current user's credentials
      const response = await authAPI.login({
        username: user.username,
        password: password.trim(),
      });

      // Password is correct, unlock the app
      dispatch(unlockApp());
      setPassword('');
    } catch (error: any) {
      Alert.alert(
        'Incorrect Password',
        'The password you entered is incorrect. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryBiometric = async () => {
    setShowPasswordFallback(false);
    setPassword('');
    await attemptBiometricAuth();
  };

  return (
    <View style={styles.container}>
      <View style={styles.lockIcon}>
        <Text style={styles.lockEmoji}>🔒</Text>
      </View>

      <Text style={styles.title}>App Locked</Text>
      <Text style={styles.subtitle}>
        {showPasswordFallback
          ? `Enter password for ${user?.username || 'user'}`
          : `Use ${biometricType || 'biometric'} to unlock`}
      </Text>

      {!showPasswordFallback ? (
        <View style={styles.biometricContainer}>
          <TouchableOpacity style={styles.biometricButton} onPress={attemptBiometricAuth}>
            <Text style={styles.biometricIcon}>👆</Text>
            <Text style={styles.biometricText}>Tap to authenticate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fallbackButton}
            onPress={() => setShowPasswordFallback(true)}>
            <Text style={styles.fallbackText}>Use Password Instead</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoFocus
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.unlockButton, isLoading && styles.unlockButtonDisabled]}
            onPress={handlePasswordUnlock}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.unlockButtonText}>Unlock</Text>
            )}
          </TouchableOpacity>

          {biometricType && (
            <TouchableOpacity style={styles.retryBiometricButton} onPress={handleRetryBiometric}>
              <Text style={styles.retryBiometricText}>Try {biometricType} Again</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  lockIcon: {
    marginBottom: 24,
  },
  lockEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  biometricContainer: {
    width: '100%',
    alignItems: 'center',
  },
  biometricButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  biometricIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  biometricText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackButton: {
    paddingVertical: 12,
  },
  fallbackText: {
    color: '#007AFF',
    fontSize: 15,
  },
  passwordContainer: {
    width: '100%',
  },
  passwordInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  unlockButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  unlockButtonDisabled: {
    backgroundColor: '#999',
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryBiometricButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  retryBiometricText: {
    color: '#007AFF',
    fontSize: 15,
  },
});

export default BiometricUnlockScreen;

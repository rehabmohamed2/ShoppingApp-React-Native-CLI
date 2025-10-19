import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { loginStart, loginSuccess, loginFailure, selectAuth } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';

// Theme colors
const themes = {
  dark: {
    background: '#1A1A2E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    primary: '#16A085',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(255, 255, 255, 0.15)',
    inputBg: 'rgba(255, 255, 255, 0.08)',
    logoBg: 'rgba(255, 255, 255, 0.12)',
    logoBorder: 'rgba(255, 255, 255, 0.2)',
    placeholder: '#A0A0A0',
    divider: 'rgba(255, 255, 255, 0.1)',
    errorBg: 'rgba(231, 76, 60, 0.15)',
    errorBorder: 'rgba(231, 76, 60, 0.3)',
    errorText: '#FF6B6B',
    buttonDisabled: '#4A5568',
    circle1: 'rgba(22, 160, 133, 0.15)',
    circle2: 'rgba(52, 152, 219, 0.12)',
    circle3: 'rgba(155, 89, 182, 0.1)',
    toggleBg: 'rgba(255, 255, 255, 0.15)',
  },
  light: {
    background: '#F5F5F7',
    text: '#1D1D1F',
    textSecondary: '#6E6E73',
    primary: '#007AFF',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(0, 0, 0, 0.1)',
    inputBg: '#F9F9F9',
    logoBg: '#FFFFFF',
    logoBorder: 'rgba(0, 0, 0, 0.1)',
    placeholder: '#999999',
    divider: 'rgba(0, 0, 0, 0.08)',
    errorBg: 'rgba(255, 59, 48, 0.1)',
    errorBorder: 'rgba(255, 59, 48, 0.3)',
    errorText: '#FF3B30',
    buttonDisabled: '#C7C7CC',
    circle1: 'rgba(0, 122, 255, 0.08)',
    circle2: 'rgba(52, 199, 89, 0.08)',
    circle3: 'rgba(255, 149, 0, 0.08)',
    toggleBg: 'rgba(0, 0, 0, 0.08)',
  },
};

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(selectAuth);

  const theme = isDarkMode ? themes.dark : themes.light;

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      dispatch(loginFailure('Please enter both username and password'));
      return;
    }

    try {
      dispatch(loginStart());
      const response = await authAPI.login({ username: username.trim(), password });

      dispatch(
        loginSuccess({
          token: response.accessToken,
          user: {
            id: response.id,
            username: response.username,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            gender: response.gender,
            image: response.image,
          },
        })
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid username or password. Please try again.';
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Theme Toggle Button */}
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: theme.toggleBg }]}
          onPress={() => setIsDarkMode(!isDarkMode)}
          activeOpacity={0.7}>
          <Text style={styles.themeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>

        {/* Decorative Background Elements */}
        <View style={[styles.bgCircle1, { backgroundColor: theme.circle1 }]} />
        <View style={[styles.bgCircle2, { backgroundColor: theme.circle2 }]} />
        <View style={[styles.bgCircle3, { backgroundColor: theme.circle3 }]} />

        <View style={styles.content}>
          {/* Logo/Icon Area */}
          <View style={styles.logoContainer}>
            <View
              style={[
                styles.logoCircle,
                {
                  backgroundColor: theme.logoBg,
                  borderColor: theme.logoBorder,
                  shadowColor: theme.primary,
                },
              ]}>
              <Text style={styles.logoEmoji}>🛍️</Text>
            </View>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text
              style={[
                styles.brandName,
                {
                  color: theme.text,
                  textShadowColor: isDarkMode
                    ? 'rgba(22, 160, 133, 0.3)'
                    : 'rgba(0, 122, 255, 0.2)',
                },
              ]}>
              LUXE COLLECTION
            </Text>
            <View style={[styles.underline, { backgroundColor: theme.primary }]} />
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>
              Your Style, Your Story
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <View style={styles.errorIconCircle}>
                <Text style={styles.errorIcon}>!</Text>
              </View>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          {/* Input Card */}
          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                shadowColor: theme.primary,
              },
            ]}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Username"
                placeholderTextColor={theme.placeholder}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                keyboardAppearance={isDarkMode ? 'dark' : 'light'}
              />
            </View>

            <View style={[styles.dividerLine, { backgroundColor: theme.divider }]} />

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="done"
                keyboardAppearance={isDarkMode ? 'dark' : 'light'}
                onSubmitEditing={handleLogin}
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: isLoading ? theme.buttonDisabled : theme.primary,
                shadowColor: theme.primary,
              },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Theme Toggle
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  themeIcon: {
    fontSize: 24,
  },
  // Decorative Background Circles
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    left: -100,
    opacity: 0.6,
  },
  bgCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: -80,
    right: -80,
    opacity: 0.5,
  },
  bgCircle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: '40%',
    right: -50,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  // Logo Section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 42,
  },
  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  underline: {
    width: 60,
    height: 3,
    borderRadius: 2,
    marginVertical: 12,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  // Error Container
  errorContainer: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  errorIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  errorIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  errorMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  // Input Card
  inputCard: {
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  inputIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    fontWeight: '500',
  },
  dividerLine: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 4,
  },
  // Login Button
  loginButton: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    marginRight: 8,
  },
  buttonArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default LoginScreen;

import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, StyleSheet, View, Modal } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';
import { logout, restoreSession } from '@/store/slices/authSlice';
import { lockApp } from '@/store/slices/lockSlice';
import { StorageUtils, StorageKeys } from '@/utils/storage';
import { authAPI } from '@/services/api';
import { User } from '@/types';
import LoginScreen from '@/screens/LoginScreen';
import AllProductsScreen from '@/screens/AllProductsScreen';
import SpecificCategoryScreen from '@/screens/SpecificCategoryScreen';
import { RootStackParamList, MainTabParamList } from '@/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Sign Out Screen component (dummy screen that triggers logout)
const SignOutScreen = () => {
  return null;
};

const MainTabs = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleSignOut = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    dispatch(logout());
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: styles.tabBar,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}>
        <Tab.Screen
          name="AllProducts"
          component={AllProductsScreen}
          options={{
            title: 'All Products',
            tabBarLabel: 'All Products',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🛍️</Text>,
          }}
        />
        <Tab.Screen
          name="SpecificCategory"
          component={SpecificCategoryScreen}
          options={{
            title: 'Smartphones',
            tabBarLabel: 'Smartphones',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📱</Text>,
          }}
        />
        <Tab.Screen
          name="SignOut"
          component={SignOutScreen}
          options={{
            tabBarLabel: 'Sign Out',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🚪</Text>,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleSignOut();
            },
          }}
        />
      </Tab.Navigator>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Text style={styles.modalIcon}>👋</Text>
              </View>
              <Text style={styles.modalTitle}>Sign Out?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to sign out?
                {user?.username && (
                  <Text style={styles.modalUsername}>{'\n\n'}Signed in as: {user.username}</Text>
                )}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalLogoutButton}
                onPress={confirmLogout}>
                <Text style={styles.modalLogoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const hasRestoredSession = useRef(false);

  // Check for stored session on mount and validate with /auth/me
  useEffect(() => {
    const validateAndRestoreSession = async () => {
      if (hasRestoredSession.current) return;
      hasRestoredSession.current = true;

      const storedToken = StorageUtils.getString(StorageKeys.AUTH_TOKEN);

      if (storedToken) {
        try {
          // Validate token with GET /auth/me
          const user = await authAPI.getCurrentUser();

          // Token is valid, restore session
          dispatch(restoreSession({ token: storedToken, user }));

          // Show biometric lock screen (user must unlock)
          dispatch(lockApp());
        } catch (error) {
          // Token is invalid or expired, clear storage
          console.log('Session validation failed, clearing storage');
          StorageUtils.delete(StorageKeys.AUTH_TOKEN);
          StorageUtils.delete(StorageKeys.USER);
        }
      }
    };

    validateAndRestoreSession();
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  // Logout Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalUsername: {
    fontWeight: '600',
    color: '#007AFF',
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6E6E73',
  },
  modalLogoutButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  modalLogoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AppNavigator;

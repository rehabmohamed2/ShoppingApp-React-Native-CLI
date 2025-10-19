/**
 * 3 Pages Store App
 * React Native Coding Challenge
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import { queryClient, createMMKVPersister } from './src/config/queryClient';
import AppNavigator from './src/navigation/AppNavigator';
import LockOverlay from './src/components/LockOverlay';
import ActivityTracker from './src/components/ActivityTracker';

const persister = createMMKVPersister();

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}>
            <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
            <ActivityTracker>
              <AppNavigator />
            </ActivityTracker>
            <LockOverlay />
          </PersistQueryClientProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

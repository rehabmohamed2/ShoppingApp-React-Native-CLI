import { MMKV } from 'react-native-mmkv';
import { StorageKeys } from '@/types';

// Create MMKV instance
export const storage = new MMKV({
  id: 'app-storage',
  encryptionKey: 'some-encryption-key-change-in-production',
});

// Re-export StorageKeys for convenience
export { StorageKeys };

// Storage utilities with type safety
export const StorageUtils = {
  // String operations
  setString: (key: string, value: string): void => {
    storage.set(key, value);
  },

  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },

  // Object operations (JSON)
  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  getObject: <T>(key: string): T | undefined => {
    const jsonValue = storage.getString(key);
    return jsonValue ? JSON.parse(jsonValue) : undefined;
  },

  // Boolean operations
  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },

  // Number operations
  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  // Delete operation
  delete: (key: string): void => {
    storage.delete(key);
  },

  // Clear all
  clearAll: (): void => {
    storage.clearAll();
  },

  // Check if key exists
  contains: (key: string): boolean => {
    return storage.contains(key);
  },

  // Get all keys
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },
};

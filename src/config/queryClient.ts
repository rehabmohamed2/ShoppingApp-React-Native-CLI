import { QueryClient } from '@tanstack/react-query';
import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { storage } from '@/utils/storage';

const CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE';

// MMKV Persister for React Query
export const createMMKVPersister = (): Persister => {
  return {
    persistClient: async (client: PersistedClient) => {
      storage.set(CACHE_KEY, JSON.stringify(client));
    },
    restoreClient: async () => {
      const cached = storage.getString(CACHE_KEY);
      if (!cached) return undefined;

      try {
        return JSON.parse(cached);
      } catch {
        return undefined;
      }
    },
    removeClient: async () => {
      storage.delete(CACHE_KEY);
    },
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

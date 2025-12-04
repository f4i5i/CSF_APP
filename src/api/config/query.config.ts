/**
 * React Query Configuration
 * Default options for queries and mutations
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default query options for React Query
 */
export const defaultQueryOptions = {
  queries: {
    // Stale time: how long data is considered fresh (default: 1 minute)
    staleTime: 60 * 1000,

    // GC time: how long unused data stays in cache (default: 5 minutes)
    // Formerly known as cacheTime in v4
    gcTime: 5 * 60 * 1000,

    // Retry configuration
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 3 times for 5xx errors (server errors)
      return failureCount < 3;
    },

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000), // Max 30 seconds

    // Refetch on window focus
    refetchOnWindowFocus: true,

    // Refetch on reconnect
    refetchOnReconnect: true,

    // Refetch on mount if data is stale
    refetchOnMount: true,
  },

  mutations: {
    // Retry mutations once for network errors only
    retry: (failureCount: number, error: any) => {
      if (error?.code === 'NETWORK_ERROR' && failureCount < 1) {
        return true;
      }
      return false;
    },
  },
};

/**
 * Create and configure React Query client
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
}

/**
 * Refetch intervals for real-time features (in milliseconds)
 */
export const REFETCH_INTERVALS = {
  // Real-time check-in status (30 seconds)
  CHECK_IN_STATUS: 30 * 1000,

  // Attendance updates (1 minute)
  ATTENDANCE: 60 * 1000,

  // Admin dashboard metrics (2 minutes)
  ADMIN_METRICS: 2 * 60 * 1000,

  // Class capacity updates (1 minute)
  CLASS_CAPACITY: 60 * 1000,
} as const;

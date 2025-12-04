/**
 * API Provider Component
 * Wraps the app with QueryClientProvider for React Query
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../../api/client/query-client';

interface ApiProviderProps {
  children: React.ReactNode;
}

/**
 * ApiProvider wraps the application with React Query context
 * Provides caching, automatic refetching, and state management for server data
 *
 * @example
 * ```tsx
 * <ApiProvider>
 *   <App />
 * </ApiProvider>
 * ```
 */
export function ApiProvider({ children }: ApiProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
        />
      )}
    </QueryClientProvider>
  );
}

/**
 * useUser Hook
 * React Query hook to fetch current user profile
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { queryKeys } from '../../constants/query-keys';
import type { User } from '../../types/auth.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseUserOptions {
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<User, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch current user profile
 * Used for authentication state management
 *
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useUser();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return <div>Welcome, {user.first_name}!</div>;
 * ```
 */
export function useUser(options: UseUserOptions = {}) {
  const { enabled = true, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: userService.getMe,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry on auth failure
    ...queryOptions,
  });
}

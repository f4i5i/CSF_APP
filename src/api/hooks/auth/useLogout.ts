/**
 * useLogout Hook
 * React Query mutation hook for user logout
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseLogoutOptions {
  mutationOptions?: Omit<
    UseMutationOptions<void, ApiErrorResponse, void>,
    'mutationFn'
  >;
}

/**
 * Hook to handle user logout
 *
 * @example
 * ```tsx
 * const { mutate: logout } = useLogout();
 *
 * const handleLogout = () => {
 *   logout();
 * };
 * ```
 */
export function useLogout(options: UseLogoutOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: () => authService.logout(),

    onSuccess: () => {
      toast.success('Logged out successfully');
    },

    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || 'Logout failed');
    },

    onSettled: () => {
      // Clear all cached data and force redirect regardless of success
      queryClient.clear();
      window.location.href = '/login';
    },

    ...mutationOptions,
  });
}

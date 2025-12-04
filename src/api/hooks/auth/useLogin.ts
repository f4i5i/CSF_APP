/**
 * useLogin Hook
 * React Query mutation hook for user login
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { queryKeys } from '../../constants/query-keys';
import type { LoginRequest, LoginResponse } from '../../types/auth.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseLoginOptions {
  mutationOptions?: Omit<
    UseMutationOptions<LoginResponse, ApiErrorResponse, LoginRequest>,
    'mutationFn'
  >;
}

/**
 * Hook to handle user login
 *
 * @example
 * ```tsx
 * const { mutate: login, isPending } = useLogin();
 *
 * const handleLogin = (email: string, password: string) => {
 *   login({ email, password });
 * };
 * ```
 */
export function useLogin(options: UseLoginOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),

    onSuccess: async () => {
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });

      toast.success('Welcome back!');
    },

    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || 'Login failed');
    },

    ...mutationOptions,
  });
}

/**
 * useRegister Hook
 * React Query mutation hook for user registration
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { queryKeys } from '../../constants/query-keys';
import type { RegisterRequest, LoginResponse } from '../../types/auth.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseRegisterOptions {
  mutationOptions?: Omit<
    UseMutationOptions<LoginResponse, ApiErrorResponse, RegisterRequest>,
    'mutationFn'
  >;
}

/**
 * Hook to handle user registration
 *
 * @example
 * ```tsx
 * const { mutate: register, isPending } = useRegister();
 *
 * const handleRegister = (userData: RegisterRequest) => {
 *   register(userData);
 * };
 * ```
 */
export function useRegister(options: UseRegisterOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),

    onSuccess: async () => {
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });

      toast.success('Account created successfully!');
    },

    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || 'Registration failed');
    },

    ...mutationOptions,
  });
}

/**
 * useUpdateUser Hook
 * React Query mutation hook to update user profile
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userService } from '../../services/user.service';
import { queryKeys } from '../../constants/query-keys';
import type { User, UpdateUserRequest } from '../../types/auth.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseUpdateUserOptions {
  mutationOptions?: Omit<
    UseMutationOptions<User, ApiErrorResponse, UpdateUserRequest, { previousUser: User | undefined }>,
    'mutationFn'
  >;
}

/**
 * Hook to update current user profile
 *
 * @example
 * ```tsx
 * const { mutate: updateUser, isPending } = useUpdateUser();
 *
 * const handleUpdate = () => {
 *   updateUser({
 *     first_name: 'John',
 *     last_name: 'Doe',
 *   });
 * };
 * ```
 */
export function useUpdateUser(options: UseUpdateUserOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (userData: UpdateUserRequest) => userService.updateMe(userData),

    onMutate: async (updatedUserData): Promise<{ previousUser: User | undefined }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.me() });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(queryKeys.users.me());

      // Optimistically update to the new value
      if (previousUser) {
        queryClient.setQueryData<User>(queryKeys.users.me(), {
          ...previousUser,
          ...updatedUserData,
        });
      }

      return { previousUser };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.me(), context.previousUser);
      }
      toast.error(error.message || 'Failed to update profile');
    },

    onSuccess: () => {
      // Invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });

      toast.success('Profile updated successfully!');
    },

    ...mutationOptions,
  });
}

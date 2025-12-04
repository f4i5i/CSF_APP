/**
 * useCreateChild Hook
 * React Query mutation hook to create a new child
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { childService } from '../../services/child.service';
import { queryKeys } from '../../constants/query-keys';
import { cacheInvalidation } from '../../utils/cache-utils';
import type { Child, CreateChildRequest } from '../../types/child.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseCreateChildOptions {
  mutationOptions?: Omit<
    UseMutationOptions<Child, ApiErrorResponse, CreateChildRequest, { previousChildren: Child[] | undefined }>,
    'mutationFn'
  >;
}

/**
 * Hook to create a new child with optimistic updates
 *
 * @example
 * ```tsx
 * const { mutate: createChild, isPending } = useCreateChild();
 *
 * const handleCreate = () => {
 *   createChild({
 *     first_name: 'John',
 *     last_name: 'Doe',
 *     date_of_birth: '2015-01-01',
 *   });
 * };
 * ```
 */
export function useCreateChild(options: UseCreateChildOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (childData: CreateChildRequest) => childService.create(childData),

    onMutate: async (_newChild: CreateChildRequest): Promise<{ previousChildren: Child[] | undefined }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.children.lists() });

      // Snapshot previous value
      const previousChildren = queryClient.getQueryData<Child[]>(
        queryKeys.children.lists()
      );

      // Optimistically update to the new value
      if (previousChildren) {
        const now = new Date().toISOString();
        queryClient.setQueryData<Child[]>(
          queryKeys.children.lists(),
          (old = []) => [
            ...old,
            {
              id: 'temp-' + Date.now(),
              user_id: '',
              ..._newChild,
              age: new Date().getFullYear() - new Date(_newChild.date_of_birth).getFullYear(),
              emergency_contacts: [],
              created_at: now,
              updated_at: now,
            } as Child,
          ]
        );
      }

      return { previousChildren };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousChildren) {
        queryClient.setQueryData(
          queryKeys.children.lists(),
          context.previousChildren
        );
      }
      toast.error(error.message || 'Failed to create child');
    },

    onSuccess: (child) => {
      // Invalidate children lists
      cacheInvalidation.onChildMutation(queryClient, child.id);

      toast.success('Child created successfully!');
    },

    ...mutationOptions,
  });
}

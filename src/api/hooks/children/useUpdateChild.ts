/**
 * useUpdateChild Hook
 * React Query mutation hook to update a child
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { childService } from '../../services/child.service';
import { queryKeys } from '../../constants/query-keys';
import { cacheInvalidation } from '../../utils/cache-utils';
import type { Child, UpdateChildRequest } from '../../types/child.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseUpdateChildOptions {
  mutationOptions?: Omit<
    UseMutationOptions<
      Child,
      ApiErrorResponse,
      { id: string; data: UpdateChildRequest },
      { previousChild: Child | undefined }
    >,
    'mutationFn'
  >;
}

/**
 * Hook to update a child with optimistic updates
 *
 * @example
 * ```tsx
 * const { mutate: updateChild, isPending } = useUpdateChild();
 *
 * const handleUpdate = (childId: string) => {
 *   updateChild({
 *     id: childId,
 *     data: { first_name: 'Jane' },
 *   });
 * };
 * ```
 */
export function useUpdateChild(options: UseUpdateChildOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChildRequest }) =>
      childService.update(id, data),

    onMutate: async ({ id, data: updatedData }): Promise<{ previousChild: Child | undefined }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.children.detail(id) });

      // Snapshot previous value
      const previousChild = queryClient.getQueryData<Child>(
        queryKeys.children.detail(id)
      );

      // Optimistically update to the new value
      if (previousChild) {
        queryClient.setQueryData<Child>(queryKeys.children.detail(id), {
          ...previousChild,
          ...updatedData,
        });
      }

      return { previousChild };
    },

    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousChild) {
        queryClient.setQueryData(
          queryKeys.children.detail(id),
          context.previousChild
        );
      }
      toast.error(error.message || 'Failed to update child');
    },

    onSuccess: (child) => {
      // Invalidate children queries
      cacheInvalidation.onChildMutation(queryClient, child.id);

      toast.success('Child updated successfully!');
    },

    ...mutationOptions,
  });
}

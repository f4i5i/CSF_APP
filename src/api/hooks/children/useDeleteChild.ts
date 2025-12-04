/**
 * useDeleteChild Hook
 * React Query mutation hook to delete a child
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { childService } from '../../services/child.service';
import { queryKeys } from '../../constants/query-keys';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseDeleteChildOptions {
  mutationOptions?: Omit<
    UseMutationOptions<{ message: string }, ApiErrorResponse, string>,
    'mutationFn'
  >;
}

/**
 * Hook to delete a child
 *
 * @example
 * ```tsx
 * const { mutate: deleteChild, isPending } = useDeleteChild();
 *
 * const handleDelete = (childId: string) => {
 *   if (confirm('Are you sure?')) {
 *     deleteChild(childId);
 *   }
 * };
 * ```
 */
export function useDeleteChild(options: UseDeleteChildOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (childId: string) => childService.delete(childId),

    onSuccess: (_data, childId) => {
      // Invalidate all children queries
      queryClient.invalidateQueries({ queryKey: queryKeys.children.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.children.detail(childId) });

      // Also invalidate enrollments for this child
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.byChild(childId) });

      toast.success('Child deleted successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete child');
    },

    ...mutationOptions,
  });
}

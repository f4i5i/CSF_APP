/**
 * useTransferEnrollment Hook
 * React Query mutation hook to transfer enrollment to another class
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { enrollmentService } from '../../services/enrollment.service';
import { queryKeys } from '../../constants/query-keys';
import { cacheInvalidation } from '../../utils/cache-utils';
import type { Enrollment, TransferEnrollmentRequest } from '../../types/enrollment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseTransferEnrollmentOptions {
  mutationOptions?: Omit<
    UseMutationOptions<
      Enrollment,
      ApiErrorResponse,
      { enrollmentId: string; data: TransferEnrollmentRequest },
      { previousEnrollment: unknown }
    >,
    'mutationFn'
  >;
}

/**
 * Hook to transfer enrollment to another class
 *
 * @example
 * ```tsx
 * const { mutate: transferEnrollment, isPending } = useTransferEnrollment();
 *
 * transferEnrollment({
 *   enrollmentId: '123',
 *   data: { new_class_id: '456', reason: 'Schedule conflict' }
 * });
 * ```
 */
export function useTransferEnrollment(options: UseTransferEnrollmentOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data: TransferEnrollmentRequest }) =>
      enrollmentService.transfer(enrollmentId, data),

    onMutate: async ({ enrollmentId, data: transferData }): Promise<{ previousEnrollment: unknown }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      // Snapshot
      const previousEnrollment = queryClient.getQueryData(
        queryKeys.enrollments.detail(enrollmentId)
      );

      // Optimistically update class_id
      queryClient.setQueryData(
        queryKeys.enrollments.detail(enrollmentId),
        (old: any) => ({ ...old, class_id: transferData.new_class_id })
      );

      return { previousEnrollment };
    },

    onError: (error, { enrollmentId }, context) => {
      // Rollback on error
      if (context?.previousEnrollment) {
        queryClient.setQueryData(
          queryKeys.enrollments.detail(enrollmentId),
          context.previousEnrollment
        );
      }
      toast.error(error.message || 'Failed to transfer enrollment');
    },

    onSuccess: (enrollment, { enrollmentId, data }) => {
      // Invalidate enrollment queries
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      // Invalidate both old and new class queries
      cacheInvalidation.onEnrollmentMutation(queryClient, {
        child_id: enrollment.child_id,
        class_id: data.new_class_id,
        id: enrollmentId,
      });

      toast.success('Enrollment transferred successfully!');
    },

    ...mutationOptions,
  });
}

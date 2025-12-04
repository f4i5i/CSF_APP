/**
 * useCancelEnrollment Hook
 * React Query mutation hook to cancel enrollment
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { enrollmentService } from '../../services/enrollment.service';
import { queryKeys } from '../../constants/query-keys';
import type { CancelEnrollmentRequest, EnrollmentStatus } from '../../types/enrollment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseCancelEnrollmentOptions {
  mutationOptions?: Omit<
    UseMutationOptions<
      { message: string; refund_amount?: number },
      ApiErrorResponse,
      { enrollmentId: string; data?: CancelEnrollmentRequest },
      { previousEnrollment: unknown }
    >,
    'mutationFn'
  >;
}

/**
 * Hook to cancel enrollment with optimistic update
 *
 * @example
 * ```tsx
 * const { mutate: cancelEnrollment, isPending } = useCancelEnrollment();
 *
 * cancelEnrollment({
 *   enrollmentId: '123',
 *   data: { reason: 'Schedule conflict' }
 * });
 * ```
 */
export function useCancelEnrollment(options: UseCancelEnrollmentOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data?: CancelEnrollmentRequest }) =>
      enrollmentService.cancel(enrollmentId, data),

    onMutate: async ({ enrollmentId }): Promise<{ previousEnrollment: unknown }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      // Snapshot
      const previousEnrollment = queryClient.getQueryData(
        queryKeys.enrollments.detail(enrollmentId)
      );

      // Optimistically update to CANCELLED
      queryClient.setQueryData(
        queryKeys.enrollments.detail(enrollmentId),
        (old: any) => ({ ...old, status: 'CANCELLED' as EnrollmentStatus })
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
      toast.error(error.message || 'Failed to cancel enrollment');
    },

    onSuccess: (result, { enrollmentId }) => {
      // Invalidate enrollment queries
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      const message = result.refund_amount
        ? `Enrollment cancelled. Refund of $${result.refund_amount} will be processed.`
        : 'Enrollment cancelled successfully';

      toast.success(message);
    },

    ...mutationOptions,
  });
}

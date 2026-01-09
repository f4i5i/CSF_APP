/**
 * @file Pause Enrollment Mutation Hook
 *
 * Provides a React Query mutation hook for pausing active enrollments with
 * optimistic updates. This hook handles the enrollment pause lifecycle
 * including status updates and cache management.
 *
 * @module hooks/enrollments/usePauseEnrollment
 *
 * ## Pause Flow
 *
 * 1. **User initiates pause** - Clicks pause on active enrollment
 * 2. **Optimistic update** - Enrollment status changes to PAUSED immediately
 * 3. **API request** - Sends pause request to backend
 * 4. **Success handling**:
 *    - Cache invalidated for enrollments
 *    - Success toast displayed
 *    - UI shows updated enrollment status
 * 5. **Error handling**:
 *    - Optimistic update rolled back
 *    - Original status restored
 *    - Error toast displayed
 *
 * ## Billing Behavior
 *
 * When an enrollment is paused:
 * - Current billing cycle completes normally
 * - No future charges until enrollment is resumed
 * - Spot is held (not released to waitlist)
 *
 * @example
 * // Basic pause
 * const { mutate: pauseEnrollment, isPending } = usePauseEnrollment();
 *
 * const handlePause = () => {
 *   pauseEnrollment({ enrollmentId: '123' });
 * };
 *
 * @example
 * // Pause with optional reason
 * const { mutate } = usePauseEnrollment();
 *
 * mutate({
 *   enrollmentId: '123',
 *   data: {
 *     reason: 'Family vacation'
 *   }
 * });
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { enrollmentService } from '../../services/enrollment.service';
import { queryKeys } from '../../constants/query-keys';
import type { Enrollment, PauseEnrollmentRequest, EnrollmentStatus } from '../../types/enrollment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the usePauseEnrollment hook
 */
interface UsePauseEnrollmentOptions {
  mutationOptions?: Omit<
    UseMutationOptions<
      Enrollment,
      ApiErrorResponse,
      { enrollmentId: string; data?: PauseEnrollmentRequest },
      { previousEnrollment: unknown }
    >,
    'mutationFn'
  >;
}

/**
 * Pauses an active enrollment with optimistic updates
 *
 * This mutation hook handles the complete enrollment pause lifecycle including:
 * - Immediate optimistic status update for instant UI feedback
 * - Automatic cache invalidation for related queries
 * - Error rollback to maintain data consistency
 * - Success/error toast notifications
 *
 * @param {UsePauseEnrollmentOptions} [options={}] - Hook configuration
 *
 * @returns {UseMutationResult} Mutation result object
 */
export function usePauseEnrollment(options: UsePauseEnrollmentOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data?: PauseEnrollmentRequest }) =>
      enrollmentService.pause(enrollmentId, data),

    onMutate: async ({ enrollmentId }): Promise<{ previousEnrollment: unknown }> => {
      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      // Snapshot current enrollment state for potential rollback
      const previousEnrollment = queryClient.getQueryData(
        queryKeys.enrollments.detail(enrollmentId)
      );

      // Optimistically update status to PAUSED
      queryClient.setQueryData(
        queryKeys.enrollments.detail(enrollmentId),
        (old: any) => old ? { ...old, status: 'PAUSED' as EnrollmentStatus } : old
      );

      return { previousEnrollment };
    },

    onError: (error, { enrollmentId }, context) => {
      // Rollback optimistic update on error
      if (context?.previousEnrollment) {
        queryClient.setQueryData(
          queryKeys.enrollments.detail(enrollmentId),
          context.previousEnrollment
        );
      }
      toast.error(error.message || 'Failed to pause enrollment');
    },

    onSuccess: (_result, { enrollmentId }) => {
      // Invalidate enrollment queries to refetch with real data
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      toast.success('Membership paused successfully. Current billing cycle will complete.');
    },

    ...mutationOptions,
  });
}

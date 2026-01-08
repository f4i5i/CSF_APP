/**
 * @file Resume Enrollment Mutation Hook
 *
 * Provides a React Query mutation hook for resuming paused enrollments with
 * optimistic updates. This hook handles the enrollment resume lifecycle
 * including status updates and cache management.
 *
 * @module hooks/enrollments/useResumeEnrollment
 *
 * ## Resume Flow
 *
 * 1. **User initiates resume** - Clicks resume on paused enrollment
 * 2. **Optimistic update** - Enrollment status changes to ACTIVE immediately
 * 3. **API request** - Sends resume request to backend
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
 * When an enrollment is resumed:
 * - Billing resumes from the next billing cycle
 * - Child can attend classes again
 * - Attendance tracking resumes
 *
 * @example
 * // Basic resume
 * const { mutate: resumeEnrollment, isPending } = useResumeEnrollment();
 *
 * const handleResume = () => {
 *   resumeEnrollment({ enrollmentId: '123' });
 * };
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { enrollmentService } from '../../services/enrollment.service';
import { queryKeys } from '../../constants/query-keys';
import type { Enrollment, EnrollmentStatus } from '../../types/enrollment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useResumeEnrollment hook
 */
interface UseResumeEnrollmentOptions {
  mutationOptions?: Omit<
    UseMutationOptions<
      Enrollment,
      ApiErrorResponse,
      { enrollmentId: string },
      { previousEnrollment: unknown }
    >,
    'mutationFn'
  >;
}

/**
 * Resumes a paused enrollment with optimistic updates
 *
 * This mutation hook handles the complete enrollment resume lifecycle including:
 * - Immediate optimistic status update for instant UI feedback
 * - Automatic cache invalidation for related queries
 * - Error rollback to maintain data consistency
 * - Success/error toast notifications
 *
 * @param {UseResumeEnrollmentOptions} [options={}] - Hook configuration
 *
 * @returns {UseMutationResult} Mutation result object
 */
export function useResumeEnrollment(options: UseResumeEnrollmentOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: ({ enrollmentId }: { enrollmentId: string }) =>
      enrollmentService.resume(enrollmentId),

    onMutate: async ({ enrollmentId }): Promise<{ previousEnrollment: unknown }> => {
      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      // Snapshot current enrollment state for potential rollback
      const previousEnrollment = queryClient.getQueryData(
        queryKeys.enrollments.detail(enrollmentId)
      );

      // Optimistically update status to ACTIVE
      queryClient.setQueryData(
        queryKeys.enrollments.detail(enrollmentId),
        (old: any) => old ? { ...old, status: 'ACTIVE' as EnrollmentStatus } : old
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
      toast.error(error.message || 'Failed to resume enrollment');
    },

    onSuccess: (_result, { enrollmentId }) => {
      // Invalidate enrollment queries to refetch with real data
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      toast.success('Membership resumed successfully. Billing will resume next cycle.');
    },

    ...mutationOptions,
  });
}

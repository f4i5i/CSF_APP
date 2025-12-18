/**
 * @file Cancel Enrollment Mutation Hook
 *
 * Provides a React Query mutation hook for cancelling existing enrollments with
 * optimistic updates and automatic refund processing. This hook handles the
 * enrollment cancellation lifecycle including status updates and cache management.
 *
 * @module hooks/enrollments/useCancelEnrollment
 *
 * ## Cancellation Flow
 *
 * 1. **User initiates cancellation** - Clicks cancel on enrollment
 * 2. **Optimistic update** - Enrollment status changes to CANCELLED immediately
 * 3. **API request** - Sends cancellation request to backend
 * 4. **Refund processing** - Backend calculates refund based on cancellation policy
 * 5. **Success handling**:
 *    - Cache invalidated for enrollments and classes
 *    - Success toast with refund information displayed
 *    - UI shows updated enrollment status
 * 6. **Error handling**:
 *    - Optimistic update rolled back
 *    - Original status restored
 *    - Error toast displayed
 *
 * ## Status Transition on Cancellation
 *
 * When enrollment is cancelled:
 * - **PENDING -> CANCELLED**: No refund (payment not completed)
 * - **ACTIVE -> CANCELLED**: Refund calculated based on:
 *   - Time before class starts
 *   - Cancellation policy (e.g., full refund 7+ days before, 50% within 7 days, none day-of)
 *   - Payment method and processing fees
 * - **COMPLETED -> CANCELLED**: Not allowed (class already finished)
 * - **CANCELLED**: Already cancelled, no action taken
 *
 * ## Refund Policy
 *
 * Refunds are calculated automatically based on timing:
 * - **7+ days before start**: Full refund (100%)
 * - **3-7 days before**: Partial refund (50%)
 * - **Less than 3 days**: No refund (0%)
 * - **After class starts**: No refund
 *
 * Note: Actual refund policy may vary - check backend implementation.
 *
 * ## Optimistic Updates
 *
 * This hook implements optimistic updates for immediate feedback:
 * - Changes enrollment status to CANCELLED before server confirms
 * - Updates single enrollment detail cache
 * - Automatically rolls back if cancellation fails
 * - List queries refetch to reflect change across all views
 *
 * ## Cache Invalidation After Success
 *
 * When cancellation succeeds, the following caches are invalidated:
 * - **Enrollment lists**: All list queries refetch to show updated status
 * - **Enrollment detail**: Specific enrollment detail refetches
 * - **Class details**: Class capacity increases (spot becomes available)
 *
 * Note: This hook does NOT use cacheInvalidation utility - it manually invalidates
 * enrollment queries only. Class availability may take longer to update.
 *
 * ## Side Effects
 *
 * Cancelling an enrollment triggers several side effects:
 * 1. **Status change**: Enrollment marked as CANCELLED
 * 2. **Refund processing**: Refund amount calculated and initiated
 * 3. **Class capacity**: Available spots increase by 1
 * 4. **Email notification**: Cancellation confirmation sent to user
 * 5. **Waitlist processing**: Next person on waitlist may be notified
 *
 * ## Error Handling
 *
 * The hook handles various error scenarios:
 * - **Already cancelled**: Cannot cancel an enrollment twice
 * - **Class completed**: Cannot cancel after class has ended
 * - **Cancellation deadline**: May reject if past cancellation window
 * - **Network errors**: Standard API error handling with rollback
 *
 * All errors automatically:
 * - Rollback optimistic status change
 * - Display error toast with specific message
 * - Restore previous enrollment state
 *
 * @example
 * // Basic cancellation
 * const { mutate: cancelEnrollment, isPending } = useCancelEnrollment();
 *
 * const handleCancel = () => {
 *   if (confirm('Are you sure you want to cancel?')) {
 *     cancelEnrollment({ enrollmentId: '123' });
 *   }
 * };
 *
 * @example
 * // Cancellation with reason
 * const { mutate } = useCancelEnrollment();
 *
 * mutate({
 *   enrollmentId: '123',
 *   data: {
 *     reason: 'Schedule conflict - cannot attend',
 *   }
 * });
 *
 * @example
 * // With custom success handler showing refund
 * const { mutate } = useCancelEnrollment({
 *   mutationOptions: {
 *     onSuccess: (result) => {
 *       if (result.refund_amount) {
 *         alert(`Refund of $${result.refund_amount} will be processed within 5-7 business days`);
 *       }
 *     }
 *   }
 * });
 *
 * @example
 * // Complete cancellation dialog component
 * function CancelEnrollmentDialog({ enrollment, onClose }) {
 *   const { mutate, isPending } = useCancelEnrollment({
 *     mutationOptions: {
 *       onSuccess: () => {
 *         onClose();
 *         navigate('/enrollments');
 *       }
 *     }
 *   });
 *
 *   const [reason, setReason] = useState('');
 *
 *   return (
 *     <Dialog>
 *       <h2>Cancel Enrollment</h2>
 *       <textarea
 *         placeholder="Reason for cancellation (optional)"
 *         value={reason}
 *         onChange={(e) => setReason(e.target.value)}
 *       />
 *       <button
 *         onClick={() => mutate({
 *           enrollmentId: enrollment.id,
 *           data: { reason }
 *         })}
 *         disabled={isPending}
 *       >
 *         {isPending ? 'Cancelling...' : 'Confirm Cancellation'}
 *       </button>
 *     </Dialog>
 *   );
 * }
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { enrollmentService } from '../../services/enrollment.service';
import { queryKeys } from '../../constants/query-keys';
import type { CancelEnrollmentRequest, EnrollmentStatus } from '../../types/enrollment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useCancelEnrollment hook
 *
 * @interface UseCancelEnrollmentOptions
 * @property {Object} [mutationOptions] - Additional React Query mutation options
 * @property {Function} [mutationOptions.onSuccess] - Callback executed after successful cancellation
 * @property {Function} [mutationOptions.onError] - Callback executed if cancellation fails
 * @property {Function} [mutationOptions.onSettled] - Callback executed after mutation completes
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
 * Cancels an existing enrollment with optimistic updates and automatic refund processing
 *
 * This mutation hook handles the complete enrollment cancellation lifecycle including:
 * - Immediate optimistic status update for instant UI feedback
 * - Refund calculation and processing based on cancellation policy
 * - Automatic cache invalidation for related queries
 * - Error rollback to maintain data consistency
 * - Success/error toast notifications with refund information
 *
 * ## Optimistic Update Behavior
 *
 * When mutation is triggered:
 * 1. Ongoing enrollment detail queries are cancelled
 * 2. Current enrollment is snapshotted for potential rollback
 * 3. Enrollment status is optimistically set to CANCELLED in cache
 * 4. API request is sent to backend
 * 5. On success: Cache invalidation triggers refetch with real data
 * 6. On error: Status is restored to snapshot value
 *
 * ## Cache Invalidation Strategy
 *
 * On successful cancellation, invalidates:
 * - **Enrollment lists**: `enrollments.lists()` - All list queries refetch
 * - **Enrollment detail**: `enrollments.detail(id)` - Specific enrollment refetches
 *
 * Note: Does NOT automatically invalidate class queries. Class availability updates
 * may be delayed until next scheduled refetch or manual invalidation.
 *
 * ## Refund Information
 *
 * Success response includes:
 * - `message`: Confirmation message
 * - `refund_amount`: Refund amount in dollars (if applicable)
 *
 * Toast notification automatically includes refund amount if present:
 * - With refund: "Enrollment cancelled. Refund of $XX will be processed."
 * - No refund: "Enrollment cancelled successfully"
 *
 * @param {UseCancelEnrollmentOptions} [options={}] - Hook configuration
 * @param {Object} [options.mutationOptions] - React Query mutation options
 *
 * @returns {UseMutationResult} Mutation result object:
 * - `mutate`: Function to trigger cancellation
 * - `mutateAsync`: Async version returning Promise
 * - `isPending`: True while request is in progress
 * - `isSuccess`: True after successful cancellation
 * - `isError`: True if cancellation failed
 * - `data`: Response with message and optional refund_amount
 * - `error`: Error details (available after failure)
 * - `reset`: Function to reset mutation state
 *
 * @example
 * // Basic cancellation with confirmation
 * const { mutate, isPending } = useCancelEnrollment();
 *
 * const handleCancel = (enrollmentId) => {
 *   if (window.confirm('Cancel this enrollment?')) {
 *     mutate({ enrollmentId });
 *   }
 * };
 *
 * @example
 * // Cancellation with reason
 * const { mutate } = useCancelEnrollment();
 *
 * mutate({
 *   enrollmentId: enrollment.id,
 *   data: {
 *     reason: 'Medical emergency - unable to attend',
 *   }
 * });
 *
 * @example
 * // Using mutateAsync with try/catch
 * const { mutateAsync } = useCancelEnrollment();
 *
 * const handleCancelAsync = async (id, reason) => {
 *   try {
 *     const result = await mutateAsync({
 *       enrollmentId: id,
 *       data: { reason }
 *     });
 *     if (result.refund_amount) {
 *       console.log(`Refund: $${result.refund_amount}`);
 *     }
 *     navigate('/enrollments');
 *   } catch (error) {
 *     console.error('Cancellation failed:', error.message);
 *   }
 * };
 *
 * @example
 * // With loading state in button
 * function CancelButton({ enrollmentId }) {
 *   const { mutate, isPending, isSuccess } = useCancelEnrollment();
 *
 *   return (
 *     <button
 *       onClick={() => mutate({ enrollmentId })}
 *       disabled={isPending || isSuccess}
 *     >
 *       {isPending ? 'Cancelling...' : isSuccess ? 'Cancelled' : 'Cancel Enrollment'}
 *     </button>
 *   );
 * }
 *
 * @example
 * // With custom success handling for refund display
 * const { mutate } = useCancelEnrollment({
 *   mutationOptions: {
 *     onSuccess: (result, variables) => {
 *       if (result.refund_amount) {
 *         showRefundModal({
 *           amount: result.refund_amount,
 *           processingDays: '5-7',
 *         });
 *       }
 *       // Navigate away from enrollment detail
 *       navigate('/my-enrollments');
 *     }
 *   }
 * });
 */
export function useCancelEnrollment(options: UseCancelEnrollmentOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data?: CancelEnrollmentRequest }) =>
      enrollmentService.cancel(enrollmentId, data),

    /**
     * Optimistic update handler - runs immediately before API request
     *
     * Updates enrollment status to CANCELLED for instant UI feedback.
     * Snapshots current enrollment for rollback in case of error.
     *
     * @param {Object} params - Mutation parameters
     * @param {string} params.enrollmentId - ID of enrollment to cancel
     * @returns {Promise<{previousEnrollment: unknown}>} Snapshot for rollback
     */
    onMutate: async ({ enrollmentId }): Promise<{ previousEnrollment: unknown }> => {
      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      // Snapshot current enrollment state for potential rollback
      const previousEnrollment = queryClient.getQueryData(
        queryKeys.enrollments.detail(enrollmentId)
      );

      // Optimistically update status to CANCELLED
      queryClient.setQueryData(
        queryKeys.enrollments.detail(enrollmentId),
        (old: any) => ({ ...old, status: 'CANCELLED' as EnrollmentStatus })
      );

      return { previousEnrollment };
    },

    /**
     * Error handler - runs if API request fails
     *
     * Rolls back optimistic status change and displays error message.
     * Restores enrollment to its previous state from snapshot.
     *
     * @param {ApiErrorResponse} error - Error from API
     * @param {Object} variables - Mutation variables with enrollmentId
     * @param {Object} context - Context from onMutate with snapshot
     */
    onError: (error, { enrollmentId }, context) => {
      // Rollback optimistic update on error
      if (context?.previousEnrollment) {
        queryClient.setQueryData(
          queryKeys.enrollments.detail(enrollmentId),
          context.previousEnrollment
        );
      }
      toast.error(error.message || 'Failed to cancel enrollment');
    },

    /**
     * Success handler - runs after successful API response
     *
     * Invalidates enrollment caches and displays success message with refund info.
     * Does NOT invalidate class queries - class availability updates separately.
     *
     * Side effects triggered:
     * - Refetches enrollment lists (all list queries)
     * - Refetches specific enrollment detail
     * - Class capacity increase (handled by backend, cache updates on next fetch)
     *
     * @param {Object} result - Response from cancellation
     * @param {string} result.message - Confirmation message
     * @param {number} [result.refund_amount] - Refund amount if applicable
     * @param {Object} variables - Mutation variables with enrollmentId
     */
    onSuccess: (result, { enrollmentId }) => {
      // Invalidate enrollment queries to refetch with real data
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      // Display success message with refund information if applicable
      const message = result.refund_amount
        ? `Enrollment cancelled. Refund of $${result.refund_amount} will be processed.`
        : 'Enrollment cancelled successfully';

      toast.success(message);
    },

    ...mutationOptions,
  });
}

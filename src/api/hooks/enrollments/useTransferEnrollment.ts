/**
 * @file Transfer Enrollment Mutation Hook
 *
 * Provides a React Query mutation hook for transferring enrollments from one class
 * to another with optimistic updates and comprehensive cache management. This hook
 * handles the complex enrollment transfer process including price adjustments and
 * capacity updates for both source and destination classes.
 *
 * @module hooks/enrollments/useTransferEnrollment
 *
 * ## Transfer Flow
 *
 * 1. **User initiates transfer** - Selects new class for existing enrollment
 * 2. **Optimistic update** - Enrollment's class_id updates immediately in UI
 * 3. **API request** - Sends transfer request to backend
 * 4. **Price adjustment** - Backend calculates price difference (if any)
 * 5. **Success handling**:
 *    - Cache invalidated for enrollments, both classes, and orders
 *    - Success toast notification displayed
 *    - UI updated with real enrollment data from server
 * 6. **Error handling**:
 *    - Optimistic update rolled back
 *    - Original class_id restored
 *    - Error toast displayed
 *
 * ## Status and Pricing During Transfer
 *
 * When enrollment is transferred:
 * - **Status**: Remains unchanged (typically ACTIVE)
 * - **Pricing**: May be adjusted based on:
 *   - New class price vs original class price
 *   - Proration for partial class completion
 *   - Any applicable transfer fees
 * - **Payment**: Additional charge or refund processed automatically
 *
 * ## Transfer Eligibility
 *
 * Not all enrollments can be transferred. Backend validates:
 * - **ACTIVE enrollments**: Can transfer to similar classes
 * - **PENDING enrollments**: May transfer before payment
 * - **CANCELLED/COMPLETED**: Cannot transfer (terminal states)
 * - **Target class**: Must have available capacity
 * - **Schedule conflict**: Cannot transfer if creates child schedule conflict
 *
 * ## Optimistic Updates
 *
 * This hook implements optimistic updates for immediate feedback:
 * - Updates class_id in enrollment detail cache
 * - Does NOT update pricing (requires server calculation)
 * - Automatically rolls back if transfer fails
 * - Full data refetched on success
 *
 * ## Cache Invalidation After Success
 *
 * When transfer succeeds, the following caches are invalidated:
 * - **Enrollment lists**: All list queries refetch to show updated class
 * - **Enrollment detail**: Specific enrollment refetches with new pricing
 * - **Original class**: Capacity increases (spot becomes available)
 * - **New class**: Capacity decreases (spot is taken)
 * - **Child enrollments**: Child's enrollment list updates
 * - **Order queries**: New order may be created for price difference
 *
 * This comprehensive invalidation ensures all UI components reflect the transfer.
 *
 * ## Side Effects
 *
 * Transferring an enrollment triggers several side effects:
 * 1. **Class capacities**: Original class +1 spot, new class -1 spot
 * 2. **Price adjustment**: Additional payment or refund processed
 * 3. **Email notification**: Transfer confirmation sent to user
 * 4. **Instructor notification**: Both instructors notified of change
 * 5. **Waitlist processing**: Original class waitlist may be processed
 *
 * ## Error Handling
 *
 * The hook handles various error scenarios:
 * - **Target class full**: Cannot transfer if no spots available
 * - **Schedule conflict**: Cannot create overlapping enrollments for same child
 * - **Invalid status**: Cannot transfer completed or cancelled enrollments
 * - **Same class**: Cannot transfer to the same class
 * - **Network errors**: Standard API error handling with rollback
 *
 * All errors automatically:
 * - Rollback optimistic class_id update
 * - Display error toast with specific message
 * - Restore previous enrollment state
 *
 * @example
 * // Basic transfer
 * const { mutate: transferEnrollment, isPending } = useTransferEnrollment();
 *
 * const handleTransfer = () => {
 *   transferEnrollment({
 *     enrollmentId: '123',
 *     data: { new_class_id: '456' }
 *   });
 * };
 *
 * @example
 * // Transfer with reason
 * const { mutate } = useTransferEnrollment();
 *
 * mutate({
 *   enrollmentId: enrollment.id,
 *   data: {
 *     new_class_id: newClass.id,
 *     reason: 'Schedule conflict with school activities',
 *   }
 * });
 *
 * @example
 * // Complete transfer flow with price check
 * function TransferDialog({ enrollment, newClass, onClose }) {
 *   const { mutate, isPending } = useTransferEnrollment({
 *     mutationOptions: {
 *       onSuccess: (updatedEnrollment) => {
 *         onClose();
 *         if (updatedEnrollment.final_price > enrollment.final_price) {
 *           navigate(`/payment/${updatedEnrollment.id}`);
 *         } else {
 *           navigate('/my-enrollments');
 *         }
 *       }
 *     }
 *   });
 *
 *   const priceDiff = newClass.price - enrollment.base_price;
 *
 *   return (
 *     <Dialog>
 *       <h2>Transfer Enrollment</h2>
 *       <p>Transfer from: {enrollment.class.name}</p>
 *       <p>Transfer to: {newClass.name}</p>
 *       {priceDiff !== 0 && (
 *         <p>Price adjustment: ${Math.abs(priceDiff)} {priceDiff > 0 ? 'additional' : 'refund'}</p>
 *       )}
 *       <button
 *         onClick={() => mutate({
 *           enrollmentId: enrollment.id,
 *           data: { new_class_id: newClass.id }
 *         })}
 *         disabled={isPending}
 *       >
 *         {isPending ? 'Transferring...' : 'Confirm Transfer'}
 *       </button>
 *     </Dialog>
 *   );
 * }
 *
 * @example
 * // With custom error handling for specific scenarios
 * const { mutate } = useTransferEnrollment({
 *   mutationOptions: {
 *     onError: (error) => {
 *       if (error.message.includes('full')) {
 *         showWaitlistDialog(newClassId);
 *       } else if (error.message.includes('conflict')) {
 *         showScheduleConflictAlert();
 *       }
 *     }
 *   }
 * });
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { enrollmentService } from '../../services/enrollment.service';
import { queryKeys } from '../../constants/query-keys';
import { cacheInvalidation } from '../../utils/cache-utils';
import type { Enrollment, TransferEnrollmentRequest } from '../../types/enrollment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useTransferEnrollment hook
 *
 * @interface UseTransferEnrollmentOptions
 * @property {Object} [mutationOptions] - Additional React Query mutation options
 * @property {Function} [mutationOptions.onSuccess] - Callback executed after successful transfer
 * @property {Function} [mutationOptions.onError] - Callback executed if transfer fails
 * @property {Function} [mutationOptions.onSettled] - Callback executed after mutation completes
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
 * Transfers an enrollment to a different class with optimistic updates and automatic cache management
 *
 * This mutation hook handles the complete enrollment transfer lifecycle including:
 * - Immediate optimistic class_id update for instant UI feedback
 * - Automatic price adjustment calculation and processing
 * - Comprehensive cache invalidation for both classes
 * - Error rollback to maintain data consistency
 * - Success/error toast notifications
 *
 * ## Optimistic Update Behavior
 *
 * When mutation is triggered:
 * 1. Ongoing enrollment detail queries are cancelled
 * 2. Current enrollment is snapshotted for potential rollback
 * 3. Enrollment's class_id is optimistically updated in cache
 * 4. API request is sent to backend for processing
 * 5. On success: Comprehensive cache invalidation triggers refetches
 * 6. On error: class_id is restored to snapshot value
 *
 * Note: Pricing is NOT optimistically updated because it requires server-side
 * calculation including prorations, fees, and discounts.
 *
 * ## Cache Invalidation Strategy
 *
 * On successful transfer, invalidates:
 * - **Enrollment lists**: `enrollments.lists()` - All list queries refetch
 * - **Enrollment detail**: `enrollments.detail(id)` - Specific enrollment refetches
 * - **Original class**: Capacity increases by 1
 * - **New class**: Capacity decreases by 1, enrollment count increases
 * - **Child queries**: Child's enrollment list updates
 * - **Order queries**: New order may be created for price difference
 *
 * Uses `cacheInvalidation.onEnrollmentMutation()` utility for coordinated invalidation
 * of the new class. Original class updates happen through standard enrollment list refetch.
 *
 * ## Price Adjustment Handling
 *
 * The returned enrollment includes updated pricing:
 * - `base_price`: Price of the new class
 * - `final_price`: Adjusted price after prorations/discounts
 * - Price difference processed automatically:
 *   - Additional charge: New order created for payment
 *   - Refund: Credit issued to original payment method
 *   - No change: No additional processing
 *
 * Components should check final_price to determine if payment is needed.
 *
 * @param {UseTransferEnrollmentOptions} [options={}] - Hook configuration
 * @param {Object} [options.mutationOptions] - React Query mutation options
 *
 * @returns {UseMutationResult<Enrollment, ApiErrorResponse>} Mutation result object:
 * - `mutate`: Function to trigger transfer
 * - `mutateAsync`: Async version returning Promise with updated enrollment
 * - `isPending`: True while request is in progress
 * - `isSuccess`: True after successful transfer
 * - `isError`: True if transfer failed
 * - `data`: Updated enrollment data with new class and pricing
 * - `error`: Error details (available after failure)
 * - `reset`: Function to reset mutation state
 *
 * @example
 * // Basic transfer
 * const { mutate, isPending } = useTransferEnrollment();
 *
 * const handleTransfer = (enrollmentId, newClassId) => {
 *   mutate({
 *     enrollmentId,
 *     data: { new_class_id: newClassId }
 *   });
 * };
 *
 * @example
 * // Transfer with reason and success navigation
 * const { mutate } = useTransferEnrollment({
 *   mutationOptions: {
 *     onSuccess: (enrollment) => {
 *       navigate(`/enrollments/${enrollment.id}`);
 *     }
 *   }
 * });
 *
 * mutate({
 *   enrollmentId: '123',
 *   data: {
 *     new_class_id: '456',
 *     reason: 'Time slot no longer works for family schedule',
 *   }
 * });
 *
 * @example
 * // Using mutateAsync to handle price differences
 * const { mutateAsync } = useTransferEnrollment();
 *
 * const handleTransferWithPayment = async () => {
 *   try {
 *     const updatedEnrollment = await mutateAsync({
 *       enrollmentId: currentEnrollment.id,
 *       data: { new_class_id: selectedClass.id }
 *     });
 *
 *     // Check if additional payment needed
 *     if (updatedEnrollment.final_price > currentEnrollment.final_price) {
 *       navigate(`/checkout/${updatedEnrollment.id}`);
 *     } else {
 *       navigate('/my-enrollments');
 *     }
 *   } catch (error) {
 *     console.error('Transfer failed:', error);
 *   }
 * };
 *
 * @example
 * // Transfer button with loading state
 * function TransferButton({ enrollmentId, newClassId }) {
 *   const { mutate, isPending, isSuccess } = useTransferEnrollment();
 *
 *   return (
 *     <button
 *       onClick={() => mutate({
 *         enrollmentId,
 *         data: { new_class_id: newClassId }
 *       })}
 *       disabled={isPending || isSuccess}
 *     >
 *       {isPending ? 'Transferring...' : isSuccess ? 'Transferred!' : 'Transfer to This Class'}
 *     </button>
 *   );
 * }
 *
 * @example
 * // With error handling for specific cases
 * const { mutate } = useTransferEnrollment({
 *   mutationOptions: {
 *     onError: (error) => {
 *       if (error.message.includes('full')) {
 *         alert('Target class is full. Would you like to join the waitlist?');
 *       } else if (error.message.includes('conflict')) {
 *         alert('This creates a schedule conflict with another enrollment.');
 *       } else {
 *         alert(`Transfer failed: ${error.message}`);
 *       }
 *     }
 *   }
 * });
 */
export function useTransferEnrollment(options: UseTransferEnrollmentOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data: TransferEnrollmentRequest }) =>
      enrollmentService.transfer(enrollmentId, data),

    /**
     * Optimistic update handler - runs immediately before API request
     *
     * Updates enrollment's class_id for instant UI feedback. Does not update pricing
     * as it requires server-side calculation. Snapshots enrollment for rollback.
     *
     * @param {Object} params - Mutation parameters
     * @param {string} params.enrollmentId - ID of enrollment to transfer
     * @param {TransferEnrollmentRequest} params.data - Transfer request with new_class_id
     * @returns {Promise<{previousEnrollment: unknown}>} Snapshot for rollback
     */
    onMutate: async ({ enrollmentId, data: transferData }): Promise<{ previousEnrollment: unknown }> => {
      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      // Snapshot current enrollment state for potential rollback
      const previousEnrollment = queryClient.getQueryData(
        queryKeys.enrollments.detail(enrollmentId)
      );

      // Optimistically update class_id (but not pricing - needs server calculation)
      queryClient.setQueryData(
        queryKeys.enrollments.detail(enrollmentId),
        (old: any) => ({ ...old, class_id: transferData.new_class_id })
      );

      return { previousEnrollment };
    },

    /**
     * Error handler - runs if API request fails
     *
     * Rolls back optimistic class_id update and displays error message.
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
      toast.error(error.message || 'Failed to transfer enrollment');
    },

    /**
     * Success handler - runs after successful API response
     *
     * Invalidates all related caches to trigger refetches with real data including
     * updated pricing. This ensures both the original and new classes update their
     * capacity, and the enrollment reflects the new class and price.
     *
     * Side effects triggered:
     * - Refetches enrollment lists (all list queries)
     * - Refetches specific enrollment detail with updated class and pricing
     * - Refetches new class details (capacity decreases, enrollment count increases)
     * - Refetches child enrollments
     * - Refetches order queries (new order may exist for price difference)
     * - Original class capacity updates via standard list refetch
     *
     * @param {Enrollment} enrollment - Updated enrollment from server with new class and pricing
     * @param {Object} variables - Mutation variables
     * @param {string} variables.enrollmentId - ID of transferred enrollment
     * @param {TransferEnrollmentRequest} variables.data - Transfer request with new_class_id
     */
    onSuccess: (enrollment, { enrollmentId, data }) => {
      // Invalidate enrollment queries to refetch with real data
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.detail(enrollmentId),
      });

      // Invalidate new class queries (capacity decreased, enrollment added)
      // Original class updates happen via enrollment list refetch
      cacheInvalidation.onEnrollmentMutation(queryClient, {
        child_id: enrollment.child_id,
        class_id: data.new_class_id, // Invalidate the NEW class
        id: enrollmentId,
      });

      toast.success('Enrollment transferred successfully!');
    },

    ...mutationOptions,
  });
}

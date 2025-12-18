/**
 * @file Create Enrollment Mutation Hook
 *
 * Provides a React Query mutation hook for creating new enrollments with optimistic updates
 * and comprehensive cache management. This hook handles the enrollment creation process,
 * including immediate UI updates and proper error rollback.
 *
 * @module hooks/enrollments/useCreateEnrollment
 *
 * ## Enrollment Creation Flow
 *
 * 1. **User initiates enrollment** - Selects child and class
 * 2. **Optimistic update** - Enrollment appears immediately in UI with temporary ID
 * 3. **API request** - Sends create request to backend
 * 4. **Success handling**:
 *    - Cache invalidated for enrollments, classes, and orders
 *    - Success toast notification displayed
 *    - UI updated with real enrollment data from server
 * 5. **Error handling**:
 *    - Optimistic update rolled back
 *    - Error toast displayed
 *    - Cache restored to previous state
 *
 * ## Status After Creation
 *
 * New enrollments typically start in **PENDING** status:
 * - PENDING: Awaiting payment completion
 * - Transition to ACTIVE: After successful payment processing
 * - Transition to CANCELLED: If payment fails or user abandons
 *
 * ## Optimistic Updates
 *
 * This hook implements optimistic updates for instant UI feedback:
 * - Creates temporary enrollment with ID format: `temp-{timestamp}`
 * - Adds enrollment to cache before server response
 * - Automatically rolls back if server request fails
 * - Updates with real data when server responds
 *
 * ## Cache Invalidation After Success
 *
 * When enrollment is successfully created, the following caches are invalidated:
 * - **Enrollment lists**: All enrollment queries refetch to show new enrollment
 * - **Class details**: Class availability/enrollment count updates
 * - **Child enrollments**: Child's enrollment list updates
 * - **Order queries**: New order may be created for payment
 *
 * This ensures all related UI components display updated information without manual refresh.
 *
 * ## Side Effects
 *
 * Creating an enrollment triggers several side effects:
 * 1. **Class capacity update**: Available spots decrease
 * 2. **Order creation**: Payment order may be generated if payment required
 * 3. **Email notification**: Confirmation email sent to user
 * 4. **Waitlist processing**: If class is full, may add to waitlist instead
 *
 * ## Error Handling
 *
 * The hook handles various error scenarios:
 * - **Class full**: Error message indicates no spots available
 * - **Duplicate enrollment**: Cannot enroll same child in same class twice
 * - **Invalid child/class**: Referenced entities must exist
 * - **Network errors**: Standard API error handling with toast notification
 *
 * All errors automatically:
 * - Rollback optimistic updates
 * - Display error toast with specific message
 * - Restore previous cache state
 *
 * @example
 * // Basic enrollment creation
 * const { mutate: createEnrollment, isPending } = useCreateEnrollment();
 *
 * const handleEnroll = () => {
 *   createEnrollment({
 *     child_id: '123',
 *     class_id: '456',
 *   });
 * };
 *
 * @example
 * // Complete enrollment flow with loading state
 * function EnrollButton({ childId, classId }) {
 *   const { mutate, isPending } = useCreateEnrollment();
 *
 *   return (
 *     <button
 *       onClick={() => mutate({ child_id: childId, class_id: classId })}
 *       disabled={isPending}
 *     >
 *       {isPending ? 'Enrolling...' : 'Enroll Now'}
 *     </button>
 *   );
 * }
 *
 * @example
 * // With custom success/error handlers
 * const { mutate } = useCreateEnrollment({
 *   mutationOptions: {
 *     onSuccess: (enrollment) => {
 *       console.log('Enrollment created:', enrollment.id);
 *       navigate(`/enrollments/${enrollment.id}`);
 *     },
 *     onError: (error) => {
 *       if (error.message.includes('full')) {
 *         showWaitlistDialog();
 *       }
 *     }
 *   }
 * });
 *
 * @example
 * // Enrollment with promo code
 * const { mutate } = useCreateEnrollment();
 *
 * mutate({
 *   child_id: childId,
 *   class_id: classId,
 *   promo_code: 'SUMMER2024',
 * });
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { enrollmentService } from '../../services/enrollment.service';
import { queryKeys } from '../../constants/query-keys';
import { cacheInvalidation } from '../../utils/cache-utils';
import type { Enrollment, CreateEnrollmentRequest } from '../../types/enrollment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useCreateEnrollment hook
 *
 * @interface UseCreateEnrollmentOptions
 * @property {Object} [mutationOptions] - Additional React Query mutation options
 * @property {Function} [mutationOptions.onSuccess] - Callback executed after successful enrollment creation
 * @property {Function} [mutationOptions.onError] - Callback executed if enrollment creation fails
 * @property {Function} [mutationOptions.onSettled] - Callback executed after mutation completes (success or error)
 */
interface UseCreateEnrollmentOptions {
  mutationOptions?: Omit<
    UseMutationOptions<Enrollment, ApiErrorResponse, CreateEnrollmentRequest, { previousEnrollments: Enrollment[] | undefined }>,
    'mutationFn'
  >;
}

/**
 * Creates a new enrollment with optimistic updates and automatic cache management
 *
 * This mutation hook handles the entire enrollment creation lifecycle including:
 * - Immediate optimistic UI updates for instant feedback
 * - Automatic cache invalidation for related queries
 * - Error rollback to maintain data consistency
 * - Success/error toast notifications
 *
 * ## Optimistic Update Behavior
 *
 * When mutation is triggered:
 * 1. Ongoing enrollment queries are cancelled to prevent race conditions
 * 2. Current enrollment list is snapshotted for potential rollback
 * 3. Temporary enrollment is added to cache with:
 *    - Temporary ID: `temp-{timestamp}`
 *    - Status: PENDING
 *    - Price fields: $0 (will be updated from server)
 *    - Timestamps: Current time
 *
 * ## Cache Invalidation Strategy
 *
 * On successful enrollment creation, invalidates:
 * - **Enrollment queries**: `enrollments.lists()`, `enrollments.detail(id)`
 * - **Class queries**: `classes.detail(class_id)` - Updates available spots
 * - **Child queries**: Child's enrollment list updates
 * - **Order queries**: May create new order for payment
 *
 * Uses `cacheInvalidation.onEnrollmentMutation()` utility for coordinated invalidation.
 *
 * ## Error Recovery
 *
 * If mutation fails:
 * - Optimistic enrollment is removed from cache
 * - Previous cache state is restored from snapshot
 * - Error toast displays user-friendly message
 * - Component error handlers are invoked if provided
 *
 * @param {UseCreateEnrollmentOptions} [options={}] - Hook configuration
 * @param {Object} [options.mutationOptions] - React Query mutation options
 *
 * @returns {UseMutationResult<Enrollment, ApiErrorResponse, CreateEnrollmentRequest>} Mutation result object:
 * - `mutate`: Function to trigger enrollment creation
 * - `mutateAsync`: Async version returning Promise
 * - `isPending`: True while request is in progress
 * - `isSuccess`: True after successful enrollment
 * - `isError`: True if enrollment failed
 * - `data`: Created enrollment data (available after success)
 * - `error`: Error details (available after failure)
 * - `reset`: Function to reset mutation state
 *
 * @example
 * // Basic usage with mutate
 * const { mutate, isPending } = useCreateEnrollment();
 *
 * const handleEnrollClick = () => {
 *   mutate({
 *     child_id: selectedChild.id,
 *     class_id: selectedClass.id,
 *   });
 * };
 *
 * @example
 * // Using mutateAsync for Promise-based flow
 * const { mutateAsync } = useCreateEnrollment();
 *
 * const handleEnroll = async () => {
 *   try {
 *     const enrollment = await mutateAsync({
 *       child_id: childId,
 *       class_id: classId,
 *     });
 *     navigate(`/payment/${enrollment.id}`);
 *   } catch (error) {
 *     console.error('Enrollment failed:', error);
 *   }
 * };
 *
 * @example
 * // With loading state and disabled button
 * function EnrollmentForm({ child, classInfo }) {
 *   const { mutate, isPending, isSuccess } = useCreateEnrollment();
 *
 *   return (
 *     <form onSubmit={(e) => {
 *       e.preventDefault();
 *       mutate({ child_id: child.id, class_id: classInfo.id });
 *     }}>
 *       <button type="submit" disabled={isPending || isSuccess}>
 *         {isPending ? 'Processing...' : isSuccess ? 'Enrolled!' : 'Enroll'}
 *       </button>
 *     </form>
 *   );
 * }
 *
 * @example
 * // With custom success navigation
 * const { mutate } = useCreateEnrollment({
 *   mutationOptions: {
 *     onSuccess: (enrollment) => {
 *       // Navigate to payment page
 *       navigate(`/checkout/${enrollment.id}`);
 *     }
 *   }
 * });
 *
 * @example
 * // With error handling for specific scenarios
 * const { mutate } = useCreateEnrollment({
 *   mutationOptions: {
 *     onError: (error) => {
 *       if (error.message.includes('class is full')) {
 *         setShowWaitlistModal(true);
 *       } else if (error.message.includes('already enrolled')) {
 *         navigate('/my-enrollments');
 *       }
 *     }
 *   }
 * });
 *
 * @example
 * // Enrollment with optional fields
 * mutate({
 *   child_id: '123',
 *   class_id: '456',
 *   promo_code: 'DISCOUNT20', // Optional discount code
 *   notes: 'Child has food allergies', // Optional notes
 * });
 */
export function useCreateEnrollment(options: UseCreateEnrollmentOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (enrollmentData: CreateEnrollmentRequest) =>
      enrollmentService.create(enrollmentData),

    /**
     * Optimistic update handler - runs immediately before API request
     *
     * Creates a temporary enrollment in the cache for instant UI feedback.
     * This allows the UI to update immediately while the API request is pending.
     *
     * @param {CreateEnrollmentRequest} newEnrollment - Enrollment data being created
     * @returns {Promise<{previousEnrollments: Enrollment[] | undefined}>} Snapshot for rollback
     */
    onMutate: async (newEnrollment): Promise<{ previousEnrollments: Enrollment[] | undefined }> => {
      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: queryKeys.enrollments.lists() });

      // Snapshot previous value for potential rollback
      const previousEnrollments = queryClient.getQueryData<Enrollment[]>(
        queryKeys.enrollments.lists()
      );

      // Optimistically update cache with temporary enrollment
      const now = new Date().toISOString();
      queryClient.setQueryData<Enrollment[]>(
        queryKeys.enrollments.lists(),
        (old = []) => [
          ...old,
          {
            id: 'temp-' + Date.now(), // Temporary ID until server responds
            ...newEnrollment,
            user_id: '', // Will be populated by server
            status: 'PENDING' as const, // New enrollments start as PENDING
            base_price: 0, // Price calculated by server
            discount_amount: 0,
            final_price: 0,
            enrollment_date: now,
            payment_completed: false,
            created_at: now,
            updated_at: now,
          } as Enrollment,
        ]
      );

      return { previousEnrollments };
    },

    /**
     * Error handler - runs if API request fails
     *
     * Rolls back optimistic updates and displays error message.
     * Restores cache to state before mutation was triggered.
     *
     * @param {ApiErrorResponse} error - Error from API
     * @param {CreateEnrollmentRequest} _variables - Mutation variables (unused)
     * @param {Object} context - Context from onMutate with snapshot
     */
    onError: (error, _variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousEnrollments) {
        queryClient.setQueryData(
          queryKeys.enrollments.lists(),
          context.previousEnrollments
        );
      }
      toast.error(error.message || 'Failed to create enrollment');
    },

    /**
     * Success handler - runs after successful API response
     *
     * Invalidates related caches to trigger refetches with real data.
     * This replaces temporary optimistic data with actual server response.
     *
     * Side effects triggered:
     * - Refetches enrollment lists (replaces temp enrollment with real data)
     * - Refetches class details (updates available spots)
     * - Refetches child enrollments
     * - Refetches order queries (new order may have been created)
     *
     * @param {Enrollment} enrollment - Successfully created enrollment from server
     */
    onSuccess: (enrollment) => {
      // Invalidate related queries to refetch with real data
      cacheInvalidation.onEnrollmentMutation(queryClient, {
        child_id: enrollment.child_id,
        class_id: enrollment.class_id,
        id: enrollment.id,
      });

      toast.success('Enrollment created successfully!');
    },

    ...mutationOptions,
  });
}

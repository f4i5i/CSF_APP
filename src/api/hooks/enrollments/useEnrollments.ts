/**
 * @file Enrollment Query Hooks
 *
 * Provides React Query hooks for fetching and managing enrollment data from the API.
 * These hooks handle caching, automatic refetching, and error states for enrollment queries.
 *
 * @module hooks/enrollments/useEnrollments
 *
 * ## Enrollment Lifecycle and Status Transitions
 *
 * Enrollments follow a specific lifecycle with the following status transitions:
 *
 * 1. **PENDING** - Initial state when enrollment is created but payment not completed
 *    - Transitions to: ACTIVE (on payment), CANCELLED (if abandoned)
 *
 * 2. **ACTIVE** - Enrollment is confirmed and student is participating in class
 *    - Transitions to: COMPLETED (class ends), CANCELLED (user cancels), TRANSFERRED (moved to another class)
 *
 * 3. **COMPLETED** - Class has finished and enrollment is complete
 *    - Terminal state - no further transitions
 *
 * 4. **CANCELLED** - Enrollment was cancelled by user or admin
 *    - Terminal state - no further transitions
 *
 * 5. **TRANSFERRED** - Enrollment was moved to a different class
 *    - Terminal state for original enrollment (new enrollment created with PENDING/ACTIVE status)
 *
 * ## Cache Management
 *
 * These query hooks use React Query's caching system with the following configuration:
 * - **staleTime**: 5 minutes - Data is considered fresh for 5 minutes
 * - **gcTime**: 10 minutes - Unused data is garbage collected after 10 minutes
 *
 * Cache is automatically invalidated when:
 * - A new enrollment is created (via useCreateEnrollment)
 * - An enrollment is cancelled (via useCancelEnrollment)
 * - An enrollment is transferred (via useTransferEnrollment)
 *
 * ## Error Handling
 *
 * All hooks return standard React Query error states:
 * - `error`: Contains ApiErrorResponse with error details
 * - `isError`: Boolean indicating if query failed
 * - Query errors are not automatically displayed - components should handle error UI
 *
 * @example
 * // Basic usage - fetch all enrollments
 * const { data: enrollments, isLoading, error } = useEnrollments();
 *
 * @example
 * // Filter by status
 * const { data: activeEnrollments } = useEnrollments({
 *   filters: { status: EnrollmentStatus.ACTIVE }
 * });
 *
 * @example
 * // Filter by child
 * const { data: childEnrollments } = useEnrollments({
 *   filters: { child_id: '123' }
 * });
 *
 * @example
 * // Custom query options
 * const { data } = useEnrollments({
 *   queryOptions: {
 *     refetchInterval: 30000, // Refetch every 30 seconds
 *     enabled: !!userId, // Only fetch if userId exists
 *   }
 * });
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { enrollmentService } from '../../services/enrollment.service';
import { queryKeys } from '../../constants/query-keys';
import type { Enrollment, EnrollmentFilters } from '../../types/enrollment.types';
import { EnrollmentStatus } from '../../types/enrollment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useEnrollments hook
 *
 * @interface UseEnrollmentsOptions
 * @property {EnrollmentFilters} [filters] - Optional filters to apply to the enrollment query
 * @property {Object} [queryOptions] - Additional React Query options (excluding queryKey and queryFn)
 */
interface UseEnrollmentsOptions {
  filters?: EnrollmentFilters;
  queryOptions?: Omit<
    UseQueryOptions<Enrollment[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Fetches the current user's enrollments with optional filtering
 *
 * This hook queries the enrollment service to retrieve all enrollments for the authenticated user.
 * Results are cached using React Query and automatically refetched based on staleTime configuration.
 *
 * ## Cache Key Structure
 * Query keys are generated based on filters to enable granular cache invalidation:
 * - `['enrollments', 'list']` - All enrollments
 * - `['enrollments', 'list', { status: 'ACTIVE' }]` - Filtered enrollments
 *
 * ## When Cache is Invalidated
 * This query is automatically refetched when:
 * - A new enrollment is created (invalidates all enrollment lists)
 * - An enrollment is cancelled (invalidates all enrollment lists)
 * - An enrollment is transferred (invalidates all enrollment lists)
 * - Component remounts after gcTime has expired
 *
 * @param {UseEnrollmentsOptions} [options={}] - Hook configuration options
 * @param {EnrollmentFilters} [options.filters] - Filters to apply (status, child_id, class_id, etc.)
 * @param {Object} [options.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Enrollment[], ApiErrorResponse>} React Query result object containing:
 * - `data`: Array of enrollments matching the filters
 * - `isLoading`: True while initial fetch is in progress
 * - `isFetching`: True while any fetch is in progress (including background refetch)
 * - `error`: Error object if query failed
 * - `refetch`: Function to manually trigger a refetch
 *
 * @example
 * // Basic usage - fetch all user's enrollments
 * const { data: enrollments, isLoading } = useEnrollments();
 *
 * if (isLoading) return <Spinner />;
 * return <EnrollmentList enrollments={enrollments} />;
 *
 * @example
 * // Filter by enrollment status
 * const { data: activeEnrollments } = useEnrollments({
 *   filters: { status: EnrollmentStatus.ACTIVE }
 * });
 *
 * @example
 * // Filter by child to show specific child's enrollments
 * const { data: childEnrollments } = useEnrollments({
 *   filters: { child_id: selectedChildId }
 * });
 *
 * @example
 * // Combine with error handling
 * const { data, error, isError } = useEnrollments();
 *
 * if (isError) {
 *   return <ErrorMessage message={error.message} />;
 * }
 *
 * @example
 * // Custom refetch behavior
 * const { data, refetch } = useEnrollments({
 *   queryOptions: {
 *     refetchOnWindowFocus: false, // Don't refetch on window focus
 *     enabled: isAuthenticated, // Only fetch when authenticated
 *   }
 * });
 */
export function useEnrollments(options: UseEnrollmentsOptions = {}) {
  const { filters, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.enrollments.list(filters),
    queryFn: () => enrollmentService.getMy(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });
}

/**
 * Fetches only active enrollments for the current user
 *
 * This is a convenience hook that wraps useEnrollments with a pre-configured filter
 * for ACTIVE status. Active enrollments represent confirmed, ongoing class enrollments.
 *
 * ## Use Cases
 * - Displaying current classes on user dashboard
 * - Showing active enrollments in profile/account pages
 * - Checking if user can enroll in conflicting time slots
 * - Calculating total active enrollment count
 *
 * @param {Object} [queryOptions] - Additional React Query options (excluding queryKey and queryFn)
 *
 * @returns {UseQueryResult<Enrollment[], ApiErrorResponse>} React Query result with active enrollments
 *
 * @example
 * // Display active enrollments in dashboard
 * const { data: activeEnrollments, isLoading } = useActiveEnrollments();
 *
 * return (
 *   <div>
 *     <h2>Your Active Classes ({activeEnrollments?.length || 0})</h2>
 *     {activeEnrollments?.map(enrollment => (
 *       <ClassCard key={enrollment.id} enrollment={enrollment} />
 *     ))}
 *   </div>
 * );
 *
 * @example
 * // Check for schedule conflicts before enrolling
 * const { data: activeEnrollments } = useActiveEnrollments();
 *
 * const hasConflict = activeEnrollments?.some(enrollment =>
 *   hasScheduleOverlap(enrollment.class, newClass)
 * );
 *
 * @example
 * // Custom query options
 * const { data } = useActiveEnrollments({
 *   refetchInterval: 60000, // Refresh active enrollments every minute
 * });
 */
export function useActiveEnrollments(
  queryOptions?: Omit<UseQueryOptions<Enrollment[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useEnrollments({
    filters: { status: EnrollmentStatus.ACTIVE },
    queryOptions,
  });
}

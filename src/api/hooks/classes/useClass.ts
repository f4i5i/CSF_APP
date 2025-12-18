/**
 * @file useClass Hook
 * @description React Query hook for fetching individual class details with real-time enrollment data.
 *
 * This hook provides access to complete class information including schedule, enrollment capacity,
 * pricing, and location details. It's optimized for frequently changing data like enrollment counts
 * and uses aggressive cache invalidation to ensure users see current availability.
 *
 * **React Query Caching Strategy:**
 * - staleTime: 0ms - Data is immediately considered stale to ensure fresh enrollment data
 * - gcTime: 5 minutes - Cached data is kept in memory for quick navigation back to viewed classes
 * - Background refetching: Enabled when component remounts or window refocuses
 * - Query key: ['classes', 'detail', classId] - Unique key per class for precise cache management
 *
 * **Integration with Enrollment Flow:**
 * 1. User browses classes via useClasses hook
 * 2. User clicks on a class to view details (this hook fetches full data)
 * 3. User enrolls in the class (enrollment mutation invalidates this query)
 * 4. Hook automatically refetches to show updated enrollment count
 *
 * @module api/hooks/classes
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { classService } from '../../services/class.service';
import { queryKeys } from '../../constants/query-keys';
import type { Class, ClassId } from '../../types/class.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Options for the useClass hook
 *
 * @interface UseClassOptions
 * @property {ClassId} classId - The unique identifier of the class to fetch
 * @property {Object} [queryOptions] - Additional React Query options to customize behavior
 */
interface UseClassOptions {
  classId: ClassId;
  queryOptions?: Omit<
    UseQueryOptions<Class, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * React Query hook to fetch detailed information for a single class
 *
 * This hook retrieves complete class details including:
 * - Schedule information (day of week, start/end times, session dates)
 * - Enrollment data (max capacity, current enrollment count, waitlist availability)
 * - Pricing information (cost per session, total cost, payment options)
 * - Location details (facility name, address, room number)
 * - Associated program and area information
 * - Instructor details
 * - Age group and skill level requirements
 *
 * **Caching Configuration:**
 * - staleTime: 0ms - Data is always considered stale for immediate refetching
 * - gcTime: 5 minutes - Keeps data in cache for quick back-navigation
 * - Automatic refetch on: window focus, component remount, network reconnect
 *
 * **Query Key Structure:**
 * The query uses a hierarchical key: `['classes', 'detail', classId]`
 * This allows for:
 * - Invalidating all class details: `queryClient.invalidateQueries(['classes', 'detail'])`
 * - Invalidating specific class: `queryClient.invalidateQueries(['classes', 'detail', '123'])`
 * - Invalidating all class queries: `queryClient.invalidateQueries(['classes'])`
 *
 * **Error Handling:**
 * Errors are returned in the standard ApiErrorResponse format:
 * - error.message: Human-readable error message
 * - error.status: HTTP status code
 * - error.details: Additional error context
 *
 * @param {UseClassOptions} options - Hook configuration options
 * @param {ClassId} options.classId - The ID of the class to fetch
 * @param {Object} [options.queryOptions] - Additional React Query configuration
 *
 * @returns {UseQueryResult<Class, ApiErrorResponse>} React Query result object
 * @returns {Class | undefined} result.data - The class data when successfully fetched
 * @returns {boolean} result.isLoading - True during initial fetch
 * @returns {boolean} result.isFetching - True during any fetch (including background refetch)
 * @returns {boolean} result.isError - True if the query encountered an error
 * @returns {ApiErrorResponse | null} result.error - Error object if query failed
 * @returns {Function} result.refetch - Function to manually trigger a refetch
 * @returns {boolean} result.isSuccess - True when data has been successfully fetched
 * @returns {boolean} result.isStale - True when data is considered stale (always true due to staleTime: 0)
 *
 * @example
 * // Basic usage - fetch class details for display
 * function ClassDetailPage({ classId }) {
 *   const { data: classDetail, isLoading, error } = useClass({
 *     classId
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <div>
 *       <h1>{classDetail.name}</h1>
 *       <p>Enrollment: {classDetail.current_enrollment} / {classDetail.max_capacity}</p>
 *       <p>Schedule: {classDetail.day_of_week} at {classDetail.start_time}</p>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Advanced usage - with custom query options for enrollment flow
 * function EnrollmentModal({ classId }) {
 *   const { data, isLoading, refetch } = useClass({
 *     classId,
 *     queryOptions: {
 *       // Refetch every 30 seconds to show real-time capacity
 *       refetchInterval: 30000,
 *       // Keep previous data while refetching for smooth UX
 *       placeholderData: (previousData) => previousData,
 *       // Retry failed requests
 *       retry: 3,
 *     }
 *   });
 *
 *   const handleEnroll = async () => {
 *     await enrollInClass(classId);
 *     // Refetch to show updated enrollment count
 *     refetch();
 *   };
 *
 *   return (
 *     <EnrollmentForm
 *       classData={data}
 *       onEnroll={handleEnroll}
 *       spotsAvailable={data.max_capacity - data.current_enrollment}
 *     />
 *   );
 * }
 *
 * @example
 * // Conditional fetching - only fetch when classId is available
 * function OptionalClassDetail({ classId }) {
 *   // Hook automatically disables when classId is null/undefined
 *   const { data, isLoading } = useClass({
 *     classId: classId || ''
 *   });
 *
 *   // isLoading will be false when classId is empty due to enabled: !!classId
 *   if (!classId) return <SelectClassPrompt />;
 *   if (isLoading) return <Spinner />;
 *
 *   return <ClassDetails data={data} />;
 * }
 */
export function useClass({ classId, queryOptions }: UseClassOptions) {
  return useQuery({
    queryKey: queryKeys.classes.detail(classId),
    queryFn: () => classService.getById(classId),
    staleTime: 0, // Always fetch fresh data (capacity changes frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!classId, // Only fetch if classId is provided
    ...queryOptions,
  });
}

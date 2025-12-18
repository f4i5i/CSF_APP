/**
 * @file Admin Client Management Hooks
 *
 * @description
 * React Query hooks for managing client data in the admin interface.
 * These hooks provide access to client information, user details, and class rosters.
 *
 * **ADMIN-ONLY ACCESS**: All hooks in this file require administrator privileges.
 * Requests will be authenticated using admin credentials and will fail if the user
 * does not have the required permissions.
 *
 * @module hooks/admin/useClients
 *
 * @features
 * - Client list management with filtering and pagination
 * - Individual client detail retrieval
 * - Class roster management
 * - Infinite scroll support for large client lists
 *
 * @requires @tanstack/react-query
 * @requires Admin role authentication
 *
 * @see {@link adminService} for underlying API calls
 * @see {@link ClientFilters} for available filter options
 */

import { useQuery, useInfiniteQuery, type UseQueryOptions, type UseInfiniteQueryOptions } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { queryKeys } from '../../constants/query-keys';
import type { ClientSummary, ClientDetail, ClientFilters, ClassRoster } from '../../types/admin.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Fetches a list of clients with optional filtering capabilities.
 *
 * @description
 * Retrieves client summaries from the admin API with support for various filters
 * including role, active status, search terms, and pagination parameters.
 *
 * **Admin Access Required**: This hook requires administrator authentication.
 *
 * @param {Object} params - Configuration object
 * @param {ClientFilters} [params.filters] - Optional filters to apply to the client list
 * @param {string} [params.filters.role] - Filter by user role (e.g., 'parent', 'student')
 * @param {boolean} [params.filters.is_active] - Filter by active/inactive status
 * @param {string} [params.filters.search] - Search term for name/email filtering
 * @param {number} [params.filters.skip] - Number of records to skip for pagination
 * @param {number} [params.filters.limit] - Maximum number of records to return
 * @param {UseQueryOptions} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<ClientSummary[], ApiErrorResponse>} Query result containing:
 * - data: Array of client summary objects
 * - isLoading: Loading state
 * - error: Error object if request failed
 * - refetch: Function to manually refetch data
 *
 * @example
 * // Basic usage - fetch all clients
 * const { data: clients, isLoading } = useClients();
 *
 * @example
 * // Filter active parents only
 * const { data: parents } = useClients({
 *   filters: { role: 'parent', is_active: true }
 * });
 *
 * @example
 * // Search for specific clients with pagination
 * const { data: searchResults } = useClients({
 *   filters: {
 *     search: 'john',
 *     skip: 0,
 *     limit: 20
 *   }
 * });
 *
 * @example
 * // Disable automatic refetching
 * const { data: clients } = useClients({
 *   queryOptions: {
 *     refetchOnWindowFocus: false,
 *     enabled: isAdminRoute
 *   }
 * });
 */
export function useClients({
  filters,
  queryOptions,
}: {
  filters?: ClientFilters;
  queryOptions?: Omit<UseQueryOptions<ClientSummary[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
} = {}) {
  return useQuery({
    queryKey: queryKeys.admin.clients(filters),
    queryFn: () => adminService.getClients(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Fetches clients with infinite scroll pagination support.
 *
 * @description
 * Implements infinite scrolling for large client lists by automatically managing
 * pagination and loading additional pages as needed. Uses cursor-based pagination
 * with a fixed page size of 20 records.
 *
 * **Admin Access Required**: This hook requires administrator authentication.
 *
 * @param {Object} params - Configuration object
 * @param {Omit<ClientFilters, 'skip' | 'limit'>} [params.filters] - Filter options (skip/limit excluded)
 * @param {string} [params.filters.role] - Filter by user role
 * @param {boolean} [params.filters.is_active] - Filter by active status
 * @param {string} [params.filters.search] - Search term for filtering
 * @param {UseInfiniteQueryOptions} [params.queryOptions] - Additional React Query infinite options
 *
 * @returns {UseInfiniteQueryResult<ClientSummary[], ApiErrorResponse>} Infinite query result:
 * - data: Paginated array of client summaries grouped by page
 * - fetchNextPage: Function to load the next page
 * - hasNextPage: Boolean indicating if more pages exist
 * - isFetchingNextPage: Loading state for next page
 * - isLoading: Initial loading state
 *
 * @example
 * // Basic infinite scroll implementation
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage
 * } = useInfiniteClients();
 *
 * // Render all pages
 * data?.pages.map(page =>
 *   page.map(client => <ClientCard key={client.id} client={client} />)
 * );
 *
 * @example
 * // With filters and scroll detection
 * const { data, fetchNextPage, hasNextPage } = useInfiniteClients({
 *   filters: { is_active: true, role: 'parent' }
 * });
 *
 * const handleScroll = () => {
 *   if (hasNextPage && !isFetchingNextPage) {
 *     fetchNextPage();
 *   }
 * };
 *
 * @example
 * // React Infinite Scroll integration
 * <InfiniteScroll
 *   dataLength={data?.pages.flatMap(p => p).length ?? 0}
 *   next={fetchNextPage}
 *   hasMore={hasNextPage ?? false}
 *   loader={<Spinner />}
 * >
 *   {data?.pages.map(page => ...)}
 * </InfiniteScroll>
 */
export function useInfiniteClients({
  filters,
  queryOptions,
}: {
  filters?: Omit<ClientFilters, 'skip' | 'limit'>;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<ClientSummary[], ApiErrorResponse>,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >;
} = {}) {
  return useInfiniteQuery({
    ...queryOptions,
    queryKey: queryKeys.admin.clients(filters),
    queryFn: ({ pageParam = 0 }) =>
      adminService.getClients({ ...filters, skip: pageParam as number, limit: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * 20;
      return lastPage.length === 20 ? nextOffset : undefined;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches detailed information for a specific client.
 *
 * @description
 * Retrieves comprehensive client details including personal information, enrollment history,
 * payment records, waiver status, and associated family members. This hook automatically
 * disables the query if no userId is provided.
 *
 * **Admin Access Required**: This hook requires administrator authentication.
 *
 * @param {Object} params - Configuration object
 * @param {string} params.userId - The unique identifier of the client to fetch (required)
 * @param {UseQueryOptions} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<ClientDetail, ApiErrorResponse>} Query result containing:
 * - data: Complete client details object
 * - isLoading: Loading state
 * - error: Error object if request failed
 * - refetch: Function to manually refetch data
 *
 * @example
 * // Basic usage - fetch client details
 * const { data: client, isLoading } = useClientDetail({
 *   userId: 'user-123'
 * });
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <div>
 *     <h2>{client.full_name}</h2>
 *     <p>Email: {client.email}</p>
 *     <p>Role: {client.role}</p>
 *     <p>Total Enrollments: {client.enrollments.length}</p>
 *   </div>
 * );
 *
 * @example
 * // With conditional rendering based on user selection
 * const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
 *
 * const { data: client } = useClientDetail({
 *   userId: selectedUserId!,
 *   queryOptions: {
 *     enabled: !!selectedUserId // Only fetch when userId is selected
 *   }
 * });
 *
 * @example
 * // Access nested client data
 * const { data: client } = useClientDetail({ userId: 'user-123' });
 *
 * // Access enrollment history
 * const enrollments = client?.enrollments || [];
 *
 * // Access payment history
 * const payments = client?.payments || [];
 *
 * // Check waiver status
 * const hasSignedWaiver = client?.waiver_signed;
 */
export function useClientDetail({
  userId,
  queryOptions,
}: {
  userId: string;
  queryOptions?: Omit<UseQueryOptions<ClientDetail, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.admin.client(userId),
    queryFn: () => adminService.getClientDetail(userId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!userId,
    ...queryOptions,
  });
}

/**
 * Fetches the complete roster for a specific class.
 *
 * @description
 * Retrieves all enrolled students, their attendance records, payment status,
 * and parent/guardian information for a given class. Useful for class management,
 * attendance tracking, and generating reports.
 *
 * **Admin Access Required**: This hook requires administrator authentication.
 *
 * @param {Object} params - Configuration object
 * @param {string} params.classId - The unique identifier of the class (required)
 * @param {UseQueryOptions} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<ClassRoster, ApiErrorResponse>} Query result containing:
 * - data: Class roster with enrollment details
 * - isLoading: Loading state
 * - error: Error object if request failed
 * - refetch: Function to manually refetch data
 *
 * @example
 * // Basic usage - display class roster
 * const { data: roster, isLoading } = useClassRoster({
 *   classId: 'class-123'
 * });
 *
 * return (
 *   <div>
 *     <h2>{roster?.class_name}</h2>
 *     <p>Total Students: {roster?.enrollments.length}</p>
 *     <ul>
 *       {roster?.enrollments.map(enrollment => (
 *         <li key={enrollment.id}>
 *           {enrollment.student_name} - {enrollment.payment_status}
 *         </li>
 *       ))}
 *     </ul>
 *   </div>
 * );
 *
 * @example
 * // With attendance tracking
 * const { data: roster } = useClassRoster({ classId: 'class-123' });
 *
 * const presentStudents = roster?.enrollments.filter(
 *   e => e.attendance_status === 'present'
 * ).length;
 *
 * const attendanceRate = (presentStudents / roster?.enrollments.length) * 100;
 *
 * @example
 * // Filter by payment status
 * const { data: roster } = useClassRoster({ classId: 'class-123' });
 *
 * const paidEnrollments = roster?.enrollments.filter(
 *   e => e.payment_status === 'paid'
 * );
 *
 * const unpaidEnrollments = roster?.enrollments.filter(
 *   e => e.payment_status === 'pending'
 * );
 *
 * @example
 * // Export roster data
 * const { data: roster } = useClassRoster({ classId: 'class-123' });
 *
 * const exportRoster = () => {
 *   const csvData = roster?.enrollments.map(e => ({
 *     student: e.student_name,
 *     parent: e.parent_name,
 *     email: e.parent_email,
 *     status: e.payment_status
 *   }));
 *   // Generate CSV export
 * };
 */
export function useClassRoster({
  classId,
  queryOptions,
}: {
  classId: string;
  queryOptions?: Omit<UseQueryOptions<ClassRoster, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.admin.roster(classId),
    queryFn: () => adminService.getClassRoster(classId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!classId,
    ...queryOptions,
  });
}

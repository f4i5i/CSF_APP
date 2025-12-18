/**
 * @file useChildren Hook - React Query hook for fetching the current user's children
 *
 * This hook implements the React Query pattern for list data fetching:
 * - Uses `useQuery` for GET operations (read-only)
 * - Provides automatic caching, background refetching, and stale data management
 * - Supports filtering to retrieve specific subsets of children
 * - Integrates with React Query's global cache using structured query keys
 *
 * @module hooks/children/useChildren
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { childService } from '../../services/child.service';
import { queryKeys } from '../../constants/query-keys';
import type { Child, ChildFilters } from '../../types/child.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useChildren hook
 *
 * @interface UseChildrenOptions
 * @property {ChildFilters} [filters] - Optional filters to narrow down the children list
 * @property {UseQueryOptions} [queryOptions] - Additional React Query options to customize behavior
 */
interface UseChildrenOptions {
  filters?: ChildFilters;
  queryOptions?: Omit<
    UseQueryOptions<Child[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * React Query hook to fetch the current user's children
 *
 * This hook uses `useQuery` to fetch and cache a list of children belonging to the authenticated user.
 * It automatically:
 * - Caches the result using the query key: `['children', 'list', filters]`
 * - Refetches data in the background when the data becomes stale (after 5 minutes)
 * - Maintains cached data in memory for 10 minutes after last use
 * - Deduplicates requests for the same filter combination across components
 *
 * **Query Key Structure:**
 * - Key: `queryKeys.children.list(filters)` → `['children', 'list', filters]`
 * - Different filter combinations create separate cache entries
 * - Allows partial invalidation (e.g., invalidate all lists while keeping detail queries)
 *
 * **Automatic Refetching:**
 * - Data becomes stale after 5 minutes
 * - Automatically refetches on window focus if data is stale
 * - Refetches on network reconnection if data is stale
 * - Can be configured to poll at intervals using queryOptions
 *
 * **Cache Updates:**
 * - This query is automatically invalidated when:
 *   - `useCreateChild` creates a new child (adds to the list)
 *   - `useUpdateChild` updates any child (may affect list ordering/filtering)
 *   - `useDeleteChild` deletes a child (removes from the list)
 *
 * @param {UseChildrenOptions} [options={}] - Configuration options for the hook
 * @param {ChildFilters} [options.filters] - Filters to apply to the children list
 * @param {UseQueryOptions} [options.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Child[], ApiErrorResponse>} React Query result object containing:
 * - `data`: Array of children (undefined while loading, empty array if no children)
 * - `isLoading`: True during the initial fetch
 * - `isFetching`: True during any fetch (initial or background)
 * - `isError`: True if the query resulted in an error
 * - `error`: The error object if an error occurred
 * - `refetch`: Function to manually refetch the data
 * - `isSuccess`: True if the query completed successfully
 *
 * @example
 * Basic usage - Display all children
 * ```tsx
 * function ChildrenList() {
 *   const { data: children, isLoading, isError, error } = useChildren();
 *
 *   if (isLoading) return <div>Loading children...</div>;
 *   if (isError) return <div>Error: {error.message}</div>;
 *   if (!children || children.length === 0) {
 *     return <div>No children found. Add your first child!</div>;
 *   }
 *
 *   return (
 *     <ul>
 *       {children.map((child) => (
 *         <li key={child.id}>
 *           {child.first_name} {child.last_name} - Age: {child.age}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * @example
 * With filters - Fetch children matching specific criteria
 * ```tsx
 * function ActiveChildrenList() {
 *   const { data: activeChildren, isLoading } = useChildren({
 *     filters: {
 *       status: 'active',
 *       minAge: 5,
 *       maxAge: 12,
 *     },
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       <h2>Active Children (Ages 5-12)</h2>
 *       <ChildrenGrid children={activeChildren} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Polling - Auto-refresh data at intervals
 * ```tsx
 * function RealtimeChildrenDashboard() {
 *   // Refresh children list every 30 seconds
 *   const { data: children, isFetching } = useChildren({
 *     queryOptions: {
 *       refetchInterval: 30000, // 30 seconds
 *       refetchIntervalInBackground: false, // Only poll when tab is active
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       {isFetching && <Badge>Updating...</Badge>}
 *       <ChildrenTable data={children} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Selection interface - List children for selection
 * ```tsx
 * function ChildSelector({ onSelect }: { onSelect: (child: Child) => void }) {
 *   const { data: children, isLoading } = useChildren();
 *
 *   if (isLoading) return <Skeleton count={3} />;
 *
 *   return (
 *     <select onChange={(e) => {
 *       const child = children?.find(c => c.id === e.target.value);
 *       if (child) onSelect(child);
 *     }}>
 *       <option value="">Select a child...</option>
 *       {children?.map((child) => (
 *         <option key={child.id} value={child.id}>
 *           {child.first_name} {child.last_name}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 *
 * @example
 * Dependent queries - Use children data for subsequent queries
 * ```tsx
 * function ChildrenWithEnrollments() {
 *   const { data: children, isSuccess } = useChildren();
 *
 *   // Fetch enrollments for each child (only after children are loaded)
 *   const enrollmentQueries = children?.map(child =>
 *     useEnrollments({ childId: child.id, enabled: isSuccess })
 *   );
 *
 *   return <EnrollmentSummary children={children} enrollments={enrollmentQueries} />;
 * }
 * ```
 */
export function useChildren(options: UseChildrenOptions = {}) {
  const { filters, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.children.list(filters),
    queryFn: () => childService.getMy(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });
}

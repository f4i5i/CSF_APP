/**
 * @file useChild Hook - React Query hook for fetching a single child by ID
 *
 * This hook implements the React Query pattern for data fetching:
 * - Uses `useQuery` for GET operations (read-only)
 * - Provides automatic caching, background refetching, and stale data management
 * - Integrates with React Query's global cache using structured query keys
 *
 * @module hooks/children/useChild
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { childService } from '../../services/child.service';
import { queryKeys } from '../../constants/query-keys';
import type { Child } from '../../types/child.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useChild hook
 *
 * @interface UseChildOptions
 * @property {boolean} [enabled=true] - Controls whether the query should execute automatically
 * @property {UseQueryOptions} [queryOptions] - Additional React Query options to customize behavior
 */
interface UseChildOptions {
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<Child, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * React Query hook to fetch a single child by ID
 *
 * This hook uses `useQuery` to fetch and cache child data. It automatically:
 * - Caches the result using the query key: `['children', 'detail', childId]`
 * - Refetches data in the background when the data becomes stale (after 5 minutes)
 * - Maintains cached data in memory for 10 minutes after last use
 * - Deduplicates requests for the same child ID across components
 *
 * **Query Key Structure:**
 * - Key: `queryKeys.children.detail(childId)` → `['children', 'detail', childId]`
 * - This allows targeted cache invalidation when a child is updated or deleted
 *
 * **Automatic Refetching:**
 * - Data becomes stale after 5 minutes
 * - Automatically refetches on window focus if data is stale
 * - Refetches on network reconnection if data is stale
 *
 * **Cache Updates:**
 * - This query is automatically invalidated when:
 *   - `useCreateChild` creates a new child
 *   - `useUpdateChild` updates this specific child
 *   - `useDeleteChild` deletes this specific child
 *
 * @param {string} childId - The unique identifier of the child to fetch
 * @param {UseChildOptions} [options={}] - Configuration options for the hook
 * @param {boolean} [options.enabled=true] - Whether to execute the query automatically
 * @param {UseQueryOptions} [options.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Child, ApiErrorResponse>} React Query result object containing:
 * - `data`: The child data (undefined while loading)
 * - `isLoading`: True during the initial fetch
 * - `isFetching`: True during any fetch (initial or background)
 * - `isError`: True if the query resulted in an error
 * - `error`: The error object if an error occurred
 * - `refetch`: Function to manually refetch the data
 * - `isSuccess`: True if the query completed successfully
 *
 * @example
 * Basic usage - Fetch and display child details
 * ```tsx
 * function ChildProfile({ childId }: { childId: string }) {
 *   const { data: child, isLoading, isError, error } = useChild(childId);
 *
 *   if (isLoading) return <div>Loading child details...</div>;
 *   if (isError) return <div>Error: {error.message}</div>;
 *   if (!child) return <div>Child not found</div>;
 *
 *   return (
 *     <div>
 *       <h2>{child.first_name} {child.last_name}</h2>
 *       <p>Date of Birth: {child.date_of_birth}</p>
 *       <p>Age: {child.age}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Conditional fetching - Only fetch when needed
 * ```tsx
 * function EditChildModal({ childId, isOpen }: Props) {
 *   // Only fetch child data when the modal is open
 *   const { data: child, isLoading } = useChild(childId, {
 *     enabled: isOpen && !!childId,
 *   });
 *
 *   if (!isOpen) return null;
 *   if (isLoading) return <Spinner />;
 *
 *   return <ChildForm initialData={child} />;
 * }
 * ```
 *
 * @example
 * Manual refetch - Refresh data on demand
 * ```tsx
 * function ChildDetails({ childId }: { childId: string }) {
 *   const { data: child, refetch, isFetching } = useChild(childId);
 *
 *   return (
 *     <div>
 *       <button onClick={() => refetch()} disabled={isFetching}>
 *         {isFetching ? 'Refreshing...' : 'Refresh'}
 *       </button>
 *       <ChildInfo child={child} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Custom query options - Disable automatic refetching
 * ```tsx
 * function StaticChildView({ childId }: { childId: string }) {
 *   const { data: child } = useChild(childId, {
 *     queryOptions: {
 *       refetchOnWindowFocus: false,
 *       refetchOnReconnect: false,
 *     },
 *   });
 *
 *   return <ChildCard child={child} />;
 * }
 * ```
 */
export function useChild(childId: string, options: UseChildOptions = {}) {
  const { enabled = true, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.children.detail(childId),
    queryFn: () => childService.getById(childId),
    enabled: enabled && !!childId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });
}

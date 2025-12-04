/**
 * useChildren Hook
 * React Query hook to fetch user's children
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { childService } from '../../services/child.service';
import { queryKeys } from '../../constants/query-keys';
import type { Child, ChildFilters } from '../../types/child.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseChildrenOptions {
  filters?: ChildFilters;
  queryOptions?: Omit<
    UseQueryOptions<Child[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch current user's children
 *
 * @example
 * ```tsx
 * const { data: children, isLoading } = useChildren();
 *
 * return (
 *   <div>
 *     {children?.map((child) => (
 *       <div key={child.id}>{child.first_name} {child.last_name}</div>
 *     ))}
 *   </div>
 * );
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

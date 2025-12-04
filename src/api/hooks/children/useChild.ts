/**
 * useChild Hook
 * React Query hook to fetch a single child by ID
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { childService } from '../../services/child.service';
import { queryKeys } from '../../constants/query-keys';
import type { Child } from '../../types/child.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseChildOptions {
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<Child, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch a single child by ID
 *
 * @example
 * ```tsx
 * const { data: child, isLoading } = useChild('123');
 *
 * if (isLoading) return <div>Loading...</div>;
 *
 * return <div>{child?.first_name} {child?.last_name}</div>;
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

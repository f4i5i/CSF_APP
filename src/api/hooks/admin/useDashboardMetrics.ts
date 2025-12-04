/**
 * useDashboardMetrics Hook
 * React Query hook to fetch admin dashboard metrics
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { queryKeys } from '../../constants/query-keys';
import type { DashboardMetrics } from '../../types/admin.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch dashboard metrics with background refetching
 *
 * @example
 * ```tsx
 * const { data: metrics, isLoading } = useDashboardMetrics();
 * ```
 */
export function useDashboardMetrics(
  queryOptions?: Omit<UseQueryOptions<DashboardMetrics, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.admin.metrics(),
    queryFn: () => adminService.getDashboardMetrics(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for real-time dashboard
    ...queryOptions,
  });
}

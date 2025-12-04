/**
 * useRevenueReport Hook
 * React Query hook to fetch revenue reports
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { queryKeys } from '../../constants/query-keys';
import type { RevenueReport, RevenueReportFilters } from '../../types/admin.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch revenue report
 *
 * @example
 * ```tsx
 * const { data: report } = useRevenueReport({
 *   filters: {
 *     start_date: '2025-01-01',
 *     end_date: '2025-12-31',
 *     groupBy: 'month'
 *   }
 * });
 * ```
 */
export function useRevenueReport({
  filters,
  queryOptions,
}: {
  filters: RevenueReportFilters;
  queryOptions?: Omit<UseQueryOptions<RevenueReport, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.admin.revenue(filters),
    queryFn: () => adminService.getRevenueReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes (reports are expensive queries)
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!filters.start_date && !!filters.end_date,
    ...queryOptions,
  });
}

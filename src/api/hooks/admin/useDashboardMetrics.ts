/**
 * @file Admin Dashboard Metrics Hook
 *
 * @description
 * React Query hook for fetching real-time dashboard analytics and metrics.
 * Provides comprehensive business intelligence data for the admin interface
 * including revenue, enrollments, user statistics, and performance indicators.
 *
 * **ADMIN-ONLY ACCESS**: This hook requires administrator privileges.
 * The metrics endpoint is protected and will return 403 Forbidden for
 * non-admin users.
 *
 * @module hooks/admin/useDashboardMetrics
 *
 * @features
 * - Real-time dashboard analytics with automatic background refresh
 * - Key performance indicators (KPIs) for business monitoring
 * - Revenue and enrollment trends
 * - User activity statistics
 * - System health metrics
 * - Configurable refresh intervals for live data
 *
 * @requires @tanstack/react-query
 * @requires Admin role authentication
 *
 * @see {@link adminService.getDashboardMetrics} for underlying API call
 * @see {@link DashboardMetrics} for the complete metrics data structure
 *
 * @performance
 * - Default stale time: 1 minute
 * - Cache time: 3 minutes
 * - Auto-refetch interval: 2 minutes
 * - Background refetching enabled for real-time updates
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { queryKeys } from '../../constants/query-keys';
import type { DashboardMetrics } from '../../types/admin.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Fetches comprehensive dashboard metrics for admin analytics.
 *
 * @description
 * Retrieves aggregated business metrics including:
 * - Total revenue and revenue trends
 * - Active enrollments and enrollment rates
 * - User statistics (total users, active users, new signups)
 * - Class occupancy and capacity metrics
 * - Pending refund counts
 * - Recent activity summaries
 *
 * This hook automatically refreshes data every 2 minutes to provide near
 * real-time dashboard updates without requiring manual refresh.
 *
 * **Admin Access Required**: This hook requires administrator authentication.
 *
 * @param {UseQueryOptions} [queryOptions] - Additional React Query configuration options
 * @param {number} [queryOptions.refetchInterval] - Override default 2-minute auto-refresh
 * @param {boolean} [queryOptions.enabled] - Conditionally enable/disable the query
 * @param {Function} [queryOptions.onSuccess] - Callback when data loads successfully
 * @param {Function} [queryOptions.onError] - Callback when an error occurs
 *
 * @returns {UseQueryResult<DashboardMetrics, ApiErrorResponse>} Query result containing:
 * - data: Dashboard metrics object with all KPIs
 * - isLoading: Initial loading state
 * - isFetching: Background refetch state
 * - error: Error object if request failed
 * - refetch: Function to manually trigger refresh
 *
 * @example
 * // Basic usage - display dashboard metrics
 * const { data: metrics, isLoading } = useDashboardMetrics();
 *
 * if (isLoading) return <DashboardSkeleton />;
 *
 * return (
 *   <Dashboard>
 *     <MetricCard
 *       title="Total Revenue"
 *       value={metrics.total_revenue}
 *       trend={metrics.revenue_trend}
 *     />
 *     <MetricCard
 *       title="Active Enrollments"
 *       value={metrics.active_enrollments}
 *     />
 *     <MetricCard
 *       title="Total Users"
 *       value={metrics.total_users}
 *     />
 *   </Dashboard>
 * );
 *
 * @example
 * // With custom refresh interval (every 30 seconds)
 * const { data: metrics, isFetching } = useDashboardMetrics({
 *   refetchInterval: 30 * 1000,
 *   refetchIntervalInBackground: true
 * });
 *
 * // Show loading indicator when refreshing
 * {isFetching && <RefreshIndicator />}
 *
 * @example
 * // Disable auto-refresh for static reports
 * const { data: metrics } = useDashboardMetrics({
 *   refetchInterval: false,
 *   refetchOnWindowFocus: false
 * });
 *
 * @example
 * // With error handling and retry logic
 * const { data: metrics, error, refetch } = useDashboardMetrics({
 *   retry: 3,
 *   retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
 *   onError: (error) => {
 *     console.error('Failed to load metrics:', error);
 *     toast.error('Dashboard metrics unavailable');
 *   }
 * });
 *
 * if (error) {
 *   return (
 *     <ErrorState
 *       message="Failed to load dashboard"
 *       onRetry={refetch}
 *     />
 *   );
 * }
 *
 * @example
 * // Access specific metrics
 * const { data: metrics } = useDashboardMetrics();
 *
 * // Revenue data
 * const totalRevenue = metrics?.total_revenue || 0;
 * const revenueGrowth = metrics?.revenue_trend?.percentage || 0;
 *
 * // Enrollment data
 * const activeEnrollments = metrics?.active_enrollments || 0;
 * const classCapacity = metrics?.class_capacity_rate || 0;
 *
 * // User statistics
 * const totalUsers = metrics?.total_users || 0;
 * const activeUsers = metrics?.active_users || 0;
 * const newSignups = metrics?.new_signups_this_month || 0;
 *
 * @example
 * // Conditional rendering based on metrics
 * const { data: metrics } = useDashboardMetrics();
 *
 * const hasLowEnrollment = metrics?.active_enrollments < 10;
 * const hasPendingRefunds = metrics?.pending_refunds > 0;
 *
 * return (
 *   <>
 *     {hasLowEnrollment && (
 *       <Alert severity="warning">
 *         Low enrollment detected. Consider marketing campaigns.
 *       </Alert>
 *     )}
 *     {hasPendingRefunds && (
 *       <Alert severity="info">
 *         {metrics.pending_refunds} refund requests need attention
 *       </Alert>
 *     )}
 *   </>
 * );
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

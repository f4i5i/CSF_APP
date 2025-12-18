/**
 * @file Admin Revenue Reporting Hook
 *
 * @description
 * React Query hook for fetching and analyzing revenue data and financial reports.
 * Provides comprehensive financial analytics with support for custom date ranges,
 * grouping options, and detailed breakdowns by class, category, or time period.
 *
 * **ADMIN-ONLY ACCESS**: This hook requires administrator privileges.
 * Revenue data is sensitive financial information accessible only to authorized
 * admin users.
 *
 * @module hooks/admin/useRevenueReport
 *
 * @features
 * - Customizable date range filtering
 * - Multiple grouping options (day, week, month, quarter, year)
 * - Revenue breakdown by class, category, or instructor
 * - Total revenue calculations and trends
 * - Refund tracking and net revenue reporting
 * - Payment method analytics
 * - Export-ready data formatting
 *
 * @requires @tanstack/react-query
 * @requires Admin role authentication
 *
 * @see {@link adminService.getRevenueReport} for underlying API call
 * @see {@link RevenueReport} for the complete report data structure
 * @see {@link RevenueReportFilters} for available filter options
 *
 * @performance
 * - Extended stale time (5 minutes) - financial reports are expensive queries
 * - Extended cache time (10 minutes) - reduce database load
 * - Conditional fetching - only runs when date range is provided
 *
 * @security
 * - PCI compliance considerations for payment data
 * - Role-based access control enforcement
 * - Audit logging for financial data access
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { queryKeys } from '../../constants/query-keys';
import type { RevenueReport, RevenueReportFilters } from '../../types/admin.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Fetches comprehensive revenue reports with customizable filters and grouping.
 *
 * @description
 * Generates detailed financial reports including:
 * - Total revenue for specified period
 * - Revenue trends and growth rates
 * - Breakdown by class, category, or time period
 * - Payment method distribution
 * - Refund amounts and net revenue
 * - Average transaction values
 * - Top-performing classes/categories
 *
 * Reports can be grouped by day, week, month, quarter, or year for trend analysis.
 * The query is automatically disabled until both start_date and end_date are provided
 * to prevent accidental expensive queries.
 *
 * **Admin Access Required**: This hook requires administrator authentication.
 *
 * @param {Object} params - Configuration object (required)
 * @param {RevenueReportFilters} params.filters - Report filters (required)
 * @param {string} params.filters.start_date - Report start date (ISO format, required)
 * @param {string} params.filters.end_date - Report end date (ISO format, required)
 * @param {string} [params.filters.groupBy] - Grouping option: 'day' | 'week' | 'month' | 'quarter' | 'year'
 * @param {string} [params.filters.class_id] - Filter by specific class
 * @param {string} [params.filters.category] - Filter by class category
 * @param {string} [params.filters.instructor_id] - Filter by instructor
 * @param {UseQueryOptions} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<RevenueReport, ApiErrorResponse>} Query result containing:
 * - data: Complete revenue report with all metrics
 * - isLoading: Initial loading state
 * - error: Error object if request failed
 * - refetch: Function to manually refresh report
 *
 * @example
 * // Basic monthly revenue report
 * const { data: report, isLoading } = useRevenueReport({
 *   filters: {
 *     start_date: '2025-01-01',
 *     end_date: '2025-01-31',
 *     groupBy: 'day'
 *   }
 * });
 *
 * if (isLoading) return <ReportSkeleton />;
 *
 * return (
 *   <RevenueChart
 *     data={report.revenue_by_period}
 *     totalRevenue={report.total_revenue}
 *     netRevenue={report.net_revenue}
 *   />
 * );
 *
 * @example
 * // Yearly report grouped by month
 * const { data: yearlyReport } = useRevenueReport({
 *   filters: {
 *     start_date: '2025-01-01',
 *     end_date: '2025-12-31',
 *     groupBy: 'month'
 *   }
 * });
 *
 * // Display monthly breakdown
 * yearlyReport?.revenue_by_period.map(period => (
 *   <MonthCard
 *     key={period.period}
 *     month={period.period}
 *     revenue={period.revenue}
 *     growth={period.growth_rate}
 *   />
 * ));
 *
 * @example
 * // Revenue by specific class category
 * const { data: categoryReport } = useRevenueReport({
 *   filters: {
 *     start_date: '2025-01-01',
 *     end_date: '2025-12-31',
 *     category: 'martial-arts',
 *     groupBy: 'month'
 *   }
 * });
 *
 * console.log('Martial Arts Revenue:', categoryReport?.total_revenue);
 *
 * @example
 * // Compare revenue across date ranges
 * const currentMonth = useRevenueReport({
 *   filters: {
 *     start_date: '2025-01-01',
 *     end_date: '2025-01-31',
 *     groupBy: 'day'
 *   }
 * });
 *
 * const previousMonth = useRevenueReport({
 *   filters: {
 *     start_date: '2024-12-01',
 *     end_date: '2024-12-31',
 *     groupBy: 'day'
 *   }
 * });
 *
 * const growth = (
 *   ((currentMonth.data?.total_revenue ?? 0) -
 *    (previousMonth.data?.total_revenue ?? 0)) /
 *   (previousMonth.data?.total_revenue ?? 1)
 * ) * 100;
 *
 * @example
 * // Conditional fetching with dynamic date range
 * const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
 *
 * const { data: report, isFetching } = useRevenueReport({
 *   filters: {
 *     start_date: dateRange?.start ?? '',
 *     end_date: dateRange?.end ?? '',
 *     groupBy: 'week'
 *   },
 *   queryOptions: {
 *     enabled: !!dateRange?.start && !!dateRange?.end
 *   }
 * });
 *
 * // Only fetches when dateRange is set
 *
 * @example
 * // Export revenue data to CSV
 * const { data: report } = useRevenueReport({
 *   filters: {
 *     start_date: '2025-01-01',
 *     end_date: '2025-12-31',
 *     groupBy: 'month'
 *   }
 * });
 *
 * const exportToCSV = () => {
 *   const csvData = report?.revenue_by_period.map(period => ({
 *     Period: period.period,
 *     Revenue: period.revenue,
 *     Refunds: period.refunds,
 *     'Net Revenue': period.net_revenue,
 *     'Transaction Count': period.transaction_count
 *   }));
 *   // Generate CSV export
 * };
 *
 * @example
 * // Revenue breakdown by payment method
 * const { data: report } = useRevenueReport({
 *   filters: {
 *     start_date: '2025-01-01',
 *     end_date: '2025-12-31'
 *   }
 * });
 *
 * const creditCardRevenue = report?.by_payment_method?.credit_card ?? 0;
 * const paypalRevenue = report?.by_payment_method?.paypal ?? 0;
 * const cashRevenue = report?.by_payment_method?.cash ?? 0;
 *
 * return (
 *   <PaymentMethodChart
 *     data={[
 *       { method: 'Credit Card', amount: creditCardRevenue },
 *       { method: 'PayPal', amount: paypalRevenue },
 *       { method: 'Cash', amount: cashRevenue }
 *     ]}
 *   />
 * );
 *
 * @example
 * // Top performing classes
 * const { data: report } = useRevenueReport({
 *   filters: {
 *     start_date: '2025-01-01',
 *     end_date: '2025-12-31'
 *   }
 * });
 *
 * const topClasses = report?.by_class
 *   ?.sort((a, b) => b.revenue - a.revenue)
 *   .slice(0, 5);
 *
 * return (
 *   <TopClassesList>
 *     {topClasses?.map(classData => (
 *       <ClassRevenueItem
 *         key={classData.class_id}
 *         name={classData.class_name}
 *         revenue={classData.revenue}
 *         enrollments={classData.enrollment_count}
 *       />
 *     ))}
 *   </TopClassesList>
 * );
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

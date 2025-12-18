/**
 * @file usePayments Hook
 * @description React Query hooks for fetching user payment history with filtering.
 *
 * This file provides multiple hooks for accessing payment lists:
 * - usePayments: Fetch all payments or filter by status
 * - usePendingPayments: Convenience hook for pending payments
 * - useCompletedPayments: Convenience hook for successful payments
 *
 * These hooks are essential for payment history, financial tracking, and
 * transaction management within the application.
 *
 * @module hooks/payments/usePayments
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { paymentService } from '../../services/payment.service';
import { queryKeys } from '../../constants/query-keys';
import type { Payment } from '../../types/payment.types';
import { PaymentStatus } from '../../types/payment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Options for the usePayments hook
 *
 * @interface UsePaymentsOptions
 * @property {PaymentStatus} [status] - Filter payments by status (pending, completed, failed, refunded)
 * @property {Object} [queryOptions] - Additional React Query options to customize behavior
 */
interface UsePaymentsOptions {
  status?: PaymentStatus;
  queryOptions?: Omit<
    UseQueryOptions<Payment[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch user's payment history with optional filtering
 *
 * @description
 * Retrieves a list of all payments made by the authenticated user. This is the
 * primary hook for displaying payment history, tracking transactions, and
 * financial reporting.
 *
 * **Use Cases:**
 * - Payment history page
 * - Transaction list in user dashboard
 * - Financial reporting and analytics
 * - Receipt management
 * - Refund tracking
 *
 * **Payment Status Filtering:**
 * - PENDING: Payments awaiting processing
 * - COMPLETED: Successfully processed payments
 * - FAILED: Declined or failed payments
 * - REFUNDED: Payments that have been refunded
 *
 * **Payment Data Includes:**
 * - Transaction amounts and fees
 * - Payment method used
 * - Stripe transaction IDs
 * - Associated order information
 * - Payment timestamps
 * - Status and metadata
 *
 * **Caching Strategy:**
 * - Stale time: 1 minute (payment status can change)
 * - Cache time: 5 minutes
 * - Query keys include status filter for proper cache separation
 *
 * **Cache Invalidation:**
 * This query is invalidated by:
 * - useConfirmOrder (when new payment is created)
 * - Payment webhook handlers (when Stripe updates occur)
 * - Refund operations (when payment status changes)
 *
 * @param {UsePaymentsOptions} [options={}] - Hook configuration options
 * @param {PaymentStatus} [options.status] - Filter by specific payment status
 * @param {Object} [options.queryOptions] - Additional React Query configuration
 *
 * @returns {UseQueryResult<Payment[], ApiErrorResponse>} React Query result object containing:
 * - data: Array of payment objects matching filter criteria
 * - isLoading: Loading state indicator
 * - isError: Error state indicator
 * - error: Error details if request failed
 * - refetch: Function to manually refetch payments
 *
 * @example
 * // Basic usage - fetch all user payments
 * ```tsx
 * const { data: payments, isLoading } = usePayments();
 *
 * return (
 *   <div>
 *     <h2>Payment History</h2>
 *     {payments?.map(payment => (
 *       <PaymentCard
 *         key={payment.id}
 *         payment={payment}
 *       />
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @example
 * // Filtered usage - fetch only completed payments
 * ```tsx
 * const { data: completedPayments } = usePayments({
 *   status: PaymentStatus.COMPLETED
 * });
 *
 * const totalPaid = completedPayments?.reduce(
 *   (sum, payment) => sum + payment.amount,
 *   0
 * );
 *
 * return <div>Total Paid: ${totalPaid.toFixed(2)}</div>;
 * ```
 *
 * @example
 * // With pagination and sorting
 * ```tsx
 * const { data: payments, isLoading } = usePayments({
 *   queryOptions: {
 *     select: (payments) => {
 *       // Sort by date descending
 *       return [...payments].sort(
 *         (a, b) => new Date(b.created_at) - new Date(a.created_at)
 *       );
 *     }
 *   }
 * });
 *
 * const [page, setPage] = useState(0);
 * const pageSize = 10;
 * const paginatedPayments = payments?.slice(
 *   page * pageSize,
 *   (page + 1) * pageSize
 * );
 * ```
 *
 * @example
 * // Financial dashboard with multiple status filters
 * ```tsx
 * const { data: allPayments } = usePayments();
 * const { data: pendingPayments } = usePendingPayments();
 * const { data: failedPayments } = usePayments({
 *   status: PaymentStatus.FAILED
 * });
 *
 * return (
 *   <Dashboard>
 *     <StatCard
 *       title="Total Payments"
 *       value={allPayments?.length}
 *     />
 *     <StatCard
 *       title="Pending"
 *       value={pendingPayments?.length}
 *       color="yellow"
 *     />
 *     <StatCard
 *       title="Failed"
 *       value={failedPayments?.length}
 *       color="red"
 *     />
 *   </Dashboard>
 * );
 * ```
 *
 * @example
 * // Export to CSV functionality
 * ```tsx
 * const { data: payments } = usePayments();
 *
 * const exportToCSV = () => {
 *   const csv = [
 *     'Date,Amount,Status,Order ID',
 *     ...payments.map(p =>
 *       `${p.created_at},${p.amount},${p.status},${p.order_id}`
 *     )
 *   ].join('\n');
 *
 *   const blob = new Blob([csv], { type: 'text/csv' });
 *   const url = window.URL.createObjectURL(blob);
 *   const a = document.createElement('a');
 *   a.href = url;
 *   a.download = 'payments.csv';
 *   a.click();
 * };
 * ```
 *
 * @see {@link usePendingPayments} for convenience hook for pending payments
 * @see {@link useCompletedPayments} for convenience hook for completed payments
 * @see {@link usePayment} for fetching a single payment by ID
 */
export function usePayments(options: UsePaymentsOptions = {}) {
  const { status, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.payments.list({ status }),
    queryFn: () => paymentService.getMy(),
    staleTime: 1 * 60 * 1000, // 1 minute (status can change)
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
}

/**
 * Convenience hook to fetch payments with pending status
 *
 * @description
 * Specialized hook that pre-filters payments to show only those currently
 * being processed. Useful for tracking in-progress transactions and
 * displaying pending payment notifications.
 *
 * This hook is equivalent to calling usePayments({ status: PaymentStatus.PENDING })
 * but provides better type safety and clearer intent.
 *
 * **Use Cases:**
 * - Show pending transaction alerts
 * - Monitor payment processing status
 * - Display "processing" indicators
 * - Track asynchronous payment methods
 *
 * @param {Object} [queryOptions] - Additional React Query configuration options
 *
 * @returns {UseQueryResult<Payment[], ApiErrorResponse>} React Query result with pending payments
 *
 * @example
 * // Display pending payment notification
 * ```tsx
 * const { data: pendingPayments, isLoading } = usePendingPayments();
 *
 * if (isLoading) return null;
 *
 * if (pendingPayments && pendingPayments.length > 0) {
 *   return (
 *     <Alert type="info">
 *       {pendingPayments.length} payment(s) are being processed
 *     </Alert>
 *   );
 * }
 * ```
 *
 * @example
 * // Poll for pending payment updates
 * ```tsx
 * const { data: pendingPayments } = usePendingPayments({
 *   refetchInterval: 5000, // Check every 5 seconds
 *   enabled: hasRecentCheckout
 * });
 *
 * useEffect(() => {
 *   if (pendingPayments?.length === 0 && previousLength > 0) {
 *     toast.success('Payment processed successfully!');
 *   }
 * }, [pendingPayments?.length]);
 * ```
 *
 * @see {@link usePayments} for the base payments hook
 * @see {@link useCompletedPayments} for completed payments
 */
export function usePendingPayments(
  queryOptions?: Omit<UseQueryOptions<Payment[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return usePayments({
    status: PaymentStatus.PENDING,
    queryOptions,
  });
}

/**
 * Convenience hook to fetch successfully completed payments
 *
 * @description
 * Specialized hook that pre-filters payments to show only those that have
 * been successfully processed. Essential for payment history, receipt
 * generation, and financial reporting.
 *
 * This hook is equivalent to calling usePayments({ status: PaymentStatus.COMPLETED })
 * but provides better type safety and clearer intent.
 *
 * **Use Cases:**
 * - Payment history displays
 * - Receipt/invoice lists
 * - Revenue calculations
 * - Financial reporting
 * - Tax documentation
 *
 * @param {Object} [queryOptions] - Additional React Query configuration options
 *
 * @returns {UseQueryResult<Payment[], ApiErrorResponse>} React Query result with completed payments
 *
 * @example
 * // Display payment history with receipts
 * ```tsx
 * const { data: completedPayments, isLoading } = useCompletedPayments();
 * const { mutate: downloadInvoice } = useDownloadInvoice();
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     <h2>Payment History</h2>
 *     {completedPayments?.map(payment => (
 *       <PaymentRow key={payment.id}>
 *         <PaymentInfo payment={payment} />
 *         <Button onClick={() => downloadInvoice(payment.id)}>
 *           Download Receipt
 *         </Button>
 *       </PaymentRow>
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @example
 * // Calculate total revenue
 * ```tsx
 * const { data: completedPayments } = useCompletedPayments();
 *
 * const stats = useMemo(() => {
 *   const total = completedPayments?.reduce(
 *     (sum, p) => sum + p.amount,
 *     0
 *   ) || 0;
 *
 *   const thisMonth = completedPayments?.filter(p =>
 *     isThisMonth(new Date(p.created_at))
 *   ).reduce((sum, p) => sum + p.amount, 0) || 0;
 *
 *   return { total, thisMonth };
 * }, [completedPayments]);
 *
 * return (
 *   <div>
 *     <Stat label="Total Spent" value={`$${stats.total}`} />
 *     <Stat label="This Month" value={`$${stats.thisMonth}`} />
 *   </div>
 * );
 * ```
 *
 * @see {@link usePayments} for the base payments hook
 * @see {@link usePendingPayments} for pending payments
 * @see {@link useDownloadInvoice} for downloading receipts
 */
export function useCompletedPayments(
  queryOptions?: Omit<UseQueryOptions<Payment[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return usePayments({
    status: PaymentStatus.COMPLETED,
    queryOptions,
  });
}

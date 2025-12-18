/**
 * @file useOrders Hook
 * @description React Query hooks for fetching user orders with filtering capabilities.
 *
 * This file provides multiple hooks for accessing order lists, including:
 * - useOrders: Fetch all orders or filter by status
 * - usePendingOrders: Convenience hook for pending payment orders
 * - useCompletedOrders: Convenience hook for paid orders
 *
 * @module hooks/orders/useOrders
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import { queryKeys } from '../../constants/query-keys';
import type { Order } from '../../types/order.types';
import { OrderStatus } from '../../types/order.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Options for the useOrders hook
 *
 * @interface UseOrdersOptions
 * @property {OrderStatus} [status] - Filter orders by status (pending, paid, cancelled, refunded)
 * @property {Object} [queryOptions] - Additional React Query options to customize behavior
 */
interface UseOrdersOptions {
  status?: OrderStatus;
  queryOptions?: Omit<
    UseQueryOptions<Order[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch user's orders with optional filtering
 *
 * @description
 * Retrieves a list of orders belonging to the authenticated user. This is the primary
 * hook for displaying order history, tracking purchases, and managing user orders.
 *
 * **Use Cases:**
 * - Order history page
 * - Dashboard order summaries
 * - Pending checkout notifications
 * - Payment tracking
 *
 * **Filtering:**
 * The hook supports filtering by OrderStatus:
 * - PENDING_PAYMENT: Orders awaiting payment
 * - PAID: Successfully completed orders
 * - CANCELLED: User-cancelled orders
 * - REFUNDED: Orders that have been refunded
 *
 * **Caching Strategy:**
 * - Stale time: 1 minute (order statuses can change frequently)
 * - Cache time: 5 minutes
 * - Query keys include status filter for proper cache separation
 *
 * **Cache Invalidation:**
 * This query is invalidated by:
 * - useCreateOrder (when new order is created)
 * - useCheckoutOrder (when order status changes)
 * - useConfirmOrder (when payment is confirmed)
 *
 * @param {UseOrdersOptions} [options={}] - Hook configuration options
 * @param {OrderStatus} [options.status] - Filter by specific order status
 * @param {Object} [options.queryOptions] - Additional React Query configuration
 *
 * @returns {UseQueryResult<Order[], ApiErrorResponse>} React Query result object containing:
 * - data: Array of order objects matching the filter criteria
 * - isLoading: Loading state indicator
 * - isError: Error state indicator
 * - error: Error details if request failed
 * - refetch: Function to manually refetch orders
 *
 * @example
 * // Basic usage - fetch all user orders
 * ```tsx
 * const { data: orders, isLoading } = useOrders();
 *
 * return (
 *   <div>
 *     <h2>Order History</h2>
 *     {orders?.map(order => (
 *       <OrderCard key={order.id} order={order} />
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @example
 * // Filtered usage - fetch only pending orders
 * ```tsx
 * const { data: pendingOrders } = useOrders({
 *   status: OrderStatus.PENDING_PAYMENT
 * });
 *
 * return (
 *   <Alert>
 *     You have {pendingOrders?.length || 0} pending orders
 *   </Alert>
 * );
 * ```
 *
 * @example
 * // With custom options and error handling
 * ```tsx
 * const { data: orders, isLoading, error, refetch } = useOrders({
 *   queryOptions: {
 *     refetchInterval: 30000, // Refetch every 30 seconds
 *     onError: (err) => {
 *       console.error('Failed to fetch orders:', err);
 *     }
 *   }
 * });
 * ```
 *
 * @see {@link usePendingOrders} for convenience hook for pending orders
 * @see {@link useCompletedOrders} for convenience hook for completed orders
 * @see {@link useOrder} for fetching a single order by ID
 */
export function useOrders(options: UseOrdersOptions = {}) {
  const { status, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.orders.list({ status }),
    queryFn: () => orderService.getMy(),
    staleTime: 1 * 60 * 1000, // 1 minute (order status can change)
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
}

/**
 * Convenience hook to fetch orders with pending payment status
 *
 * @description
 * Specialized hook that pre-filters orders to show only those awaiting payment.
 * This is useful for:
 * - Displaying incomplete checkouts
 * - Sending payment reminders
 * - Cart recovery workflows
 * - Dashboard notifications
 *
 * This hook is equivalent to calling useOrders({ status: OrderStatus.PENDING_PAYMENT })
 * but provides better type safety and clearer intent.
 *
 * @param {Object} [queryOptions] - Additional React Query configuration options
 *
 * @returns {UseQueryResult<Order[], ApiErrorResponse>} React Query result with pending orders
 *
 * @example
 * // Display pending orders notification
 * ```tsx
 * const { data: pendingOrders, isLoading } = usePendingOrders();
 *
 * if (isLoading) return null;
 *
 * if (pendingOrders && pendingOrders.length > 0) {
 *   return (
 *     <Notification>
 *       You have {pendingOrders.length} pending order(s)
 *       <Link to="/checkout">Complete payment</Link>
 *     </Notification>
 *   );
 * }
 * ```
 *
 * @example
 * // Auto-redirect to checkout if pending orders exist
 * ```tsx
 * const { data: pendingOrders } = usePendingOrders();
 * const navigate = useNavigate();
 *
 * useEffect(() => {
 *   if (pendingOrders && pendingOrders.length > 0) {
 *     navigate(`/checkout/${pendingOrders[0].id}`);
 *   }
 * }, [pendingOrders, navigate]);
 * ```
 *
 * @see {@link useOrders} for the base orders hook
 * @see {@link useCompletedOrders} for completed orders
 */
export function usePendingOrders(
  queryOptions?: Omit<UseQueryOptions<Order[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useOrders({
    status: OrderStatus.PENDING_PAYMENT,
    queryOptions,
  });
}

/**
 * Convenience hook to fetch successfully paid orders
 *
 * @description
 * Specialized hook that pre-filters orders to show only those that have been paid.
 * This is useful for:
 * - Order history displays
 * - Purchase confirmation pages
 * - Revenue reporting
 * - Enrollment activation
 *
 * This hook is equivalent to calling useOrders({ status: OrderStatus.PAID })
 * but provides better type safety and clearer intent.
 *
 * @param {Object} [queryOptions] - Additional React Query configuration options
 *
 * @returns {UseQueryResult<Order[], ApiErrorResponse>} React Query result with completed orders
 *
 * @example
 * // Display completed order history
 * ```tsx
 * const { data: completedOrders, isLoading } = useCompletedOrders();
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     <h2>Order History</h2>
 *     {completedOrders?.map(order => (
 *       <CompletedOrderCard
 *         key={order.id}
 *         order={order}
 *         showInvoice={true}
 *       />
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @example
 * // Calculate total spent
 * ```tsx
 * const { data: completedOrders } = useCompletedOrders();
 *
 * const totalSpent = useMemo(() => {
 *   return completedOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
 * }, [completedOrders]);
 *
 * return <div>Total Spent: ${totalSpent.toFixed(2)}</div>;
 * ```
 *
 * @see {@link useOrders} for the base orders hook
 * @see {@link usePendingOrders} for pending orders
 */
export function useCompletedOrders(
  queryOptions?: Omit<UseQueryOptions<Order[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useOrders({
    status: OrderStatus.PAID,
    queryOptions,
  });
}

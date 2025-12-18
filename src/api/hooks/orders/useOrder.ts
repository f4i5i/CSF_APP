/**
 * @file useOrder Hook
 * @description React Query hook for fetching single order details.
 *
 * This hook provides access to complete order information including line items,
 * payment status, pricing details, and associated enrollments. It's designed to
 * work within the checkout flow and order management system.
 *
 * @module hooks/orders/useOrder
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import { queryKeys } from '../../constants/query-keys';
import type { Order, OrderId } from '../../types/order.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Options for the useOrder hook
 *
 * @interface UseOrderOptions
 * @property {OrderId} orderId - The unique identifier of the order to fetch
 * @property {Object} [queryOptions] - Additional React Query options to customize behavior
 */
interface UseOrderOptions {
  orderId: OrderId;
  queryOptions?: Omit<
    UseQueryOptions<Order, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch single order details
 *
 * @description
 * Retrieves comprehensive order information by ID. This hook is commonly used in:
 * - Order confirmation pages
 * - Order history detail views
 * - Payment verification flows
 * - Admin order management
 *
 * **Order Data Includes:**
 * - Line items with associated enrollment details
 * - Payment status (pending, paid, failed, refunded)
 * - Pricing breakdown (subtotal, discounts, tax, total)
 * - Order metadata (created_at, updated_at, user_id)
 * - Associated payment information
 *
 * **Caching Strategy:**
 * - Stale time: 1 minute (orders can change status quickly)
 * - Cache time: 5 minutes (balance between freshness and performance)
 * - Auto-disabled when orderId is not provided
 *
 * **Cache Invalidation:**
 * This query is invalidated by:
 * - useCreateOrder (when new order is created)
 * - useCheckoutOrder (when order is checked out)
 * - useConfirmOrder (when payment is confirmed)
 *
 * @param {UseOrderOptions} options - Hook configuration options
 * @param {OrderId} options.orderId - The order ID to fetch
 * @param {Object} [options.queryOptions] - Additional React Query configuration
 *
 * @returns {UseQueryResult<Order, ApiErrorResponse>} React Query result object containing:
 * - data: The order object with all details
 * - isLoading: Loading state indicator
 * - isError: Error state indicator
 * - error: Error details if request failed
 * - refetch: Function to manually refetch the order
 *
 * @example
 * // Basic usage - fetch order details
 * ```tsx
 * const { data: order, isLoading, error } = useOrder({
 *   orderId: 'order_123'
 * });
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     <h2>Order #{order.id}</h2>
 *     <p>Status: {order.status}</p>
 *     <p>Total: ${order.total_amount}</p>
 *   </div>
 * );
 * ```
 *
 * @example
 * // With custom options - disable automatic refetch
 * ```tsx
 * const { data: order } = useOrder({
 *   orderId: orderId,
 *   queryOptions: {
 *     refetchOnWindowFocus: false,
 *     retry: 3
 *   }
 * });
 * ```
 *
 * @example
 * // Conditional fetching based on URL parameter
 * ```tsx
 * const { orderId } = useParams();
 * const { data: order, isLoading } = useOrder({
 *   orderId: orderId || '',
 *   queryOptions: {
 *     enabled: !!orderId // Only fetch when orderId exists
 *   }
 * });
 * ```
 *
 * @see {@link useOrders} for fetching multiple orders
 * @see {@link useCreateOrder} for creating new orders
 * @see {@link useCheckoutOrder} for order checkout process
 */
export function useOrder({ orderId, queryOptions }: UseOrderOptions) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderService.getById(orderId),
    staleTime: 1 * 60 * 1000, // 1 minute (status can change)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!orderId,
    ...queryOptions,
  });
}

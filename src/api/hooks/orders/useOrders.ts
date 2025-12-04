/**
 * useOrders Hook
 * React Query hook to fetch orders
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import { queryKeys } from '../../constants/query-keys';
import type { Order } from '../../types/order.types';
import { OrderStatus } from '../../types/order.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseOrdersOptions {
  status?: OrderStatus;
  queryOptions?: Omit<
    UseQueryOptions<Order[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch user's orders
 *
 * @example
 * ```tsx
 * const { data: orders, isLoading } = useOrders();
 * ```
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
 * Hook to fetch pending orders
 *
 * @example
 * ```tsx
 * const { data: pendingOrders } = usePendingOrders();
 * ```
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
 * Hook to fetch completed orders
 *
 * @example
 * ```tsx
 * const { data: completedOrders } = useCompletedOrders();
 * ```
 */
export function useCompletedOrders(
  queryOptions?: Omit<UseQueryOptions<Order[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useOrders({
    status: OrderStatus.PAID,
    queryOptions,
  });
}

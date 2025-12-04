/**
 * useOrder Hook
 * React Query hook to fetch single order details
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import { queryKeys } from '../../constants/query-keys';
import type { Order, OrderId } from '../../types/order.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
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
 * Includes:
 * - Order line items (enrollments)
 * - Payment status
 * - Total amounts (base, discount, final)
 * - Timestamps
 *
 * @example
 * ```tsx
 * const { data: order, isLoading } = useOrder({
 *   orderId: '123'
 * });
 * ```
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

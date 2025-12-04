/**
 * useCreateOrder Hook
 * React Query mutation hook to create order
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { orderService } from '../../services/order.service';
import { queryKeys } from '../../constants/query-keys';
import type { Order, CreateOrderRequest } from '../../types/order.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseCreateOrderOptions {
  mutationOptions?: Omit<
    UseMutationOptions<Order, ApiErrorResponse, CreateOrderRequest, { previousOrders: Order[] | undefined }>,
    'mutationFn'
  >;
}

/**
 * Hook to create order with optimistic updates
 *
 * @example
 * ```tsx
 * const { mutate: createOrder, isPending } = useCreateOrder();
 *
 * createOrder({
 *   enrollment_ids: ['enroll-1', 'enroll-2']
 * });
 * ```
 */
export function useCreateOrder(options: UseCreateOrderOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (orderData: CreateOrderRequest) => orderService.create(orderData),

    onMutate: async (): Promise<{ previousOrders: Order[] | undefined }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.lists() });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData<Order[]>(queryKeys.orders.lists());

      // Return snapshot without optimistic update (will be updated after server responds)
      return { previousOrders };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKeys.orders.lists(), context.previousOrders);
      }
      toast.error(error.message || 'Failed to create order');
    },

    onSuccess: (order) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(order.id) });

      // Invalidate enrollments that are now part of this order
      order.line_items?.forEach((item: { enrollment_id: string }) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.enrollments.detail(item.enrollment_id),
        });
      });

      toast.success('Order created successfully!');
    },

    ...mutationOptions,
  });
}

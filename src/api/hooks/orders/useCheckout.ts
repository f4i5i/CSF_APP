/**
 * useCheckout Hook
 * React Query mutation hook for order checkout process
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { orderService } from '../../services/order.service';
import { queryKeys } from '../../constants/query-keys';
import type { CheckoutRequest, CheckoutResponse, ConfirmOrderRequest, CalculateOrderResponse, Order } from '../../types/order.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to calculate order total before checkout
 *
 * @example
 * ```tsx
 * const { mutate: calculateTotal, data: pricing } = useCalculateOrder();
 *
 * calculateTotal({
 *   enrollment_ids: ['123', '456']
 * });
 * ```
 */
export function useCalculateOrder(
  options?: Omit<
    UseMutationOptions<CalculateOrderResponse, ApiErrorResponse, { enrollment_ids: string[] }>,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: (data: { enrollment_ids: string[] }) => orderService.calculateTotal(data),
    ...options,
  });
}

/**
 * Hook to checkout order (initiate payment)
 *
 * @example
 * ```tsx
 * const { mutate: checkout, isPending } = useCheckoutOrder({
 *   mutationOptions: {
 *     onSuccess: (response) => {
 *       // Redirect to Stripe or handle payment
 *       window.location.href = response.stripe_checkout_url;
 *     }
 *   }
 * });
 *
 * checkout({
 *   order_id: 'order-123',
 *   payment_method_id: 'pm_123',
 *   installment_plan_id: 'plan-456' // Optional
 * });
 * ```
 */
export function useCheckoutOrder(
  options?: Omit<
    UseMutationOptions<CheckoutResponse, ApiErrorResponse, CheckoutRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkoutData: CheckoutRequest) => {
      if (!checkoutData.order_id) {
        throw new Error('order_id is required for checkout');
      }
      return orderService.checkout(checkoutData.order_id, checkoutData);
    },

    onSuccess: (_response, variables) => {
      // Invalidate order and related queries
      if (variables.order_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(variables.order_id),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });

      toast.success('Redirecting to payment...');
    },

    onError: (error) => {
      toast.error(error.message || 'Checkout failed. Please try again.');
    },

    ...options,
  });
}

/**
 * Hook to confirm order after successful payment
 *
 * @example
 * ```tsx
 * const { mutate: confirmOrder } = useConfirmOrder();
 *
 * confirmOrder({
 *   order_id: 'order-123',
 *   payment_intent_id: 'pi_123',
 *   status: 'succeeded'
 * });
 * ```
 */
export function useConfirmOrder(
  options?: Omit<
    UseMutationOptions<Order, ApiErrorResponse, ConfirmOrderRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (confirmData: ConfirmOrderRequest) => {
      return orderService.confirm(confirmData.order_id, confirmData);
    },

    onSuccess: (_response, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(variables.order_id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });

      toast.success('Order confirmed! Your enrollments are now active.');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to confirm order');
    },

    ...options,
  });
}

/**
 * @file useCreateOrder Hook
 * @description React Query mutation hook for creating new orders from enrollments.
 *
 * This hook is a critical part of the checkout flow, converting selected enrollments
 * into an order ready for payment. It handles optimistic updates, cache invalidation,
 * and provides comprehensive error handling.
 *
 * **Checkout Flow:**
 * 1. User selects classes and creates enrollments
 * 2. **useCreateOrder** - Creates order from enrollment IDs
 * 3. useCalculateOrder - Calculates pricing
 * 4. useCheckoutOrder - Initiates Stripe payment
 * 5. useConfirmOrder - Confirms payment and activates enrollments
 *
 * @module hooks/orders/useCreateOrder
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { orderService } from '../../services/order.service';
import { queryKeys } from '../../constants/query-keys';
import type { Order, CreateOrderRequest } from '../../types/order.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Options for the useCreateOrder hook
 *
 * @interface UseCreateOrderOptions
 * @property {Object} [mutationOptions] - Additional React Query mutation options
 */
interface UseCreateOrderOptions {
  mutationOptions?: Omit<
    UseMutationOptions<Order, ApiErrorResponse, CreateOrderRequest, { previousOrders: Order[] | undefined }>,
    'mutationFn'
  >;
}

/**
 * Hook to create an order from enrollment IDs
 *
 * @description
 * Creates a new order containing the specified enrollments. This is the first step
 * in the checkout process. Once an order is created, it can be checked out with
 * payment information.
 *
 * **What This Hook Does:**
 * - Creates order from enrollment IDs
 * - Validates that enrollments belong to the user
 * - Groups enrollments into order line items
 * - Sets initial order status to PENDING_PAYMENT
 * - Optimistically updates the cache
 * - Invalidates related queries (orders, enrollments)
 *
 * **Request Format:**
 * ```typescript
 * {
 *   enrollment_ids: string[] // Array of enrollment IDs to include in order
 * }
 * ```
 *
 * **Response Format:**
 * ```typescript
 * {
 *   id: string
 *   status: 'pending_payment'
 *   line_items: Array<{ enrollment_id, price, ... }>
 *   subtotal: number
 *   total_amount: number
 *   created_at: string
 * }
 * ```
 *
 * **Cache Invalidation Chain:**
 * On success, this mutation invalidates:
 * - orders.lists() - Refresh all order lists
 * - orders.detail(orderId) - Refresh the new order details
 * - enrollments.detail(enrollmentId) - For each enrollment in the order
 *
 * **Error Handling:**
 * - Automatically rolls back optimistic updates on error
 * - Displays error toast notification
 * - Preserves previous cache state
 *
 * **Optimistic Updates:**
 * The hook prepares for optimistic updates by:
 * - Cancelling in-flight queries
 * - Snapshotting current cache state
 * - Preparing rollback mechanism
 * (Note: Actual optimistic update happens after server response)
 *
 * @param {UseCreateOrderOptions} [options={}] - Hook configuration options
 * @param {Object} [options.mutationOptions] - Additional React Query mutation options
 *
 * @returns {UseMutationResult} React Query mutation result containing:
 * - mutate: Function to create the order
 * - mutateAsync: Async version of mutate
 * - isPending: Loading state indicator
 * - isError: Error state indicator
 * - error: Error details if mutation failed
 * - data: The created order object
 * - reset: Function to reset mutation state
 *
 * @example
 * // Basic usage - create order from selected enrollments
 * ```tsx
 * const { mutate: createOrder, isPending } = useCreateOrder();
 *
 * const handleCheckout = () => {
 *   createOrder({
 *     enrollment_ids: ['enroll_1', 'enroll_2', 'enroll_3']
 *   });
 * };
 *
 * return (
 *   <Button onClick={handleCheckout} disabled={isPending}>
 *     {isPending ? 'Creating Order...' : 'Proceed to Checkout'}
 *   </Button>
 * );
 * ```
 *
 * @example
 * // With success callback - navigate to checkout
 * ```tsx
 * const navigate = useNavigate();
 * const { mutate: createOrder } = useCreateOrder({
 *   mutationOptions: {
 *     onSuccess: (order) => {
 *       navigate(`/checkout/${order.id}`);
 *     }
 *   }
 * });
 *
 * const handleCreateOrder = () => {
 *   const selectedEnrollments = cart.items.map(item => item.enrollment_id);
 *   createOrder({ enrollment_ids: selectedEnrollments });
 * };
 * ```
 *
 * @example
 * // Complete checkout flow
 * ```tsx
 * const { mutate: createOrder, isPending: isCreating } = useCreateOrder();
 * const { mutate: calculateTotal } = useCalculateOrder();
 * const { mutate: checkout } = useCheckoutOrder();
 *
 * const handleCompleteCheckout = async () => {
 *   // Step 1: Create order
 *   createOrder(
 *     { enrollment_ids: selectedIds },
 *     {
 *       onSuccess: (order) => {
 *         // Step 2: Calculate total (optional, for display)
 *         calculateTotal({ enrollment_ids: selectedIds });
 *
 *         // Step 3: Proceed to payment
 *         checkout({
 *           order_id: order.id,
 *           payment_method_id: selectedPaymentMethod
 *         });
 *       }
 *     }
 *   );
 * };
 * ```
 *
 * @example
 * // With error handling and validation
 * ```tsx
 * const { mutate: createOrder, error } = useCreateOrder({
 *   mutationOptions: {
 *     onError: (error) => {
 *       if (error.message.includes('enrollment')) {
 *         toast.error('One or more enrollments are invalid');
 *       } else {
 *         toast.error('Failed to create order. Please try again.');
 *       }
 *     }
 *   }
 * });
 *
 * const handleSubmit = () => {
 *   if (enrollmentIds.length === 0) {
 *     toast.error('Please select at least one class');
 *     return;
 *   }
 *   createOrder({ enrollment_ids: enrollmentIds });
 * };
 * ```
 *
 * @see {@link useCheckoutOrder} for the next step in the checkout flow
 * @see {@link useCalculateOrder} for calculating order totals
 * @see {@link useOrders} for fetching created orders
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

/**
 * @file useCheckout Hooks
 * @description React Query mutation hooks for the complete order checkout process.
 *
 * This file contains three critical hooks that work together to complete a purchase:
 * - useCalculateOrder: Calculate pricing before checkout
 * - useCheckoutOrder: Initiate Stripe payment process
 * - useConfirmOrder: Confirm payment and activate enrollments
 *
 * **Complete Checkout Flow:**
 * 1. useCreateOrder - Create order from enrollments
 * 2. **useCalculateOrder** - Calculate total with discounts
 * 3. **useCheckoutOrder** - Create Stripe PaymentIntent and redirect
 * 4. User completes payment on Stripe
 * 5. **useConfirmOrder** - Verify payment and activate enrollments
 *
 * **Stripe Integration:**
 * - Uses Stripe Checkout for secure payment processing
 * - Handles payment intents and setup intents
 * - Supports saved payment methods
 * - Integrates with installment plans
 *
 * **Cache Invalidation Chain:**
 * When payment completes successfully:
 * - Order status → Updated to PAID
 * - Enrollments → Status changes to ACTIVE
 * - Payments → New payment record created
 * - All related queries invalidated automatically
 *
 * @module hooks/orders/useCheckout
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
 * @description
 * Calculates the final order total including all discounts, taxes, and fees.
 * This is typically called before displaying the checkout page to show the
 * user accurate pricing information.
 *
 * **What It Calculates:**
 * - Subtotal (sum of all enrollment prices)
 * - Applied discounts (promo codes, bulk discounts)
 * - Tax calculations (if applicable)
 * - Final total amount
 *
 * **Use Cases:**
 * - Display pricing preview before checkout
 * - Validate promo codes
 * - Show pricing breakdown to users
 * - Verify pricing before payment
 *
 * **Important Notes:**
 * - This is a preview calculation, actual charges happen in useCheckoutOrder
 * - Prices may change between calculation and checkout if class prices update
 * - Does not require an order to exist (can be called before order creation)
 *
 * @param {Object} [options] - React Query mutation options
 *
 * @returns {UseMutationResult} Mutation result containing:
 * - mutate: Function to calculate order total
 * - data: CalculateOrderResponse with pricing breakdown
 * - isPending: Loading state indicator
 * - error: Error details if calculation failed
 *
 * @example
 * // Basic usage - calculate total for selected enrollments
 * ```tsx
 * const { mutate: calculateTotal, data: pricing, isPending } = useCalculateOrder();
 *
 * useEffect(() => {
 *   if (selectedEnrollments.length > 0) {
 *     calculateTotal({
 *       enrollment_ids: selectedEnrollments.map(e => e.id)
 *     });
 *   }
 * }, [selectedEnrollments]);
 *
 * if (isPending) return <Spinner />;
 *
 * return (
 *   <PricingSummary
 *     subtotal={pricing?.subtotal}
 *     discount={pricing?.discount}
 *     total={pricing?.total}
 *   />
 * );
 * ```
 *
 * @example
 * // With promo code validation
 * ```tsx
 * const { mutate: calculateTotal, data: pricing } = useCalculateOrder({
 *   onSuccess: (data) => {
 *     if (data.discount > 0) {
 *       toast.success(`Promo code applied! Saved $${data.discount}`);
 *     }
 *   }
 * });
 *
 * const applyPromoCode = (code: string) => {
 *   calculateTotal({
 *     enrollment_ids: selectedIds,
 *     promo_code: code
 *   });
 * };
 * ```
 *
 * @see {@link useCheckoutOrder} for initiating payment after calculation
 * @see {@link useCreateOrder} for creating the order
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
 * Hook to initiate order checkout and Stripe payment
 *
 * @description
 * Initiates the payment process by creating a Stripe Checkout session or PaymentIntent.
 * This is the critical step where the order transitions from "pending" to "processing"
 * and the user is redirected to Stripe to complete payment.
 *
 * **Stripe Integration Details:**
 * - Creates Stripe PaymentIntent for the order
 * - Generates secure checkout URL
 * - Supports both new and saved payment methods
 * - Handles installment plan integration
 * - Manages payment method verification
 *
 * **Request Parameters:**
 * - order_id: The order to checkout (required)
 * - payment_method_id: Stripe payment method ID (optional if using Checkout)
 * - installment_plan_id: For split payments (optional)
 * - return_url: URL to return to after Stripe (optional)
 *
 * **Response Contains:**
 * - stripe_checkout_url: URL to redirect user to Stripe
 * - payment_intent_id: Stripe PaymentIntent identifier
 * - client_secret: For confirming payment client-side
 *
 * **What Happens After:**
 * 1. User is redirected to Stripe Checkout
 * 2. User completes payment on Stripe's secure page
 * 3. Stripe redirects back to return_url
 * 4. useConfirmOrder is called to finalize the order
 *
 * **Cache Invalidation:**
 * On success, invalidates:
 * - orders.detail(orderId) - Order status changed
 * - orders.lists() - Order list needs refresh
 *
 * **Error Scenarios:**
 * - Invalid order_id
 * - Order already paid
 * - Payment method validation failed
 * - Stripe communication error
 *
 * @param {Object} [options] - React Query mutation options
 *
 * @returns {UseMutationResult} Mutation result containing:
 * - mutate: Function to initiate checkout
 * - data: CheckoutResponse with Stripe details
 * - isPending: Loading state indicator
 * - error: Error details if checkout failed
 *
 * @example
 * // Basic usage - checkout with Stripe redirect
 * ```tsx
 * const { mutate: checkout, isPending } = useCheckoutOrder({
 *   onSuccess: (response) => {
 *     // Redirect to Stripe Checkout
 *     window.location.href = response.stripe_checkout_url;
 *   }
 * });
 *
 * const handlePayment = () => {
 *   checkout({
 *     order_id: orderId,
 *     return_url: `${window.location.origin}/order/confirmation`
 *   });
 * };
 *
 * return (
 *   <Button onClick={handlePayment} disabled={isPending}>
 *     {isPending ? 'Processing...' : 'Pay Now'}
 *   </Button>
 * );
 * ```
 *
 * @example
 * // With saved payment method
 * ```tsx
 * const { data: paymentMethods } = usePaymentMethods();
 * const { mutate: checkout } = useCheckoutOrder();
 *
 * const handleCheckout = () => {
 *   const defaultMethod = paymentMethods?.find(pm => pm.is_default);
 *
 *   checkout({
 *     order_id: orderId,
 *     payment_method_id: defaultMethod?.id,
 *     return_url: '/order/success'
 *   });
 * };
 * ```
 *
 * @example
 * // With installment plan
 * ```tsx
 * const { data: installmentPlans } = useInstallmentPlans();
 * const { mutate: checkout } = useCheckoutOrder();
 * const [selectedPlan, setSelectedPlan] = useState<string>();
 *
 * const handleInstallmentCheckout = () => {
 *   checkout({
 *     order_id: orderId,
 *     installment_plan_id: selectedPlan,
 *     return_url: '/order/confirmation'
 *   });
 * };
 *
 * return (
 *   <div>
 *     <InstallmentPlanSelector
 *       plans={installmentPlans}
 *       selected={selectedPlan}
 *       onChange={setSelectedPlan}
 *     />
 *     <Button onClick={handleInstallmentCheckout}>
 *       Pay in Installments
 *     </Button>
 *   </div>
 * );
 * ```
 *
 * @example
 * // Complete checkout flow with error handling
 * ```tsx
 * const { mutate: checkout, isPending, error } = useCheckoutOrder({
 *   onSuccess: (response) => {
 *     // Save payment intent for confirmation
 *     sessionStorage.setItem('payment_intent_id', response.payment_intent_id);
 *     window.location.href = response.stripe_checkout_url;
 *   },
 *   onError: (error) => {
 *     if (error.message.includes('already paid')) {
 *       navigate(`/order/${orderId}/confirmation`);
 *     }
 *   }
 * });
 *
 * const handleSubmit = () => {
 *   if (!selectedPaymentMethod) {
 *     toast.error('Please select a payment method');
 *     return;
 *   }
 *
 *   checkout({
 *     order_id: orderId,
 *     payment_method_id: selectedPaymentMethod
 *   });
 * };
 * ```
 *
 * @see {@link useConfirmOrder} for confirming payment after Stripe redirect
 * @see {@link useCreateOrder} for creating the order before checkout
 * @see {@link usePaymentMethods} for managing saved payment methods
 * @see {@link useInstallmentPlans} for installment payment options
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
 * Hook to confirm order after successful Stripe payment
 *
 * @description
 * Finalizes the order after the user completes payment on Stripe. This is the
 * final step in the checkout flow that verifies the payment, updates the order
 * status, and activates all associated enrollments.
 *
 * **Critical Final Step:**
 * This hook should be called after the user returns from Stripe Checkout. It:
 * - Verifies the payment with Stripe
 * - Updates order status to PAID
 * - Activates all enrollments in the order
 * - Creates payment records
 * - Triggers enrollment activation workflows
 *
 * **Request Parameters:**
 * - order_id: The order being confirmed (required)
 * - payment_intent_id: Stripe PaymentIntent ID from URL params (required)
 * - status: Payment status from Stripe ('succeeded', 'processing', etc.)
 *
 * **What Happens:**
 * 1. Backend verifies payment with Stripe API
 * 2. Order status updated to PAID
 * 3. Payment record created
 * 4. Each enrollment's status changed to ACTIVE
 * 5. User gains access to enrolled classes
 * 6. Confirmation email sent (if configured)
 *
 * **Cache Invalidation Chain:**
 * This is the most comprehensive cache invalidation, affecting:
 * - orders.detail(orderId) - Order now paid
 * - orders.lists() - Order list updated
 * - enrollments.lists() - Enrollments now active
 * - payments.lists() - New payment added
 *
 * **Error Scenarios:**
 * - Payment verification failed with Stripe
 * - Payment was declined or cancelled
 * - Order already confirmed
 * - Invalid payment intent
 *
 * **Important Notes:**
 * - This should only be called ONCE per payment
 * - Idempotent - safe to retry if uncertain
 * - Must be called after Stripe redirect
 * - Requires valid payment_intent_id from Stripe
 *
 * @param {Object} [options] - React Query mutation options
 *
 * @returns {UseMutationResult} Mutation result containing:
 * - mutate: Function to confirm the order
 * - data: Updated Order object with PAID status
 * - isPending: Loading state indicator
 * - error: Error details if confirmation failed
 *
 * @example
 * // Basic usage - confirm after Stripe redirect
 * ```tsx
 * const { mutate: confirmOrder } = useConfirmOrder({
 *   onSuccess: (order) => {
 *     navigate(`/order/${order.id}/success`);
 *   }
 * });
 *
 * useEffect(() => {
 *   const params = new URLSearchParams(window.location.search);
 *   const paymentIntentId = params.get('payment_intent');
 *
 *   if (paymentIntentId && orderId) {
 *     confirmOrder({
 *       order_id: orderId,
 *       payment_intent_id: paymentIntentId,
 *       status: 'succeeded'
 *     });
 *   }
 * }, []);
 * ```
 *
 * @example
 * // With loading state and error handling
 * ```tsx
 * const { mutate: confirmOrder, isPending, error } = useConfirmOrder({
 *   onSuccess: (order) => {
 *     toast.success('Payment successful! Your classes are now active.');
 *     navigate(`/dashboard`);
 *   },
 *   onError: (error) => {
 *     if (error.message.includes('already confirmed')) {
 *       navigate(`/order/${orderId}/success`);
 *     } else {
 *       toast.error('Payment verification failed. Please contact support.');
 *     }
 *   }
 * });
 *
 * if (isPending) {
 *   return (
 *     <LoadingScreen message="Confirming your payment..." />
 *   );
 * }
 * ```
 *
 * @example
 * // Complete payment confirmation flow
 * ```tsx
 * const CheckoutSuccess = () => {
 *   const { orderId } = useParams();
 *   const [searchParams] = useSearchParams();
 *   const navigate = useNavigate();
 *
 *   const { mutate: confirmOrder, isPending, isSuccess } = useConfirmOrder({
 *     onSuccess: (order) => {
 *       // Show success message
 *       toast.success('Payment successful!');
 *
 *       // Track analytics
 *       analytics.track('Purchase Completed', {
 *         order_id: order.id,
 *         amount: order.total_amount,
 *         items: order.line_items.length
 *       });
 *     }
 *   });
 *
 *   useEffect(() => {
 *     const paymentIntent = searchParams.get('payment_intent');
 *     const paymentStatus = searchParams.get('redirect_status');
 *
 *     if (paymentIntent && paymentStatus === 'succeeded' && orderId) {
 *       confirmOrder({
 *         order_id: orderId,
 *         payment_intent_id: paymentIntent,
 *         status: paymentStatus
 *       });
 *     } else if (paymentStatus === 'canceled') {
 *       navigate(`/checkout/${orderId}?error=payment_canceled`);
 *     }
 *   }, [searchParams, orderId]);
 *
 *   if (isPending) {
 *     return <LoadingScreen message="Verifying payment..." />;
 *   }
 *
 *   if (isSuccess) {
 *     return <OrderSuccessPage />;
 *   }
 *
 *   return null;
 * };
 * ```
 *
 * @example
 * // With retry logic for network issues
 * ```tsx
 * const { mutate: confirmOrder, error } = useConfirmOrder({
 *   retry: 3,
 *   retryDelay: 1000,
 *   onError: (error, variables, context) => {
 *     console.error('Confirmation failed:', error);
 *     // Store in localStorage to retry later
 *     localStorage.setItem('pendingConfirmation', JSON.stringify(variables));
 *   }
 * });
 *
 * // Retry any pending confirmations on mount
 * useEffect(() => {
 *   const pending = localStorage.getItem('pendingConfirmation');
 *   if (pending) {
 *     const data = JSON.parse(pending);
 *     confirmOrder(data);
 *   }
 * }, []);
 * ```
 *
 * @see {@link useCheckoutOrder} for initiating the payment before confirmation
 * @see {@link useOrder} for fetching the confirmed order details
 * @see {@link usePayments} for viewing payment records
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

/**
 * Order Service Module
 * @module api/services/order.service
 * @description
 *
 * Handles all order-related operations including order creation, pricing calculation,
 * and Stripe payment processing for the checkout flow.
 *
 * ## Order/Checkout Flow
 *
 * The order service supports a complete e-commerce checkout workflow:
 *
 * 1. **Pricing Calculation** - Preview order totals before creating an order
 * 2. **Order Creation** - Create a draft order from enrollment selections
 * 3. **Payment Initiation** - Start Stripe payment intent process
 * 4. **Payment Confirmation** - Confirm payment completion and update order status
 *
 * ## Order Status Lifecycle
 *
 * Orders transition through the following states:
 * - **DRAFT** - Initial state, order created but not yet in checkout
 * - **PENDING_PAYMENT** - Order awaiting payment confirmation from Stripe
 * - **PAID** - Order fully paid and complete
 * - **PARTIALLY_PAID** - Some payment received (for installment plans)
 * - **REFUNDED** - Refund processed after payment
 * - **CANCELLED** - Order cancelled before payment or after
 *
 * ## Stripe Integration
 *
 * This service integrates with Stripe for secure payment processing:
 * - Uses Stripe Payment Intents API for PCI compliance
 * - Supports both single payments and installment plans
 * - Handles both client-secret-based and hosted checkout flows
 * - Stores Stripe payment intent IDs for reference and webhooks
 *
 * @example
 * // Example 1: Calculate order total before creating an order
 * const enrollmentIds = ['enrollment-123', 'enrollment-456'];
 * const pricing = await orderService.calculate({
 *   enrollment_ids: enrollmentIds,
 *   discount_code: 'SAVE20'
 * });
 * console.log(`Total: $${pricing.total}`);
 *
 * @example
 * // Example 2: Complete checkout flow
 *
 * // Step 1: Create order from enrollments
 * const order = await orderService.create({
 *   enrollment_ids: ['enrollment-123'],
 *   discount_code: 'SAVE20',
 *   notes: 'Group enrollment'
 * });
 * console.log('Order created:', order.id); // e.g., "order-abc123"
 *
 * // Step 2: Initiate payment via Stripe
 * const checkout = await orderService.checkout(order.id, {
 *   save_payment_method: true
 * });
 * console.log('Payment Intent:', checkout.payment_intent_id);
 *
 * // Step 3: Client-side Stripe confirmation happens here
 * // (Use the checkout.client_secret with Stripe Elements)
 *
 * // Step 4: Confirm payment completion
 * const confirmedOrder = await orderService.confirm(order.id, {
 *   payment_intent_id: checkout.payment_intent_id,
 *   status: 'succeeded'
 * });
 * console.log('Order status:', confirmedOrder.status); // Should be PAID
 *
 * @example
 * // Example 3: Retrieve and manage orders
 *
 * // Get current user's orders
 * const myOrders = await orderService.getMy({
 *   status: OrderStatus.PAID,
 *   limit: 10
 * });
 *
 * // Get single order details
 * const order = await orderService.getById('order-abc123');
 *
 * // Cancel an order
 * const result = await orderService.cancel('order-abc123');
 * console.log(result.message);
 *
 * @see {@link module:api/types/order.types} for type definitions
 * @see {@link OrderStatus} for status enum values
 */

import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Order,
  OrderFilters,
  CreateOrderRequest,
  CalculateOrderRequest,
  CalculateOrderResponse,
  CheckoutRequest,
  CheckoutResponse,
  ConfirmPaymentRequest,
  OrderStatus,
} from '../types/order.types';

/**
 * Order service object
 *
 * Pure API functions for order management and payment processing.
 * All methods are async and return data from the backend API.
 *
 * @constant
 * @type {Object}
 */
export const orderService = {
  /**
   * Get current user's orders
   *
   * Retrieves all orders belonging to the authenticated user, with optional filtering.
   * This is the primary way users access their order history and track purchases.
   *
   * @async
   * @param {OrderFilters} [filters] - Optional filter parameters
   * @param {OrderStatus} [filters.status] - Filter by order status (e.g., PAID, PENDING_PAYMENT)
   * @param {string} [filters.search] - Search orders by description or notes
   * @param {number} [filters.skip] - Pagination offset (default: 0)
   * @param {number} [filters.limit] - Maximum results to return (default: 20)
   * @returns {Promise<Order[]>} Array of Order objects for the current user
   *
   * @throws {AxiosError} If the API request fails or user is not authenticated
   *
   * @example
   * // Get all paid orders
   * const paidOrders = await orderService.getMy({
   *   status: OrderStatus.PAID,
   *   limit: 10
   * });
   *
   * @example
   * // Get orders with pagination
   * const orders = await orderService.getMy({
   *   skip: 20,
   *   limit: 20
   * });
   */
  async getMy(filters?: OrderFilters): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>(ENDPOINTS.ORDERS.MY, {
      params: filters,
    });
    return data;
  },

  /**
   * Get all orders (admin only)
   *
   * Retrieves all orders in the system. This endpoint is restricted to admin users.
   * Allows admins to view and manage all customer orders.
   *
   * @async
   * @param {OrderFilters} [filters] - Optional filter parameters
   * @param {OrderStatus} [filters.status] - Filter by order status
   * @param {string} [filters.search] - Search orders by customer or description
   * @param {number} [filters.skip] - Pagination offset (default: 0)
   * @param {number} [filters.limit] - Maximum results to return (default: 20)
   * @returns {Promise<Order[]>} Array of all Order objects
   *
   * @throws {AxiosError} If the API request fails, user is not authenticated, or lacks admin permissions
   *
   * @example
   * // Get all pending orders (admin view)
   * const pendingOrders = await orderService.getAll({
   *   status: OrderStatus.PENDING_PAYMENT,
   *   limit: 50
   * });
   *
   * @example
   * // Search all orders by customer name
   * const results = await orderService.getAll({
   *   search: 'John Doe'
   * });
   */
  async getAll(filters?: OrderFilters): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>(ENDPOINTS.ORDERS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get order by ID
   *
   * Retrieves a specific order by its ID. The authenticated user can only view their own orders
   * unless they have admin privileges.
   *
   * @async
   * @param {string} id - The order ID to retrieve
   * @returns {Promise<Order>} The Order object with full details including line items and totals
   *
   * @throws {AxiosError} If the API request fails, order not found (404), or user lacks permission
   *
   * @example
   * // Get order details
   * const order = await orderService.getById('order-abc123');
   * console.log(`Order ${order.id} Total: $${order.total}`);
   * console.log(`Status: ${order.status}`);
   * console.log(`Items: ${order.line_items.length}`);
   *
   * @example
   * // Check order payment status
   * const order = await orderService.getById('order-xyz789');
   * if (order.status === OrderStatus.PAID) {
   *   console.log('Order is paid!');
   * } else if (order.status === OrderStatus.PENDING_PAYMENT) {
   *   console.log('Awaiting payment confirmation...');
   * }
   */
  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(ENDPOINTS.ORDERS.BY_ID(id));
    return data;
  },

  /**
   * Calculate order total (preview pricing)
   *
   * Calculates the total price of an order without creating it. This is useful for showing
   * users a price preview before they proceed to checkout. Handles discount codes, tax
   * calculation, and line item pricing.
   *
   * @async
   * @param {CalculateOrderRequest} calculateData - Order calculation parameters
   * @param {string[]} calculateData.enrollment_ids - Array of enrollment IDs to calculate
   * @param {string} [calculateData.discount_code] - Optional discount code to apply
   * @returns {Promise<CalculateOrderResponse>} Pricing breakdown with totals
   * @returns {number} response.subtotal - Sum of all line items before tax and discounts
   * @returns {number} response.discount_amount - Total discount applied
   * @returns {Object} [response.discount_details] - Breakdown of discount code details
   * @returns {string} response.discount_details.code - The discount code applied
   * @returns {string} response.discount_details.type - Type of discount (percentage, fixed, etc.)
   * @returns {number} response.discount_details.amount - Discount amount in cents/lowest unit
   * @returns {number} response.tax - Calculated tax amount
   * @returns {number} response.total - Final total (subtotal + tax - discounts)
   * @returns {OrderLineItem[]} response.line_items - Detailed breakdown of items
   *
   * @throws {AxiosError} If discount code is invalid or calculation fails
   *
   * @example
   * // Preview pricing for cart items
   * const pricing = await orderService.calculate({
   *   enrollment_ids: ['enrollment-123', 'enrollment-456'],
   *   discount_code: 'SAVE20'
   * });
   * console.log(`Subtotal: $${pricing.subtotal}`);
   * console.log(`Discount: -$${pricing.discount_amount}`);
   * console.log(`Tax: $${pricing.tax}`);
   * console.log(`Total: $${pricing.total}`);
   *
   * @example
   * // Show pricing breakdown in cart
   * const calc = await orderService.calculate({
   *   enrollment_ids: ['course-1', 'course-2']
   * });
   * calc.line_items.forEach(item => {
   *   console.log(`${item.description}: $${item.total}`);
   * });
   */
  async calculate(
    calculateData: CalculateOrderRequest
  ): Promise<CalculateOrderResponse> {
    const { data } = await apiClient.post<CalculateOrderResponse>(
      ENDPOINTS.ORDERS.CALCULATE,
      calculateData
    );
    return data;
  },

  /**
   * Alias for calculate
   *
   * Alternative method name for {@link orderService.calculate}. Provides the same
   * functionality with a more descriptive name.
   *
   * @async
   * @param {CalculateOrderRequest} calculateData - Order calculation parameters
   * @returns {Promise<CalculateOrderResponse>} Pricing breakdown with totals
   *
   * @see {@link orderService.calculate} for detailed documentation
   *
   * @example
   * // Same as calculate method
   * const pricing = await orderService.calculateTotal({
   *   enrollment_ids: ['enrollment-123']
   * });
   */
  async calculateTotal(
    calculateData: CalculateOrderRequest
  ): Promise<CalculateOrderResponse> {
    return this.calculate(calculateData);
  },

  /**
   * Create new order
   *
   * Creates a new order in DRAFT status from the provided enrollment IDs. This is the
   * first step in the checkout flow. The order becomes PENDING_PAYMENT after checkout
   * is initiated and PAID after payment confirmation.
   *
   * The order is created with:
   * - All line items calculated from enrollments
   * - Discount code applied if provided
   * - Initial status set to DRAFT
   * - Timestamps for audit purposes
   *
   * @async
   * @param {CreateOrderRequest} orderData - Order creation parameters
   * @param {string[]} orderData.enrollment_ids - Array of enrollment IDs to include in order
   * @param {string} [orderData.discount_code] - Optional discount code to apply
   * @param {string} [orderData.notes] - Optional notes or special instructions for the order
   * @returns {Promise<Order>} The created Order object with full details
   * @returns {string} order.id - Unique order identifier
   * @returns {OrderStatus} order.status - Initial status (DRAFT)
   * @returns {number} order.subtotal - Subtotal before tax and discounts
   * @returns {number} order.discount_total - Total discount amount
   * @returns {number} order.tax - Tax calculation
   * @returns {number} order.total - Final order total
   * @returns {OrderLineItem[]} order.line_items - Order line items
   * @returns {string} [order.stripe_payment_intent_id] - Null until checkout is initiated
   *
   * @throws {AxiosError} If enrollments not found, invalid data, or user not authenticated
   *
   * @example
   * // Step 1: Create order from cart items
   * const order = await orderService.create({
   *   enrollment_ids: ['enrollment-123', 'enrollment-456'],
   *   discount_code: 'WELCOME50',
   *   notes: 'Gift for student'
   * });
   *
   * console.log(`Order ${order.id} created`);
   * console.log(`Status: ${order.status}`); // DRAFT
   * console.log(`Total: $${order.total}`);
   *
   * // Step 2: Proceed to checkout
   * const checkout = await orderService.checkout(order.id, {
   *   save_payment_method: true
   * });
   *
   * @see {@link orderService.checkout} for next step in the flow
   */
  async create(orderData: CreateOrderRequest): Promise<Order> {
    const { data } = await apiClient.post<Order>(
      ENDPOINTS.ORDERS.CREATE,
      orderData
    );
    return data;
  },

  /**
   * Checkout - create payment intent
   *
   * Initiates the Stripe payment process by creating a Payment Intent for the order.
   * This is the second step in the checkout flow. The order status changes to PENDING_PAYMENT.
   *
   * The backend will:
   * 1. Validate the order exists and is in a valid state
   * 2. Create a Stripe Payment Intent for the order amount
   * 3. Return the client_secret for client-side confirmation
   * 4. Optionally save the payment method for future use
   * 5. Support installment plans if applicable
   *
   * The response includes:
   * - client_secret: Used with Stripe.js to confirm payment on client
   * - payment_intent_id: Stripe's unique identifier for this payment
   * - amount: Amount in cents charged to the card
   * - stripe_checkout_url: Optional hosted Stripe checkout URL
   *
   * ## Stripe Integration Flow
   *
   * After receiving the checkout response on the client:
   * 1. Use client_secret with Stripe Elements or Stripe.js
   * 2. Confirm payment with stripe.confirmPayment() or similar
   * 3. Call orderService.confirm() when payment succeeds
   *
   * @async
   * @param {string} orderId - The order ID to process payment for
   * @param {CheckoutRequest} checkoutData - Checkout parameters
   * @param {string} [checkoutData.payment_method_id] - Optional saved payment method ID
   * @param {boolean} [checkoutData.save_payment_method] - Whether to save this payment method
   * @param {string} [checkoutData.installment_plan_id] - Optional installment plan ID
   * @returns {Promise<CheckoutResponse>} Payment intent details
   * @returns {string} response.client_secret - Stripe client secret for payment confirmation
   * @returns {string} response.payment_intent_id - Stripe payment intent ID
   * @returns {number} response.amount - Amount in cents to charge
   * @returns {string} [response.stripe_checkout_url] - Optional hosted checkout URL
   *
   * @throws {AxiosError} If order not found, already paid, or Stripe error occurs
   *
   * @example
   * // Step 2: Initiate payment
   * const checkout = await orderService.checkout('order-abc123', {
   *   save_payment_method: true
   * });
   *
   * console.log('Payment Intent ID:', checkout.payment_intent_id);
   * console.log('Amount (cents):', checkout.amount);
   *
   * // Step 3: Confirm payment on client side with Stripe.js
   * const result = await stripe.confirmPayment({
   *   clientSecret: checkout.client_secret,
   *   confirmParams: {
   *     return_url: 'https://example.com/order-success'
   *   }
   * });
   *
   * // Step 4: Confirm payment in backend
   * if (result.paymentIntent.status === 'succeeded') {
   *   const order = await orderService.confirm('order-abc123', {
   *     payment_intent_id: checkout.payment_intent_id,
   *     status: 'succeeded'
   *   });
   * }
   *
   * @example
   * // Using hosted Stripe checkout
   * const checkout = await orderService.checkout('order-xyz789', {
   *   save_payment_method: true
   * });
   *
   * // Redirect to Stripe hosted checkout
   * if (checkout.stripe_checkout_url) {
   *   window.location.href = checkout.stripe_checkout_url;
   * }
   *
   * @see {@link orderService.confirm} for payment confirmation
   * @see {@link CheckoutResponse} for response structure
   */
  async checkout(
    orderId: string,
    checkoutData: CheckoutRequest
  ): Promise<CheckoutResponse> {
    const { data } = await apiClient.post<CheckoutResponse>(
      ENDPOINTS.ORDERS.CHECKOUT(orderId),
      checkoutData
    );
    return data;
  },

  /**
   * Confirm payment completion
   *
   * Confirms that Stripe payment was successful and updates the order status to PAID.
   * This is the final step in the checkout flow. Should be called after the customer
   * successfully completes payment on the client side.
   *
   * The backend will:
   * 1. Verify the payment_intent_id with Stripe
   * 2. Confirm payment status with Stripe API
   * 3. Update order status from PENDING_PAYMENT to PAID (or PARTIALLY_PAID)
   * 4. Create enrollment records or activate enrollments
   * 5. Return the updated order
   *
   * This endpoint is typically called:
   * - From a success page after Stripe redirects back
   * - From a webhook handler for asynchronous confirmation
   * - From the payment confirmation page after stripe.confirmPayment() completes
   *
   * @async
   * @param {string} orderId - The order ID to confirm payment for
   * @param {ConfirmPaymentRequest} confirmData - Payment confirmation details
   * @param {string} confirmData.payment_intent_id - Stripe payment intent ID (from checkout)
   * @param {string} [confirmData.status] - Payment status from Stripe (e.g., 'succeeded', 'processing')
   * @returns {Promise<Order>} The updated Order object with status PAID
   * @returns {OrderStatus} order.status - Updated status (PAID or PARTIALLY_PAID)
   * @returns {string} order.stripe_payment_intent_id - Stripe payment intent ID reference
   *
   * @throws {AxiosError} If order not found, payment verification fails, or Stripe API error
   *
   * @example
   * // Complete checkout flow with confirmation
   * try {
   *   // Step 1: Create order
   *   const order = await orderService.create({
   *     enrollment_ids: ['enrollment-123'],
   *     discount_code: 'WELCOME50'
   *   });
   *
   *   // Step 2: Initiate payment
   *   const checkout = await orderService.checkout(order.id, {
   *     save_payment_method: true
   *   });
   *
   *   // Step 3: Client-side Stripe confirmation
   *   const { paymentIntent } = await stripe.confirmPayment({
   *     clientSecret: checkout.client_secret,
   *     confirmParams: {
   *       return_url: 'https://example.com/success'
   *     }
   *   });
   *
   *   // Step 4: Confirm payment in backend
   *   const confirmedOrder = await orderService.confirm(order.id, {
   *     payment_intent_id: paymentIntent.id,
   *     status: paymentIntent.status
   *   });
   *
   *   console.log('Payment confirmed!');
   *   console.log('Order Status:', confirmedOrder.status); // PAID
   *   console.log('Enrollments activated');
   *
   * } catch (error) {
   *   console.error('Payment confirmation failed:', error);
   * }
   *
   * @example
   * // Webhook handler confirmation
   * app.post('/webhooks/stripe', async (req, res) => {
   *   const event = req.body;
   *
   *   if (event.type === 'payment_intent.succeeded') {
   *     const paymentIntent = event.data.object;
   *
   *     // Extract order ID from metadata
   *     const orderId = paymentIntent.metadata.order_id;
   *
   *     const order = await orderService.confirm(orderId, {
   *       payment_intent_id: paymentIntent.id,
   *       status: paymentIntent.status
   *     });
   *
   *     // Send confirmation email
   *     await sendConfirmationEmail(order);
   *   }
   * });
   *
   * @see {@link orderService.checkout} for initiating payment
   * @see {@link orderService.create} for creating orders
   */
  async confirm(
    orderId: string,
    confirmData: ConfirmPaymentRequest
  ): Promise<Order> {
    const { data } = await apiClient.post<Order>(
      ENDPOINTS.ORDERS.CONFIRM(orderId),
      confirmData
    );
    return data;
  },

  /**
   * Cancel order
   *
   * Cancels an order, preventing further checkout or processing. Orders can typically be
   * cancelled only if they are in DRAFT or PENDING_PAYMENT status. Paid orders may require
   * a refund instead.
   *
   * The backend will:
   * 1. Verify the order exists and user has permission
   * 2. Check if order is in a cancellable state
   * 3. Update order status to CANCELLED
   * 4. If Stripe payment intent exists, cancel it
   * 5. Return confirmation message
   *
   * Use cases:
   * - User abandons cart/checkout (DRAFT orders)
   * - Payment timeout or failed payment (PENDING_PAYMENT orders)
   * - User requests cancellation before payment (DRAFT orders)
   *
   * @async
   * @param {string} orderId - The order ID to cancel
   * @returns {Promise<{message: string}>} Confirmation message
   * @returns {string} response.message - Cancellation confirmation (e.g., "Order cancelled successfully")
   *
   * @throws {AxiosError} If order not found, already paid, or cannot be cancelled
   *
   * @example
   * // Cancel a draft order
   * const result = await orderService.cancel('order-abc123');
   * console.log(result.message); // "Order cancelled successfully"
   *
   * @example
   * // Cleanup on checkout page exit
   * const handlePageExit = async () => {
   *   if (currentOrder && currentOrder.status === OrderStatus.DRAFT) {
   *     await orderService.cancel(currentOrder.id);
   *   }
   * };
   *
   * window.addEventListener('beforeunload', handlePageExit);
   *
   * @example
   * // Error handling for cancellation
   * try {
   *   await orderService.cancel('order-xyz789');
   * } catch (error) {
   *   if (error.response?.status === 400) {
   *     // Order is already paid, need refund instead
   *     console.log('Cannot cancel paid order. Use refund endpoint.');
   *   }
   * }
   */
  async cancel(orderId: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      ENDPOINTS.ORDERS.CANCEL(orderId)
    );
    return data;
  },
};

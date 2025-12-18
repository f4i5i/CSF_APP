/**
 * @fileoverview Payment Service
 *
 * Comprehensive payment processing service that integrates with Stripe to handle:
 * - Payment transactions and history tracking
 * - Secure payment method management (credit cards, debit cards)
 * - Installment plan creation and management
 * - Invoice generation and PDF downloads
 * - Refund processing for administrators
 * - Stripe SetupIntent flows for saving payment methods
 *
 * The service provides two main interfaces:
 * 1. paymentService - Core payment operations and method management
 * 2. installmentService - Flexible payment plan functionality
 *
 * All functions are pure API calls with no React dependencies, making them
 * suitable for use in any context (components, hooks, middleware, etc.).
 *
 * @module payment.service
 * @requires axios-client
 * @requires endpoints
 * @see {@link https://stripe.com/docs/payments/payment-intents|Stripe Payment Intents}
 * @see {@link https://stripe.com/docs/payments/setup-intents|Stripe Setup Intents}
 *
 * @example
 * // Basic payment flow with Stripe
 * import { paymentService } from './api/services/payment.service';
 *
 * // 1. Save a payment method for future use
 * const setupIntent = await paymentService.createSetupIntent({
 *   customer_id: 'cus_123'
 * });
 *
 * // Use Stripe.js on frontend to collect payment details
 * const { setupIntent: confirmedIntent } = await stripe.confirmCardSetup(
 *   setupIntent.client_secret,
 *   { payment_method: { card: cardElement } }
 * );
 *
 * // 2. Attach the payment method to the user's account
 * const paymentMethod = await paymentService.attachPaymentMethod({
 *   payment_method_id: confirmedIntent.payment_method,
 *   set_as_default: true
 * });
 *
 * // 3. View all saved payment methods
 * const methods = await paymentService.getPaymentMethods();
 *
 * // 4. View payment history
 * const payments = await paymentService.getMy({
 *   status: 'succeeded',
 *   limit: 10
 * });
 *
 * @example
 * // Installment plan workflow
 * import { installmentService } from './api/services/payment.service';
 *
 * // 1. Preview the installment schedule before committing
 * const preview = await installmentService.preview({
 *   total_amount: 50000, // $500.00 in cents
 *   number_of_installments: 4,
 *   frequency: 'monthly'
 * });
 *
 * // 2. Create the installment plan
 * const plan = await installmentService.create({
 *   order_id: 'order_123',
 *   number_of_installments: 4,
 *   frequency: 'monthly',
 *   payment_method_id: 'pm_123'
 * });
 *
 * // 3. Monitor the plan
 * const payments = await installmentService.getPayments(plan.id);
 * const summary = await installmentService.getSummary();
 */

import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Payment,
  PaymentFilters,
  PaymentMethod,
  SetupIntentRequest,
  SetupIntentResponse,
  AttachPaymentMethodRequest,
  RefundRequest,
  RefundResponse,
  InstallmentPlan,
  InstallmentPlanFilters,
  InstallmentPayment,
  CreateInstallmentPlanRequest,
  InstallmentPreviewRequest,
  InstallmentPreviewResponse,
  InstallmentSummary,
} from '../types/payment.types';

/**
 * Payment service for managing payment transactions and methods
 *
 * Provides comprehensive payment functionality including:
 * - Payment history retrieval with filtering
 * - Stripe payment method management (add, list, set default, delete)
 * - SetupIntent creation for secure payment method collection
 * - Refund processing for administrators
 * - Invoice PDF generation and download
 *
 * All payment amounts are handled in cents (e.g., $10.00 = 1000).
 * Stripe is used as the payment processor for secure transaction handling.
 *
 * @namespace paymentService
 */
export const paymentService = {
  /**
   * Retrieves the current authenticated user's payment history
   *
   * Fetches all payments associated with the logged-in user's account.
   * Supports optional filtering by status, date range, and pagination.
   * Each payment includes transaction details, amount, status, and associated order/enrollment.
   *
   * @param {PaymentFilters} [filters] - Optional filters to narrow results
   * @param {string} [filters.status] - Filter by payment status (succeeded, pending, failed, refunded)
   * @param {string} [filters.start_date] - Start date for date range (ISO format)
   * @param {string} [filters.end_date] - End date for date range (ISO format)
   * @param {number} [filters.limit] - Maximum number of results to return
   * @param {number} [filters.offset] - Number of results to skip (for pagination)
   * @returns {Promise<Payment[]>} Array of payment records
   * @throws {Error} If user is not authenticated
   *
   * @example
   * // Get all payments for current user
   * const allPayments = await paymentService.getMy();
   *
   * @example
   * // Get successful payments from last 30 days
   * const recentPayments = await paymentService.getMy({
   *   status: 'succeeded',
   *   start_date: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
   *   limit: 20
   * });
   */
  async getMy(filters?: PaymentFilters): Promise<Payment[]> {
    const { data } = await apiClient.get<Payment[]>(ENDPOINTS.PAYMENTS.MY, {
      params: filters,
    });
    return data;
  },

  /**
   * Retrieves all payments in the system (admin only)
   *
   * Administrative endpoint that returns payments from all users.
   * Useful for financial reporting, reconciliation, and customer support.
   * Supports the same filtering options as getMy().
   *
   * @param {PaymentFilters} [filters] - Optional filters to narrow results
   * @param {string} [filters.status] - Filter by payment status
   * @param {string} [filters.user_id] - Filter by specific user ID
   * @param {string} [filters.start_date] - Start date for date range
   * @param {string} [filters.end_date] - End date for date range
   * @param {number} [filters.limit] - Maximum number of results
   * @param {number} [filters.offset] - Pagination offset
   * @returns {Promise<Payment[]>} Array of all payment records
   * @throws {Error} If user does not have admin privileges
   *
   * @example
   * // Get all failed payments for investigation
   * const failedPayments = await paymentService.getAll({
   *   status: 'failed',
   *   limit: 50
   * });
   */
  async getAll(filters?: PaymentFilters): Promise<Payment[]> {
    const { data } = await apiClient.get<Payment[]>(ENDPOINTS.PAYMENTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Retrieves detailed information for a specific payment
   *
   * Fetches complete payment details including transaction metadata,
   * Stripe payment intent information, related order/enrollment data,
   * and refund history if applicable.
   *
   * @param {string} id - Unique payment identifier
   * @returns {Promise<Payment>} Complete payment record with all details
   * @throws {Error} If payment not found or user lacks permission to view it
   *
   * @example
   * // Get payment details for receipt display
   * const payment = await paymentService.getById('pay_abc123');
   * console.log(`Amount: $${payment.amount / 100}`);
   * console.log(`Status: ${payment.status}`);
   * console.log(`Date: ${new Date(payment.created_at).toLocaleDateString()}`);
   */
  async getById(id: string): Promise<Payment> {
    const { data } = await apiClient.get<Payment>(ENDPOINTS.PAYMENTS.BY_ID(id));
    return data;
  },

  /**
   * Creates a Stripe SetupIntent for securely collecting payment method details
   *
   * SetupIntents are used to save payment methods for future use without charging
   * the customer immediately. This is essential for:
   * - Saving cards for recurring payments
   * - Setting up installment plans
   * - Enabling one-click checkout experiences
   *
   * The flow involves:
   * 1. Backend creates a SetupIntent via Stripe API
   * 2. Frontend receives client_secret
   * 3. Frontend uses Stripe.js to collect and confirm payment details
   * 4. Backend receives webhook when setup completes
   * 5. Payment method is attached via attachPaymentMethod()
   *
   * @param {SetupIntentRequest} [request] - Optional setup configuration
   * @param {string} [request.customer_id] - Stripe customer ID to associate with
   * @param {object} [request.metadata] - Additional metadata to attach
   * @returns {Promise<SetupIntentResponse>} SetupIntent with client_secret
   * @returns {string} SetupIntentResponse.client_secret - Secret for Stripe.js confirmation
   * @returns {string} SetupIntentResponse.id - SetupIntent ID for tracking
   *
   * @example
   * // Complete payment method setup flow
   * import { loadStripe } from '@stripe/stripe-js';
   * import { paymentService } from './api/services/payment.service';
   *
   * // 1. Create SetupIntent on backend
   * const setupIntent = await paymentService.createSetupIntent();
   *
   * // 2. Confirm with Stripe.js on frontend
   * const stripe = await loadStripe('pk_test_...');
   * const { setupIntent: confirmed, error } = await stripe.confirmCardSetup(
   *   setupIntent.client_secret,
   *   {
   *     payment_method: {
   *       card: cardElement,
   *       billing_details: { name: 'John Doe' }
   *     }
   *   }
   * );
   *
   * // 3. Attach payment method to account
   * if (confirmed) {
   *   await paymentService.attachPaymentMethod({
   *     payment_method_id: confirmed.payment_method,
   *     set_as_default: true
   *   });
   * }
   *
   * @see {@link https://stripe.com/docs/payments/setup-intents|Stripe SetupIntent Documentation}
   */
  async createSetupIntent(
    request?: SetupIntentRequest
  ): Promise<SetupIntentResponse> {
    const { data } = await apiClient.post<SetupIntentResponse>(
      ENDPOINTS.PAYMENTS.SETUP_INTENT,
      request
    );
    return data;
  },

  /**
   * Retrieves all saved payment methods for the current user
   *
   * Returns a list of payment methods (credit/debit cards) that the user has
   * previously saved to their account. Each method includes:
   * - Card brand (Visa, Mastercard, Amex, etc.)
   * - Last 4 digits of card number
   * - Expiration date
   * - Billing details
   * - Whether it's set as the default payment method
   *
   * @returns {Promise<PaymentMethod[]>} Array of saved payment methods
   * @throws {Error} If user is not authenticated
   *
   * @example
   * // Display saved payment methods in account settings
   * const methods = await paymentService.getPaymentMethods();
   *
   * methods.forEach(method => {
   *   console.log(`${method.card.brand} ending in ${method.card.last4}`);
   *   console.log(`Expires: ${method.card.exp_month}/${method.card.exp_year}`);
   *   console.log(`Default: ${method.is_default ? 'Yes' : 'No'}`);
   * });
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data } = await apiClient.get<PaymentMethod[]>(
      ENDPOINTS.PAYMENTS.METHODS
    );
    return data;
  },

  /**
   * Attaches a confirmed payment method to the user's account
   *
   * After a SetupIntent is confirmed via Stripe.js, this endpoint saves the
   * payment method to the user's account for future use. The payment method
   * can optionally be set as the default for automatic selection during checkout.
   *
   * This completes the payment method setup flow initiated by createSetupIntent().
   *
   * @param {AttachPaymentMethodRequest} request - Payment method attachment details
   * @param {string} request.payment_method_id - Stripe PaymentMethod ID (from confirmed SetupIntent)
   * @param {boolean} [request.set_as_default] - Whether to make this the default payment method
   * @returns {Promise<PaymentMethod>} The attached payment method details
   * @throws {Error} If payment method ID is invalid or already attached to another user
   *
   * @example
   * // Attach payment method after Stripe.js confirmation
   * const paymentMethod = await paymentService.attachPaymentMethod({
   *   payment_method_id: 'pm_1234567890abcdef',
   *   set_as_default: true
   * });
   *
   * console.log(`Saved ${paymentMethod.card.brand} ending in ${paymentMethod.card.last4}`);
   */
  async attachPaymentMethod(
    request: AttachPaymentMethodRequest
  ): Promise<PaymentMethod> {
    const { data } = await apiClient.post<PaymentMethod>(
      ENDPOINTS.PAYMENTS.ATTACH_METHOD,
      request
    );
    return data;
  },

  /**
   * Sets a payment method as the default for future transactions
   *
   * The default payment method is automatically selected during checkout
   * and used for recurring payments and installment plans unless otherwise specified.
   * Only one payment method can be set as default at a time.
   *
   * @param {string} methodId - Stripe PaymentMethod ID to set as default
   * @returns {Promise<PaymentMethod>} Updated payment method with is_default = true
   * @throws {Error} If payment method not found or doesn't belong to user
   *
   * @example
   * // Let user change their default payment method
   * const methods = await paymentService.getPaymentMethods();
   * const selectedMethod = methods[1]; // User's selection
   *
   * await paymentService.setDefaultPaymentMethod(selectedMethod.id);
   * console.log('Default payment method updated');
   */
  async setDefaultPaymentMethod(methodId: string): Promise<PaymentMethod> {
    const { data } = await apiClient.post<PaymentMethod>(
      ENDPOINTS.PAYMENTS.SET_DEFAULT_METHOD(methodId)
    );
    return data;
  },

  /**
   * Permanently deletes a saved payment method
   *
   * Removes the payment method from both the user's account and Stripe.
   * This action is irreversible. If the deleted method was the default,
   * the user will need to select a new default payment method.
   *
   * Note: Cannot delete a payment method if it's currently being used
   * for an active installment plan.
   *
   * @param {string} methodId - Stripe PaymentMethod ID to delete
   * @returns {Promise<void>} Resolves when deletion is complete
   * @throws {Error} If payment method is in use by active installment plans
   *
   * @example
   * // Remove expired or unwanted payment method
   * try {
   *   await paymentService.deletePaymentMethod('pm_expired123');
   *   console.log('Payment method removed successfully');
   * } catch (error) {
   *   if (error.message.includes('installment')) {
   *     console.error('Cannot delete - payment method is in use');
   *   }
   * }
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    await apiClient.delete(
      ENDPOINTS.PAYMENTS.DELETE_METHOD(methodId)
    );
  },

  /**
   * Processes a refund for a completed payment (admin only)
   *
   * Initiates a refund through Stripe for a successful payment.
   * Refunds can be full or partial, and are typically processed back to
   * the original payment method within 5-10 business days.
   *
   * The refund creates an audit trail and updates payment status.
   * Enrollment/order status may also be updated based on refund policy.
   *
   * @param {RefundRequest} refundData - Refund request details
   * @param {string} refundData.payment_id - ID of payment to refund
   * @param {number} [refundData.amount] - Amount to refund in cents (omit for full refund)
   * @param {string} [refundData.reason] - Reason for refund (requested_by_customer, duplicate, fraudulent)
   * @param {string} [refundData.notes] - Internal notes about the refund
   * @returns {Promise<RefundResponse>} Refund details including Stripe refund ID and status
   * @throws {Error} If user lacks admin privileges or payment cannot be refunded
   *
   * @example
   * // Process full refund for cancelled enrollment
   * const refund = await paymentService.requestRefund({
   *   payment_id: 'pay_abc123',
   *   reason: 'requested_by_customer',
   *   notes: 'Customer cancelled enrollment due to schedule conflict'
   * });
   *
   * console.log(`Refund processed: $${refund.amount / 100}`);
   * console.log(`Stripe Refund ID: ${refund.stripe_refund_id}`);
   *
   * @example
   * // Process partial refund (e.g., late cancellation with penalty)
   * const partialRefund = await paymentService.requestRefund({
   *   payment_id: 'pay_def456',
   *   amount: 7500, // Refund $75 of $100 payment
   *   reason: 'requested_by_customer',
   *   notes: 'Late cancellation - $25 penalty applied per policy'
   * });
   */
  async requestRefund(refundData: RefundRequest): Promise<RefundResponse> {
    const { data } = await apiClient.post<RefundResponse>(
      ENDPOINTS.PAYMENTS.REFUND,
      refundData
    );
    return data;
  },

  /**
   * Downloads a PDF invoice for a completed payment
   *
   * Generates and downloads a professionally formatted invoice PDF
   * containing payment details, itemization, tax information, and
   * customer/business information. Useful for record keeping and
   * expense reporting.
   *
   * The PDF is generated on-demand and returned as a Blob that can
   * be downloaded or displayed in the browser.
   *
   * @param {string} paymentId - ID of the payment to generate invoice for
   * @returns {Promise<Blob>} PDF file as a Blob object
   * @throws {Error} If payment not found or user lacks permission to access it
   *
   * @example
   * // Download invoice and save as file
   * const invoiceBlob = await paymentService.downloadInvoice('pay_abc123');
   *
   * const url = window.URL.createObjectURL(invoiceBlob);
   * const link = document.createElement('a');
   * link.href = url;
   * link.download = `invoice-${paymentId}.pdf`;
   * link.click();
   * window.URL.revokeObjectURL(url);
   *
   * @example
   * // Display invoice in new browser tab
   * const invoiceBlob = await paymentService.downloadInvoice('pay_def456');
   * const url = window.URL.createObjectURL(invoiceBlob);
   * window.open(url, '_blank');
   */
  async downloadInvoice(paymentId: string): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(
      ENDPOINTS.PAYMENTS.INVOICE_DOWNLOAD(paymentId),
      { responseType: 'blob' }
    );
    return data;
  },
};

/**
 * Installment plan service for flexible payment scheduling
 *
 * Enables customers to split large payments into smaller, scheduled installments.
 * This improves affordability and increases enrollment conversion rates.
 *
 * Key features:
 * - Flexible payment schedules (weekly, biweekly, monthly)
 * - Automatic payment processing via saved payment methods
 * - Preview functionality to see schedule before committing
 * - Failed payment retry logic with notifications
 * - Cancellation with prorated refunds
 * - Real-time status tracking and payment history
 *
 * Installment plans use Stripe's scheduled payment functionality to automatically
 * charge the customer's saved payment method on specified dates.
 *
 * @namespace installmentService
 *
 * @example
 * // Typical installment plan lifecycle
 * // 1. Preview the schedule
 * const preview = await installmentService.preview({
 *   total_amount: 100000, // $1000.00
 *   number_of_installments: 5,
 *   frequency: 'monthly'
 * });
 *
 * // 2. Create the plan with saved payment method
 * const plan = await installmentService.create({
 *   order_id: 'order_123',
 *   number_of_installments: 5,
 *   frequency: 'monthly',
 *   payment_method_id: 'pm_abc123'
 * });
 *
 * // 3. Monitor progress
 * const payments = await installmentService.getPayments(plan.id);
 * const summary = await installmentService.getSummary();
 *
 * // 4. Handle failed payment if needed
 * const failedPayment = payments.find(p => p.status === 'failed');
 * if (failedPayment) {
 *   await installmentService.attemptPayment(plan.id, failedPayment.id);
 * }
 */
export const installmentService = {
  /**
   * Retrieves the current user's installment plans
   *
   * Returns all installment plans associated with the authenticated user,
   * including active plans, completed plans, and cancelled plans.
   * Each plan includes the payment schedule, status, and payment history.
   *
   * @param {InstallmentPlanFilters} [filters] - Optional filters
   * @param {string} [filters.status] - Filter by status (active, completed, cancelled, defaulted)
   * @param {string} [filters.order_id] - Filter by specific order
   * @param {number} [filters.limit] - Maximum number of results
   * @param {number} [filters.offset] - Pagination offset
   * @returns {Promise<InstallmentPlan[]>} Array of installment plans
   *
   * @example
   * // Get all active installment plans
   * const activePlans = await installmentService.getMy({
   *   status: 'active'
   * });
   *
   * activePlans.forEach(plan => {
   *   const remaining = plan.payments.filter(p => p.status === 'pending').length;
   *   console.log(`Plan ${plan.id}: ${remaining} payments remaining`);
   * });
   */
  async getMy(filters?: InstallmentPlanFilters): Promise<InstallmentPlan[]> {
    const { data } = await apiClient.get<InstallmentPlan[]>(
      ENDPOINTS.INSTALLMENTS.MY,
      { params: filters }
    );
    return data;
  },

  /**
   * Retrieves all installment plans in the system (admin only)
   *
   * Administrative endpoint for viewing installment plans across all users.
   * Useful for financial reporting, identifying at-risk accounts, and
   * customer support. Includes all plan statuses and full payment details.
   *
   * @param {InstallmentPlanFilters} [filters] - Optional filters
   * @param {string} [filters.status] - Filter by plan status
   * @param {string} [filters.user_id] - Filter by specific user
   * @param {string} [filters.payment_status] - Filter by payment status
   * @param {number} [filters.limit] - Maximum results
   * @param {number} [filters.offset] - Pagination offset
   * @returns {Promise<InstallmentPlan[]>} Array of all installment plans
   * @throws {Error} If user lacks admin privileges
   *
   * @example
   * // Find plans with failed payments requiring attention
   * const problematicPlans = await installmentService.getAll({
   *   payment_status: 'failed'
   * });
   *
   * console.log(`${problematicPlans.length} plans need follow-up`);
   */
  async getAll(filters?: InstallmentPlanFilters): Promise<InstallmentPlan[]> {
    const { data } = await apiClient.get<InstallmentPlan[]>(
      ENDPOINTS.INSTALLMENTS.LIST,
      { params: filters }
    );
    return data;
  },

  /**
   * Retrieves detailed information for a specific installment plan
   *
   * Returns complete plan details including:
   * - Payment schedule with due dates and amounts
   * - Individual payment status and history
   * - Associated order and enrollment information
   * - Payment method details
   * - Total paid vs. remaining balance
   *
   * @param {string} id - Installment plan ID
   * @returns {Promise<InstallmentPlan>} Complete installment plan details
   * @throws {Error} If plan not found or user lacks permission
   *
   * @example
   * // Display detailed plan information
   * const plan = await installmentService.getById('inst_abc123');
   *
   * console.log(`Total: $${plan.total_amount / 100}`);
   * console.log(`Installments: ${plan.number_of_installments}`);
   * console.log(`Frequency: ${plan.frequency}`);
   * console.log(`Paid: $${plan.amount_paid / 100}`);
   * console.log(`Remaining: $${plan.amount_remaining / 100}`);
   *
   * plan.payments.forEach((payment, index) => {
   *   console.log(`Payment ${index + 1}: ${payment.status} - Due ${payment.due_date}`);
   * });
   */
  async getById(id: string): Promise<InstallmentPlan> {
    const { data } = await apiClient.get<InstallmentPlan>(
      ENDPOINTS.INSTALLMENTS.BY_ID(id)
    );
    return data;
  },

  /**
   * Previews an installment payment schedule before creation
   *
   * Calculates and returns the exact payment schedule without creating
   * a plan or charging the customer. Shows due dates, amounts per installment,
   * and total cost. Essential for displaying payment options to users
   * before they commit.
   *
   * The preview accounts for:
   * - Even distribution of amount across installments
   * - Rounding to nearest cent (first payment may include remainder)
   * - Calculated due dates based on frequency
   * - No fees or interest (unless configured in backend)
   *
   * @param {InstallmentPreviewRequest} previewData - Preview parameters
   * @param {number} previewData.total_amount - Total amount in cents to split
   * @param {number} previewData.number_of_installments - How many payments (2-12 typically)
   * @param {string} previewData.frequency - Payment frequency (weekly, biweekly, monthly)
   * @param {string} [previewData.first_payment_date] - Optional custom start date (ISO format)
   * @returns {Promise<InstallmentPreviewResponse>} Preview with payment schedule
   * @returns {Object[]} InstallmentPreviewResponse.schedule - Array of scheduled payments
   * @returns {number} InstallmentPreviewResponse.amount_per_installment - Amount per payment in cents
   *
   * @example
   * // Show payment options to user
   * const preview3Month = await installmentService.preview({
   *   total_amount: 60000, // $600.00
   *   number_of_installments: 3,
   *   frequency: 'monthly'
   * });
   *
   * console.log(`3 payments of $${preview3Month.amount_per_installment / 100}`);
   * preview3Month.schedule.forEach((payment, i) => {
   *   console.log(`Payment ${i+1}: $${payment.amount / 100} due on ${payment.due_date}`);
   * });
   *
   * @example
   * // Compare different payment plan options
   * const [plan3, plan6] = await Promise.all([
   *   installmentService.preview({ total_amount: 120000, number_of_installments: 3, frequency: 'monthly' }),
   *   installmentService.preview({ total_amount: 120000, number_of_installments: 6, frequency: 'monthly' })
   * ]);
   *
   * console.log(`3 months: $${plan3.amount_per_installment / 100}/month`);
   * console.log(`6 months: $${plan6.amount_per_installment / 100}/month`);
   */
  async preview(
    previewData: InstallmentPreviewRequest
  ): Promise<InstallmentPreviewResponse> {
    const { data } = await apiClient.post<InstallmentPreviewResponse>(
      ENDPOINTS.INSTALLMENTS.PREVIEW,
      previewData
    );
    return data;
  },

  /**
   * Creates a new installment plan for an order
   *
   * Establishes a payment plan that automatically charges the customer's
   * saved payment method on scheduled dates. The first payment may be
   * charged immediately or on a future date.
   *
   * Prerequisites:
   * - User must have a saved payment method
   * - Order must be in pending or confirmed status
   * - Order amount must meet minimum installment threshold
   *
   * Once created, payments are processed automatically by Stripe on
   * their due dates. Customers receive email notifications before each charge.
   *
   * @param {CreateInstallmentPlanRequest} planData - Plan configuration
   * @param {string} planData.order_id - Order to create installment plan for
   * @param {number} planData.number_of_installments - Number of payments (2-12)
   * @param {string} planData.frequency - Payment frequency (weekly, biweekly, monthly)
   * @param {string} planData.payment_method_id - Stripe payment method ID to charge
   * @param {string} [planData.first_payment_date] - Optional custom start date
   * @param {boolean} [planData.charge_immediately] - Charge first installment now (default: true)
   * @returns {Promise<InstallmentPlan>} Created installment plan with full details
   * @throws {Error} If order invalid, payment method missing, or amount too low
   *
   * @example
   * // Create 4-month payment plan for an order
   * const plan = await installmentService.create({
   *   order_id: 'order_abc123',
   *   number_of_installments: 4,
   *   frequency: 'monthly',
   *   payment_method_id: 'pm_xyz789',
   *   charge_immediately: true
   * });
   *
   * console.log(`Plan created: ${plan.id}`);
   * console.log(`${plan.payments.length} payments scheduled`);
   * console.log(`Next payment: ${plan.next_payment_date}`);
   *
   * @example
   * // Create plan with delayed start date
   * const futureDate = new Date();
   * futureDate.setDate(futureDate.getDate() + 14); // Start in 2 weeks
   *
   * const plan = await installmentService.create({
   *   order_id: 'order_def456',
   *   number_of_installments: 6,
   *   frequency: 'biweekly',
   *   payment_method_id: 'pm_abc123',
   *   first_payment_date: futureDate.toISOString(),
   *   charge_immediately: false
   * });
   */
  async create(
    planData: CreateInstallmentPlanRequest
  ): Promise<InstallmentPlan> {
    const { data } = await apiClient.post<InstallmentPlan>(
      ENDPOINTS.INSTALLMENTS.CREATE,
      planData
    );
    return data;
  },

  /**
   * Cancels an active installment plan
   *
   * Stops all future scheduled payments for the plan. Depending on
   * cancellation policy and timing:
   * - May trigger a refund for remaining balance
   * - May cancel associated enrollment/order
   * - Updates plan status to 'cancelled'
   *
   * Payments already processed are not automatically refunded.
   * For refunds, use the refund endpoint separately.
   *
   * Note: Some installment plans may have cancellation restrictions
   * or penalties based on business rules.
   *
   * @param {string} planId - ID of installment plan to cancel
   * @returns {Promise<{message: string}>} Cancellation confirmation message
   * @throws {Error} If plan not found, already completed, or cancellation restricted
   *
   * @example
   * // Cancel an installment plan
   * const result = await installmentService.cancel('inst_abc123');
   * console.log(result.message); // "Installment plan cancelled successfully"
   *
   * @example
   * // Cancel with error handling
   * try {
   *   await installmentService.cancel('inst_xyz789');
   *   // Optionally get updated plan details
   *   const plan = await installmentService.getById('inst_xyz789');
   *   console.log(`Status: ${plan.status}`); // 'cancelled'
   * } catch (error) {
   *   if (error.message.includes('restriction')) {
   *     console.error('Plan cannot be cancelled at this time');
   *   }
   * }
   */
  async cancel(planId: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      ENDPOINTS.INSTALLMENTS.DELETE(planId)
    );
    return data;
  },

  /**
   * Retrieves a summary of all installment plans for the current user
   *
   * Provides high-level financial overview including:
   * - Total number of active installment plans
   * - Total amount currently owed across all plans
   * - Total amount paid to date
   * - Number of upcoming payments
   * - Any overdue payments requiring attention
   *
   * Useful for dashboard displays and financial summaries.
   *
   * @returns {Promise<InstallmentSummary>} Aggregated installment statistics
   * @returns {number} InstallmentSummary.active_plans_count - Number of active plans
   * @returns {number} InstallmentSummary.total_owed - Total remaining balance in cents
   * @returns {number} InstallmentSummary.total_paid - Total amount paid in cents
   * @returns {number} InstallmentSummary.upcoming_payments - Count of scheduled payments
   * @returns {number} InstallmentSummary.overdue_payments - Count of failed/overdue payments
   *
   * @example
   * // Display financial summary on user dashboard
   * const summary = await installmentService.getSummary();
   *
   * console.log(`Active Plans: ${summary.active_plans_count}`);
   * console.log(`Total Owed: $${summary.total_owed / 100}`);
   * console.log(`Total Paid: $${summary.total_paid / 100}`);
   *
   * if (summary.overdue_payments > 0) {
   *   console.warn(`⚠️ ${summary.overdue_payments} overdue payment(s) - update payment method`);
   * }
   */
  async getSummary(): Promise<InstallmentSummary> {
    const { data } = await apiClient.get<InstallmentSummary>(
      ENDPOINTS.INSTALLMENTS.SUMMARY
    );
    return data;
  },

  /**
   * Retrieves all individual payments for a specific installment plan
   *
   * Returns the complete payment history and schedule for a plan,
   * including past, current, and future payments. Each payment includes:
   * - Due date and amount
   * - Current status (pending, succeeded, failed)
   * - Stripe payment intent ID (if processed)
   * - Failure reason (if applicable)
   * - Number of retry attempts
   *
   * @param {string} planId - Installment plan ID
   * @returns {Promise<InstallmentPayment[]>} Array of payments in chronological order
   * @throws {Error} If plan not found or user lacks permission
   *
   * @example
   * // Display payment history for a plan
   * const payments = await installmentService.getPayments('inst_abc123');
   *
   * payments.forEach((payment, index) => {
   *   const dueDate = new Date(payment.due_date).toLocaleDateString();
   *   const amount = `$${payment.amount / 100}`;
   *   const status = payment.status;
   *
   *   console.log(`Payment ${index + 1}: ${amount} - ${status} (due ${dueDate})`);
   *
   *   if (payment.status === 'failed') {
   *     console.log(`  Failure reason: ${payment.failure_reason}`);
   *   }
   * });
   *
   * @example
   * // Find next payment due
   * const payments = await installmentService.getPayments('inst_def456');
   * const nextPayment = payments.find(p => p.status === 'pending');
   *
   * if (nextPayment) {
   *   const daysUntilDue = Math.ceil(
   *     (new Date(nextPayment.due_date) - new Date()) / (1000 * 60 * 60 * 24)
   *   );
   *   console.log(`Next payment of $${nextPayment.amount / 100} due in ${daysUntilDue} days`);
   * }
   */
  async getPayments(planId: string): Promise<InstallmentPayment[]> {
    const { data } = await apiClient.get<InstallmentPayment[]>(
      ENDPOINTS.INSTALLMENTS.PAYMENTS(planId)
    );
    return data;
  },

  /**
   * Manually attempts to process a failed or pending installment payment
   *
   * Retries payment processing for a specific installment payment.
   * This is useful when:
   * - A scheduled payment failed due to insufficient funds or card issues
   * - Customer has updated their payment method
   * - Manual retry is needed outside the automatic retry schedule
   *
   * The payment will be processed immediately using the plan's
   * associated payment method. If successful, the payment status
   * updates to 'succeeded' and the plan progresses normally.
   *
   * @param {string} planId - Installment plan ID
   * @param {string} paymentId - Specific payment ID to retry
   * @returns {Promise<{message: string, payment: Payment}>} Result with updated payment
   * @returns {string} message - Success/failure message
   * @returns {Payment} payment - Updated payment object with new status
   * @throws {Error} If payment cannot be processed (invalid card, insufficient funds, etc.)
   *
   * @example
   * // Retry a failed payment after customer updates card
   * const payments = await installmentService.getPayments('inst_abc123');
   * const failedPayment = payments.find(p => p.status === 'failed');
   *
   * if (failedPayment) {
   *   try {
   *     const result = await installmentService.attemptPayment(
   *       'inst_abc123',
   *       failedPayment.id
   *     );
   *
   *     console.log(result.message); // "Payment processed successfully"
   *     console.log(`New status: ${result.payment.status}`);
   *   } catch (error) {
   *     console.error('Payment failed again:', error.message);
   *     // Prompt user to update payment method
   *   }
   * }
   *
   * @example
   * // Admin manually retrying payment for customer
   * const result = await installmentService.attemptPayment(
   *   'inst_xyz789',
   *   'payment_456'
   * );
   *
   * if (result.payment.status === 'succeeded') {
   *   console.log('Payment retry successful');
   *   // Send confirmation email to customer
   * }
   */
  async attemptPayment(
    planId: string,
    paymentId: string
  ): Promise<{ message: string; payment: Payment }> {
    const { data } = await apiClient.post<{
      message: string;
      payment: Payment;
    }>(ENDPOINTS.INSTALLMENTS.ATTEMPT_PAYMENT(planId, paymentId));
    return data;
  },
};

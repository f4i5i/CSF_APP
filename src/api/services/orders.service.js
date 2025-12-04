/**
 * Orders Service
 * Handles order management and checkout operations
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const ordersService = {
  /**
   * Get all user's orders
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.status] - Filter by status (pending, confirmed, cancelled, completed)
   * @param {string} [filters.start_date] - Start date filter (YYYY-MM-DD)
   * @param {string} [filters.end_date] - End date filter (YYYY-MM-DD)
   * @returns {Promise<Array>} List of orders
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.ORDERS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order details with items, payments, and installments
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.ORDERS.BY_ID(id));
    return data;
  },

  /**
   * Create new order
   * @param {Object} orderData - Order information
   * @param {Array} orderData.items - Array of order items
   * @param {string} orderData.items[].enrollment_id - Enrollment ID
   * @param {number} orderData.items[].amount - Item amount
   * @param {string} [orderData.discount_code] - Discount code
   * @param {string} [orderData.payment_plan] - Payment plan (full, installments)
   * @param {number} [orderData.installments_count] - Number of installments if applicable
   * @param {string} [orderData.notes] - Additional notes
   * @returns {Promise<Object>} Created order
   */
  async create(orderData) {
    const { data } = await apiClient.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
    return data;
  },

  /**
   * Update order (admin only)
   * @param {string} id - Order ID
   * @param {Object} orderData - Updated order data
   * @returns {Promise<Object>} Updated order
   */
  async update(id, orderData) {
    const { data } = await apiClient.put(API_ENDPOINTS.ORDERS.BY_ID(id), orderData);
    return data;
  },

  /**
   * Cancel order
   * @param {string} id - Order ID
   * @param {Object} cancellationData - Cancellation information
   * @param {string} [cancellationData.reason] - Cancellation reason
   * @returns {Promise<Object>} Cancellation confirmation
   */
  async cancel(id, cancellationData = {}) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ORDERS.CANCEL(id),
      cancellationData
    );
    return data;
  },

  /**
   * Get order items
   * @param {string} orderId - Order ID
   * @returns {Promise<Array>} Order items
   */
  async getItems(orderId) {
    const { data } = await apiClient.get(API_ENDPOINTS.ORDERS.ITEMS(orderId));
    return data;
  },

  /**
   * Get order payments
   * @param {string} orderId - Order ID
   * @returns {Promise<Array>} Order payments
   */
  async getPayments(orderId) {
    const { data } = await apiClient.get(API_ENDPOINTS.ORDERS.PAYMENTS(orderId));
    return data;
  },

  /**
   * Get order installment plan
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Installment plan with schedule
   */
  async getInstallments(orderId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.ORDERS.INSTALLMENTS(orderId)
    );
    return data;
  },

  /**
   * Apply discount code to order
   * @param {string} orderId - Order ID
   * @param {Object} discountData - Discount information
   * @param {string} discountData.code - Discount code
   * @returns {Promise<Object>} Updated order with discount applied
   */
  async applyDiscount(orderId, discountData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ORDERS.APPLY_DISCOUNT(orderId),
      discountData
    );
    return data;
  },

  /**
   * Remove discount from order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Updated order
   */
  async removeDiscount(orderId) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ORDERS.REMOVE_DISCOUNT(orderId)
    );
    return data;
  },

  /**
   * Get order invoice
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Invoice data
   */
  async getInvoice(orderId) {
    const { data } = await apiClient.get(API_ENDPOINTS.ORDERS.INVOICE(orderId));
    return data;
  },

  /**
   * Download order invoice as PDF
   * @param {string} orderId - Order ID
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadInvoice(orderId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.ORDERS.INVOICE_PDF(orderId),
      { responseType: 'blob' }
    );
    return data;
  },

  /**
   * Get pending orders
   * @returns {Promise<Array>} Pending orders
   */
  async getPending() {
    return this.getAll({ status: 'pending' });
  },

  /**
   * Get confirmed orders
   * @returns {Promise<Array>} Confirmed orders
   */
  async getConfirmed() {
    return this.getAll({ status: 'confirmed' });
  },

  /**
   * Get completed orders
   * @returns {Promise<Array>} Completed orders
   */
  async getCompleted() {
    return this.getAll({ status: 'completed' });
  },

  /**
   * Get cancelled orders
   * @returns {Promise<Array>} Cancelled orders
   */
  async getCancelled() {
    return this.getAll({ status: 'cancelled' });
  },

  /**
   * Calculate order total with discounts
   * @param {Object} calculationData - Calculation data
   * @param {Array} calculationData.items - Order items
   * @param {string} [calculationData.discount_code] - Discount code
   * @returns {Promise<Object>} Calculated totals {subtotal, discount, tax, total}
   */
  async calculateTotal(calculationData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ORDERS.CALCULATE,
      calculationData
    );
    return data;
  },

  /**
   * Checkout - Create order and process payment
   * @param {Object} checkoutData - Checkout information
   * @param {Array} checkoutData.items - Order items
   * @param {string} [checkoutData.discount_code] - Discount code
   * @param {string} checkoutData.payment_method - Payment method
   * @param {Object} checkoutData.payment_details - Payment details
   * @param {string} [checkoutData.payment_plan] - Payment plan
   * @returns {Promise<Object>} Checkout result with order and payment
   */
  async checkout(checkoutData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ORDERS.CHECKOUT,
      checkoutData
    );
    return data;
  },

  /**
   * Get order summary for current user
   * @param {Object} params - Parameters
   * @param {string} [params.start_date] - Start date (YYYY-MM-DD)
   * @param {string} [params.end_date] - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Order summary statistics
   */
  async getSummary(params = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.ORDERS.SUMMARY, {
      params,
    });
    return data;
  },

  /**
   * Resend order confirmation email
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Confirmation
   */
  async resendConfirmation(orderId) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ORDERS.RESEND_CONFIRMATION(orderId)
    );
    return data;
  },

  /**
   * Verify order status (check payment and fulfillment)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order status details
   */
  async verifyStatus(orderId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.ORDERS.VERIFY_STATUS(orderId)
    );
    return data;
  },
};

export default ordersService;

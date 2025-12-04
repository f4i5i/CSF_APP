/**
 * Payments Service
 * Handles payment processing and transaction management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const paymentsService = {
  /**
   * Get all user's payments
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.status] - Filter by status (pending, completed, failed, refunded)
   * @param {string} [filters.order_id] - Filter by order ID
   * @param {string} [filters.start_date] - Start date filter (YYYY-MM-DD)
   * @param {string} [filters.end_date] - End date filter (YYYY-MM-DD)
   * @returns {Promise<Array>} List of payments
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.PAYMENTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get payment by ID
   * @param {string} id - Payment ID
   * @returns {Promise<Object>} Payment details with transaction info
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.PAYMENTS.BY_ID(id));
    return data;
  },

  /**
   * Create payment intent
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.order_id - Order ID
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.payment_method - Payment method (card, ach, cash)
   * @param {string} [paymentData.description] - Payment description
   * @returns {Promise<Object>} Payment intent with client secret
   */
  async createIntent(paymentData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PAYMENTS.CREATE_INTENT,
      paymentData
    );
    return data;
  },

  /**
   * Confirm payment
   * @param {string} paymentIntentId - Payment intent ID
   * @param {Object} confirmData - Confirmation data
   * @param {string} [confirmData.payment_method_id] - Stripe payment method ID
   * @returns {Promise<Object>} Confirmed payment
   */
  async confirm(paymentIntentId, confirmData = {}) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PAYMENTS.CONFIRM(paymentIntentId),
      confirmData
    );
    return data;
  },

  /**
   * Process payment (direct payment without intent)
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.order_id - Order ID
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.payment_method - Payment method
   * @param {Object} paymentData.payment_details - Payment method details
   * @returns {Promise<Object>} Processed payment
   */
  async process(paymentData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PAYMENTS.PROCESS,
      paymentData
    );
    return data;
  },

  /**
   * Request refund
   * @param {string} paymentId - Payment ID
   * @param {Object} refundData - Refund information
   * @param {number} [refundData.amount] - Partial refund amount (full refund if not provided)
   * @param {string} refundData.reason - Reason for refund
   * @returns {Promise<Object>} Refund confirmation
   */
  async refund(paymentId, refundData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PAYMENTS.REFUND(paymentId),
      refundData
    );
    return data;
  },

  /**
   * Get payment receipt
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Receipt data
   */
  async getReceipt(paymentId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.PAYMENTS.RECEIPT(paymentId)
    );
    return data;
  },

  /**
   * Download payment receipt as PDF
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadReceipt(paymentId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.PAYMENTS.RECEIPT_PDF(paymentId),
      { responseType: 'blob' }
    );
    return data;
  },

  /**
   * Get saved payment methods
   * @returns {Promise<Array>} List of saved payment methods
   */
  async getPaymentMethods() {
    const { data } = await apiClient.get(API_ENDPOINTS.PAYMENTS.METHODS);
    return data;
  },

  /**
   * Add new payment method
   * @param {Object} methodData - Payment method data
   * @param {string} methodData.payment_method_id - Stripe payment method ID
   * @param {boolean} [methodData.set_as_default] - Set as default payment method
   * @returns {Promise<Object>} Added payment method
   */
  async addPaymentMethod(methodData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PAYMENTS.ADD_METHOD,
      methodData
    );
    return data;
  },

  /**
   * Remove payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise<Object>} Removal confirmation
   */
  async removePaymentMethod(methodId) {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.PAYMENTS.REMOVE_METHOD(methodId)
    );
    return data;
  },

  /**
   * Set default payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise<Object>} Confirmation
   */
  async setDefaultPaymentMethod(methodId) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PAYMENTS.SET_DEFAULT_METHOD(methodId)
    );
    return data;
  },

  /**
   * Get payment history for an order
   * @param {string} orderId - Order ID
   * @returns {Promise<Array>} Payment history
   */
  async getByOrder(orderId) {
    return this.getAll({ order_id: orderId });
  },

  /**
   * Get completed payments
   * @returns {Promise<Array>} Completed payments
   */
  async getCompleted() {
    return this.getAll({ status: 'completed' });
  },

  /**
   * Get pending payments
   * @returns {Promise<Array>} Pending payments
   */
  async getPending() {
    return this.getAll({ status: 'pending' });
  },

  /**
   * Get failed payments
   * @returns {Promise<Array>} Failed payments
   */
  async getFailed() {
    return this.getAll({ status: 'failed' });
  },

  /**
   * Get payment statistics
   * @param {Object} params - Parameters
   * @param {string} [params.start_date] - Start date (YYYY-MM-DD)
   * @param {string} [params.end_date] - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Payment statistics
   */
  async getStats(params = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.PAYMENTS.STATS, {
      params,
    });
    return data;
  },

  /**
   * Verify payment status (webhook simulation for testing)
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Current payment status
   */
  async verifyStatus(paymentId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.PAYMENTS.VERIFY_STATUS(paymentId)
    );
    return data;
  },
};

export default paymentsService;

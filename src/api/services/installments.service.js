/**
 * Installments Service
 * Handles payment installment plans and schedules
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const installmentsService = {
  /**
   * Get all user's installment plans
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.order_id] - Filter by order ID
   * @param {string} [filters.status] - Filter by status (active, completed, cancelled)
   * @returns {Promise<Array>} List of installment plans
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.INSTALLMENTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get installment plan by ID
   * @param {string} id - Installment plan ID
   * @returns {Promise<Object>} Installment plan details with payment schedule
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.INSTALLMENTS.BY_ID(id));
    return data;
  },

  /**
   * Create installment plan for an order
   * @param {Object} planData - Installment plan information
   * @param {string} planData.order_id - Order ID
   * @param {number} planData.total_amount - Total amount to pay
   * @param {number} planData.installments_count - Number of installments
   * @param {string} planData.frequency - Payment frequency (weekly, biweekly, monthly)
   * @param {string} planData.start_date - First payment date (YYYY-MM-DD)
   * @param {number} [planData.down_payment] - Initial down payment amount
   * @returns {Promise<Object>} Created installment plan with schedule
   */
  async create(planData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.INSTALLMENTS.CREATE,
      planData
    );
    return data;
  },

  /**
   * Update installment plan (admin only)
   * @param {string} id - Installment plan ID
   * @param {Object} planData - Updated plan data
   * @returns {Promise<Object>} Updated installment plan
   */
  async update(id, planData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.INSTALLMENTS.BY_ID(id),
      planData
    );
    return data;
  },

  /**
   * Cancel installment plan
   * @param {string} id - Installment plan ID
   * @param {Object} cancellationData - Cancellation information
   * @param {string} [cancellationData.reason] - Cancellation reason
   * @returns {Promise<Object>} Cancellation confirmation
   */
  async cancel(id, cancellationData = {}) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.INSTALLMENTS.CANCEL(id),
      cancellationData
    );
    return data;
  },

  /**
   * Get upcoming installments (due soon)
   * @param {number} days - Number of days ahead to check (default 7)
   * @returns {Promise<Array>} Upcoming installment payments
   */
  async getUpcoming(days = 7) {
    const { data } = await apiClient.get(API_ENDPOINTS.INSTALLMENTS.UPCOMING, {
      params: { days },
    });
    return data;
  },

  /**
   * Get overdue installments
   * @returns {Promise<Array>} Overdue installment payments
   */
  async getOverdue() {
    const { data } = await apiClient.get(API_ENDPOINTS.INSTALLMENTS.OVERDUE);
    return data;
  },

  /**
   * Pay specific installment
   * @param {string} installmentId - Installment payment ID
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.payment_method - Payment method
   * @param {Object} [paymentData.payment_details] - Payment method details
   * @returns {Promise<Object>} Payment confirmation
   */
  async payInstallment(installmentId, paymentData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.INSTALLMENTS.PAY(installmentId),
      paymentData
    );
    return data;
  },

  /**
   * Get payment history for an installment plan
   * @param {string} planId - Installment plan ID
   * @returns {Promise<Array>} Payment history
   */
  async getPaymentHistory(planId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.INSTALLMENTS.PAYMENT_HISTORY(planId)
    );
    return data;
  },

  /**
   * Get installment schedule
   * @param {string} planId - Installment plan ID
   * @returns {Promise<Array>} Detailed payment schedule
   */
  async getSchedule(planId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.INSTALLMENTS.SCHEDULE(planId)
    );
    return data;
  },

  /**
   * Update installment due date (admin only)
   * @param {string} installmentId - Installment payment ID
   * @param {Object} updateData - Update information
   * @param {string} updateData.new_due_date - New due date (YYYY-MM-DD)
   * @param {string} [updateData.reason] - Reason for change
   * @returns {Promise<Object>} Updated installment
   */
  async updateDueDate(installmentId, updateData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.INSTALLMENTS.UPDATE_DUE_DATE(installmentId),
      updateData
    );
    return data;
  },

  /**
   * Mark installment as paid (admin only - for manual payments)
   * @param {string} installmentId - Installment payment ID
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.payment_method - Payment method used
   * @param {string} [paymentData.transaction_id] - Transaction reference
   * @param {string} [paymentData.notes] - Additional notes
   * @returns {Promise<Object>} Confirmation
   */
  async markAsPaid(installmentId, paymentData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.INSTALLMENTS.MARK_PAID(installmentId),
      paymentData
    );
    return data;
  },

  /**
   * Calculate installment plan preview
   * @param {Object} calculationData - Calculation parameters
   * @param {number} calculationData.total_amount - Total amount
   * @param {number} calculationData.installments_count - Number of installments
   * @param {string} calculationData.frequency - Payment frequency
   * @param {number} [calculationData.down_payment] - Down payment amount
   * @returns {Promise<Object>} Calculated schedule preview
   */
  async calculatePlan(calculationData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.INSTALLMENTS.CALCULATE,
      calculationData
    );
    return data;
  },

  /**
   * Get active installment plans
   * @returns {Promise<Array>} Active plans
   */
  async getActive() {
    return this.getAll({ status: 'active' });
  },

  /**
   * Get completed installment plans
   * @returns {Promise<Array>} Completed plans
   */
  async getCompleted() {
    return this.getAll({ status: 'completed' });
  },

  /**
   * Get installment summary for user
   * @returns {Promise<Object>} Summary {total_plans, active_plans, total_remaining, next_due}
   */
  async getSummary() {
    const { data } = await apiClient.get(API_ENDPOINTS.INSTALLMENTS.SUMMARY);
    return data;
  },

  /**
   * Setup auto-pay for installment plan
   * @param {string} planId - Installment plan ID
   * @param {Object} autoPayData - Auto-pay configuration
   * @param {string} autoPayData.payment_method_id - Payment method to use
   * @param {boolean} autoPayData.enabled - Enable/disable auto-pay
   * @returns {Promise<Object>} Auto-pay configuration
   */
  async setupAutoPay(planId, autoPayData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.INSTALLMENTS.SETUP_AUTOPAY(planId),
      autoPayData
    );
    return data;
  },
};

export default installmentsService;

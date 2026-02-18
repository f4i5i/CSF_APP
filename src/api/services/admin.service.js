/**
 * Admin Service
 * Handles admin dashboard and management operations
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const adminService = {
  /**
   * Get dashboard metrics
   * @returns {Promise<Object>} Dashboard metrics including revenue, enrollments, etc.
   */
  async getDashboardMetrics() {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.METRICS);
    return data;
  },

  /**
   * Get revenue report
   * @param {Object} params - Report parameters
   * @param {string} [params.start_date] - Start date (YYYY-MM-DD)
   * @param {string} [params.end_date] - End date (YYYY-MM-DD)
   * @param {string} [params.group_by] - Grouping (day, week, month)
   * @returns {Promise<Object>} Revenue report data
   */
  async getRevenueReport(params = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.REVENUE, { params });
    return data;
  },

  /**
   * Get clients list
   * @param {Object} params - Filter parameters
   * @param {number} [params.skip] - Offset for pagination
   * @param {number} [params.limit] - Limit for pagination
   * @param {string} [params.search] - Search by name or email
   * @param {boolean} [params.has_active_enrollment] - Filter by active enrollment
   * @param {string} [params.program_id] - Filter by program
   * @returns {Promise<Object>} Paginated clients list
   */
  async getClients(params = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.CLIENTS, { params });
    return data;
  },

  /**
   * Get client details
   * @param {string} clientId - Client ID
   * @returns {Promise<Object>} Detailed client information
   */
  async getClientById(clientId) {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.CLIENT_BY_ID(clientId));
    return data;
  },

  /**
   * Delete a client
   * @param {string} clientId - Client ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteClient(clientId) {
    const { data } = await apiClient.delete(API_ENDPOINTS.ADMIN.CLIENT_BY_ID(clientId));
    return data;
  },

  /**
   * Get all coaches for class assignment
   * @returns {Promise<Object>} List of coaches with assigned class count
   */
  async getCoaches() {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.COACHES);
    return data;
  },

  /**
   * Get class roster
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Class roster with enrolled students
   */
  async getClassRoster(classId) {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.ROSTER(classId));
    return data;
  },

  /**
   * Search refunds with filters
   * @param {Object} params - Filter parameters
   * @param {string} [params.start_date] - Filter by refund date (start)
   * @param {string} [params.end_date] - Filter by refund date (end)
   * @param {string} [params.user_id] - Filter by user
   * @param {number} [params.min_amount] - Minimum refund amount
   * @param {number} [params.max_amount] - Maximum refund amount
   * @param {string} [params.payment_status] - Filter by status (refunded, partially_refunded)
   * @param {number} [params.skip] - Pagination offset
   * @param {number} [params.limit] - Pagination limit
   * @returns {Promise<Object>} Paginated refunds list
   */
  async getRefunds(params = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.REFUNDS_SEARCH, { params });
    return data;
  },

  /**
   * Get pending refund requests
   * @returns {Promise<Object>} List of pending refunds
   */
  async getPendingRefunds() {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.REFUNDS_PENDING);
    return data;
  },

  /**
   * Approve a pending refund
   * @param {string} paymentId - Payment ID to approve refund for
   * @returns {Promise<Object>} Approval confirmation
   */
  async approveRefund(paymentId) {
    const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.REFUND_APPROVE(paymentId));
    return data;
  },

  /**
   * Reject a pending refund
   * @param {string} paymentId - Payment ID to reject refund for
   * @param {string} reason - Rejection reason (required)
   * @returns {Promise<Object>} Rejection confirmation
   */
  async rejectRefund(paymentId, reason) {
    const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.REFUND_REJECT(paymentId), {
      rejection_reason: reason,
    });
    return data;
  },

  // ===================
  // CANCELLATION REQUESTS
  // ===================

  /**
   * Get cancellation requests
   * @param {Object} params - Filter parameters
   * @param {string} [params.status] - Filter by status (pending, approved, rejected, auto_approved)
   * @param {number} [params.limit] - Pagination limit
   * @param {number} [params.offset] - Pagination offset
   * @returns {Promise<Object>} List of cancellation requests
   */
  async getCancellationRequests(params = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.CANCELLATION_REQUESTS, { params });
    return data;
  },

  /**
   * Get pending cancellation requests
   * @returns {Promise<Object>} List of pending requests
   */
  async getPendingCancellationRequests() {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.CANCELLATION_REQUESTS_PENDING);
    return data;
  },

  /**
   * Get cancellation request by ID
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>} Cancellation request details
   */
  async getCancellationRequestById(requestId) {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.CANCELLATION_REQUEST_BY_ID(requestId));
    return data;
  },

  /**
   * Approve a cancellation request
   * @param {string} requestId - Request ID
   * @param {Object} body - Approval details
   * @param {number} [body.approved_amount] - Amount to refund (optional, defaults to requested)
   * @param {string} [body.admin_notes] - Admin notes
   * @returns {Promise<Object>} Approval result
   */
  async approveCancellationRequest(requestId, body = {}) {
    const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.CANCELLATION_REQUEST_APPROVE(requestId), body);
    return data;
  },

  /**
   * Reject a cancellation request
   * @param {string} requestId - Request ID
   * @param {Object} body - Rejection details
   * @param {string} body.rejection_reason - Reason for rejection (required)
   * @param {string} [body.admin_notes] - Admin notes
   * @returns {Promise<Object>} Rejection result
   */
  async rejectCancellationRequest(requestId, body) {
    const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.CANCELLATION_REQUEST_REJECT(requestId), body);
    return data;
  },

  /**
   * Get cancellation request statistics
   * @returns {Promise<Object>} Stats summary
   */
  async getCancellationRequestStats() {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.CANCELLATION_REQUESTS_STATS);
    return data;
  },

  // ===================
  // INVOICE-BASED REFUNDS
  // ===================

  /**
   * Get refunded invoices (uses Invoice table)
   * @param {Object} params - Filter parameters
   * @param {string} [params.start_date] - Start date filter
   * @param {string} [params.end_date] - End date filter
   * @param {string} [params.user_id] - User filter
   * @param {string} [params.search] - Search by invoice number or user
   * @param {number} [params.skip] - Pagination offset
   * @param {number} [params.limit] - Pagination limit
   * @returns {Promise<Object>} Refunded invoices list
   */
  async getRefundedInvoices(params = {}) {
    const { data } = await apiClient.get('/admin/invoices/refunded', { params });
    return data;
  },

  /**
   * Get invoice statistics
   * @returns {Promise<Object>} Invoice stats by status
   */
  async getInvoiceStats() {
    const { data } = await apiClient.get('/admin/invoices/stats');
    return data;
  },

  /**
   * Send server logs to developer for support
   * @returns {Promise<Object>} Success message
   */
  async sendSupportLogs() {
    const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.SEND_SUPPORT_LOGS);
    return data;
  },

  /**
   * Send bulk email to recipients
   * @param {Object} emailData - Bulk email parameters
   * @param {string} emailData.recipient_type - "all", "class", "program", "area", "custom"
   * @param {string} [emailData.class_id] - Class ID (when recipient_type is "class")
   * @param {string} [emailData.program_id] - Program ID (when recipient_type is "program")
   * @param {string} [emailData.area_id] - Area ID (when recipient_type is "area")
   * @param {Array<string>} [emailData.recipient_ids] - Custom recipient IDs
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.message - Email body
   * @param {boolean} [emailData.include_parents] - Include parents (default true)
   * @returns {Promise<Object>} Results with total_recipients, successful, failed, details
   */
  async sendBulkEmail(emailData) {
    const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.BULK_EMAIL, emailData);
    return data;
  },
};

export default adminService;

/**
 * Invoices Service
 * Handles invoice and billing management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const invoicesService = {
  /**
   * Get billing summary for current user
   * @returns {Promise<Object>} Billing summary with balance, next due date, etc.
   */
  async getBillingSummary() {
    const { data } = await apiClient.get(API_ENDPOINTS.INVOICES.BILLING_SUMMARY);
    return data;
  },

  /**
   * Get all user's invoices
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.status] - Filter by status (draft, sent, paid, overdue)
   * @param {number} [filters.skip] - Number to skip (pagination)
   * @param {number} [filters.limit] - Maximum number to return
   * @returns {Promise<Object>} List of invoices with total
   */
  async getMyInvoices(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.INVOICES.MY, {
      params: filters,
    });
    return data;
  },

  /**
   * Get invoice by ID
   * @param {string} id - Invoice ID
   * @returns {Promise<Object>} Invoice details
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.INVOICES.BY_ID(id));
    return data;
  },

  /**
   * Download invoice as PDF
   * @param {string} id - Invoice ID
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadPdf(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.INVOICES.DOWNLOAD(id), {
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Get all invoices (admin only)
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.user_id] - Filter by user
   * @param {number} [filters.skip] - Number to skip
   * @param {number} [filters.limit] - Maximum number to return
   * @returns {Promise<Object>} List of invoices with total
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.INVOICES.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Sync invoices from Stripe for current user
   * Fetches all invoices from Stripe and stores them in the database
   * @returns {Promise<Object>} Sync summary with counts
   */
  async syncFromStripe() {
    const { data } = await apiClient.post(API_ENDPOINTS.INVOICES.SYNC);
    return data;
  },

  /**
   * Sync ALL invoices from Stripe (admin only)
   * Fetches all invoices from Stripe for all customers
   * @param {Object} filters - Optional filters
   * @param {string} [filters.status] - Stripe status filter (draft, open, paid, etc.)
   * @returns {Promise<Object>} Sync summary with counts
   */
  async syncAllFromStripe(filters = {}) {
    const { data } = await apiClient.post(API_ENDPOINTS.INVOICES.SYNC_ALL, null, {
      params: filters,
    });
    return data;
  },
};

export default invoicesService;

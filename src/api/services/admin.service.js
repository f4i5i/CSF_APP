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
   * Get class roster
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Class roster with enrolled students
   */
  async getClassRoster(classId) {
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.ROSTER(classId));
    return data;
  },
};

export default adminService;

/**
 * Waitlist Service
 * API calls for managing class waitlists
 */

import apiClient from '../client';

const waitlistService = {
  /**
   * Get all waitlist entries
   * @param {Object} filters - Filter options
   * @returns {Promise}
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.class_id) params.append('class_id', filters.class_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);

    const response = await apiClient.get(`/waitlist?${params.toString()}`);
    return response.data;
  },

  /**
   * Get waitlist entry by ID
   * @param {number} id - Waitlist entry ID
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await apiClient.get(`/waitlist/${id}`);
    return response.data;
  },

  /**
   * Add student to waitlist
   * @param {Object} data - Waitlist entry data
   * @returns {Promise}
   */
  add: async (data) => {
    const response = await apiClient.post('/waitlist', data);
    return response.data;
  },

  /**
   * Move waitlist entry to enrolled
   * @param {number} id - Waitlist entry ID
   * @param {Object} options - Options (notify, etc.)
   * @returns {Promise}
   */
  moveToEnrolled: async (id, options = {}) => {
    const response = await apiClient.post(`/waitlist/${id}/enroll`, options);
    return response.data;
  },

  /**
   * Remove from waitlist
   * @param {number} id - Waitlist entry ID
   * @returns {Promise}
   */
  remove: async (id) => {
    const response = await apiClient.delete(`/waitlist/${id}`);
    return response.data;
  },

  /**
   * Send notification when spot is available
   * @param {number} id - Waitlist entry ID
   * @returns {Promise}
   */
  notifyAvailable: async (id) => {
    const response = await apiClient.post(`/waitlist/${id}/notify`);
    return response.data;
  },

  /**
   * Get waitlist position
   * @param {number} id - Waitlist entry ID
   * @returns {Promise}
   */
  getPosition: async (id) => {
    const response = await apiClient.get(`/waitlist/${id}/position`);
    return response.data;
  },

  /**
   * Get waitlist count for a class
   * @param {number} classId - Class ID
   * @returns {Promise}
   */
  getCountByClass: async (classId) => {
    const response = await apiClient.get(`/waitlist/class/${classId}/count`);
    return response.data;
  },
};

export default waitlistService;

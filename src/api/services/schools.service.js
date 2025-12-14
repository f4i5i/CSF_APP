/**
 * Schools Service
 * Handles schools management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const schoolsService = {
  /**
   * Get all available schools
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} List of schools
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.SCHOOLS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get school by ID
   * @param {string} id - School ID
   * @returns {Promise<Object>} School details
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.SCHOOLS.BY_ID(id));
    return data;
  },

  /**
   * Create new school (admin only)
   * @param {Object} schoolData - School information
   * @returns {Promise<Object>} Created school
   */
  async create(schoolData) {
    const { data } = await apiClient.post(API_ENDPOINTS.SCHOOLS.CREATE, schoolData);
    return data;
  },

  /**
   * Update school (admin only)
   * @param {string} id - School ID
   * @param {Object} schoolData - Updated school data
   * @returns {Promise<Object>} Updated school
   */
  async update(id, schoolData) {
    const { data } = await apiClient.put(API_ENDPOINTS.SCHOOLS.UPDATE(id), schoolData);
    return data;
  },

  /**
   * Delete school (admin only)
   * @param {string} id - School ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.SCHOOLS.DELETE(id));
    return data;
  },
};

export default schoolsService;

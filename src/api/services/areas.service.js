/**
 * Areas Service
 * Handles geographic areas/locations management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const areasService = {
  /**
   * Get all available areas
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} List of areas
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.AREAS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get area by ID
   * @param {string} id - Area ID
   * @returns {Promise<Object>} Area details
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.AREAS.BY_ID(id));
    return data;
  },

  /**
   * Create new area (admin only)
   * @param {Object} areaData - Area information
   * @returns {Promise<Object>} Created area
   */
  async create(areaData) {
    const { data } = await apiClient.post(API_ENDPOINTS.AREAS.CREATE, areaData);
    return data;
  },

  /**
   * Update area (admin only)
   * @param {string} id - Area ID
   * @param {Object} areaData - Updated area data
   * @returns {Promise<Object>} Updated area
   */
  async update(id, areaData) {
    const { data } = await apiClient.put(API_ENDPOINTS.AREAS.UPDATE(id), areaData);
    return data;
  },

  /**
   * Delete area (admin only)
   * @param {string} id - Area ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.AREAS.DELETE(id));
    return data;
  },
};

export default areasService;

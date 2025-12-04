/**
 * Programs Service
 * Handles sports programs and activities management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const programsService = {
  /**
   * Get all available programs
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.sport_type] - Filter by sport type (soccer, basketball, etc.)
   * @param {string} [filters.age_group] - Filter by age group
   * @param {boolean} [filters.active] - Filter by active status
   * @param {string} [filters.season] - Filter by season
   * @returns {Promise<Array>} List of programs
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.PROGRAMS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get program by ID
   * @param {string} id - Program ID
   * @returns {Promise<Object>} Program details with classes and schedule
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.PROGRAMS.BY_ID(id));
    return data;
  },

  /**
   * Create new program (admin only)
   * @param {Object} programData - Program information
   * @param {string} programData.name - Program name
   * @param {string} programData.sport_type - Sport type
   * @param {string} programData.description - Program description
   * @param {string} programData.age_group - Target age group
   * @param {number} programData.min_age - Minimum age
   * @param {number} programData.max_age - Maximum age
   * @param {string} programData.season - Season (Fall, Winter, Spring, Summer)
   * @param {number} [programData.price] - Program price
   * @param {string} [programData.image_url] - Program image URL
   * @param {boolean} [programData.registration_open] - Registration status
   * @returns {Promise<Object>} Created program
   */
  async create(programData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PROGRAMS.CREATE,
      programData
    );
    return data;
  },

  /**
   * Update program information (admin only)
   * @param {string} id - Program ID
   * @param {Object} programData - Updated program data
   * @returns {Promise<Object>} Updated program
   */
  async update(id, programData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.PROGRAMS.BY_ID(id),
      programData
    );
    return data;
  },

  /**
   * Delete program (admin only)
   * @param {string} id - Program ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.PROGRAMS.BY_ID(id));
    return data;
  },

  /**
   * Get classes for a program
   * @param {string} programId - Program ID
   * @returns {Promise<Array>} Program classes
   */
  async getClasses(programId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.PROGRAMS.CLASSES(programId)
    );
    return data;
  },

  /**
   * Get enrollments for a program (admin only)
   * @param {string} programId - Program ID
   * @returns {Promise<Array>} Program enrollments
   */
  async getEnrollments(programId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.PROGRAMS.ENROLLMENTS(programId)
    );
    return data;
  },

  /**
   * Get program statistics (admin only)
   * @param {string} programId - Program ID
   * @returns {Promise<Object>} Statistics {total_enrollments, total_classes, revenue, etc.}
   */
  async getStats(programId) {
    const { data } = await apiClient.get(API_ENDPOINTS.PROGRAMS.STATS(programId));
    return data;
  },

  /**
   * Get active programs
   * @returns {Promise<Array>} Active programs
   */
  async getActive() {
    return this.getAll({ active: true });
  },

  /**
   * Get programs by sport type
   * @param {string} sportType - Sport type
   * @returns {Promise<Array>} Programs of the specified sport
   */
  async getBySportType(sportType) {
    return this.getAll({ sport_type: sportType });
  },

  /**
   * Get programs by season
   * @param {string} season - Season (Fall, Winter, Spring, Summer)
   * @returns {Promise<Array>} Seasonal programs
   */
  async getBySeason(season) {
    return this.getAll({ season });
  },

  /**
   * Get programs accepting registration
   * @returns {Promise<Array>} Programs with open registration
   */
  async getOpenForRegistration() {
    const { data } = await apiClient.get(API_ENDPOINTS.PROGRAMS.OPEN_REGISTRATION);
    return data;
  },

  /**
   * Toggle program registration status (admin only)
   * @param {string} id - Program ID
   * @param {boolean} open - Registration open status
   * @returns {Promise<Object>} Updated program
   */
  async toggleRegistration(id, open) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PROGRAMS.TOGGLE_REGISTRATION(id),
      { registration_open: open }
    );
    return data;
  },

  /**
   * Get featured programs
   * @returns {Promise<Array>} Featured programs
   */
  async getFeatured() {
    const { data } = await apiClient.get(API_ENDPOINTS.PROGRAMS.FEATURED);
    return data;
  },

  /**
   * Set program as featured (admin only)
   * @param {string} id - Program ID
   * @param {boolean} featured - Featured status
   * @returns {Promise<Object>} Updated program
   */
  async setFeatured(id, featured) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PROGRAMS.SET_FEATURED(id),
      { featured }
    );
    return data;
  },

  /**
   * Upload program image (admin only)
   * @param {string} programId - Program ID
   * @param {File} imageFile - Image file
   * @returns {Promise<Object>} Updated program with image URL
   */
  async uploadImage(programId, imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    const { data } = await apiClient.post(
      API_ENDPOINTS.PROGRAMS.UPLOAD_IMAGE(programId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Get program calendar/schedule
   * @param {string} programId - Program ID
   * @param {Object} params - Parameters
   * @param {string} [params.start_date] - Start date (YYYY-MM-DD)
   * @param {string} [params.end_date] - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Program schedule
   */
  async getSchedule(programId, params = {}) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.PROGRAMS.SCHEDULE(programId),
      { params }
    );
    return data;
  },

  /**
   * Search programs
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching programs
   */
  async search(query) {
    const { data } = await apiClient.get(API_ENDPOINTS.PROGRAMS.SEARCH, {
      params: { q: query },
    });
    return data;
  },
};

export default programsService;

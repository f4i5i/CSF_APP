/**
 * Classes Service
 * Handles class/program management and enrollment operations
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const classesService = {
  /**
   * Get all available classes with optional filters
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.program_id] - Filter by program ID
   * @param {string} [filters.school_id] - Filter by school ID
   * @param {string} [filters.area_id] - Filter by area ID
   * @param {boolean} [filters.has_capacity] - Only show classes with available spots
   * @param {number} [filters.min_age] - Minimum age requirement
   * @param {number} [filters.max_age] - Maximum age requirement
   * @param {string} [filters.search] - Search query for class name
   * @returns {Promise<Array>} List of classes
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.CLASSES.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get class details by ID
   * @param {string} id - Class ID
   * @returns {Promise<Object>} Class details with schedule, capacity, and enrollment info
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.CLASSES.BY_ID(id));
    return data;
  },

  /**
   * Get class schedule
   * @param {string} id - Class ID
   * @returns {Promise<Array>} Class schedule with sessions
   */
  async getSchedule(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.CLASSES.SCHEDULE(id));
    return data;
  },

  /**
   * Get enrolled students for a class (admin only)
   * @param {string} id - Class ID
   * @returns {Promise<Array>} List of enrolled students
   */
  async getEnrollments(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.CLASSES.ENROLLMENTS(id));
    return data;
  },

  /**
   * Create new class (admin only)
   * @param {Object} classData - Class information
   * @param {string} classData.name - Class name
   * @param {string} classData.program_id - Program ID
   * @param {string} classData.school_id - School ID
   * @param {string} classData.area_id - Area ID
   * @param {number} classData.capacity - Maximum capacity
   * @param {number} classData.min_age - Minimum age
   * @param {number} classData.max_age - Maximum age
   * @param {string} classData.start_date - Start date (YYYY-MM-DD)
   * @param {string} classData.end_date - End date (YYYY-MM-DD)
   * @param {Array} classData.schedule - Weekly schedule
   * @param {string} [classData.description] - Class description
   * @param {number} [classData.price] - Class price
   * @returns {Promise<Object>} Created class
   */
  async create(classData) {
    const { data } = await apiClient.post(API_ENDPOINTS.CLASSES.CREATE, classData);
    return data;
  },

  /**
   * Update class information (admin only)
   * @param {string} id - Class ID
   * @param {Object} classData - Updated class data
   * @returns {Promise<Object>} Updated class
   */
  async update(id, classData) {
    const { data } = await apiClient.put(API_ENDPOINTS.CLASSES.BY_ID(id), classData);
    return data;
  },

  /**
   * Delete class (admin only)
   * @param {string} id - Class ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.CLASSES.BY_ID(id));
    return data;
  },

  /**
   * Check if a class has available capacity
   * @param {string} id - Class ID
   * @returns {Promise<Object>} Capacity information {available: boolean, spots_left: number}
   */
  async checkCapacity(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.CLASSES.CAPACITY(id));
    return data;
  },

  /**
   * Get classes by program
   * @param {string} programId - Program ID
   * @returns {Promise<Array>} List of classes in the program
   */
  async getByProgram(programId) {
    return this.getAll({ program_id: programId });
  },

  /**
   * Get classes by school
   * @param {string} schoolId - School ID
   * @returns {Promise<Array>} List of classes at the school
   */
  async getBySchool(schoolId) {
    return this.getAll({ school_id: schoolId });
  },

  /**
   * Get classes with available spots
   * @returns {Promise<Array>} List of classes with capacity
   */
  async getAvailable() {
    return this.getAll({ has_capacity: true });
  },
};

export default classesService;

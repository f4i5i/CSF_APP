/**
 * Users Service
 * Handles user profile management and admin user CRUD operations
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const usersService = {
  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getMe() {
    const { data } = await apiClient.get(API_ENDPOINTS.USERS.ME);
    return data;
  },

  /**
   * Update current user profile
   * @param {Object} userData - User data to update
   * @param {string} [userData.first_name] - First name
   * @param {string} [userData.last_name] - Last name
   * @param {string} [userData.email] - Email address
   * @param {string} [userData.phone] - Phone number
   * @returns {Promise<Object>} Updated user profile
   */
  async update(userData) {
    const { data } = await apiClient.put(API_ENDPOINTS.USERS.UPDATE, userData);
    return data;
  },

  // ============== Admin User Management ==============

  /**
   * Get all users with optional filters (Admin only)
   * @param {Object} filters - Filter parameters
   * @param {number} [filters.skip=0] - Number of records to skip
   * @param {number} [filters.limit=20] - Number of records to return
   * @param {string} [filters.search] - Search by name or email
   * @param {string} [filters.role] - Filter by role (owner, admin, coach, parent)
   * @param {boolean} [filters.is_active] - Filter by active status
   * @returns {Promise<Object>} Response with items, total, skip, limit
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.USERS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get user by ID (Admin only)
   * @param {string} id - User ID
   * @returns {Promise<Object>} User details
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.USERS.BY_ID(id));
    return data;
  },

  /**
   * Create a new user (Admin only)
   * @param {Object} userData - User data
   * @param {string} userData.email - Email address
   * @param {string} userData.first_name - First name
   * @param {string} userData.last_name - Last name
   * @param {string} [userData.phone] - Phone number
   * @param {string} [userData.role='parent'] - User role
   * @param {string} [userData.password] - Password (optional, user will need to reset if not provided)
   * @param {boolean} [userData.is_active=true] - Active status
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    const { data } = await apiClient.post(API_ENDPOINTS.USERS.CREATE, userData);
    return data;
  },

  /**
   * Update a user (Admin only)
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, userData) {
    const { data } = await apiClient.put(API_ENDPOINTS.USERS.BY_ID(id), userData);
    return data;
  },

  /**
   * Delete a user (Admin only) - soft delete
   * @param {string} id - User ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id));
    return data;
  },
};

export default usersService;

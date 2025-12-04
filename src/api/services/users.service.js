/**
 * Users Service
 * Handles user profile management
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
};

export default usersService;

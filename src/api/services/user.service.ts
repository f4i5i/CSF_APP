/**
 * User Service
 * Handles user profile management
 */

import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../constants/endpoints';
import type { User, UpdateUserRequest } from '../types/auth.types';

/**
 * User service
 * Pure API functions for user management
 */
export const userService = {
  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>(ENDPOINTS.USERS.ME);
    return data;
  },

  /**
   * Update current user profile
   */
  async updateMe(userData: UpdateUserRequest): Promise<User> {
    const { data } = await apiClient.put<User>(
      ENDPOINTS.USERS.UPDATE_ME,
      userData
    );
    return data;
  },
};

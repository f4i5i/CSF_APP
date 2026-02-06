/**
 * Authentication Service
 * Handles login, registration, token management, and logout
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';
import API_CONFIG from '../config';

const storeTokens = (tokens = {}) => {
  if (tokens.access_token) {
    localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, tokens.access_token);
  }

  if (tokens.refresh_token) {
    localStorage.setItem(
      API_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
      tokens.refresh_token
    );
  }
};

const authService = {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Token response with access_token and refresh_token
   */
  async login(email, password) {
    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    storeTokens(data.tokens ?? data);

    return data;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.confirm_password - Password confirmation
   * @param {string} userData.first_name - First name
   * @param {string} userData.last_name - Last name
   * @param {string} [userData.phone] - Phone number (optional)
   * @returns {Promise<Object>} Token response
   */
  async register(userData) {
    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);

    storeTokens(data.tokens ?? data);

    return data;
  },

  /**
   * Refresh access token using refresh token
   * @returns {Promise<Object>} New token response
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });

    storeTokens(data);

    return data;
  },

  /**
   * Google OAuth authentication
   * @param {string} googleToken - Google OAuth token
   * @returns {Promise<Object>} Token response
   */
  async googleAuth(googleToken) {
    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE, {
      token: googleToken,
    });

    storeTokens(data.tokens ?? data);

    return data;
  },

  /**
   * Logout - notify backend and clear all authentication data
   */
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Clear tokens from localStorage even if API call fails
      localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
      localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);

      if (apiClient.defaults?.headers?.common?.Authorization) {
        delete apiClient.defaults.headers.common['Authorization'];
      }
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if access token exists
   */
  isAuthenticated() {
    return !!localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
  },

  /**
   * Get stored access token
   * @returns {string|null} Access token or null
   */
  getAccessToken() {
    return localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
  },

  /**
   * Get stored refresh token
   * @returns {string|null} Refresh token or null
   */
  getRefreshToken() {
    return localStorage.getItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
  },

  async forgotPassword(email) {
    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return data;
  },

  async resetPassword(token, newPassword, confirmPassword) {
    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword || newPassword,
    });
    return data;
  },
};

export default authService;

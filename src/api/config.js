/**
 * API Configuration
 * Central configuration for all API-related settings
 */

const API_CONFIG = {
  // Base API URL - defaults to localhost:8000
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',

  // API version prefix
  API_PREFIX: '/api/v1',

  // Request timeout (30 seconds)
  TIMEOUT: 30000,

  // Token storage keys
  TOKEN_STORAGE_KEY: 'csf_access_token',
  REFRESH_TOKEN_STORAGE_KEY: 'csf_refresh_token',

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

/**
 * Helper function to construct full API URLs
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login')
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
};

/**
 * Get the full base URL (including API prefix)
 * @returns {string} Full base URL
 */
export const getBaseUrl = () => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`;
};

export default API_CONFIG;

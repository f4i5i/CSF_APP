/**
 * API Configuration
 * Central configuration for API client settings
 */

/**
 * API configuration object
 */
export const API_CONFIG = {
  // Base URL for API (from environment or default to localhost)
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',

  // API version prefix
  API_PREFIX: '/api/v1',

  // Request timeout in milliseconds (30 seconds)
  TIMEOUT: 30000,

  // Token storage keys in localStorage
  TOKEN_STORAGE_KEY: 'csf_access_token',
  REFRESH_TOKEN_STORAGE_KEY: 'csf_refresh_token',

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // Base delay in milliseconds
} as const;

/**
 * Get full API URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
}

export default API_CONFIG;

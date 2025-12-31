/**
 * API Configuration
 * Central configuration for all API-related settings
 */

const API_CONFIG = {
  // Base API URL - defaults to localhost:8000
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',

  // API version prefix
  API_PREFIX: '/v1',

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

/**
 * Get the uploads base URL for static files
 * @returns {string} Uploads base URL
 */
export const getUploadsUrl = () => {
  // Remove /api from BASE_URL to get the server root
  const serverRoot = API_CONFIG.BASE_URL.replace(/\/api$/, '');
  return `${serverRoot}/uploads`;
};

/**
 * Get full URL for an uploaded file
 * @param {string} filePath - Relative file path or API endpoint (e.g., 'announcements/xyz.jpg' or '/api/v1/children/123/profile-image')
 * @returns {string} Full URL to the file
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  // If already a full URL, return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  // If it's an API endpoint URL (starts with /api/), prepend the server root
  if (filePath.startsWith('/api/')) {
    const serverRoot = API_CONFIG.BASE_URL.replace(/\/api$/, '');
    return `${serverRoot}${filePath}`;
  }
  // Legacy: filesystem-based path
  return `${getUploadsUrl()}/${filePath}`;
};

export default API_CONFIG;

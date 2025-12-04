/**
 * Axios Client with Interceptors
 * Handles all API communication, token refresh, and error transformation
 *
 * Features:
 * - Automatic token attachment to requests
 * - Token refresh on 401 errors
 * - Request queuing during token refresh
 * - Error transformation to standard format
 * - withCredentials for httpOnly cookies support
 */

import axios from 'axios';
import API_CONFIG from './config';
import { handleApiError } from '../lib/errorHandler';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // CRITICAL for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
  },
});

// Request queue for handling concurrent requests during token refresh
let isRefreshing = false;
let failedQueue = [];

/**
 * Process queued requests after token refresh
 * @param {Error|null} error - Error if refresh failed
 * @param {string|null} token - New access token if refresh succeeded
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * REQUEST INTERCEPTOR
 * Adds access token to Authorization header for every request
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    const token = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);

    // Add token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Handles token refresh on 401 errors and transforms all errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.url} - ${response.status}`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Mark request as retry to prevent infinite loops
      originalRequest._retry = true;
      isRefreshing = true;

      // Get refresh token
      const refreshToken = localStorage.getItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);

      // No refresh token - redirect to login
      if (!refreshToken) {
        processQueue(error, null);
        isRefreshing = false;

        // Clear storage and redirect
        localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
        localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
        window.location.href = '/';

        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            withCredentials: true,
            headers: {
              'ngrok-skip-browser-warning': '69420',
            }
          }
        );

        const { access_token, refresh_token } = response.data;

        // Store new tokens
        localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, access_token);
        localStorage.setItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY, refresh_token);

        // Update default authorization header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Process queued requests with new token
        processQueue(null, access_token);
        isRefreshing = false;

        // Retry original request with new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - logout user
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear all auth data
        localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
        localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);

        // Redirect to login
        window.location.href = '/';

        return Promise.reject(refreshError);
      }
    }

    // Transform error to standard format and reject
    const transformedError = handleApiError(error);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', transformedError);
    }

    return Promise.reject(transformedError);
  }
);

/**
 * Helper function to set authorization token
 * Useful for setting token after login/registration
 * @param {string} token - Access token
 */
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
    localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
  }
};

/**
 * Helper function to clear authentication
 */
export const clearAuth = () => {
  delete apiClient.defaults.headers.common['Authorization'];
  localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
  localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
};

export default apiClient;

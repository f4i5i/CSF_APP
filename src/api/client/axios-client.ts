/**
 * @file axios-client.ts
 * @description Configured Axios HTTP client with interceptors for the CSF application.
 *
 * This module provides a preconfigured Axios instance that handles:
 * - Automatic JWT token attachment to requests
 * - Intelligent token refresh on 401 errors
 * - Request queuing during token refresh to prevent duplicate refresh calls
 * - Error transformation to user-friendly messages
 * - httpOnly cookie support for secure session management
 *
 * Key Features:
 *
 * 1. REQUEST INTERCEPTOR
 *    - Automatically attaches JWT access token to Authorization header
 *    - Retrieves token from localStorage before each request
 *    - Transforms errors using centralized error handler
 *
 * 2. RESPONSE INTERCEPTOR
 *    - Detects 401 Unauthorized responses (expired token)
 *    - Automatically refreshes token using refresh token
 *    - Queues concurrent requests during token refresh to prevent race conditions
 *    - Retries failed requests with new token after refresh
 *    - Redirects to login if token refresh fails
 *    - Transforms all errors to standardized format
 *
 * 3. REQUEST QUEUING
 *    - Prevents multiple simultaneous token refresh calls
 *    - Queues requests that arrive while token is being refreshed
 *    - Processes all queued requests once new token is obtained
 *    - Maintains request integrity and prevents dropped requests
 *
 * Technical Implementation:
 *
 * Token Refresh Flow:
 * 1. API request fails with 401 error
 * 2. Check if token refresh already in progress
 * 3. If yes: Queue request and wait for new token
 * 4. If no: Start token refresh process
 * 5. Call refresh token endpoint with refresh_token
 * 6. Store new access_token and refresh_token
 * 7. Retry original request with new token
 * 8. Process all queued requests with new token
 * 9. If refresh fails: Clear storage and redirect to login
 *
 * @requires axios
 * @requires ../config/api.config
 * @requires ../utils/error-handler
 * @requires ../types/auth.types
 *
 * @example
 * // Import and use the configured client
 * import apiClient from '@/api/client/axios-client';
 *
 * // Make authenticated requests
 * const response = await apiClient.get('/users/me');
 * const data = await apiClient.post('/enrollments', enrollmentData);
 */

// ========================================
// IMPORTS
// ========================================
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { handleApiError } from '../utils/error-handler';
import type { LoginResponse } from '../types/auth.types';

// ========================================
// AXIOS INSTANCE CONFIGURATION
// ========================================

/**
 * Preconfigured Axios instance
 *
 * Configuration:
 * - baseURL: Combines BASE_URL + API_PREFIX (e.g., http://localhost:8000/api/v1)
 * - timeout: 30 seconds (configurable via API_CONFIG)
 * - withCredentials: true - CRITICAL for sending/receiving httpOnly cookies
 * - headers:
 *   - Content-Type: application/json - All requests send JSON
 *   - ngrok-skip-browser-warning: Bypass ngrok browser warning during development
 */
export const apiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // CRITICAL: Enables sending/receiving httpOnly cookies for session management
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420', // Development: Bypass ngrok browser warning
  },
});

// ========================================
// TOKEN REFRESH QUEUE MANAGEMENT
// ========================================

/**
 * Token refresh state flag
 * Prevents multiple simultaneous token refresh calls
 * Set to true when refresh is in progress, false when complete
 */
let isRefreshing = false;

/**
 * Failed request queue
 *
 * Stores requests that arrive while token refresh is in progress
 * Each entry contains resolve/reject callbacks to process after refresh
 *
 * Structure:
 * {
 *   resolve: (token: string) => void - Called on successful refresh with new token
 *   reject: (error: any) => void - Called on failed refresh with error
 * }
 */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Process queued requests after token refresh
 *
 * Called after token refresh completes (success or failure)
 * Resolves all queued promises with new token or rejects with error
 *
 * @param {any} error - Error object if refresh failed, null if successful
 * @param {string|null} token - New access token if refresh successful, null if failed
 *
 * @example
 * // On successful refresh
 * processQueue(null, newAccessToken);
 *
 * // On failed refresh
 * processQueue(refreshError, null);
 */
const processQueue = (error: any = null, token: string | null = null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      // Refresh failed: Reject all queued requests
      promise.reject(error);
    } else {
      // Refresh succeeded: Resolve all queued requests with new token
      promise.resolve(token!);
    }
  });

  // Clear the queue after processing
  failedQueue = [];
};

// ========================================
// REQUEST INTERCEPTOR
// ========================================

/**
 * REQUEST INTERCEPTOR
 *
 * Automatically attaches JWT access token to every outgoing request
 *
 * Flow:
 * 1. Retrieve access token from localStorage
 * 2. If token exists, add to Authorization header as "Bearer <token>"
 * 3. If error occurs during request setup, transform and reject
 *
 * Token Storage:
 * - Access token stored in localStorage under key defined in API_CONFIG
 * - Retrieved fresh for each request to ensure latest token is used
 *
 * @param {InternalAxiosRequestConfig} config - Axios request configuration
 * @returns {InternalAxiosRequestConfig} Modified config with Authorization header
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Retrieve JWT access token from localStorage
    const token = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);

    // Attach token to Authorization header if it exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    // Transform error to standardized format before rejecting
    return Promise.reject(handleApiError(error));
  }
);

// ========================================
// RESPONSE INTERCEPTOR
// ========================================

/**
 * RESPONSE INTERCEPTOR
 *
 * Handles token refresh on 401 errors and error transformation
 *
 * Flow for successful responses:
 * 1. Pass response through unchanged
 *
 * Flow for 401 Unauthorized errors (expired token):
 * 1. Check if request already retried (_retry flag)
 * 2. Check if token refresh already in progress
 * 3a. If refreshing: Queue request and wait for new token
 * 3b. If not refreshing: Start token refresh process
 * 4. Call /auth/refresh endpoint with refresh token
 * 5. On success:
 *    - Store new access_token and refresh_token
 *    - Update Authorization header on original request
 *    - Process all queued requests
 *    - Retry original request with new token
 * 6. On failure:
 *    - Clear localStorage (logout)
 *    - Redirect to login page
 *    - Reject all queued requests
 *
 * Flow for other errors:
 * 1. Transform error using handleApiError()
 * 2. Reject promise with transformed error
 *
 * @param {AxiosResponse} response - Successful response
 * @param {AxiosError} error - Error response
 * @returns {Promise} Resolved promise for success, rejected for errors
 */
apiClient.interceptors.response.use(
  // Success handler: Pass through unchanged
  (response: AxiosResponse) => response,

  // Error handler: Handle 401 and transform errors
  async (error: AxiosError) => {
    // Type the original request config with retry flag
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    /**
     * HANDLE 401 UNAUTHORIZED - TOKEN EXPIRED
     *
     * Conditions for token refresh:
     * - Response status is 401
     * - Original request exists (config available)
     * - Request hasn't been retried yet (!_retry)
     */
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      /**
       * CASE 1: Token refresh already in progress
       *
       * Queue this request and wait for refresh to complete
       * Returns a promise that resolves when refresh succeeds
       */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          // Add request to queue with resolve/reject callbacks
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Refresh succeeded: Update Authorization header with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            // Retry original request with new token
            return apiClient(originalRequest);
          })
          .catch((err) => {
            // Refresh failed: Transform and reject error
            return Promise.reject(handleApiError(err));
          });
      }

      /**
       * CASE 2: Start token refresh process
       *
       * This is the first 401 error, start refreshing the token
       */

      // Mark request as retried to prevent infinite loops
      originalRequest._retry = true;

      // Set refreshing flag to queue future requests
      isRefreshing = true;

      // Retrieve refresh token from localStorage
      const refreshToken = localStorage.getItem(
        API_CONFIG.REFRESH_TOKEN_STORAGE_KEY
      );

      /**
       * No refresh token available
       * User must log in again
       */
      if (!refreshToken) {
        processQueue(error, null); // Reject all queued requests
        isRefreshing = false;
        localStorage.clear(); // Clear all auth data
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(handleApiError(error));
      }

      /**
       * Attempt to refresh the token
       *
       * Call /auth/refresh endpoint with refresh_token
       * Uses direct axios instance (not apiClient) to avoid interceptor loop
       */
      try {
        const response = await axios.post<LoginResponse>(
          `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            withCredentials: true, // Include cookies
            headers: {
              'ngrok-skip-browser-warning': '69420',
            }
          }
        );

        // Extract new tokens from response
        const { access_token, refresh_token } = response.data;

        // Store new tokens in localStorage
        localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, access_token);
        localStorage.setItem(
          API_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
          refresh_token
        );

        // Update Authorization header on original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        // Process all queued requests with new token
        processQueue(null, access_token);

        // Reset refreshing flag
        isRefreshing = false;

        // Retry original request with new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        /**
         * Token refresh failed
         * Logout user and redirect to login
         */
        processQueue(refreshError, null); // Reject all queued requests
        isRefreshing = false;
        localStorage.clear(); // Clear all auth data
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(handleApiError(refreshError));
      }
    }

    /**
     * NOT A 401 ERROR
     *
     * Transform error to standardized format and reject
     * Uses handleApiError() to convert Axios errors to user-friendly messages
     */
    return Promise.reject(handleApiError(error));
  }
);

// ========================================
// EXPORT
// ========================================

/**
 * Export configured Axios instance
 *
 * Usage in services:
 * import apiClient from '@/api/client/axios-client';
 * const response = await apiClient.get('/endpoint');
 */
export default apiClient;

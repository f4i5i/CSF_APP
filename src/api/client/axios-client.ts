/**
 * Axios Client with Interceptors
 * Handles all API communication, token refresh, and error transformation
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { handleApiError } from '../utils/error-handler';
import type { LoginResponse } from '../types/auth.types';

// Create axios instance with default configuration
export const apiClient = axios.create({
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
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: any = null, token: string | null = null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * REQUEST INTERCEPTOR
 * Adds access token to Authorization header for every request
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(handleApiError(error));
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Handles token refresh on 401 errors and error transformation
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 - Token expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(handleApiError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(
        API_CONFIG.REFRESH_TOKEN_STORAGE_KEY
      );

      if (!refreshToken) {
        processQueue(error, null);
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(handleApiError(error));
      }

      try {
        const response = await axios.post<LoginResponse>(
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

        localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, access_token);
        localStorage.setItem(
          API_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
          refresh_token
        );

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        processQueue(null, access_token);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(handleApiError(refreshError));
      }
    }

    // Transform error and reject
    return Promise.reject(handleApiError(error));
  }
);

export default apiClient;

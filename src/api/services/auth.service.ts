/**
 * Authentication Service
 * Handles login, registration, token management, and logout
 */

import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../config/endpoints';
import { API_CONFIG } from '../config/api.config';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  GoogleAuthRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types/auth.types';

/**
 * Authentication service
 * Pure API functions with no React dependencies
 */
const storeTokens = (tokens?: Partial<LoginResponse>) => {
  if (!tokens) return;

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

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse | { tokens: LoginResponse }>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const tokens = 'tokens' in data ? data.tokens : data;
    storeTokens(tokens);

    return tokens;
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<{ user: any; tokens: LoginResponse } | LoginResponse>(
      ENDPOINTS.AUTH.REGISTER,
      userData
    );
    const tokens = 'tokens' in data ? data.tokens : data;
    storeTokens(tokens);

    return tokens;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem(
      API_CONFIG.REFRESH_TOKEN_STORAGE_KEY
    );

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const { data } = await apiClient.post<RefreshTokenResponse>(
      ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken } as RefreshTokenRequest
    );
    storeTokens(data);

    return data;
  },

  /**
   * Google OAuth authentication
   */
  async googleAuth(googleToken: string): Promise<{ user: any; tokens: LoginResponse }> {
    const { data } = await apiClient.post<{ user: any; tokens: LoginResponse }>(
      ENDPOINTS.AUTH.GOOGLE,
      { token: googleToken } as GoogleAuthRequest
    );
    storeTokens(data.tokens);

    return data;
  },

  /**
   * Logout - notify backend and clear all authentication data
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<void>(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Always clear local auth state even if the API call fails
      localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
      localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);

      if (apiClient.defaults.headers.common) {
        delete apiClient.defaults.headers.common['Authorization'];
      }
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
  },

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
  },
};

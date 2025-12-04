/**
 * Authentication Type Definitions
 * Types for login, registration, and authentication-related operations
 */

import type { UserRole, UserId } from './common.types';

// ============================================================================
// User Interface
// ============================================================================

/**
 * User entity
 */
export interface User {
  id: UserId;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  google_id?: string;
  stripe_customer_id?: string;
  account_credit: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

/**
 * Google OAuth authentication request
 */
export interface GoogleAuthRequest {
  token: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Login/Register response with tokens
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in?: number;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ============================================================================
// Update Types
// ============================================================================

/**
 * Update user profile request
 */
export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Token storage keys
 */
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'csf_access_token',
  REFRESH_TOKEN: 'csf_refresh_token',
} as const;

/**
 * User Type Definitions
 * Types for user management and profiles
 */

import type { UserRole, UserId } from './common.types';

// Re-export User from auth.types to avoid circular dependency
export type { User, UpdateUserRequest } from './auth.types';

// ============================================================================
// User Profile Types
// ============================================================================

/**
 * User profile details (extended)
 */
export interface UserProfile {
  id: UserId;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  stripe_customer_id?: string;
  account_credit: number;
  created_at: string;
  updated_at: string;
  // Additional profile fields
  children_count?: number;
  enrollments_count?: number;
  total_spent?: number;
}

// ============================================================================
// User Settings Types
// ============================================================================

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  announcement_notifications: boolean;
  payment_reminders: boolean;
  attendance_reminders: boolean;
}

/**
 * Update notification preferences request
 */
export interface UpdateNotificationPreferencesRequest
  extends Partial<NotificationPreferences> {}

// ============================================================================
// User Statistics Types
// ============================================================================

/**
 * User activity statistics
 */
export interface UserStats {
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  total_payments: number;
  total_spent: number;
  account_credit: number;
  children_count: number;
  last_login?: string;
}

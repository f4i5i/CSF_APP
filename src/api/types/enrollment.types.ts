/**
 * Enrollment Type Definitions
 * Types for class enrollments and waitlist management
 */

import {
  EnrollmentId,
  ChildId,
  ClassId,
  UserId,
  Timestamped,
} from './common.types';
import type { Child } from './child.types';
import type { Class } from './class.types';

// Re-export for convenience
export type { EnrollmentId };

// ============================================================================
// Enrollment Status Enum
// ============================================================================

/**
 * Enrollment status
 */
export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  WAITLIST = 'WAITLIST',
}

// ============================================================================
// Enrollment Interface
// ============================================================================

/**
 * Enrollment entity
 */
export interface Enrollment extends Timestamped {
  id: EnrollmentId;
  child_id: ChildId;
  class_id: ClassId;
  user_id: UserId;
  status: EnrollmentStatus;
  base_price: number;
  discount_amount: number;
  final_price: number;
  enrollment_date: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  payment_completed: boolean;
  // Related entities
  child?: Child;
  class?: Class;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Create enrollment request
 */
export interface CreateEnrollmentRequest {
  child_id: ChildId;
  class_id: ClassId;
  notes?: string;
  discount_code?: string;
}

/**
 * Update enrollment request
 */
export interface UpdateEnrollmentRequest {
  status?: EnrollmentStatus;
  notes?: string;
  payment_completed?: boolean;
}

/**
 * Cancel enrollment request
 */
export interface CancelEnrollmentRequest {
  reason?: string;
  refund_requested?: boolean;
}

/**
 * Cancel enrollment preview response
 */
export interface CancellationPreview {
  refund_amount: number;
  cancellation_fee: number;
  net_refund: number;
  refund_policy: string;
}

/**
 * Transfer enrollment request
 */
export interface TransferEnrollmentRequest {
  new_class_id: ClassId;
  reason?: string;
}

/**
 * Waitlist join request
 */
export interface WaitlistJoinRequest {
  child_id: ChildId;
  class_id: ClassId;
  is_priority?: boolean;
}

/**
 * Waitlist entry
 */
export interface WaitlistEntry extends Timestamped {
  id: string;
  enrollment_id: EnrollmentId;
  position: number;
  is_priority: boolean;
  notified_at?: string;
  expires_at?: string;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Filter parameters for enrollment list
 */
export interface EnrollmentFilters {
  status?: EnrollmentStatus;
  child_id?: ChildId;
  class_id?: ClassId;
  search?: string;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Enrollment with full details
 */
export interface EnrollmentDetail extends Enrollment {
  child: Child;
  class: Class;
  attendance_count?: number;
  attendance_percentage?: number;
}

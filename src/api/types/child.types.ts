/**
 * Child Type Definitions
 * Types for child profiles and emergency contacts
 */

import { ChildId, UserId, Timestamped } from './common.types';

// Re-export for convenience
export type { ChildId };

// ============================================================================
// Child Interface
// ============================================================================

/**
 * Child entity
 */
export interface Child extends Timestamped {
  id: ChildId;
  user_id: UserId;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age: number;
  jersey_size?: string;
  grade?: string;
  school?: string;
  // Encrypted fields
  medical_conditions?: string;
  health_insurance?: string;
  // Additional info
  how_heard?: string;
  after_school_attendance?: boolean;
  notes?: string;
  // Emergency contacts
  emergency_contacts?: EmergencyContact[];
}

// ============================================================================
// Emergency Contact Types
// ============================================================================

/**
 * Emergency contact for a child
 */
export interface EmergencyContact {
  id: string;
  child_id: ChildId;
  first_name: string;
  last_name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
  can_pickup: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Create child request
 */
export interface CreateChildRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  jersey_size?: string;
  grade?: string;
  school?: string;
  medical_conditions?: string;
  health_insurance?: string;
  how_heard?: string;
  after_school_attendance?: boolean;
  notes?: string;
}

/**
 * Update child request
 */
export interface UpdateChildRequest extends Partial<CreateChildRequest> {}

/**
 * Create emergency contact request
 */
export interface CreateEmergencyContactRequest {
  first_name: string;
  last_name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary?: boolean;
  can_pickup?: boolean;
}

/**
 * Update emergency contact request
 */
export interface UpdateEmergencyContactRequest
  extends Partial<CreateEmergencyContactRequest> {}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Filter parameters for children list
 */
export interface ChildFilters {
  search?: string;
  age_min?: number;
  age_max?: number;
  grade?: string;
}

// ============================================================================
// Enums
// ============================================================================

/**
 * Jersey sizes
 */
export enum JerseySize {
  YXS = 'YXS',
  YS = 'YS',
  YM = 'YM',
  YL = 'YL',
  YXL = 'YXL',
  AS = 'AS',
  AM = 'AM',
  AL = 'AL',
  AXL = 'AXL',
}

/**
 * Common relationships for emergency contacts
 */
export enum Relationship {
  PARENT = 'Parent',
  GUARDIAN = 'Guardian',
  GRANDPARENT = 'Grandparent',
  AUNT = 'Aunt',
  UNCLE = 'Uncle',
  SIBLING = 'Sibling',
  FAMILY_FRIEND = 'Family Friend',
  OTHER = 'Other',
}

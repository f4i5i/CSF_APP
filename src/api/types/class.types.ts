/**
 * Class Type Definitions
 * Types for sports classes and programs
 */

import {
  ClassId,
  ProgramId,
  AreaId,
  SchoolId,
  UserId,
  Timestamped,
  DayOfWeek,
} from './common.types';

// Re-export for convenience
export type { ClassId, ProgramId, AreaId, SchoolId };

// ============================================================================
// Program Interface
// ============================================================================

/**
 * Sports program
 */
export interface Program extends Timestamped {
  id: ProgramId;
  name: string;
  description?: string;
  is_active: boolean;
}

// ============================================================================
// Area Interface
// ============================================================================

/**
 * Geographic area
 */
export interface Area extends Timestamped {
  id: AreaId;
  name: string;
  description?: string;
  is_active: boolean;
}

// ============================================================================
// School Interface
// ============================================================================

/**
 * School
 */
export interface School extends Timestamped {
  id: SchoolId;
  name: string;
  address?: string;
  area_id?: AreaId;
  is_active: boolean;
}

// ============================================================================
// Class Schedule
// ============================================================================

/**
 * Class schedule
 */
export interface ClassSchedule {
  day_of_week: DayOfWeek;
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
}

// ============================================================================
// Class Interface
// ============================================================================

/**
 * Coach information
 */
export interface CoachInfo {
  id: UserId;
  first_name: string;
  last_name: string;
}

/**
 * Sports class
 */
export interface Class extends Timestamped {
  id: ClassId;
  name: string;
  description?: string;
  program_id: ProgramId;
  area_id?: AreaId;
  school_id?: SchoolId;
  coach_id?: UserId; // Legacy single coach support
  coach_ids?: UserId[]; // Multiple coaches support
  slug?: string; // Custom URL slug for registration links
  base_price: number;
  capacity: number;
  current_enrollment: number;
  min_age?: number;
  max_age?: number;
  start_date: string;
  end_date: string;
  schedule?: ClassSchedule[];
  location?: string;
  is_active: boolean;
  // Related entities
  program?: Program;
  area?: Area;
  school?: School;
  coach?: CoachInfo; // Legacy single coach
  coaches?: CoachInfo[]; // Multiple coaches
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Create class request (admin only)
 */
export interface CreateClassRequest {
  name: string;
  description?: string;
  program_id: ProgramId;
  area_id?: AreaId;
  school_id?: SchoolId;
  coach_id?: UserId; // Legacy single coach
  coach_ids?: UserId[]; // Multiple coaches support
  slug?: string; // Custom URL slug
  base_price: number;
  capacity: number;
  min_age?: number;
  max_age?: number;
  start_date: string;
  end_date: string;
  schedule?: ClassSchedule[];
  location?: string;
}

/**
 * Update class request (admin only)
 */
export interface UpdateClassRequest extends Partial<CreateClassRequest> {}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Filter parameters for class list
 */
export interface ClassFilters {
  program_id?: ProgramId;
  area_id?: AreaId;
  school_id?: SchoolId;
  has_capacity?: boolean;
  min_age?: number;
  max_age?: number;
  day_of_week?: DayOfWeek;
  is_active?: boolean;
  search?: string;
  exclude_child_id?: string;
  skip?: number;
  limit?: number;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Class capacity information
 */
export interface ClassCapacity {
  class_id: ClassId;
  capacity: number;
  current_enrollment: number;
  available_spots: number;
  has_capacity: boolean;
  waitlist_count?: number;
}

/**
 * Class with availability
 */
export interface ClassWithAvailability extends Class {
  available_spots: number;
  has_capacity: boolean;
  waitlist_count: number;
}

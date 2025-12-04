/**
 * Badge Type Definitions
 * TypeScript types for achievement badges and awards management
 */

import type { Timestamped, UUID, BadgeId } from './common.types';
import type { ChildId } from './child.types';
import type { ProgramId } from './class.types';
import type { EnrollmentId } from './enrollment.types';

// Re-export for convenience
export type { BadgeId };

/**
 * Type aliases for badge identifiers
 */
export type AwardId = UUID;

/**
 * Badge category enum
 */
export enum BadgeCategory {
  ACHIEVEMENT = 'achievement',
  PARTICIPATION = 'participation',
  SKILL = 'skill',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
}

/**
 * Badge interface
 */
export interface Badge extends Timestamped {
  id: BadgeId;
  name: string;
  description: string;
  category: BadgeCategory;
  icon_url: string;
  program_id?: ProgramId;
  criteria?: BadgeCriteria;
  is_active: boolean;
  display_order?: number;
}

/**
 * Badge criteria for earning
 */
export interface BadgeCriteria {
  attendance_count?: number;
  attendance_streak?: number;
  skill_level?: string;
  events_attended?: number;
  special_achievement?: string;
  custom_requirements?: Record<string, any>;
}

/**
 * Badge award record
 */
export interface BadgeAward extends Timestamped {
  id: AwardId;
  badge_id: BadgeId;
  child_id: ChildId;
  enrollment_id?: EnrollmentId;
  earned_date: string; // ISO date
  notes?: string;
  awarded_by?: string; // Admin/coach ID
  badge?: Badge; // Populated badge details
}

/**
 * Request to create badge
 */
export interface CreateBadgeRequest {
  name: string;
  description: string;
  category: BadgeCategory;
  icon_url: string;
  program_id?: ProgramId;
  criteria?: BadgeCriteria;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Request to update badge
 */
export interface UpdateBadgeRequest {
  name?: string;
  description?: string;
  category?: BadgeCategory;
  icon_url?: string;
  program_id?: ProgramId;
  criteria?: BadgeCriteria;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Request to award badge
 */
export interface AwardBadgeRequest {
  badge_id: BadgeId;
  child_id: ChildId;
  enrollment_id?: EnrollmentId;
  notes?: string;
  awarded_by?: string;
}

/**
 * Request to revoke badge
 */
export interface RevokeBadgeRequest {
  reason?: string;
}

/**
 * Badge filters
 */
export interface BadgeFilters {
  category?: BadgeCategory;
  program_id?: ProgramId;
  is_active?: boolean;
}

/**
 * Badge eligibility check result
 */
export interface BadgeEligibility {
  eligible: boolean;
  reason?: string;
  progress?: BadgeProgress;
  missing_requirements?: string[];
}

/**
 * Badge progress tracking
 */
export interface BadgeProgress {
  badge_id: BadgeId;
  child_id: ChildId;
  enrollment_id?: EnrollmentId;
  completion_percentage: number;
  current_values: Record<string, number>;
  required_values: Record<string, number>;
  is_complete: boolean;
  estimated_completion_date?: string;
}

/**
 * Badge leaderboard entry
 */
export interface BadgeLeaderboardEntry {
  child_id: ChildId;
  child_name: string;
  badge_count: number;
  recent_badges?: Badge[];
  last_earned_date?: string;
}

/**
 * Badge statistics
 */
export interface BadgeStats {
  total_badges: number;
  total_awards: number;
  by_category: Record<BadgeCategory, number>;
  most_earned_badge?: {
    badge: Badge;
    count: number;
  };
  recent_awards_count: number;
  average_badges_per_child: number;
}

/**
 * Child's badges grouped response
 */
export interface ChildBadgesResponse {
  child_id: ChildId;
  child_name: string;
  total_badges: number;
  badges: BadgeAward[];
}

/**
 * Leaderboard parameters
 */
export interface LeaderboardParams {
  program_id?: ProgramId;
  badge_id?: BadgeId;
  limit?: number;
}

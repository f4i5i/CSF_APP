/**
 * @fileoverview Badge Service
 *
 * Manages achievement badges, awards, and gamification features for children.
 * Provides comprehensive APIs for creating badges, awarding them to children,
 * tracking progress, and displaying leaderboards.
 *
 * @description
 * The badge system provides:
 * - Badge definition and management (admin)
 * - Award badges to children based on achievements or criteria
 * - Track badge progress and eligibility
 * - Display badge leaderboards
 * - View awarded badges by child or enrollment
 * - Gamification features to encourage participation
 *
 * Badges are used to recognize and reward:
 * - Perfect attendance streaks
 * - Skill achievements
 * - Milestone completions
 * - Participation milestones
 * - Special accomplishments
 *
 * Admin role is required for badge CRUD operations. Any authenticated user
 * can view badges and their progress.
 *
 * @module services/badge
 * @example
 * import { badgeService } from '@/api/services';
 *
 * // Get all available badges
 * const badges = await badgeService.getAll();
 *
 * // View badges earned by a child
 * const childBadges = await badgeService.getByChild('child123');
 *
 * // Award a badge to a child
 * const awarded = await badgeService.awardBadge({
 *   child_id: 'child123',
 *   badge_id: 'perfect-attendance',
 *   reason: 'Perfect attendance for March 2024'
 * });
 *
 * // Check if a child is eligible for a badge
 * const eligibility = await badgeService.checkEligibility('child123', 'perfect-attendance');
 *
 * // Get badge leaderboard
 * const leaderboard = await badgeService.getLeaderboard({
 *   limit: 10,
 *   sort_by: 'badges_count'
 * });
 */

import { apiClient } from '../client/axios-client';
import { ENDPOINTS } from '../config/endpoints';
import type {
  Badge,
  BadgeId,
  BadgeAward,
  CreateBadgeRequest,
  UpdateBadgeRequest,
  AwardBadgeRequest,
  RevokeBadgeRequest,
  BadgeFilters,
  BadgeEligibility,
  BadgeProgress,
  BadgeLeaderboardEntry,
  BadgeStats,
  ChildBadgesResponse,
  LeaderboardParams,
} from '../types/badge.types';

/**
 * Badge service
 * Pure API functions for badge management, awards, and gamification
 */
export const badgeService = {
  /**
   * Get all available badges with optional filters
   *
   * Retrieves the complete list of badges available in the system.
   * These are the badge definitions that can be awarded to children.
   *
   * @async
   * @param {BadgeFilters} [filters] - Optional filter parameters
   * @param {string} [filters.category] - Filter by badge category (e.g., 'attendance', 'skill')
   * @param {string} [filters.status] - Filter by badge status (active, inactive)
   * @param {boolean} [filters.featured] - Filter for featured badges only
   * @returns {Promise<Badge[]>} Array of badge definitions
   *
   * @example
   * // Get all badges
   * const allBadges = await badgeService.getAll();
   *
   * // Get attendance-related badges
   * const attendanceBadges = await badgeService.getAll({
   *   category: 'attendance'
   * });
   */
  async getAll(filters?: BadgeFilters): Promise<Badge[]> {
    const { data } = await apiClient.get<Badge[]>(ENDPOINTS.BADGES.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get a specific badge definition by ID
   *
   * @async
   * @param {BadgeId} id - The badge ID
   * @returns {Promise<Badge>} The badge definition with full details
   *
   * @example
   * const badge = await badgeService.getById('perfect-attendance');
   * console.log(badge.name); // 'Perfect Attendance'
   * console.log(badge.description); // 'Attended all classes in the month'
   * console.log(badge.icon_url); // 'https://...'
   */
  async getById(id: BadgeId): Promise<Badge> {
    const { data } = await apiClient.get<Badge>(ENDPOINTS.BADGES.BY_ID(id));
    return data;
  },

  /**
   * Create a new badge definition (admin only)
   *
   * Defines a new badge that can be awarded to children. Requires admin role.
   * Badges should have clear criteria for earning.
   *
   * @async
   * @param {CreateBadgeRequest} badgeData - Badge definition to create
   * @param {string} badgeData.name - Badge name (e.g., 'Perfect Attendance')
   * @param {string} badgeData.description - Description of how to earn the badge
   * @param {string} badgeData.category - Badge category (attendance, skill, milestone, etc.)
   * @param {string} [badgeData.icon_url] - URL to badge icon image
   * @param {Object} [badgeData.criteria] - Criteria object defining earning requirements
   * @returns {Promise<Badge>} The created badge definition
   *
   * @example
   * const newBadge = await badgeService.create({
   *   name: 'Perfect Attendance',
   *   description: 'Attended all classes in the month',
   *   category: 'attendance',
   *   icon_url: 'https://cdn.example.com/badges/perfect-attendance.png',
   *   criteria: {
   *     min_attendance_rate: 1.0,
   *     period: 'month'
   *   }
   * });
   */
  async create(badgeData: CreateBadgeRequest): Promise<Badge> {
    const { data } = await apiClient.post<Badge>(ENDPOINTS.BADGES.CREATE, badgeData);
    return data;
  },

  /**
   * Update an existing badge definition (admin only)
   *
   * Modifies badge information. Requires admin role.
   * Updating a badge may affect eligibility calculations for existing awards.
   *
   * @async
   * @param {BadgeId} id - The badge ID to update
   * @param {UpdateBadgeRequest} badgeData - Fields to update
   * @param {string} [badgeData.name] - Updated badge name
   * @param {string} [badgeData.description] - Updated description
   * @param {string} [badgeData.icon_url] - Updated icon URL
   * @param {string} [badgeData.status] - Updated status (active, inactive)
   * @returns {Promise<Badge>} The updated badge definition
   *
   * @example
   * const updated = await badgeService.update('perfect-attendance', {
   *   description: 'Attended all classes in the month (updated criteria)',
   *   status: 'active'
   * });
   */
  async update(id: BadgeId, badgeData: UpdateBadgeRequest): Promise<Badge> {
    const { data } = await apiClient.put<Badge>(ENDPOINTS.BADGES.BY_ID(id), badgeData);
    return data;
  },

  /**
   * Delete a badge definition (admin only)
   *
   * Removes a badge from the system. Requires admin role.
   * Deleting a badge does not affect previously awarded badges to children.
   *
   * @async
   * @param {BadgeId} id - The badge ID to delete
   * @returns {Promise<{message: string}>} Confirmation message
   *
   * @example
   * const result = await badgeService.delete('temporary-badge');
   * console.log(result.message); // 'Badge deleted successfully'
   */
  async delete(id: BadgeId): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(ENDPOINTS.BADGES.BY_ID(id));
    return data;
  },

  /**
   * Get all badges earned by a specific child
   *
   * Retrieves all badge awards for a child across all enrollments.
   * Shows the child's achievements and earned badges.
   *
   * @async
   * @param {string} childId - The child's ID
   * @returns {Promise<BadgeAward[]>} Array of badges earned by the child
   *
   * @example
   * const childBadges = await badgeService.getByChild('child123');
   * childBadges.forEach(award => {
   *   console.log(award.badge.name); // 'Perfect Attendance'
   *   console.log(award.awarded_at); // '2024-01-15'
   * });
   */
  async getByChild(childId: string): Promise<BadgeAward[]> {
    const { data } = await apiClient.get<BadgeAward[]>(ENDPOINTS.BADGES.BY_CHILD(childId));
    return data;
  },

  /**
   * Get all badges earned in a specific enrollment
   *
   * Retrieves all badge awards for a child within a specific class enrollment.
   * Useful for viewing achievements in a particular class context.
   *
   * @async
   * @param {string} enrollmentId - The enrollment ID
   * @returns {Promise<BadgeAward[]>} Array of badges earned in the enrollment
   *
   * @example
   * const enrollmentBadges = await badgeService.getByEnrollment('enrollment123');
   * console.log(enrollmentBadges.length); // 3 badges earned in this class
   */
  async getByEnrollment(enrollmentId: string): Promise<BadgeAward[]> {
    const { data } = await apiClient.get<BadgeAward[]>(ENDPOINTS.BADGES.BY_ENROLLMENT(enrollmentId));
    return data;
  },

  /**
   * Get current user's children's badges
   *
   * For parent/guardian users, retrieves all badges for all their children.
   * Aggregates badges across all children in one call.
   *
   * @async
   * @returns {Promise<ChildBadgesResponse[]>} Array of each child with their badges
   *
   * @example
   * const childrenBadges = await badgeService.getMyChildrenBadges();
   * childrenBadges.forEach(childRecord => {
   *   console.log(childRecord.child_id);
   *   console.log(childRecord.badges.length); // Number of badges
   * });
   */
  async getMyChildrenBadges(): Promise<ChildBadgesResponse[]> {
    const { data } = await apiClient.get<ChildBadgesResponse[]>(ENDPOINTS.BADGES.MY_CHILDREN);
    return data;
  },

  /**
   * Award a badge to a child (admin only)
   *
   * Manually awards a badge to a child for achievements or milestones.
   * Requires admin role. Creates a new badge award record.
   *
   * @async
   * @param {AwardBadgeRequest} awardData - Badge award details
   * @param {string} awardData.child_id - ID of the child to award badge to
   * @param {BadgeId} awardData.badge_id - ID of the badge to award
   * @param {string} [awardData.reason] - Reason for the award (visible to child/parents)
   * @param {string} [awardData.awarded_by] - Admin user ID who awarded the badge
   * @returns {Promise<BadgeAward>} The created badge award
   *
   * @example
   * const award = await badgeService.awardBadge({
   *   child_id: 'child123',
   *   badge_id: 'perfect-attendance',
   *   reason: 'Perfect attendance for January 2024',
   *   awarded_by: 'admin123'
   * });
   * console.log(award.id); // Award ID
   * console.log(award.awarded_at); // '2024-02-01'
   */
  async awardBadge(awardData: AwardBadgeRequest): Promise<BadgeAward> {
    const { data } = await apiClient.post<BadgeAward>(
      ENDPOINTS.BADGES.AWARD,
      awardData
    );
    return data;
  },

  /**
   * Revoke a badge from a child (admin only)
   *
   * Removes a previously awarded badge from a child. Requires admin role.
   * Used for correcting mistaken awards or enforcement purposes.
   *
   * @async
   * @param {string} awardId - The badge award ID to revoke
   * @param {RevokeBadgeRequest} [revocationData] - Optional revocation details
   * @param {string} [revocationData.reason] - Reason for revocation
   * @param {string} [revocationData.revoked_by] - Admin user ID revoking the badge
   * @returns {Promise<{message: string}>} Confirmation message
   *
   * @example
   * const result = await badgeService.revokeBadge('award123', {
   *   reason: 'Attendance criteria no longer met',
   *   revoked_by: 'admin123'
   * });
   */
  async revokeBadge(awardId: string, revocationData?: RevokeBadgeRequest): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      ENDPOINTS.BADGES.REVOKE(awardId),
      revocationData
    );
    return data;
  },

  /**
   * Get badge leaderboard
   *
   * Retrieves a ranked list of children by badge count or other metrics.
   * Useful for gamification and displaying top achievers.
   *
   * @async
   * @param {LeaderboardParams} [params] - Leaderboard options
   * @param {number} [params.limit] - Max number of entries (default: 10)
   * @param {number} [params.offset] - Pagination offset
   * @param {string} [params.sort_by] - Sort criteria (badges_count, recent, etc.)
   * @param {string} [params.badge_id] - Filter by specific badge
   * @returns {Promise<BadgeLeaderboardEntry[]>} Ranked list of children
   *
   * @example
   * const leaderboard = await badgeService.getLeaderboard({
   *   limit: 10,
   *   sort_by: 'badges_count'
   * });
   * leaderboard.forEach((entry, index) => {
   *   console.log(`${index + 1}. ${entry.child_name}: ${entry.badge_count} badges`);
   * });
   */
  async getLeaderboard(params?: LeaderboardParams): Promise<BadgeLeaderboardEntry[]> {
    const { data } = await apiClient.get<BadgeLeaderboardEntry[]>(ENDPOINTS.BADGES.LEADERBOARD, {
      params,
    });
    return data;
  },

  /**
   * Get badge statistics
   *
   * Retrieves statistics about badge distribution and usage.
   * Can get overall stats or stats for a specific badge.
   *
   * @async
   * @param {BadgeId} [badgeId] - Optional badge ID for specific badge stats
   * @returns {Promise<BadgeStats>} Badge statistics
   *
   * @example
   * // Get overall badge statistics
   * const overallStats = await badgeService.getStats();
   * console.log(overallStats.total_badges_awarded); // Total awards across all children
   * console.log(overallStats.unique_children); // Unique children with badges
   *
   * // Get stats for a specific badge
   * const badgeStats = await badgeService.getStats('perfect-attendance');
   * console.log(badgeStats.award_count); // How many times awarded
   * console.log(badgeStats.award_percentage); // What % of children earned it
   */
  async getStats(badgeId?: BadgeId): Promise<BadgeStats> {
    const endpoint = badgeId
      ? ENDPOINTS.BADGES.STATS(badgeId)
      : ENDPOINTS.BADGES.STATS_OVERALL;
    const { data } = await apiClient.get<BadgeStats>(endpoint);
    return data;
  },

  /**
   * Check if a child is eligible to earn a badge
   *
   * Validates whether a child currently meets the criteria for earning a specific badge.
   * Useful for showing children progress toward earning badges.
   *
   * @async
   * @param {string} childId - The child's ID
   * @param {BadgeId} badgeId - The badge to check eligibility for
   * @returns {Promise<BadgeEligibility>} Eligibility status and progress details
   *
   * @example
   * const eligibility = await badgeService.checkEligibility('child123', 'perfect-attendance');
   * console.log(eligibility.is_eligible); // true or false
   * console.log(eligibility.progress); // { current: 19, required: 20 }
   * console.log(eligibility.remaining); // What else is needed
   */
  async checkEligibility(childId: string, badgeId: BadgeId): Promise<BadgeEligibility> {
    const { data } = await apiClient.post<BadgeEligibility>(
      ENDPOINTS.BADGES.CHECK_ELIGIBILITY,
      { child_id: childId, badge_id: badgeId }
    );
    return data;
  },

  /**
   * Get a child's progress toward earning a badge
   *
   * Shows detailed progress metrics for a child toward earning a specific badge.
   * Useful for displaying progress bars and achievement tracking.
   *
   * @async
   * @param {string} childId - The child's ID
   * @param {BadgeId} badgeId - The badge ID
   * @returns {Promise<BadgeProgress>} Detailed progress information
   *
   * @example
   * const progress = await badgeService.getProgress('child123', 'perfect-attendance');
   * console.log(progress.current_value); // Current progress (e.g., 19 classes)
   * console.log(progress.required_value); // Required (e.g., 20 classes)
   * console.log(progress.percentage); // 95% progress
   * console.log(progress.eta); // Estimated time to achieve
   */
  async getProgress(childId: string, badgeId: BadgeId): Promise<BadgeProgress> {
    const { data } = await apiClient.get<BadgeProgress>(
      ENDPOINTS.BADGES.PROGRESS(childId, badgeId)
    );
    return data;
  },

  /**
   * Get badges in a specific category
   *
   * Convenience method to filter badges by category (attendance, skill, etc.).
   * Useful for displaying badge collections by type.
   *
   * @async
   * @param {string} category - The badge category to filter by
   * @returns {Promise<Badge[]>} Array of badges in the category
   *
   * @example
   * const attendanceBadges = await badgeService.getByCategory('attendance');
   * const skillBadges = await badgeService.getByCategory('skill');
   */
  async getByCategory(category: string): Promise<Badge[]> {
    return this.getAll({ category: category as any });
  },

  /**
   * Get recently awarded badges
   *
   * Retrieves the most recent badge awards across the system.
   * Useful for activity feeds and recent achievements displays.
   *
   * @async
   * @param {number} [limit=10] - Maximum number of recent awards to return
   * @returns {Promise<BadgeAward[]>} Array of recent badge awards
   *
   * @example
   * const recent = await badgeService.getRecentAwards(10);
   * recent.forEach(award => {
   *   console.log(`${award.child.name} earned "${award.badge.name}" on ${award.awarded_at}`);
   * });
   */
  async getRecentAwards(limit: number = 10): Promise<BadgeAward[]> {
    const { data } = await apiClient.get<BadgeAward[]>(ENDPOINTS.BADGES.RECENT_AWARDS, {
      params: { limit },
    });
    return data;
  },
};

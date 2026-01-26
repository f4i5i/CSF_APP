/**
 * Badges Service
 * Handles achievement badges and awards management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const badgesService = {
  /**
   * Get all available badges
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.category] - Badge category (achievement, participation, skill, etc.)
   * @param {string} [filters.program_id] - Filter by program ID
   * @returns {Promise<Array>} List of badges
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.BADGES.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get badge by ID
   * @param {string} id - Badge ID
   * @returns {Promise<Object>} Badge details
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.BADGES.BY_ID(id));
    return data;
  },

  /**
   * Create new badge (admin only)
   * @param {Object} badgeData - Badge information
   * @param {string} badgeData.name - Badge name
   * @param {string} badgeData.description - Badge description
   * @param {string} badgeData.category - Badge category
   * @param {string} badgeData.icon_url - Badge icon URL
   * @param {string} [badgeData.program_id] - Associated program ID
   * @param {Object} [badgeData.criteria] - Criteria for earning badge
   * @returns {Promise<Object>} Created badge
   */
  async create(badgeData) {
    const { data } = await apiClient.post(API_ENDPOINTS.BADGES.CREATE, badgeData);
    return data;
  },

  /**
   * Update badge information (admin only)
   * @param {string} id - Badge ID
   * @param {Object} badgeData - Updated badge data
   * @returns {Promise<Object>} Updated badge
   */
  async update(id, badgeData) {
    const { data } = await apiClient.put(API_ENDPOINTS.BADGES.BY_ID(id), badgeData);
    return data;
  },

  /**
   * Delete badge (admin only)
   * @param {string} id - Badge ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.BADGES.BY_ID(id));
    return data;
  },

  /**
   * Get badges earned by a child
   * @param {string} childId - Child ID (uses first enrollment)
   * @returns {Promise<Array>} List of earned badges with earn dates
   */
  async getByChild(childId) {
    const { data } = await apiClient.get(API_ENDPOINTS.BADGES.BY_CHILD(childId));
    return data;
  },

  /**
   * Get badges earned by enrollment
   * @param {string} enrollmentId - Enrollment ID
   * @returns {Promise<Array>} List of earned badges with earn dates
   */
  async getByEnrollment(enrollmentId) {
    const { data } = await apiClient.get(API_ENDPOINTS.BADGES.BY_ENROLLMENT(enrollmentId));

    // Handle paginated response format {items: [...], total: X}
    if (data && data.items) {
      return data.items;
    }

    // Return data as-is if not paginated (or if it's a direct array)
    return data;
  },

  /**
   * Get current user's children's badges
   * @returns {Promise<Object>} Badges grouped by child
   */
  async getMyChildrenBadges() {
    const { data } = await apiClient.get(API_ENDPOINTS.BADGES.MY_CHILDREN);
    return data;
  },

  /**
   * Award badge to child (admin only)
   * @param {Object} awardData - Award information
   * @param {string} awardData.badge_id - Badge ID
   * @param {string} awardData.child_id - Child ID
   * @param {string} [awardData.notes] - Award notes
   * @param {string} [awardData.awarded_by] - Admin who awarded it
   * @returns {Promise<Object>} Award confirmation
   */
  async awardBadge(awardData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.BADGES.AWARD,
      awardData
    );
    return data;
  },

  /**
   * Award badge to all students in a class (bulk award)
   * @param {Object} bulkAwardData - Bulk award information
   * @param {string} bulkAwardData.badge_id - Badge ID
   * @param {string} bulkAwardData.class_id - Class ID
   * @param {string} [bulkAwardData.notes] - Award notes
   * @returns {Promise<Object>} Bulk award confirmation with success/failure counts
   */
  async awardBadgeToClass(bulkAwardData) {
    const { data } = await apiClient.post(
      '/badges/award-class',
      bulkAwardData
    );
    return data;
  },

  /**
   * Revoke badge from child (admin only)
   * @param {string} awardId - Award ID
   * @param {Object} revocationData - Revocation information
   * @param {string} [revocationData.reason] - Reason for revocation
   * @returns {Promise<Object>} Revocation confirmation
   */
  async revokeBadge(awardId, revocationData = {}) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.BADGES.REVOKE(awardId),
      revocationData
    );
    return data;
  },

  /**
   * Get badge leaderboard
   * @param {Object} params - Leaderboard parameters
   * @param {string} [params.program_id] - Filter by program
   * @param {string} [params.badge_id] - Filter by specific badge
   * @param {number} [params.limit] - Number of top achievers (default 10)
   * @returns {Promise<Array>} Leaderboard with child names and badge counts
   */
  async getLeaderboard(params = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.BADGES.LEADERBOARD, {
      params,
    });
    return data;
  },

  /**
   * Get badge statistics
   * @param {string} [badgeId] - Optional badge ID for specific badge stats
   * @returns {Promise<Object>} Badge statistics
   */
  async getStats(badgeId = null) {
    const endpoint = badgeId
      ? API_ENDPOINTS.BADGES.STATS(badgeId)
      : API_ENDPOINTS.BADGES.STATS_OVERALL;
    const { data } = await apiClient.get(endpoint);
    return data;
  },

  /**
   * Check badge eligibility for a child
   * @param {string} childId - Child ID
   * @param {string} badgeId - Badge ID
   * @returns {Promise<Object>} Eligibility info {eligible: boolean, reason: string, progress: Object}
   */
  async checkEligibility(childId, badgeId) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.BADGES.CHECK_ELIGIBILITY,
      { child_id: childId, badge_id: badgeId }
    );
    return data;
  },

  /**
   * Get badges by category
   * @param {string} category - Badge category
   * @returns {Promise<Array>} Badges in the category
   */
  async getByCategory(category) {
    return this.getAll({ category });
  },

  /**
   * Get recent badge awards
   * @param {number} limit - Number of recent awards (default 10)
   * @returns {Promise<Array>} Recent badge awards
   */
  async getRecentAwards(limit = 10) {
    const { data } = await apiClient.get(API_ENDPOINTS.BADGES.RECENT_AWARDS, {
      params: { limit },
    });
    return data;
  },
};

export default badgesService;

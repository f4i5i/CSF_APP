/**
 * Badge Service
 * Handles achievement badges and awards management
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

export const badgeService = {
  /**
   * Get all available badges
   */
  async getAll(filters?: BadgeFilters): Promise<Badge[]> {
    const { data } = await apiClient.get<Badge[]>(ENDPOINTS.BADGES.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get badge by ID
   */
  async getById(id: BadgeId): Promise<Badge> {
    const { data } = await apiClient.get<Badge>(ENDPOINTS.BADGES.BY_ID(id));
    return data;
  },

  /**
   * Create new badge (admin only)
   */
  async create(badgeData: CreateBadgeRequest): Promise<Badge> {
    const { data } = await apiClient.post<Badge>(ENDPOINTS.BADGES.CREATE, badgeData);
    return data;
  },

  /**
   * Update badge information (admin only)
   */
  async update(id: BadgeId, badgeData: UpdateBadgeRequest): Promise<Badge> {
    const { data } = await apiClient.put<Badge>(ENDPOINTS.BADGES.BY_ID(id), badgeData);
    return data;
  },

  /**
   * Delete badge (admin only)
   */
  async delete(id: BadgeId): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(ENDPOINTS.BADGES.BY_ID(id));
    return data;
  },

  /**
   * Get badges earned by a child
   */
  async getByChild(childId: string): Promise<BadgeAward[]> {
    const { data } = await apiClient.get<BadgeAward[]>(ENDPOINTS.BADGES.BY_CHILD(childId));
    return data;
  },

  /**
   * Get badges earned by enrollment
   */
  async getByEnrollment(enrollmentId: string): Promise<BadgeAward[]> {
    const { data } = await apiClient.get<BadgeAward[]>(ENDPOINTS.BADGES.BY_ENROLLMENT(enrollmentId));
    return data;
  },

  /**
   * Get current user's children's badges
   */
  async getMyChildrenBadges(): Promise<ChildBadgesResponse[]> {
    const { data } = await apiClient.get<ChildBadgesResponse[]>(ENDPOINTS.BADGES.MY_CHILDREN);
    return data;
  },

  /**
   * Award badge to child (admin only)
   */
  async awardBadge(awardData: AwardBadgeRequest): Promise<BadgeAward> {
    const { data } = await apiClient.post<BadgeAward>(
      ENDPOINTS.BADGES.AWARD,
      awardData
    );
    return data;
  },

  /**
   * Revoke badge from child (admin only)
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
   */
  async getLeaderboard(params?: LeaderboardParams): Promise<BadgeLeaderboardEntry[]> {
    const { data } = await apiClient.get<BadgeLeaderboardEntry[]>(ENDPOINTS.BADGES.LEADERBOARD, {
      params,
    });
    return data;
  },

  /**
   * Get badge statistics
   */
  async getStats(badgeId?: BadgeId): Promise<BadgeStats> {
    const endpoint = badgeId
      ? ENDPOINTS.BADGES.STATS(badgeId)
      : ENDPOINTS.BADGES.STATS_OVERALL;
    const { data } = await apiClient.get<BadgeStats>(endpoint);
    return data;
  },

  /**
   * Check badge eligibility for a child
   */
  async checkEligibility(childId: string, badgeId: BadgeId): Promise<BadgeEligibility> {
    const { data } = await apiClient.post<BadgeEligibility>(
      ENDPOINTS.BADGES.CHECK_ELIGIBILITY,
      { child_id: childId, badge_id: badgeId }
    );
    return data;
  },

  /**
   * Get badge progress for a child
   */
  async getProgress(childId: string, badgeId: BadgeId): Promise<BadgeProgress> {
    const { data } = await apiClient.get<BadgeProgress>(
      ENDPOINTS.BADGES.PROGRESS(childId, badgeId)
    );
    return data;
  },

  /**
   * Get badges by category
   */
  async getByCategory(category: string): Promise<Badge[]> {
    return this.getAll({ category: category as any });
  },

  /**
   * Get recent badge awards
   */
  async getRecentAwards(limit: number = 10): Promise<BadgeAward[]> {
    const { data } = await apiClient.get<BadgeAward[]>(ENDPOINTS.BADGES.RECENT_AWARDS, {
      params: { limit },
    });
    return data;
  },
};

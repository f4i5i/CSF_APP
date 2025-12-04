/**
 * Announcement Service
 * Handles announcements and notifications management
 */

import { apiClient } from '../client/axios-client';
import { ENDPOINTS } from '../config/endpoints';
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementFilters,
  UnreadCountResponse,
} from '../types/announcement.types';

export const announcementService = {
  /**
   * Get all announcements with optional filters
   */
  async getAll(filters?: AnnouncementFilters): Promise<Announcement[]> {
    const { data } = await apiClient.get<Announcement[]>(ENDPOINTS.ANNOUNCEMENTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get announcement by ID
   */
  async getById(id: string): Promise<Announcement> {
    const { data } = await apiClient.get<Announcement>(ENDPOINTS.ANNOUNCEMENTS.BY_ID(id));
    return data;
  },

  /**
   * Create new announcement (admin only)
   */
  async create(announcementData: CreateAnnouncementRequest): Promise<Announcement> {
    const { data } = await apiClient.post<Announcement>(
      ENDPOINTS.ANNOUNCEMENTS.CREATE,
      announcementData
    );
    return data;
  },

  /**
   * Update announcement (admin only)
   */
  async update(id: string, announcementData: UpdateAnnouncementRequest): Promise<Announcement> {
    const { data } = await apiClient.put<Announcement>(
      ENDPOINTS.ANNOUNCEMENTS.BY_ID(id),
      announcementData
    );
    return data;
  },

  /**
   * Delete announcement (admin only)
   */
  async delete(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(ENDPOINTS.ANNOUNCEMENTS.BY_ID(id));
    return data;
  },

  /**
   * Mark announcement as read
   */
  async markAsRead(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      ENDPOINTS.ANNOUNCEMENTS.MARK_READ(id)
    );
    return data;
  },

  /**
   * Mark all announcements as read
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      ENDPOINTS.ANNOUNCEMENTS.MARK_ALL_READ
    );
    return data;
  },

  /**
   * Get unread announcements count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const { data } = await apiClient.get<UnreadCountResponse>(ENDPOINTS.ANNOUNCEMENTS.UNREAD_COUNT);
    return data;
  },

  /**
   * Get unread announcements
   */
  async getUnread(): Promise<Announcement[]> {
    return this.getAll({ unread: true });
  },

  /**
   * Get announcements by priority
   */
  async getByPriority(priority: string): Promise<Announcement[]> {
    return this.getAll({ priority: priority as any });
  },

  /**
   * Get high priority announcements
   */
  async getHighPriority(): Promise<Announcement[]> {
    return this.getByPriority('high');
  },

  /**
   * Get announcements by type
   */
  async getByType(type: string): Promise<Announcement[]> {
    return this.getAll({ type: type as any });
  },

  /**
   * Get urgent announcements
   */
  async getUrgent(): Promise<Announcement[]> {
    return this.getByType('urgent');
  },

  /**
   * Get announcements for a specific class
   */
  async getByClass(classId: string): Promise<Announcement[]> {
    return this.getAll({ class_id: classId });
  },

  /**
   * Get announcements for a specific program
   */
  async getByProgram(programId: string): Promise<Announcement[]> {
    return this.getAll({ program_id: programId });
  },

  /**
   * Get recent announcements
   */
  async getRecent(limit: number = 5): Promise<Announcement[]> {
    return this.getAll({ limit });
  },

  /**
   * Pin announcement (admin only)
   */
  async pin(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(ENDPOINTS.ANNOUNCEMENTS.PIN(id));
    return data;
  },

  /**
   * Unpin announcement (admin only)
   */
  async unpin(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(ENDPOINTS.ANNOUNCEMENTS.UNPIN(id));
    return data;
  },

  /**
   * Get pinned announcements
   */
  async getPinned(): Promise<Announcement[]> {
    const { data } = await apiClient.get<Announcement[]>(ENDPOINTS.ANNOUNCEMENTS.PINNED);
    return data;
  },
};

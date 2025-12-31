/**
 * Announcements Service
 * Handles announcements and notifications management
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const announcementsService = {
  /**
   * Get all announcements with optional filters
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.priority] - Filter by priority (high, medium, low)
   * @param {string} [filters.type] - Filter by type (general, urgent, event, class)
   * @param {string} [filters.program_id] - Filter by program ID
   * @param {string} [filters.class_id] - Filter by class ID
   * @param {boolean} [filters.unread] - Show only unread announcements
   * @param {number} [filters.limit] - Limit number of results
   * @returns {Promise<Array>} List of announcements
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.ANNOUNCEMENTS.LIST, {
      params: filters,
    });

    // Handle paginated response format {items: [...], total: X}
    if (data && data.items) {
      return data.items;
    }

    // Return data as-is if not paginated
    return data;
  },

  /**
   * Get announcement by ID
   * @param {string} id - Announcement ID
   * @returns {Promise<Object>} Announcement details
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id));
    return data;
  },

  /**
   * Create new announcement (admin only)
   * @param {Object} announcementData - Announcement information
   * @param {string} announcementData.title - Announcement title
   * @param {string} announcementData.description - Announcement description
   * @param {string} announcementData.type - Announcement type (general, important, urgent)
   * @param {Array<string>} announcementData.class_ids - Target class IDs
   * @returns {Promise<Object>} Created announcement
   */
  async create(announcementData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ANNOUNCEMENTS.CREATE,
      announcementData
    );
    return data;
  },

  /**
   * Update announcement (admin only)
   * @param {string} id - Announcement ID
   * @param {Object} announcementData - Updated announcement data
   * @returns {Promise<Object>} Updated announcement
   */
  async update(id, announcementData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id),
      announcementData
    );
    return data;
  },

  /**
   * Upload attachment to announcement
   * @param {string} announcementId - Announcement ID
   * @param {File} file - File to upload
   * @returns {Promise<Object>} Uploaded attachment details
   */
  async uploadAttachment(announcementId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post(
      `${API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(announcementId)}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  /**
   * Delete announcement (admin only)
   * @param {string} id - Announcement ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id));
    return data;
  },

  /**
   * Mark announcement as read
   * @param {string} id - Announcement ID
   * @returns {Promise<Object>} Confirmation
   */
  async markAsRead(id) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ANNOUNCEMENTS.MARK_READ(id)
    );
    return data;
  },

  /**
   * Mark all announcements as read
   * @returns {Promise<Object>} Confirmation
   */
  async markAllAsRead() {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ANNOUNCEMENTS.MARK_ALL_READ
    );
    return data;
  },

  /**
   * Get unread announcements count
   * @returns {Promise<Object>} Count {unread_count: number}
   */
  async getUnreadCount() {
    const { data } = await apiClient.get(API_ENDPOINTS.ANNOUNCEMENTS.UNREAD_COUNT);
    return data;
  },

  /**
   * Get unread announcements
   * @returns {Promise<Array>} Unread announcements
   */
  async getUnread() {
    return this.getAll({ unread: true });
  },

  /**
   * Get announcements by priority
   * @param {string} priority - Priority level (high, medium, low)
   * @returns {Promise<Array>} Announcements with the specified priority
   */
  async getByPriority(priority) {
    return this.getAll({ priority });
  },

  /**
   * Get high priority announcements
   * @returns {Promise<Array>} High priority announcements
   */
  async getHighPriority() {
    return this.getByPriority('high');
  },

  /**
   * Get announcements by type
   * @param {string} type - Announcement type
   * @returns {Promise<Array>} Announcements of the specified type
   */
  async getByType(type) {
    return this.getAll({ type });
  },

  /**
   * Get urgent announcements
   * @returns {Promise<Array>} Urgent announcements
   */
  async getUrgent() {
    return this.getByType('urgent');
  },

  /**
   * Get announcements for a specific class
   * @param {string} classId - Class ID
   * @returns {Promise<Array>} Class announcements
   */
  async getByClass(classId) {
    return this.getAll({ class_id: classId });
  },

  /**
   * Get announcements for a specific program
   * @param {string} programId - Program ID
   * @returns {Promise<Array>} Program announcements
   */
  async getByProgram(programId) {
    return this.getAll({ program_id: programId });
  },

  /**
   * Get recent announcements
   * @param {number} limit - Number of announcements (default 5)
   * @returns {Promise<Array>} Recent announcements
   */
  async getRecent(limit = 5) {
    return this.getAll({ limit });
  },

  /**
   * Pin announcement (admin only)
   * @param {string} id - Announcement ID
   * @returns {Promise<Object>} Confirmation
   */
  async pin(id) {
    const { data } = await apiClient.post(API_ENDPOINTS.ANNOUNCEMENTS.PIN(id));
    return data;
  },

  /**
   * Unpin announcement (admin only)
   * @param {string} id - Announcement ID
   * @returns {Promise<Object>} Confirmation
   */
  async unpin(id) {
    const { data } = await apiClient.post(API_ENDPOINTS.ANNOUNCEMENTS.UNPIN(id));
    return data;
  },

  /**
   * Get pinned announcements
   * @returns {Promise<Array>} Pinned announcements
   */
  async getPinned() {
    const { data } = await apiClient.get(API_ENDPOINTS.ANNOUNCEMENTS.PINNED);
    return data;
  },
};

export default announcementsService;

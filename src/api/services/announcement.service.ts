/**
 * @fileoverview Announcement Service Module
 *
 * Provides comprehensive API client for managing announcements and notifications:
 * - Announcement creation, retrieval, updating, and deletion
 * - Multi-level filtering (by priority, type, class, program, status)
 * - Read status tracking and management
 * - Pinning/highlighting important announcements
 * - Unread count aggregation with breakdown by priority and type
 * - Contextual announcement retrieval (recent, urgent, high-priority)
 *
 * Write operations (create, update, delete, pin/unpin) require admin privileges.
 * Read operations available to all authenticated users.
 *
 * @module services/announcement
 * @example
 * // Fetch and filter announcements
 * const urgent = await announcementService.getUrgent();
 * const classAnnouncements = await announcementService.getByClass('grade-3-a');
 * const recent = await announcementService.getRecent(10);
 *
 * @example
 * // Create a new announcement
 * const announcement = await announcementService.create({
 *   title: 'School Closed Tomorrow',
 *   content: 'School will be closed due to weather.',
 *   type: AnnouncementType.URGENT,
 *   priority: AnnouncementPriority.HIGH,
 *   send_email: true,
 *   send_push: true,
 *   is_published: true
 * });
 *
 * @example
 * // Manage read status
 * await announcementService.markAsRead('announcement-123');
 * const unreadCount = await announcementService.getUnreadCount();
 * console.log(`${unreadCount.unread_count} unread announcements`);
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
   * Retrieve all announcements with optional filtering.
   *
   * Fetches a list of announcements with support for multiple filter criteria including
   * priority, type, class/program association, and read status.
   *
   * @async
   * @function getAll
   * @param {AnnouncementFilters} [filters] - Optional filter criteria
   * @param {string} [filters.priority] - Filter by priority ('high', 'medium', 'low')
   * @param {string} [filters.type] - Filter by type ('general', 'urgent', 'event', 'class', 'maintenance', 'celebration')
   * @param {string} [filters.class_id] - Filter announcements for a specific class
   * @param {string} [filters.program_id] - Filter announcements for a specific program
   * @param {boolean} [filters.unread] - Filter by read status (true for unread only)
   * @param {boolean} [filters.is_pinned] - Filter by pinned status
   * @param {boolean} [filters.is_published] - Filter by publication status
   * @param {number} [filters.limit] - Limit number of results
   * @returns {Promise<Announcement[]>} Array of announcement objects matching filters
   * @throws {AxiosError} If the request fails
   *
   * @example
   * const allAnnouncements = await announcementService.getAll();
   * const classAnnouncements = await announcementService.getAll({
   *   class_id: 'grade-3-a'
   * });
   * const highPriority = await announcementService.getAll({
   *   priority: 'high',
   *   is_published: true
   * });
   */
  async getAll(filters?: AnnouncementFilters): Promise<Announcement[]> {
    const { data } = await apiClient.get<Announcement[]>(ENDPOINTS.ANNOUNCEMENTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Retrieve a single announcement by ID.
   *
   * Fetches complete details of a specific announcement including content, metadata,
   * attachments, and view count.
   *
   * @async
   * @function getById
   * @param {string} id - The announcement ID (UUID)
   * @returns {Promise<Announcement>} Complete announcement object with all details
   * @throws {AxiosError} If announcement not found (404) or request fails
   *
   * @example
   * const announcement = await announcementService.getById('announcement-uuid-123');
   * console.log(announcement.title, announcement.content);
   * console.log(`Posted by: ${announcement.author_name}`);
   */
  async getById(id: string): Promise<Announcement> {
    const { data } = await apiClient.get<Announcement>(ENDPOINTS.ANNOUNCEMENTS.BY_ID(id));
    return data;
  },

  /**
   * Create a new announcement.
   *
   * Creates a new announcement with specified content, type, priority, and distribution settings.
   * Announcements can be targeted to specific classes or programs and can trigger email/push notifications.
   *
   * Admin-only operation.
   *
   * @async
   * @function create
   * @param {CreateAnnouncementRequest} announcementData - Announcement creation data
   * @param {string} announcementData.title - Announcement title (required)
   * @param {string} announcementData.content - Announcement body text (required)
   * @param {string} announcementData.type - Type of announcement (required)
   *   - 'general': Regular announcements
   *   - 'urgent': Time-sensitive information
   *   - 'event': Event-related announcements
   *   - 'class': Class-specific information
   *   - 'maintenance': System maintenance notices
   *   - 'celebration': Celebratory messages
   * @param {string} announcementData.priority - Priority level (required)
   *   - 'high': Prominent display, urgent
   *   - 'medium': Standard visibility
   *   - 'low': Secondary information
   * @param {string} [announcementData.program_id] - Target program ID (overrides class_id if set)
   * @param {string} [announcementData.class_id] - Target class ID
   * @param {boolean} [announcementData.send_email] - Send email notifications to recipients
   * @param {boolean} [announcementData.send_push] - Send push notifications to recipients
   * @param {string} [announcementData.expires_at] - Expiration date (ISO 8601 format)
   * @param {boolean} [announcementData.is_published] - Publish immediately (default: false)
   * @param {string[]} [announcementData.attachment_urls] - URLs of attached files or images
   * @returns {Promise<Announcement>} Created announcement object with assigned ID
   * @throws {AxiosError} If creation fails due to validation or permission errors
   *
   * @example
   * // Create a published urgent announcement
   * const announcement = await announcementService.create({
   *   title: 'School Event Cancelled',
   *   content: 'Due to weather, the field day has been rescheduled to next week.',
   *   type: 'urgent',
   *   priority: 'high',
   *   class_id: 'grade-3-a',
   *   send_email: true,
   *   send_push: true,
   *   is_published: true
   * });
   *
   * @example
   * // Create a draft announcement to be published later
   * const draft = await announcementService.create({
   *   title: 'Upcoming Field Trip',
   *   content: 'Details about the museum field trip coming next month.',
   *   type: 'event',
   *   priority: 'medium',
   *   program_id: 'program-elementary',
   *   attachment_urls: ['https://example.com/field-trip-guide.pdf'],
   *   is_published: false
   * });
   */
  async create(announcementData: CreateAnnouncementRequest): Promise<Announcement> {
    const { data } = await apiClient.post<Announcement>(
      ENDPOINTS.ANNOUNCEMENTS.CREATE,
      announcementData
    );
    return data;
  },

  /**
   * Update an existing announcement.
   *
   * Modifies announcement content, settings, and metadata. Partial updates are supported.
   * Changes to published announcements trigger re-distribution if notification settings change.
   *
   * Admin-only operation.
   *
   * @async
   * @function update
   * @param {string} id - The announcement ID to update
   * @param {UpdateAnnouncementRequest} announcementData - Announcement data to update (partial)
   * @param {string} [announcementData.title] - Updated title
   * @param {string} [announcementData.content] - Updated body text
   * @param {string} [announcementData.type] - Updated type
   * @param {string} [announcementData.priority] - Updated priority level
   * @param {string} [announcementData.program_id] - Updated program target
   * @param {string} [announcementData.class_id] - Updated class target
   * @param {string} [announcementData.expires_at] - Updated expiration date
   * @param {boolean} [announcementData.is_published] - Update publication status
   * @param {string[]} [announcementData.attachment_urls] - Update attachments
   * @returns {Promise<Announcement>} Updated announcement object
   * @throws {AxiosError} If announcement not found or update fails
   *
   * @example
   * const updated = await announcementService.update('announcement-123', {
   *   content: 'Updated content with new details',
   *   priority: 'medium',
   *   expires_at: '2024-12-31T23:59:59Z'
   * });
   *
   * @example
   * // Change publication status and notify recipients
   * await announcementService.update('announcement-456', {
   *   is_published: true
   * });
   */
  async update(id: string, announcementData: UpdateAnnouncementRequest): Promise<Announcement> {
    const { data } = await apiClient.put<Announcement>(
      ENDPOINTS.ANNOUNCEMENTS.BY_ID(id),
      announcementData
    );
    return data;
  },

  /**
   * Delete an announcement permanently.
   *
   * Removes the announcement from the system. This action is irreversible.
   * Deleted announcements are no longer visible to users.
   *
   * Admin-only operation.
   *
   * @async
   * @function delete
   * @param {string} id - The announcement ID to delete
   * @returns {Promise<{message: string}>} Confirmation message
   * @throws {AxiosError} If announcement not found or deletion fails
   *
   * @example
   * const result = await announcementService.delete('announcement-123');
   * console.log(result.message); // 'Announcement deleted successfully'
   */
  async delete(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(ENDPOINTS.ANNOUNCEMENTS.BY_ID(id));
    return data;
  },

  /**
   * Mark a single announcement as read for the current user.
   *
   * Marks an announcement as read, updating its read status in the database.
   * This affects the user's unread count and read status tracking.
   *
   * @async
   * @function markAsRead
   * @param {string} id - The announcement ID to mark as read
   * @returns {Promise<{message: string}>} Confirmation message
   * @throws {AxiosError} If announcement not found or operation fails
   *
   * @example
   * await announcementService.markAsRead('announcement-123');
   * console.log('Announcement marked as read');
   */
  async markAsRead(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      ENDPOINTS.ANNOUNCEMENTS.MARK_READ(id)
    );
    return data;
  },

  /**
   * Mark all announcements as read for the current user.
   *
   * Bulk operation that marks every announcement as read, clearing the user's
   * entire unread announcement queue. Useful for "mark all as read" functionality.
   *
   * @async
   * @function markAllAsRead
   * @returns {Promise<{message: string}>} Confirmation message
   * @throws {AxiosError} If operation fails
   *
   * @example
   * await announcementService.markAllAsRead();
   * console.log('All announcements marked as read');
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      ENDPOINTS.ANNOUNCEMENTS.MARK_ALL_READ
    );
    return data;
  },

  /**
   * Get unread announcement count with breakdowns by priority and type.
   *
   * Retrieves the total unread announcement count along with detailed breakdowns
   * organized by priority level and announcement type. Useful for displaying
   * badge counts and notification summaries.
   *
   * @async
   * @function getUnreadCount
   * @returns {Promise<UnreadCountResponse>} Unread count response object
   * @returns {number} result.unread_count - Total number of unread announcements
   * @returns {object} [result.by_priority] - Breakdown by priority level
   * @returns {number} result.by_priority.high - Unread high-priority announcements
   * @returns {number} result.by_priority.medium - Unread medium-priority announcements
   * @returns {number} result.by_priority.low - Unread low-priority announcements
   * @returns {object} [result.by_type] - Breakdown by type
   * @returns {number} result.by_type.urgent - Unread urgent announcements
   * @returns {number} result.by_type.general - Unread general announcements
   * @returns {number} result.by_type.event - Unread event announcements
   * @returns {number} result.by_type.class - Unread class announcements
   * @throws {AxiosError} If request fails
   *
   * @example
   * const counts = await announcementService.getUnreadCount();
   * console.log(`${counts.unread_count} total unread`);
   * console.log(`${counts.by_priority.high} high-priority unread`);
   *
   * @example
   * // Display notification badge
   * const result = await announcementService.getUnreadCount();
   * if (result.unread_count > 0) {
   *   showBadge(result.unread_count);
   *   if (result.by_priority?.high > 0) {
   *     highlightAsUrgent();
   *   }
   * }
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const { data } = await apiClient.get<UnreadCountResponse>(ENDPOINTS.ANNOUNCEMENTS.UNREAD_COUNT);
    return data;
  },

  /**
   * Retrieve only unread announcements for the current user.
   *
   * Convenience method that filters announcements to show only those not yet read.
   * Equivalent to calling getAll({ unread: true }).
   *
   * @async
   * @function getUnread
   * @returns {Promise<Announcement[]>} Array of unread announcement objects
   * @throws {AxiosError} If request fails
   *
   * @example
   * const unread = await announcementService.getUnread();
   * console.log(`You have ${unread.length} unread announcements`);
   *
   * unread.forEach(announcement => {
   *   console.log(`[${announcement.priority}] ${announcement.title}`);
   * });
   */
  async getUnread(): Promise<Announcement[]> {
    return this.getAll({ unread: true });
  },

  /**
   * Retrieve announcements filtered by priority level.
   *
   * Convenience method to fetch announcements of a specific priority.
   * Common priorities: 'high', 'medium', 'low'.
   *
   * @async
   * @function getByPriority
   * @param {string} priority - Priority level to filter by
   * @returns {Promise<Announcement[]>} Array of announcements with the specified priority
   * @throws {AxiosError} If request fails
   *
   * @example
   * const mediumPriority = await announcementService.getByPriority('medium');
   */
  async getByPriority(priority: string): Promise<Announcement[]> {
    return this.getAll({ priority: priority as any });
  },

  /**
   * Retrieve all high-priority announcements.
   *
   * Convenience method combining getByPriority('high').
   * Useful for displaying critical information prominently.
   *
   * @async
   * @function getHighPriority
   * @returns {Promise<Announcement[]>} Array of high-priority announcement objects
   * @throws {AxiosError} If request fails
   *
   * @example
   * const important = await announcementService.getHighPriority();
   * if (important.length > 0) {
   *   displayHighPrioritySection(important);
   * }
   */
  async getHighPriority(): Promise<Announcement[]> {
    return this.getByPriority('high');
  },

  /**
   * Retrieve announcements filtered by type.
   *
   * Convenience method to fetch announcements of a specific type.
   * Common types: 'general', 'urgent', 'event', 'class', 'maintenance', 'celebration'.
   *
   * @async
   * @function getByType
   * @param {string} type - Announcement type to filter by
   * @returns {Promise<Announcement[]>} Array of announcements with the specified type
   * @throws {AxiosError} If request fails
   *
   * @example
   * const eventAnnouncements = await announcementService.getByType('event');
   */
  async getByType(type: string): Promise<Announcement[]> {
    return this.getAll({ type: type as any });
  },

  /**
   * Retrieve all urgent announcements.
   *
   * Convenience method combining getByType('urgent').
   * Useful for displaying time-sensitive information prominently.
   *
   * @async
   * @function getUrgent
   * @returns {Promise<Announcement[]>} Array of urgent announcement objects
   * @throws {AxiosError} If request fails
   *
   * @example
   * const urgent = await announcementService.getUrgent();
   * if (urgent.length > 0) {
   *   playUrgentSound();
   *   showUrgentNotifications(urgent);
   * }
   */
  async getUrgent(): Promise<Announcement[]> {
    return this.getByType('urgent');
  },

  /**
   * Retrieve announcements targeted to a specific class.
   *
   * Convenience method that filters announcements by class ID.
   * Equivalent to calling getAll({ class_id: classId }).
   *
   * @async
   * @function getByClass
   * @param {string} classId - The class ID to filter by
   * @returns {Promise<Announcement[]>} Array of announcements for the class
   * @throws {AxiosError} If request fails
   *
   * @example
   * const classNews = await announcementService.getByClass('grade-3-a');
   * console.log(`${classNews.length} announcements for Grade 3A`);
   */
  async getByClass(classId: string): Promise<Announcement[]> {
    return this.getAll({ class_id: classId });
  },

  /**
   * Retrieve announcements targeted to a specific program.
   *
   * Convenience method that filters announcements by program ID.
   * Program-level announcements reach all classes within the program.
   * Equivalent to calling getAll({ program_id: programId }).
   *
   * @async
   * @function getByProgram
   * @param {string} programId - The program ID to filter by
   * @returns {Promise<Announcement[]>} Array of announcements for the program
   * @throws {AxiosError} If request fails
   *
   * @example
   * const programNews = await announcementService.getByProgram('elementary-school');
   */
  async getByProgram(programId: string): Promise<Announcement[]> {
    return this.getAll({ program_id: programId });
  },

  /**
   * Retrieve recent announcements limited to a specified count.
   *
   * Convenience method that fetches the most recent announcements.
   * Equivalent to calling getAll({ limit: limit }).
   * Default limit is 5 announcements.
   *
   * @async
   * @function getRecent
   * @param {number} [limit=5] - Maximum number of announcements to retrieve
   * @returns {Promise<Announcement[]>} Array of most recent announcements
   * @throws {AxiosError} If request fails
   *
   * @example
   * // Get 5 most recent announcements
   * const recent = await announcementService.getRecent();
   *
   * @example
   * // Get 20 most recent announcements
   * const moreRecent = await announcementService.getRecent(20);
   * recentAnnouncementsList.update(moreRecent);
   */
  async getRecent(limit: number = 5): Promise<Announcement[]> {
    return this.getAll({ limit });
  },

  /**
   * Pin an announcement to keep it prominent.
   *
   * Marks an announcement as pinned, causing it to appear at the top of listings
   * and be prioritized in feeds. Useful for important information that should remain visible.
   *
   * Admin-only operation.
   *
   * @async
   * @function pin
   * @param {string} id - The announcement ID to pin
   * @returns {Promise<{message: string}>} Confirmation message
   * @throws {AxiosError} If announcement not found or operation fails
   *
   * @example
   * await announcementService.pin('announcement-123');
   * console.log('Announcement is now pinned');
   */
  async pin(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(ENDPOINTS.ANNOUNCEMENTS.PIN(id));
    return data;
  },

  /**
   * Unpin a previously pinned announcement.
   *
   * Removes the pinned status from an announcement, allowing it to be sorted with
   * other announcements in regular order.
   *
   * Admin-only operation.
   *
   * @async
   * @function unpin
   * @param {string} id - The announcement ID to unpin
   * @returns {Promise<{message: string}>} Confirmation message
   * @throws {AxiosError} If announcement not found or operation fails
   *
   * @example
   * await announcementService.unpin('announcement-123');
   * console.log('Announcement is no longer pinned');
   */
  async unpin(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(ENDPOINTS.ANNOUNCEMENTS.UNPIN(id));
    return data;
  },

  /**
   * Retrieve all pinned announcements.
   *
   * Fetches announcements that have been pinned by administrators for prominence.
   * Pinned announcements typically appear at the top of announcement lists.
   *
   * @async
   * @function getPinned
   * @returns {Promise<Announcement[]>} Array of pinned announcement objects
   * @throws {AxiosError} If request fails
   *
   * @example
   * const pinnedAnnouncements = await announcementService.getPinned();
   * displayHeaderSection(pinnedAnnouncements);
   *
   * @example
   * // Check if there are important pinned announcements
   * const pinned = await announcementService.getPinned();
   * if (pinned.some(a => a.priority === 'high')) {
   *   showWarningBanner();
   * }
   */
  async getPinned(): Promise<Announcement[]> {
    const { data } = await apiClient.get<Announcement[]>(ENDPOINTS.ANNOUNCEMENTS.PINNED);
    return data;
  },
};

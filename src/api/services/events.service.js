/**
 * Events Service
 * Handles event management and RSVP operations
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const eventsService = {
  /**
   * Get all events with optional filters
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.type] - Event type (tournament, practice, social, etc.)
   * @param {string} [filters.start_date] - Start date filter (YYYY-MM-DD)
   * @param {string} [filters.end_date] - End date filter (YYYY-MM-DD)
   * @param {string} [filters.program_id] - Filter by program ID
   * @param {boolean} [filters.upcoming] - Show only upcoming events
   * @returns {Promise<Array>} List of events
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.EVENTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get event by ID
   * @param {string} id - Event ID
   * @returns {Promise<Object>} Event details with attendees and RSVP info
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.EVENTS.BY_ID(id));
    return data;
  },

  /**
   * Create new event (admin only)
   * @param {Object} eventData - Event information
   * @param {string} eventData.title - Event title
   * @param {string} eventData.description - Event description
   * @param {string} eventData.type - Event type
   * @param {string} eventData.start_datetime - Start date and time (ISO format)
   * @param {string} eventData.end_datetime - End date and time (ISO format)
   * @param {string} eventData.location - Event location
   * @param {string} [eventData.program_id] - Associated program ID
   * @param {number} [eventData.max_attendees] - Maximum attendees
   * @param {boolean} [eventData.requires_rsvp] - RSVP required flag
   * @param {string} [eventData.image_url] - Event image URL
   * @returns {Promise<Object>} Created event
   */
  async create(eventData) {
    const { data } = await apiClient.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
    return data;
  },

  /**
   * Update event information (admin only)
   * @param {string} id - Event ID
   * @param {Object} eventData - Updated event data
   * @returns {Promise<Object>} Updated event
   */
  async update(id, eventData) {
    const { data } = await apiClient.put(API_ENDPOINTS.EVENTS.BY_ID(id), eventData);
    return data;
  },

  /**
   * Delete event (admin only)
   * @param {string} id - Event ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.EVENTS.BY_ID(id));
    return data;
  },

  /**
   * RSVP to an event
   * @param {string} eventId - Event ID
   * @param {Object} rsvpData - RSVP information
   * @param {string} rsvpData.status - RSVP status (attending, not_attending, maybe)
   * @param {Array<string>} [rsvpData.child_ids] - Array of child IDs attending
   * @param {string} [rsvpData.notes] - Additional notes
   * @returns {Promise<Object>} RSVP confirmation
   */
  async rsvp(eventId, rsvpData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.EVENTS.RSVP(eventId),
      rsvpData
    );
    return data;
  },

  /**
   * Get RSVPs for an event (admin only)
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} List of RSVPs
   */
  async getRsvps(eventId) {
    const { data } = await apiClient.get(API_ENDPOINTS.EVENTS.RSVPS(eventId));
    return data;
  },

  /**
   * Get user's RSVP status for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} RSVP status
   */
  async getMyRsvp(eventId) {
    const { data } = await apiClient.get(API_ENDPOINTS.EVENTS.MY_RSVP(eventId));
    return data;
  },

  /**
   * Update RSVP status
   * @param {string} eventId - Event ID
   * @param {string} rsvpId - RSVP ID
   * @param {Object} rsvpData - Updated RSVP data
   * @returns {Promise<Object>} Updated RSVP
   */
  async updateRsvp(eventId, rsvpId, rsvpData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.EVENTS.RSVP_BY_ID(eventId, rsvpId),
      rsvpData
    );
    return data;
  },

  /**
   * Cancel RSVP
   * @param {string} eventId - Event ID
   * @param {string} rsvpId - RSVP ID
   * @returns {Promise<Object>} Cancellation confirmation
   */
  async cancelRsvp(eventId, rsvpId) {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.EVENTS.RSVP_BY_ID(eventId, rsvpId)
    );
    return data;
  },

  /**
   * Get upcoming events
   * @param {number} limit - Maximum number of events to return
   * @returns {Promise<Array>} Upcoming events
   */
  async getUpcoming(limit = 10) {
    return this.getAll({ upcoming: true, limit });
  },

  /**
   * Get events by type
   * @param {string} type - Event type
   * @returns {Promise<Array>} Events of the specified type
   */
  async getByType(type) {
    return this.getAll({ type });
  },

  /**
   * Get events by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Events in the date range
   */
  async getByDateRange(startDate, endDate) {
    return this.getAll({ start_date: startDate, end_date: endDate });
  },

  /**
   * Get events for the current month
   * @returns {Promise<Array>} Events in the current month
   */
  async getThisMonth() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    return this.getByDateRange(startDate, endDate);
  },

  /**
   * Get events for a specific class
   * @param {string} classId - Class ID
   * @param {Object} filters - Optional filters (year, month, upcoming, limit)
   * @returns {Promise<Array>} Class events
   */
  async getByClass(classId, filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.EVENTS.BY_CLASS(classId), {
      params: filters,
    });
    return data;
  },
};

export default eventsService;

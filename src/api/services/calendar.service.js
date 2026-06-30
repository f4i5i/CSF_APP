/**
 * Calendar Service
 * Fetches the unified, role-scoped calendar feed (class sessions, events and
 * cancelled practices) for a visible date range. The backend scopes results to
 * the authenticated user's role (admin org-wide, coach their classes, parent
 * their children's enrolled classes).
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const calendarService = {
  /**
   * Get calendar items within a date range.
   * @param {string} start - Range start date (YYYY-MM-DD)
   * @param {string} end - Range end date (YYYY-MM-DD)
   * @returns {Promise<Array>} Flat list of calendar items
   */
  async getRange(start, end) {
    const { data } = await apiClient.get(API_ENDPOINTS.CALENDAR.GET, {
      params: { start, end },
    });
    return data?.items || [];
  },
};

export default calendarService;

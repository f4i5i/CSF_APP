/**
 * Check-In Service
 * Handles student check-in/check-out operations for coaches
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const checkinService = {
  /**
   * Get check-in status for all students in a class
   * @param {string} classId - Class ID
   * @param {string} [date] - Check-in date (defaults to today)
   * @returns {Promise<Array>} List of students with check-in status
   */
  async getClassStatus(classId, date = null) {
    const checkInDate = date || new Date().toISOString().split('T')[0];
    const { data } = await apiClient.get(API_ENDPOINTS.CHECKIN.STATUS(classId), {
      params: { check_in_date: checkInDate }
    });
    // API returns { class_id, check_in_date, statuses: [...] }
    return data?.statuses || data || [];
  },

  /**
   * Get check-ins for a class (today's check-ins)
   * @param {string} classId - Class ID
   * @returns {Promise<Array>} List of check-ins
   */
  async getByClass(classId) {
    const { data } = await apiClient.get(API_ENDPOINTS.CHECKIN.BY_CLASS(classId));
    return data;
  },

  /**
   * Check in a single student
   * @param {Object} checkInData - Check-in information
   * @param {string} checkInData.enrollment_id - Enrollment ID
   * @param {string} [checkInData.notes] - Additional notes
   * @returns {Promise<Object>} Check-in record
   */
  async checkIn(checkInData) {
    const { data } = await apiClient.post(API_ENDPOINTS.CHECKIN.SINGLE, checkInData);
    return data;
  },

  /**
   * Check out a student (update check-in with check-out time)
   * @param {string} checkInId - Check-in record ID
   * @returns {Promise<Object>} Updated check-in record
   */
  async checkOut(checkInId) {
    const { data } = await apiClient.put(`${API_ENDPOINTS.CHECKIN.SINGLE}/${checkInId}/checkout`);
    return data;
  },

  /**
   * Bulk check-in multiple students
   * @param {Object} bulkData - Bulk check-in data
   * @param {string} bulkData.class_id - Class ID
   * @param {Array<string>} bulkData.enrollment_ids - Array of enrollment IDs to check in
   * @returns {Promise<Object>} Bulk check-in result
   */
  async bulkCheckIn(bulkData) {
    const { data } = await apiClient.post(API_ENDPOINTS.CHECKIN.BULK, bulkData);
    return data;
  },

  /**
   * Toggle check-in status for a student
   * If checked in, check out. If not checked in, check in.
   * @param {Object} params - Parameters
   * @param {string} params.enrollment_id - Enrollment ID
   * @param {boolean} params.isCheckedIn - Current check-in status
   * @param {string} [params.checkInId] - Check-in record ID (required for checkout)
   * @returns {Promise<Object>} Updated check-in record
   */
  async toggleCheckIn({ enrollment_id, isCheckedIn, checkInId }) {
    if (isCheckedIn && checkInId) {
      return this.checkOut(checkInId);
    } else {
      return this.checkIn({ enrollment_id });
    }
  },
};

export default checkinService;

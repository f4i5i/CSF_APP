/**
 * Attendance Service
 * Handles attendance tracking and records
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const attendanceService = {
  /**
   * Get attendance history for an enrollment
   * @param {string} enrollmentId - Enrollment ID
   * @param {Object} filters - Filter parameters
   * @param {number} [filters.skip] - Number of records to skip
   * @param {number} [filters.limit] - Max records to return
   * @returns {Promise<Object>} Attendance list response {items, total, skip, limit}
   */
  async getByEnrollment(enrollmentId, filters = {}) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.ATTENDANCE.HISTORY(enrollmentId),
      { params: filters }
    );
    return data;
  },

  /**
   * Get attendance record by ID
   * @param {string} id - Attendance record ID
   * @returns {Promise<Object>} Attendance record details
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.ATTENDANCE.BY_ID(id));
    return data;
  },

  /**
   * Record attendance (admin/staff only)
   * @param {Object} attendanceData - Attendance information
   * @param {string} attendanceData.child_id - Child ID
   * @param {string} attendanceData.class_id - Class ID
   * @param {string} attendanceData.date - Attendance date (YYYY-MM-DD)
   * @param {string} attendanceData.status - Status (present, absent, excused, late)
   * @param {string} [attendanceData.notes] - Additional notes
   * @param {string} [attendanceData.check_in_time] - Check-in time (HH:MM:SS)
   * @param {string} [attendanceData.check_out_time] - Check-out time (HH:MM:SS)
   * @returns {Promise<Object>} Created attendance record
   */
  async create(attendanceData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ATTENDANCE.CREATE,
      attendanceData
    );
    return data;
  },

  /**
   * Update attendance record
   * @param {string} id - Attendance record ID
   * @param {Object} attendanceData - Updated attendance data
   * @returns {Promise<Object>} Updated attendance record
   */
  async update(id, attendanceData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.ATTENDANCE.BY_ID(id),
      attendanceData
    );
    return data;
  },

  /**
   * Delete attendance record
   * @param {string} id - Attendance record ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.ATTENDANCE.BY_ID(id));
    return data;
  },

  /**
   * Get attendance statistics for a specific child
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Child's attendance stats with by_enrollment breakdown
   */
  async getStatsByChild(childId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.ATTENDANCE.STATS(childId)
    );
    return data;
  },

  /**
   * Get attendance for a specific class
   * @param {string} classId - Class ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Class attendance records
   */
  async getByClass(classId, filters = {}) {
    return this.getAll({ ...filters, class_id: classId });
  },

  /**
   * Get attendance for a specific date
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Attendance records for the date
   */
  async getByDate(date, filters = {}) {
    return this.getAll({ ...filters, date });
  },

  /**
   * Get attendance statistics for a child
   * @param {string} childId - Child ID
   * @param {Object} filters - Filter parameters (start_date, end_date, class_id)
   * @returns {Promise<Object>} Stats {total: number, present: number, absent: number, late: number, excused: number}
   */
  async getStats(childId, filters = {}) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.ATTENDANCE.STATS(childId),
      { params: filters }
    );
    return data;
  },

  /**
   * Get attendance streak for an enrollment
   * @param {string} enrollmentId - Enrollment ID
   * @returns {Promise<Object>} Streak data {current_streak: number, longest_streak: number, total_attended: number, etc.}
   */
  async getStreak(enrollmentId) {
    const { data} = await apiClient.get(
      API_ENDPOINTS.ATTENDANCE.STREAK(enrollmentId)
    );
    return data;
  },

  /**
   * Bulk record attendance for a class session
   * @param {Object} bulkData - Bulk attendance data
   * @param {string} bulkData.class_id - Class ID
   * @param {string} bulkData.date - Session date (YYYY-MM-DD)
   * @param {Array} bulkData.records - Array of {child_id, status, notes}
   * @returns {Promise<Object>} Bulk creation result
   */
  async bulkCreate(bulkData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ATTENDANCE.BULK_CREATE,
      bulkData
    );
    return data;
  },

  /**
   * Get attendance summary for a date range
   * @param {Object} params - Parameters
   * @param {string} params.start_date - Start date (YYYY-MM-DD)
   * @param {string} params.end_date - End date (YYYY-MM-DD)
   * @param {string} [params.child_id] - Optional child ID
   * @param {string} [params.class_id] - Optional class ID
   * @returns {Promise<Object>} Summary statistics
   */
  async getSummary(params) {
    const { data } = await apiClient.get(API_ENDPOINTS.ATTENDANCE.SUMMARY, {
      params,
    });
    return data;
  },
};

export default attendanceService;

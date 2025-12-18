/**
 * @fileoverview Attendance Service
 *
 * Manages attendance tracking and records for children enrolled in classes.
 * Provides comprehensive APIs for recording, updating, and retrieving attendance data,
 * calculating statistics, tracking attendance streaks, and bulk operations.
 *
 * @description
 * The attendance system allows:
 * - Individual attendance recording for each class session
 * - Bulk attendance recording for entire class sessions
 * - Attendance filtering by child, class, or date
 * - Attendance statistics (total classes, attended, missed, rate)
 * - Streak tracking (consecutive class attendance)
 * - Attendance summaries over date ranges
 *
 * All methods require proper authentication. Admin/staff roles are required for
 * create, update, and delete operations.
 *
 * @module services/attendance
 * @example
 * import { attendanceService } from '@/api/services';
 *
 * // Get all attendance records with filters
 * const records = await attendanceService.getAll({
 *   child_id: 'child123',
 *   start_date: '2024-01-01',
 *   end_date: '2024-12-31'
 * });
 *
 * // Record a single attendance
 * const attendance = await attendanceService.create({
 *   child_id: 'child123',
 *   class_id: 'class456',
 *   date: '2024-01-15',
 *   status: 'present'
 * });
 *
 * // Get attendance statistics
 * const stats = await attendanceService.getStats('child123', {
 *   class_id: 'class456'
 * });
 *
 * // Bulk record attendance for a class session
 * const bulkResult = await attendanceService.bulkCreate({
 *   class_id: 'class456',
 *   date: '2024-01-15',
 *   records: [
 *     { child_id: 'child123', status: 'present' },
 *     { child_id: 'child124', status: 'absent' }
 *   ]
 * });
 */

import { apiClient } from '../client/axios-client';
import { ENDPOINTS } from '../config/endpoints';
import type {
  Attendance,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  AttendanceFilters,
  AttendanceStats,
  AttendanceStreak,
  BulkAttendanceRequest,
  BulkAttendanceResponse,
  AttendanceSummary,
} from '../types/attendance.types';

/**
 * Attendance service
 * Pure API functions for attendance management and tracking
 */
export const attendanceService = {
  /**
   * Get attendance records with optional filters
   *
   * Retrieves all attendance records matching the provided filter criteria.
   * Supports filtering by child, class, date, and date ranges.
   *
   * @async
   * @param {AttendanceFilters} [filters] - Optional filter parameters
   * @param {string} [filters.child_id] - Filter by specific child
   * @param {string} [filters.class_id] - Filter by specific class
   * @param {string} [filters.date] - Filter by specific date (YYYY-MM-DD)
   * @param {string} [filters.start_date] - Filter by start date range
   * @param {string} [filters.end_date] - Filter by end date range
   * @param {string} [filters.status] - Filter by attendance status (present, absent, late, etc.)
   * @returns {Promise<Attendance[]>} Array of attendance records
   *
   * @example
   * // Get all attendance records
   * const allRecords = await attendanceService.getAll();
   *
   * // Get attendance for a specific child
   * const childAttendance = await attendanceService.getAll({ child_id: 'child123' });
   *
   * // Get attendance for a date range
   * const rangeAttendance = await attendanceService.getAll({
   *   start_date: '2024-01-01',
   *   end_date: '2024-01-31'
   * });
   */
  async getAll(filters?: AttendanceFilters): Promise<Attendance[]> {
    const { data } = await apiClient.get<Attendance[]>(ENDPOINTS.ATTENDANCE.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get a specific attendance record by ID
   *
   * @async
   * @param {string} id - The attendance record ID
   * @returns {Promise<Attendance>} The attendance record details
   *
   * @example
   * const attendance = await attendanceService.getById('attendance123');
   * console.log(attendance.status); // 'present'
   */
  async getById(id: string): Promise<Attendance> {
    const { data } = await apiClient.get<Attendance>(ENDPOINTS.ATTENDANCE.BY_ID(id));
    return data;
  },

  /**
   * Record a single attendance entry (admin/staff only)
   *
   * Creates a new attendance record for a child at a class session.
   * Requires authentication with admin or staff role.
   *
   * @async
   * @param {CreateAttendanceRequest} attendanceData - Attendance details to create
   * @param {string} attendanceData.child_id - ID of the child
   * @param {string} attendanceData.class_id - ID of the class
   * @param {string} attendanceData.date - Date of the class session (YYYY-MM-DD)
   * @param {string} attendanceData.status - Attendance status (present, absent, late, excused)
   * @param {string} [attendanceData.notes] - Optional notes about attendance
   * @returns {Promise<Attendance>} The created attendance record
   *
   * @example
   * const attendance = await attendanceService.create({
   *   child_id: 'child123',
   *   class_id: 'class456',
   *   date: '2024-01-15',
   *   status: 'present',
   *   notes: 'On time'
   * });
   */
  async create(attendanceData: CreateAttendanceRequest): Promise<Attendance> {
    const { data } = await apiClient.post<Attendance>(
      ENDPOINTS.ATTENDANCE.CREATE,
      attendanceData
    );
    return data;
  },

  /**
   * Update an existing attendance record (admin/staff only)
   *
   * Modifies an attendance record. Commonly used to correct status or add notes.
   * Requires authentication with admin or staff role.
   *
   * @async
   * @param {string} id - The attendance record ID to update
   * @param {UpdateAttendanceRequest} attendanceData - Fields to update
   * @param {string} [attendanceData.status] - New attendance status
   * @param {string} [attendanceData.notes] - Updated notes
   * @returns {Promise<Attendance>} The updated attendance record
   *
   * @example
   * const updated = await attendanceService.update('attendance123', {
   *   status: 'absent',
   *   notes: 'Reported sick'
   * });
   */
  async update(id: string, attendanceData: UpdateAttendanceRequest): Promise<Attendance> {
    const { data } = await apiClient.put<Attendance>(
      ENDPOINTS.ATTENDANCE.BY_ID(id),
      attendanceData
    );
    return data;
  },

  /**
   * Delete an attendance record (admin/staff only)
   *
   * Removes an attendance record permanently. Requires authentication
   * with admin or staff role.
   *
   * @async
   * @param {string} id - The attendance record ID to delete
   * @returns {Promise<{message: string}>} Confirmation message
   *
   * @example
   * const result = await attendanceService.delete('attendance123');
   * console.log(result.message); // 'Attendance record deleted'
   */
  async delete(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(ENDPOINTS.ATTENDANCE.BY_ID(id));
    return data;
  },

  /**
   * Get all attendance records for a specific child
   *
   * Convenience method that retrieves attendance for a child, optionally filtered.
   *
   * @async
   * @param {string} childId - The child's ID
   * @param {AttendanceFilters} [filters] - Additional filter parameters
   * @returns {Promise<Attendance[]>} Array of the child's attendance records
   *
   * @example
   * const childRecords = await attendanceService.getByChild('child123');
   *
   * // With additional filters
   * const classRecords = await attendanceService.getByChild('child123', {
   *   class_id: 'class456'
   * });
   */
  async getByChild(childId: string, filters?: AttendanceFilters): Promise<Attendance[]> {
    return this.getAll({ ...filters, child_id: childId });
  },

  /**
   * Get all attendance records for a specific class
   *
   * Convenience method that retrieves all attendance for a class session,
   * optionally filtered further.
   *
   * @async
   * @param {string} classId - The class's ID
   * @param {AttendanceFilters} [filters] - Additional filter parameters
   * @returns {Promise<Attendance[]>} Array of attendance records for the class
   *
   * @example
   * const classAttendance = await attendanceService.getByClass('class456');
   *
   * // Get class attendance for a specific date
   * const dateAttendance = await attendanceService.getByClass('class456', {
   *   date: '2024-01-15'
   * });
   */
  async getByClass(classId: string, filters?: AttendanceFilters): Promise<Attendance[]> {
    return this.getAll({ ...filters, class_id: classId });
  },

  /**
   * Get all attendance records for a specific date
   *
   * Convenience method that retrieves all attendance on a given date,
   * optionally filtered by child or class.
   *
   * @async
   * @param {string} date - The date to query (YYYY-MM-DD format)
   * @param {AttendanceFilters} [filters] - Additional filter parameters
   * @returns {Promise<Attendance[]>} Array of attendance records for that date
   *
   * @example
   * const dateAttendance = await attendanceService.getByDate('2024-01-15');
   *
   * // Get attendance for a specific class on a date
   * const classDateAttendance = await attendanceService.getByDate('2024-01-15', {
   *   class_id: 'class456'
   * });
   */
  async getByDate(date: string, filters?: AttendanceFilters): Promise<Attendance[]> {
    return this.getAll({ ...filters, date });
  },

  /**
   * Get attendance statistics for a child
   *
   * Calculates comprehensive attendance metrics including total classes,
   * attended, missed, and attendance rate.
   *
   * @async
   * @param {string} childId - The child's ID
   * @param {AttendanceFilters} [filters] - Optional filters (e.g., by class or date range)
   * @returns {Promise<AttendanceStats>} Statistics object with attendance metrics
   *
   * @example
   * const stats = await attendanceService.getStats('child123');
   * console.log(stats.attendance_rate); // 0.95 (95%)
   * console.log(stats.total_classes); // 20
   * console.log(stats.attended); // 19
   * console.log(stats.missed); // 1
   *
   * // Get stats for a specific class
   * const classStats = await attendanceService.getStats('child123', {
   *   class_id: 'class456'
   * });
   */
  async getStats(childId: string, filters?: AttendanceFilters): Promise<AttendanceStats> {
    const { data } = await apiClient.get<AttendanceStats>(
      ENDPOINTS.ATTENDANCE.STATS(childId),
      { params: filters }
    );
    return data;
  },

  /**
   * Get attendance streak information for an enrollment
   *
   * Retrieves current attendance streak (consecutive classes attended)
   * and other streak-related metrics.
   *
   * @async
   * @param {string} enrollmentId - The enrollment ID
   * @returns {Promise<AttendanceStreak>} Streak information
   *
   * @example
   * const streak = await attendanceService.getStreak('enrollment123');
   * console.log(streak.current_streak); // 5 (attended 5 consecutive classes)
   * console.log(streak.longest_streak); // 12
   * console.log(streak.streak_start_date); // '2024-01-10'
   */
  async getStreak(enrollmentId: string): Promise<AttendanceStreak> {
    const { data } = await apiClient.get<AttendanceStreak>(
      ENDPOINTS.ATTENDANCE.STREAK(enrollmentId)
    );
    return data;
  },

  /**
   * Record attendance for multiple children in a single class session (admin/staff only)
   *
   * Bulk operation for efficiently recording attendance for all or most
   * children in a class session at once. More efficient than individual creates.
   *
   * @async
   * @param {BulkAttendanceRequest} bulkData - Bulk attendance data
   * @param {string} bulkData.class_id - The class ID
   * @param {string} bulkData.date - The session date (YYYY-MM-DD)
   * @param {Array<{child_id: string, status: string}>} bulkData.records - Array of attendance records
   * @returns {Promise<BulkAttendanceResponse>} Result of bulk operation
   *
   * @example
   * const result = await attendanceService.bulkCreate({
   *   class_id: 'class456',
   *   date: '2024-01-15',
   *   records: [
   *     { child_id: 'child123', status: 'present' },
   *     { child_id: 'child124', status: 'absent', notes: 'Sick' },
   *     { child_id: 'child125', status: 'late' }
   *   ]
   * });
   * console.log(result.created); // 3
   * console.log(result.failed); // 0
   */
  async bulkCreate(bulkData: BulkAttendanceRequest): Promise<BulkAttendanceResponse> {
    const { data } = await apiClient.post<BulkAttendanceResponse>(
      ENDPOINTS.ATTENDANCE.BULK_CREATE,
      bulkData
    );
    return data;
  },

  /**
   * Get attendance summary for a date range
   *
   * Generates a summary of attendance data over a specified period,
   * optionally filtered by child or class.
   *
   * @async
   * @param {Object} params - Summary parameters
   * @param {string} params.start_date - Start date (YYYY-MM-DD)
   * @param {string} params.end_date - End date (YYYY-MM-DD)
   * @param {string} [params.child_id] - Optional child ID filter
   * @param {string} [params.class_id] - Optional class ID filter
   * @returns {Promise<AttendanceSummary>} Summarized attendance data
   *
   * @example
   * const summary = await attendanceService.getSummary({
   *   start_date: '2024-01-01',
   *   end_date: '2024-01-31',
   *   child_id: 'child123'
   * });
   * console.log(summary.total_sessions); // 10
   * console.log(summary.attended_sessions); // 9
   * console.log(summary.avg_attendance_rate); // 0.90
   */
  async getSummary(params: {
    start_date: string;
    end_date: string;
    child_id?: string;
    class_id?: string;
  }): Promise<AttendanceSummary> {
    const { data } = await apiClient.get<AttendanceSummary>(ENDPOINTS.ATTENDANCE.SUMMARY, {
      params,
    });
    return data;
  },
};

/**
 * Attendance Service
 * Handles attendance tracking and records
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

export const attendanceService = {
  /**
   * Get attendance records with filters
   */
  async getAll(filters?: AttendanceFilters): Promise<Attendance[]> {
    const { data } = await apiClient.get<Attendance[]>(ENDPOINTS.ATTENDANCE.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get attendance record by ID
   */
  async getById(id: string): Promise<Attendance> {
    const { data } = await apiClient.get<Attendance>(ENDPOINTS.ATTENDANCE.BY_ID(id));
    return data;
  },

  /**
   * Record attendance (admin/staff only)
   */
  async create(attendanceData: CreateAttendanceRequest): Promise<Attendance> {
    const { data } = await apiClient.post<Attendance>(
      ENDPOINTS.ATTENDANCE.CREATE,
      attendanceData
    );
    return data;
  },

  /**
   * Update attendance record
   */
  async update(id: string, attendanceData: UpdateAttendanceRequest): Promise<Attendance> {
    const { data } = await apiClient.put<Attendance>(
      ENDPOINTS.ATTENDANCE.BY_ID(id),
      attendanceData
    );
    return data;
  },

  /**
   * Delete attendance record
   */
  async delete(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(ENDPOINTS.ATTENDANCE.BY_ID(id));
    return data;
  },

  /**
   * Get attendance for a specific child
   */
  async getByChild(childId: string, filters?: AttendanceFilters): Promise<Attendance[]> {
    return this.getAll({ ...filters, child_id: childId });
  },

  /**
   * Get attendance for a specific class
   */
  async getByClass(classId: string, filters?: AttendanceFilters): Promise<Attendance[]> {
    return this.getAll({ ...filters, class_id: classId });
  },

  /**
   * Get attendance for a specific date
   */
  async getByDate(date: string, filters?: AttendanceFilters): Promise<Attendance[]> {
    return this.getAll({ ...filters, date });
  },

  /**
   * Get attendance statistics for a child
   */
  async getStats(childId: string, filters?: AttendanceFilters): Promise<AttendanceStats> {
    const { data } = await apiClient.get<AttendanceStats>(
      ENDPOINTS.ATTENDANCE.STATS(childId),
      { params: filters }
    );
    return data;
  },

  /**
   * Get attendance streak for an enrollment
   */
  async getStreak(enrollmentId: string): Promise<AttendanceStreak> {
    const { data } = await apiClient.get<AttendanceStreak>(
      ENDPOINTS.ATTENDANCE.STREAK(enrollmentId)
    );
    return data;
  },

  /**
   * Bulk record attendance for a class session
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

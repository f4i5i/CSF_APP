/**
 * Attendance Type Definitions
 * TypeScript types for attendance tracking and records
 */

import type { Timestamped, AttendanceId } from './common.types';
import type { ChildId } from './child.types';
import type { ClassId } from './class.types';
import type { EnrollmentId } from './enrollment.types';

// Re-export for convenience
export type { AttendanceId };

/**
 * Attendance status enum
 */
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  EXCUSED = 'excused',
  LATE = 'late',
}

/**
 * Attendance record interface
 */
export interface Attendance extends Timestamped {
  id: AttendanceId;
  child_id: ChildId;
  class_id: ClassId;
  enrollment_id?: EnrollmentId;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  check_in_time?: string; // HH:MM:SS
  check_out_time?: string; // HH:MM:SS
  marked_by?: string; // Admin/coach who marked attendance
}

/**
 * Request to create attendance record
 */
export interface CreateAttendanceRequest {
  child_id: ChildId;
  class_id: ClassId;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  check_in_time?: string;
  check_out_time?: string;
}

/**
 * Request to update attendance record
 */
export interface UpdateAttendanceRequest {
  status?: AttendanceStatus;
  notes?: string;
  check_in_time?: string;
  check_out_time?: string;
}

/**
 * Filters for fetching attendance records
 */
export interface AttendanceFilters {
  child_id?: ChildId;
  class_id?: ClassId;
  enrollment_id?: EnrollmentId;
  date?: string; // YYYY-MM-DD
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  status?: AttendanceStatus;
  skip?: number;
  limit?: number;
}

/**
 * Attendance statistics for a child
 */
export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number; // Percentage
}

/**
 * Attendance streak information
 */
export interface AttendanceStreak {
  enrollment_id: EnrollmentId;
  current_streak: number;
  longest_streak: number;
  total_attended: number;
  total_sessions: number;
  last_attendance_date?: string;
  next_session_date?: string;
}

/**
 * Bulk attendance record for a single child in a session
 */
export interface BulkAttendanceRecord {
  child_id: ChildId;
  status: AttendanceStatus;
  notes?: string;
  check_in_time?: string;
  check_out_time?: string;
}

/**
 * Request for bulk attendance creation
 */
export interface BulkAttendanceRequest {
  class_id: ClassId;
  date: string; // YYYY-MM-DD
  records: BulkAttendanceRecord[];
}

/**
 * Response from bulk attendance creation
 */
export interface BulkAttendanceResponse {
  success: boolean;
  created_count: number;
  updated_count: number;
  failed_count: number;
  errors?: Array<{
    child_id: ChildId;
    error: string;
  }>;
}

/**
 * Attendance summary for a date range
 */
export interface AttendanceSummary {
  start_date: string;
  end_date: string;
  total_sessions: number;
  total_students: number;
  average_attendance_rate: number;
  by_status: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  by_date?: Array<{
    date: string;
    present: number;
    absent: number;
    total: number;
  }>;
}

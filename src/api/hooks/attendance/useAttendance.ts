/**
 * @file useAttendance Hook
 * @description React Query hooks for fetching attendance records with support for filtering
 * by child, class, date range, and status. These hooks provide read-only access to attendance
 * data and are used throughout the application to display attendance history and statistics.
 *
 * @module hooks/attendance/useAttendance
 *
 * @overview Attendance Tracking Flow
 * The attendance system tracks when students attend classes and supports:
 * - Real-time attendance marking by coaches during class sessions
 * - Historical attendance viewing for students, parents, and administrators
 * - Filtering by date ranges, status (present/absent/late), child, or class
 * - Automatic cache invalidation when attendance is marked or updated
 * - Short cache times (1 minute) for near-real-time updates
 *
 * @example Query Organization
 * The hooks use React Query's hierarchical query key structure:
 * - `attendance.list(filters)` - All attendance with optional filters
 * - `attendance.byChild(childId)` - Attendance for a specific child
 * - `attendance.byClass(classId)` - Attendance for a specific class
 *
 * This structure allows efficient invalidation when attendance is marked.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendance.service';
import { queryKeys } from '../../constants/query-keys';
import type { Attendance, AttendanceFilters } from '../../types/attendance.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Options for configuring attendance queries
 *
 * @interface UseAttendanceOptions
 * @property {AttendanceFilters} [filters] - Optional filters to narrow attendance results
 * @property {Object} [queryOptions] - React Query configuration options
 */
interface UseAttendanceOptions {
  filters?: AttendanceFilters;
  queryOptions?: Omit<
    UseQueryOptions<Attendance[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Primary hook for fetching attendance records with flexible filtering
 *
 * @description
 * Fetches attendance records from the API with support for filtering by:
 * - `child_id` - Get attendance for a specific student
 * - `class_id` - Get attendance for a specific class
 * - `enrollment_id` - Get attendance for a specific enrollment
 * - `start_date` and `end_date` - Filter by date range
 * - `status` - Filter by attendance status (present, absent, late, excused)
 *
 * Caching Strategy:
 * - Stale time: 1 minute - Attendance data is considered fresh for 1 minute
 * - Garbage collection: 3 minutes - Unused data is removed after 3 minutes
 * - Short cache times ensure coaches see recent attendance updates quickly
 *
 * @param {UseAttendanceOptions} [options={}] - Configuration options
 * @param {AttendanceFilters} [options.filters] - Filters to apply to the query
 * @param {Object} [options.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Attendance[], ApiErrorResponse>} React Query result object
 *
 * @example Basic Usage - Fetch All Attendance
 * ```tsx
 * function AttendanceList() {
 *   const { data: attendance, isLoading } = useAttendance();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   return (
 *     <div>
 *       {attendance?.map(record => (
 *         <div key={record.id}>{record.child_name} - {record.status}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Filtering by Date Range
 * ```tsx
 * function MonthlyAttendance() {
 *   const { data: attendance } = useAttendance({
 *     filters: {
 *       start_date: '2025-12-01',
 *       end_date: '2025-12-31',
 *       status: 'present'
 *     }
 *   });
 *
 *   return <AttendanceChart data={attendance} />;
 * }
 * ```
 *
 * @example Custom Query Options
 * ```tsx
 * function AttendanceWithPolling() {
 *   const { data } = useAttendance({
 *     filters: { class_id: '123' },
 *     queryOptions: {
 *       refetchInterval: 10000, // Poll every 10 seconds
 *       enabled: isClassActive
 *     }
 *   });
 * }
 * ```
 */
export function useAttendance(options: UseAttendanceOptions = {}) {
  const { filters, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.attendance.list(filters),
    queryFn: () => attendanceService.getAll(filters),
    staleTime: 1 * 60 * 1000, // 1 minute (attendance changes frequently)
    gcTime: 3 * 60 * 1000, // 3 minutes
    ...queryOptions,
  });
}

/**
 * Convenience hook for fetching attendance records for a specific child
 *
 * @description
 * Simplified hook that automatically filters attendance by child ID.
 * Used in parent dashboards and student profiles to show attendance history.
 * Inherits the same caching behavior as useAttendance.
 *
 * @param {string} childId - The ID of the child to fetch attendance for
 * @param {AttendanceFilters} [filters] - Additional filters (date range, status, etc.)
 * @param {Object} [queryOptions] - React Query configuration options
 *
 * @returns {UseQueryResult<Attendance[], ApiErrorResponse>} React Query result object
 *
 * @example Parent Dashboard
 * ```tsx
 * function ParentDashboard({ childId }: { childId: string }) {
 *   const { data: attendance, isLoading } = useChildAttendance(childId, {
 *     start_date: '2025-01-01',
 *     end_date: '2025-12-31'
 *   });
 *
 *   const attendanceRate = calculateAttendanceRate(attendance);
 *
 *   return (
 *     <div>
 *       <h2>Attendance: {attendanceRate}%</h2>
 *       <AttendanceCalendar records={attendance} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Recent Attendance
 * ```tsx
 * function RecentAttendance({ childId }: { childId: string }) {
 *   const thirtyDaysAgo = new Date();
 *   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
 *
 *   const { data: recentAttendance } = useChildAttendance(childId, {
 *     start_date: thirtyDaysAgo.toISOString().split('T')[0]
 *   });
 *
 *   return <AttendanceList attendance={recentAttendance} />;
 * }
 * ```
 */
export function useChildAttendance(
  childId: string,
  filters?: AttendanceFilters,
  queryOptions?: Omit<UseQueryOptions<Attendance[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useAttendance({
    filters: { ...filters, child_id: childId },
    queryOptions,
  });
}

/**
 * Convenience hook for fetching attendance records for a specific class
 *
 * @description
 * Simplified hook that automatically filters attendance by class ID.
 * Used in coach dashboards and class detail pages to show attendance for all students.
 * Particularly useful for generating class attendance reports.
 *
 * @param {string} classId - The ID of the class to fetch attendance for
 * @param {AttendanceFilters} [filters] - Additional filters (date range, status, etc.)
 * @param {Object} [queryOptions] - React Query configuration options
 *
 * @returns {UseQueryResult<Attendance[], ApiErrorResponse>} React Query result object
 *
 * @example Coach Class Dashboard
 * ```tsx
 * function ClassAttendancePage({ classId }: { classId: string }) {
 *   const today = new Date().toISOString().split('T')[0];
 *   const { data: todayAttendance, isLoading } = useClassAttendance(classId, {
 *     date: today
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *
 *   const presentCount = todayAttendance?.filter(a => a.status === 'present').length;
 *
 *   return (
 *     <div>
 *       <h2>Today's Attendance: {presentCount} / {todayAttendance?.length}</h2>
 *       <AttendanceTable records={todayAttendance} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Attendance Report
 * ```tsx
 * function MonthlyClassReport({ classId }: { classId: string }) {
 *   const { data: monthAttendance } = useClassAttendance(classId, {
 *     start_date: '2025-12-01',
 *     end_date: '2025-12-31'
 *   });
 *
 *   return <AttendanceReport data={monthAttendance} />;
 * }
 * ```
 */
export function useClassAttendance(
  classId: string,
  filters?: AttendanceFilters,
  queryOptions?: Omit<UseQueryOptions<Attendance[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useAttendance({
    filters: { ...filters, class_id: classId },
    queryOptions,
  });
}

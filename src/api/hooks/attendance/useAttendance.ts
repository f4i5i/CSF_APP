/**
 * useAttendance Hook
 * React Query hook to fetch attendance records
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendance.service';
import { queryKeys } from '../../constants/query-keys';
import type { Attendance, AttendanceFilters } from '../../types/attendance.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseAttendanceOptions {
  filters?: AttendanceFilters;
  queryOptions?: Omit<
    UseQueryOptions<Attendance[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch attendance records
 *
 * @example
 * ```tsx
 * const { data: attendance, isLoading } = useAttendance({
 *   filters: { child_id: '123', start_date: '2025-01-01' }
 * });
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
 * Hook to fetch attendance for a child
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
 * Hook to fetch attendance for a class
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

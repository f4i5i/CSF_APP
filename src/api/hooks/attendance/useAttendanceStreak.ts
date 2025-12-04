/**
 * useAttendanceStreak Hook
 * React Query hook to fetch attendance streak and stats
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendance.service';
import { queryKeys } from '../../constants/query-keys';
import type { AttendanceStreak, AttendanceStats } from '../../types/attendance.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch attendance streak for an enrollment
 *
 * @example
 * ```tsx
 * const { data: streak, isLoading } = useAttendanceStreak({
 *   enrollmentId: 'enroll-123'
 * });
 * ```
 */
export function useAttendanceStreak({
  enrollmentId,
  queryOptions,
}: {
  enrollmentId: string;
  queryOptions?: Omit<UseQueryOptions<AttendanceStreak, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.attendance.streak(enrollmentId),
    queryFn: () => attendanceService.getStreak(enrollmentId),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    enabled: !!enrollmentId,
    ...queryOptions,
  });
}

/**
 * Hook to fetch attendance stats for a child
 *
 * @example
 * ```tsx
 * const { data: stats } = useAttendanceStats({
 *   childId: 'child-123'
 * });
 * ```
 */
export function useAttendanceStats({
  childId,
  filters,
  queryOptions,
}: {
  childId: string;
  filters?: Record<string, any>;
  queryOptions?: Omit<UseQueryOptions<AttendanceStats, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.attendance.stats(childId),
    queryFn: () => attendanceService.getStats(childId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!childId,
    ...queryOptions,
  });
}

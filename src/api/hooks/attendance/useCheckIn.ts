/**
 * useCheckIn Hook
 * React Query hooks for check-in operations with real-time updates
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { attendanceService } from '../../services/attendance.service';
import { queryKeys } from '../../constants/query-keys';
import type { Attendance, CreateAttendanceRequest } from '../../types/attendance.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to get check-in status for a class (with real-time polling)
 * Polls every 30 seconds for live updates
 *
 * @example
 * ```tsx
 * const { data: checkInStatus } = useCheckInStatus({ classId: '123' });
 * ```
 */
export function useCheckInStatus({
  classId,
  date,
  queryOptions,
}: {
  classId: string;
  date?: string;
  queryOptions?: Omit<UseQueryOptions<Attendance[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.checkIn.status(classId),
    queryFn: () => attendanceService.getByClass(classId, { date }),
    staleTime: 20 * 1000, // 20 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
    enabled: !!classId,
    ...queryOptions,
  });
}

/**
 * Hook to check in a single child
 *
 * @example
 * ```tsx
 * const { mutate: checkIn } = useCheckIn();
 *
 * checkIn({
 *   child_id: '123',
 *   class_id: '456',
 *   date: '2025-12-03',
 *   status: 'present',
 *   check_in_time: '14:30:00'
 * });
 * ```
 */
export function useCheckIn(
  options?: Omit<
    UseMutationOptions<Attendance, ApiErrorResponse, CreateAttendanceRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkInData: CreateAttendanceRequest) =>
      attendanceService.create(checkInData),

    onSuccess: (_attendance, variables) => {
      // Invalidate check-in status for the class
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkIn.status(variables.class_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkIn.byClass(variables.class_id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.lists() });

      toast.success('Checked in successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to check in');
    },

    ...options,
  });
}

/**
 * Hook to bulk check in multiple children
 *
 * @example
 * ```tsx
 * const { mutate: bulkCheckIn } = useBulkCheckIn();
 *
 * bulkCheckIn({
 *   class_id: '456',
 *   date: '2025-12-03',
 *   records: [
 *     { child_id: '123', status: 'present', check_in_time: '14:30:00' },
 *     { child_id: '124', status: 'present', check_in_time: '14:31:00' }
 *   ]
 * });
 * ```
 */
export function useBulkCheckIn(
  options?: Omit<
    UseMutationOptions<any, ApiErrorResponse, any>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bulkData: any) => attendanceService.bulkCreate(bulkData),

    onSuccess: (result, variables) => {
      // Invalidate check-in queries for the class
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkIn.status(variables.class_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkIn.byClass(variables.class_id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.lists() });

      toast.success(`Successfully checked in ${result.created_count} student(s)!`);
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to bulk check in');
    },

    ...options,
  });
}

/**
 * Hook to get check-in history for an enrollment
 */
export function useCheckInHistory({
  enrollmentId,
  queryOptions,
}: {
  enrollmentId: string;
  queryOptions?: Omit<UseQueryOptions<Attendance[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.checkIn.history(enrollmentId),
    queryFn: () => attendanceService.getAll({ enrollment_id: enrollmentId }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!enrollmentId,
    ...queryOptions,
  });
}

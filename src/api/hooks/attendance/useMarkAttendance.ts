/**
 * useMarkAttendance Hook
 * React Query mutation hooks for marking attendance
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { attendanceService } from '../../services/attendance.service';
import { queryKeys } from '../../constants/query-keys';
import type {
  Attendance,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  BulkAttendanceRequest,
  BulkAttendanceResponse,
} from '../../types/attendance.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to mark attendance
 *
 * @example
 * ```tsx
 * const { mutate: markAttendance } = useMarkAttendance();
 *
 * markAttendance({
 *   child_id: '123',
 *   class_id: '456',
 *   date: '2025-12-03',
 *   status: 'present'
 * });
 * ```
 */
export function useMarkAttendance(
  options?: Omit<
    UseMutationOptions<Attendance, ApiErrorResponse, CreateAttendanceRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attendanceData: CreateAttendanceRequest) =>
      attendanceService.create(attendanceData),

    onSuccess: (attendance) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.byEnrollment(attendance.enrollment_id || ''),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.streak(attendance.enrollment_id || ''),
      });

      toast.success('Attendance marked successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to mark attendance');
    },

    ...options,
  });
}

/**
 * Hook to update attendance record
 */
export function useUpdateAttendance(
  options?: Omit<
    UseMutationOptions<
      Attendance,
      ApiErrorResponse,
      { id: string; data: UpdateAttendanceRequest }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceRequest }) =>
      attendanceService.update(id, data),

    onSuccess: (attendance) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.byEnrollment(attendance.enrollment_id || ''),
      });

      toast.success('Attendance updated successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update attendance');
    },

    ...options,
  });
}

/**
 * Hook to bulk mark attendance for a class
 *
 * @example
 * ```tsx
 * const { mutate: bulkMarkAttendance } = useBulkMarkAttendance();
 *
 * bulkMarkAttendance({
 *   class_id: '456',
 *   date: '2025-12-03',
 *   records: [
 *     { child_id: '123', status: 'present' },
 *     { child_id: '124', status: 'absent' }
 *   ]
 * });
 * ```
 */
export function useBulkMarkAttendance(
  options?: Omit<
    UseMutationOptions<BulkAttendanceResponse, ApiErrorResponse, BulkAttendanceRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bulkData: BulkAttendanceRequest) =>
      attendanceService.bulkCreate(bulkData),

    onSuccess: (result, variables) => {
      // Invalidate all attendance queries for the class
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.list({ class_id: variables.class_id }),
      });

      const message = `Successfully marked ${result.created_count} attendance record(s)${
        result.failed_count > 0 ? `. ${result.failed_count} failed.` : ''
      }`;
      toast.success(message);
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to bulk mark attendance');
    },

    ...options,
  });
}

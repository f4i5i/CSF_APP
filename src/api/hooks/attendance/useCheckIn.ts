/**
 * @file useCheckIn Hook
 * @description React Query hooks for real-time student check-in operations during class sessions.
 * Provides polling-based live updates for coaches to track which students have checked in.
 *
 * @module hooks/attendance/useCheckIn
 *
 * @overview Check-In Flow
 * The check-in system is designed for coaches to mark student attendance at the start of class:
 *
 * 1. Coach opens the check-in interface for their class
 * 2. The system displays all enrolled students with check-in status
 * 3. Real-time polling (every 30 seconds) updates the status automatically
 * 4. Coach can check in students individually or in bulk
 * 5. Check-in data is immediately available to parents and admins
 *
 * Check-In vs Mark Attendance:
 * - Check-in: Used during class sessions, includes check-in time tracking
 * - Mark Attendance: General attendance marking (can be done after class)
 *
 * @overview Real-Time Updates
 * The check-in status query uses aggressive polling to ensure coaches see updates:
 * - Polls every 30 seconds automatically
 * - Stale time of 20 seconds (considered fresh for only 20 seconds)
 * - This enables multiple coaches/assistants to collaborate on check-ins
 *
 * @overview Cache Invalidation Strategy
 * After check-in operations, the following queries are invalidated:
 * - `checkIn.status(classId)` - Current check-in status for the class
 * - `checkIn.byClass(classId)` - Check-in history for the class
 * - `attendance.lists()` - All attendance list queries
 * - This ensures all views show the latest check-in data immediately
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { attendanceService } from '../../services/attendance.service';
import { queryKeys } from '../../constants/query-keys';
import type { Attendance, CreateAttendanceRequest } from '../../types/attendance.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to get real-time check-in status for a class with automatic polling
 *
 * @description
 * Fetches and monitors check-in status for all students in a class with automatic updates.
 * This hook is the foundation of the coach check-in interface, providing live updates
 * as students are checked in by coaches or teaching assistants.
 *
 * Real-Time Behavior:
 * - Automatically refetches data every 30 seconds
 * - Data is considered stale after 20 seconds
 * - Enables collaborative check-ins (multiple coaches can check in simultaneously)
 * - Updates reflect immediately across all connected clients
 *
 * Polling Strategy:
 * The aggressive polling ensures coaches always see the latest check-in status,
 * even when multiple people are managing attendance. This is crucial during
 * busy class start times when students arrive at different times.
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.classId - The ID of the class to monitor check-ins for
 * @param {string} [params.date] - Optional date filter (defaults to today)
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Attendance[], ApiErrorResponse>} React Query result with check-in records
 *
 * @example Coach Check-In Interface
 * ```tsx
 * function CoachCheckInPage({ classId }: { classId: string }) {
 *   const { data: checkInStatus, isLoading } = useCheckInStatus({ classId });
 *
 *   if (isLoading) return <Spinner />;
 *
 *   const checkedInCount = checkInStatus?.filter(r => r.status === 'present').length || 0;
 *   const totalStudents = checkInStatus?.length || 0;
 *
 *   return (
 *     <div>
 *       <h2>Check-In Progress: {checkedInCount} / {totalStudents}</h2>
 *       <StudentCheckInList students={checkInStatus} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Real-Time Progress Indicator
 * ```tsx
 * function CheckInProgress({ classId }: { classId: string }) {
 *   const { data: status } = useCheckInStatus({ classId });
 *
 *   const progress = (status?.filter(r => r.status === 'present').length || 0) /
 *                   (status?.length || 1) * 100;
 *
 *   return (
 *     <div>
 *       <ProgressBar value={progress} />
 *       <p>Updating every 30 seconds...</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Specific Date Check-In
 * ```tsx
 * function HistoricalCheckIn({ classId, date }: { classId: string; date: string }) {
 *   const { data: checkInStatus } = useCheckInStatus({
 *     classId,
 *     date,
 *     queryOptions: {
 *       refetchInterval: false // Disable polling for historical data
 *     }
 *   });
 *
 *   return <CheckInReport data={checkInStatus} />;
 * }
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
 * Mutation hook to check in a single student during class
 *
 * @description
 * Creates an attendance record with check-in time for a single student.
 * This is typically used in the coach check-in interface when marking students
 * as present one at a time (e.g., scanning QR codes, tapping names).
 *
 * Check-In Process:
 * 1. Coach selects a student from the check-in list
 * 2. System records check-in time automatically
 * 3. Mutation creates attendance record with 'present' status
 * 4. Success toast notification confirms check-in
 * 5. All check-in queries are invalidated to trigger real-time updates
 *
 * Cache Invalidation:
 * On success, the following queries are invalidated to ensure fresh data:
 * - `checkIn.status(classId)` - Updates the check-in status view immediately
 * - `checkIn.byClass(classId)` - Updates check-in history for the class
 * - `attendance.lists()` - Updates all attendance list views
 *
 * This ensures that the coach sees the updated count immediately, and any
 * other coaches/assistants see the update within 30 seconds (next poll).
 *
 * @param {Object} [options] - Additional mutation options
 *
 * @returns {UseMutationResult} React Query mutation result with mutate function
 *
 * @example Basic Check-In
 * ```tsx
 * function StudentCheckInButton({ student, classId }: Props) {
 *   const { mutate: checkIn, isPending } = useCheckIn();
 *
 *   const handleCheckIn = () => {
 *     checkIn({
 *       child_id: student.id,
 *       class_id: classId,
 *       date: new Date().toISOString().split('T')[0],
 *       status: 'present',
 *       check_in_time: new Date().toTimeString().split(' ')[0]
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleCheckIn} disabled={isPending}>
 *       {isPending ? 'Checking in...' : 'Check In'}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example QR Code Check-In
 * ```tsx
 * function QRCodeCheckIn({ classId }: { classId: string }) {
 *   const { mutate: checkIn } = useCheckIn();
 *
 *   const handleScan = (qrData: string) => {
 *     const studentId = parseQRCode(qrData);
 *     const now = new Date();
 *
 *     checkIn({
 *       child_id: studentId,
 *       class_id: classId,
 *       date: now.toISOString().split('T')[0],
 *       status: 'present',
 *       check_in_time: now.toTimeString().split(' ')[0],
 *       notes: 'QR code scan'
 *     });
 *   };
 *
 *   return <QRScanner onScan={handleScan} />;
 * }
 * ```
 *
 * @example With Custom Success Handler
 * ```tsx
 * function CheckInWithSound({ classId }: { classId: string }) {
 *   const { mutate: checkIn } = useCheckIn({
 *     onSuccess: (attendance) => {
 *       playSuccessSound();
 *       logCheckIn(attendance);
 *     }
 *   });
 *
 *   // Component implementation...
 * }
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
 * Mutation hook to check in multiple students simultaneously
 *
 * @description
 * Creates attendance records for multiple students in a single operation.
 * This is the most efficient way to check in students and is typically used when:
 * - Marking all students present at class start
 * - Checking in a group of students who arrived together
 * - Importing attendance from an external system
 *
 * Bulk Check-In Benefits:
 * - Single API call reduces network overhead
 * - Atomic operation - all succeed or all fail (transactional)
 * - Returns summary of successful and failed check-ins
 * - One cache invalidation for all records
 *
 * Response Format:
 * The mutation returns a result object with:
 * - `created_count`: Number of successfully checked-in students
 * - `failed_count`: Number of failed check-ins
 * - `errors`: Array of error details for failed records
 *
 * @param {Object} [options] - Additional mutation options
 *
 * @returns {UseMutationResult} React Query mutation result with mutate function
 *
 * @example Check In All Present Students
 * ```tsx
 * function BulkCheckInButton({ classId, students }: Props) {
 *   const { mutate: bulkCheckIn, isPending } = useBulkCheckIn();
 *   const now = new Date();
 *   const today = now.toISOString().split('T')[0];
 *   const time = now.toTimeString().split(' ')[0];
 *
 *   const checkInAll = () => {
 *     bulkCheckIn({
 *       class_id: classId,
 *       date: today,
 *       records: students.map(student => ({
 *         child_id: student.id,
 *         status: 'present',
 *         check_in_time: time
 *       }))
 *     });
 *   };
 *
 *   return (
 *     <button onClick={checkInAll} disabled={isPending}>
 *       Check In All ({students.length})
 *     </button>
 *   );
 * }
 * ```
 *
 * @example Selective Bulk Check-In
 * ```tsx
 * function SelectiveCheckIn({ classId }: { classId: string }) {
 *   const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
 *   const { mutate: bulkCheckIn } = useBulkCheckIn();
 *
 *   const checkInSelected = () => {
 *     const now = new Date();
 *     bulkCheckIn({
 *       class_id: classId,
 *       date: now.toISOString().split('T')[0],
 *       records: selectedStudents.map(studentId => ({
 *         child_id: studentId,
 *         status: 'present',
 *         check_in_time: now.toTimeString().split(' ')[0]
 *       }))
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <StudentSelector onSelect={setSelectedStudents} />
 *       <button onClick={checkInSelected}>
 *         Check In Selected ({selectedStudents.length})
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Error Handling
 * ```tsx
 * function BulkCheckInWithErrors({ classId, students }: Props) {
 *   const { mutate: bulkCheckIn } = useBulkCheckIn({
 *     onSuccess: (result) => {
 *       if (result.failed_count > 0) {
 *         console.error('Failed check-ins:', result.errors);
 *         showErrorDialog(result.errors);
 *       }
 *     }
 *   });
 *
 *   // Component implementation...
 * }
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
 * Query hook to fetch complete check-in history for an enrollment
 *
 * @description
 * Retrieves all historical check-in records for a specific student enrollment.
 * This is useful for:
 * - Displaying a student's complete attendance history
 * - Generating attendance reports
 * - Analyzing attendance patterns
 * - Parent/guardian review of student attendance
 *
 * Caching Strategy:
 * - Stale time: 2 minutes - Historical data changes less frequently
 * - Garbage collection: 5 minutes
 * - Longer cache times than real-time check-in status (history is stable)
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.enrollmentId - The enrollment ID to fetch history for
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Attendance[], ApiErrorResponse>} React Query result with attendance history
 *
 * @example Student Attendance History
 * ```tsx
 * function StudentAttendanceHistory({ enrollmentId }: { enrollmentId: string }) {
 *   const { data: history, isLoading } = useCheckInHistory({ enrollmentId });
 *
 *   if (isLoading) return <Spinner />;
 *
 *   const totalClasses = history?.length || 0;
 *   const presentCount = history?.filter(r => r.status === 'present').length || 0;
 *   const attendanceRate = (presentCount / totalClasses) * 100;
 *
 *   return (
 *     <div>
 *       <h3>Attendance Rate: {attendanceRate.toFixed(1)}%</h3>
 *       <AttendanceHistoryTable records={history} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Parent View
 * ```tsx
 * function ParentAttendanceView({ enrollmentId }: { enrollmentId: string }) {
 *   const { data: history } = useCheckInHistory({ enrollmentId });
 *
 *   const recentAttendance = history?.slice(0, 10); // Last 10 classes
 *
 *   return (
 *     <Card>
 *       <h2>Recent Attendance</h2>
 *       <AttendanceCalendar records={recentAttendance} />
 *     </Card>
 *   );
 * }
 * ```
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

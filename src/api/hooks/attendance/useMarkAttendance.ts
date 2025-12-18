/**
 * @file useMarkAttendance Hook
 * @description React Query mutation hooks for marking and updating student attendance.
 * Provides comprehensive attendance management with automatic cache invalidation and
 * streak calculation triggers.
 *
 * @module hooks/attendance/useMarkAttendance
 *
 * @overview Attendance Marking Flow
 * The attendance marking system supports multiple use cases:
 *
 * 1. Real-time marking during class (coaches)
 * 2. Post-class attendance entry (administrators)
 * 3. Retroactive attendance correction (admins)
 * 4. Bulk attendance marking for entire classes
 *
 * Mark Attendance vs Check-In:
 * - Mark Attendance: General purpose, can be done anytime, focuses on status
 * - Check-In: Real-time during class, includes check-in time, supports polling
 *
 * @overview Cache Invalidation Strategy
 * When attendance is marked or updated, the following queries are invalidated:
 *
 * 1. `attendance.lists()` - All attendance list queries
 * 2. `attendance.byEnrollment(enrollmentId)` - Enrollment-specific attendance
 * 3. `attendance.streak(enrollmentId)` - CRITICAL: Triggers streak recalculation
 *
 * The streak invalidation is crucial because:
 * - Streaks are calculated based on consecutive attendance
 * - New attendance can extend or break a streak
 * - Streak changes may trigger badge eligibility (e.g., "Attendance Streak" badges)
 * - Parents/students see updated streak immediately after attendance is marked
 *
 * @overview Badge System Integration
 * Marking attendance can trigger badge awards through the streak system:
 * - 7-day streak: "Week Warrior" badge
 * - 30-day streak: "Month Master" badge
 * - Perfect attendance: "Perfect Record" badge
 *
 * The system automatically checks eligibility when streaks are updated.
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
 * Primary mutation hook for marking student attendance
 *
 * @description
 * Creates a new attendance record for a student. This is the main hook for recording
 * whether a student was present, absent, late, or excused for a class session.
 *
 * Attendance Statuses:
 * - `present`: Student attended the class
 * - `absent`: Student did not attend
 * - `late`: Student arrived after class started
 * - `excused`: Student was absent but had a valid excuse
 *
 * Important Side Effects:
 * 1. Invalidates all attendance-related queries for fresh data
 * 2. Invalidates streak queries to trigger recalculation
 * 3. May indirectly trigger badge awards if streak milestones are reached
 *
 * Cache Invalidation Flow:
 * - `attendance.lists()` → Updates all attendance list views
 * - `attendance.byEnrollment()` → Updates student's attendance history
 * - `attendance.streak()` → Triggers streak recalculation which may award badges
 *
 * @param {Object} [options] - Additional mutation options
 *
 * @returns {UseMutationResult} React Query mutation result with mutate function
 *
 * @example Basic Attendance Marking
 * ```tsx
 * function MarkAttendanceButton({ student, classId }: Props) {
 *   const { mutate: markAttendance, isPending } = useMarkAttendance();
 *
 *   const markPresent = () => {
 *     markAttendance({
 *       child_id: student.id,
 *       class_id: classId,
 *       date: new Date().toISOString().split('T')[0],
 *       status: 'present'
 *     });
 *   };
 *
 *   return (
 *     <button onClick={markPresent} disabled={isPending}>
 *       Mark Present
 *     </button>
 *   );
 * }
 * ```
 *
 * @example Mark Absent with Notes
 * ```tsx
 * function MarkAbsent({ student, classId }: Props) {
 *   const { mutate: markAttendance } = useMarkAttendance();
 *   const [reason, setReason] = useState('');
 *
 *   const handleMarkAbsent = () => {
 *     markAttendance({
 *       child_id: student.id,
 *       class_id: classId,
 *       date: new Date().toISOString().split('T')[0],
 *       status: 'absent',
 *       notes: reason
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         value={reason}
 *         onChange={(e) => setReason(e.target.value)}
 *         placeholder="Reason for absence"
 *       />
 *       <button onClick={handleMarkAbsent}>Mark Absent</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Retroactive Attendance (Admin)
 * ```tsx
 * function AdminAttendanceCorrection() {
 *   const { mutate: markAttendance } = useMarkAttendance({
 *     onSuccess: (attendance) => {
 *       console.log('Retroactive attendance marked:', attendance);
 *       logAdminAction('attendance_correction', attendance);
 *     }
 *   });
 *
 *   const correctAttendance = (studentId: string, date: string) => {
 *     markAttendance({
 *       child_id: studentId,
 *       class_id: 'class-123',
 *       date,
 *       status: 'present',
 *       notes: 'Administrative correction'
 *     });
 *   };
 *
 *   // Component implementation...
 * }
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
 * Mutation hook for updating existing attendance records
 *
 * @description
 * Modifies an existing attendance record. This is used for:
 * - Correcting mistakes in attendance marking
 * - Changing status (e.g., absent → excused)
 * - Adding or updating notes
 * - Administrative corrections
 *
 * Update Use Cases:
 * - Coach marks wrong status and needs to correct it
 * - Parent provides excuse note for absence
 * - Admin corrects attendance after reviewing evidence
 * - Late arrival needs to be changed to present after class ends
 *
 * Important: Updates do NOT trigger streak recalculation automatically.
 * If the status changes from absent to present (or vice versa), streaks
 * may need to be manually recalculated.
 *
 * @param {Object} [options] - Additional mutation options
 *
 * @returns {UseMutationResult} React Query mutation result with mutate function
 *
 * @example Correct Attendance Status
 * ```tsx
 * function CorrectAttendance({ record }: { record: Attendance }) {
 *   const { mutate: updateAttendance } = useUpdateAttendance();
 *
 *   const changeToPresent = () => {
 *     updateAttendance({
 *       id: record.id,
 *       data: {
 *         status: 'present',
 *         notes: 'Corrected - student was present'
 *       }
 *     });
 *   };
 *
 *   return <button onClick={changeToPresent}>Change to Present</button>;
 * }
 * ```
 *
 * @example Add Excuse for Absence
 * ```tsx
 * function AddExcuse({ attendance }: { attendance: Attendance }) {
 *   const { mutate: updateAttendance } = useUpdateAttendance();
 *   const [excuse, setExcuse] = useState('');
 *
 *   const submitExcuse = () => {
 *     updateAttendance({
 *       id: attendance.id,
 *       data: {
 *         status: 'excused',
 *         notes: excuse
 *       }
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <textarea value={excuse} onChange={(e) => setExcuse(e.target.value)} />
 *       <button onClick={submitExcuse}>Submit Excuse</button>
 *     </div>
 *   );
 * }
 * ```
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
 * Mutation hook for bulk marking attendance for multiple students
 *
 * @description
 * Creates attendance records for multiple students in a single operation.
 * This is the most efficient way to mark attendance for an entire class
 * and is commonly used for:
 * - End-of-class bulk attendance entry
 * - Administrative attendance import
 * - Marking entire class absent (e.g., class cancellation)
 * - Quick marking of attendance patterns
 *
 * Bulk Operation Benefits:
 * - Single API call reduces network overhead
 * - Transactional - all records succeed or all fail
 * - Returns detailed success/failure counts
 * - Single cache invalidation for all records
 *
 * Response Details:
 * The mutation returns a `BulkAttendanceResponse` with:
 * - `created_count`: Number of successfully created records
 * - `failed_count`: Number of failed records
 * - `errors`: Array of error details for failed records
 *
 * Cache Invalidation:
 * After bulk marking, the following queries are invalidated:
 * - All attendance list queries
 * - Class-specific attendance queries
 * - Individual student attendance histories (via list invalidation)
 *
 * Note: Bulk operations do NOT automatically invalidate streak queries
 * for each student. For large classes, consider triggering a background
 * job to recalculate streaks and check badge eligibility.
 *
 * @param {Object} [options] - Additional mutation options
 *
 * @returns {UseMutationResult} React Query mutation result with mutate function
 *
 * @example Mark Entire Class Present
 * ```tsx
 * function BulkMarkPresent({ classId, students }: Props) {
 *   const { mutate: bulkMarkAttendance, isPending } = useBulkMarkAttendance();
 *   const today = new Date().toISOString().split('T')[0];
 *
 *   const markAllPresent = () => {
 *     bulkMarkAttendance({
 *       class_id: classId,
 *       date: today,
 *       records: students.map(student => ({
 *         child_id: student.id,
 *         status: 'present'
 *       }))
 *     });
 *   };
 *
 *   return (
 *     <button onClick={markAllPresent} disabled={isPending}>
 *       Mark All Present ({students.length})
 *     </button>
 *   );
 * }
 * ```
 *
 * @example Selective Bulk Marking
 * ```tsx
 * function SelectiveBulkMark({ classId, allStudents }: Props) {
 *   const [presentIds, setPresentIds] = useState<string[]>([]);
 *   const { mutate: bulkMarkAttendance } = useBulkMarkAttendance();
 *
 *   const submitAttendance = () => {
 *     const today = new Date().toISOString().split('T')[0];
 *
 *     bulkMarkAttendance({
 *       class_id: classId,
 *       date: today,
 *       records: allStudents.map(student => ({
 *         child_id: student.id,
 *         status: presentIds.includes(student.id) ? 'present' : 'absent'
 *       }))
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <StudentSelector students={allStudents} selected={presentIds} onChange={setPresentIds} />
 *       <button onClick={submitAttendance}>Submit Attendance</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Error Handling
 * ```tsx
 * function BulkMarkWithErrors({ classId, students }: Props) {
 *   const { mutate: bulkMarkAttendance } = useBulkMarkAttendance({
 *     onSuccess: (result) => {
 *       console.log(`Created: ${result.created_count}, Failed: ${result.failed_count}`);
 *
 *       if (result.failed_count > 0) {
 *         showErrorDialog({
 *           title: 'Some records failed',
 *           message: `${result.failed_count} students could not be marked`,
 *           details: result.errors
 *         });
 *       }
 *     }
 *   });
 *
 *   // Component implementation...
 * }
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

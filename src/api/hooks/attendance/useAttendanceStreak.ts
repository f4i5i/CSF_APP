/**
 * @file useAttendanceStreak Hook
 * @description React Query hooks for fetching attendance streaks and statistics.
 * Streaks are a key gamification feature that drives student engagement and badge eligibility.
 *
 * @module hooks/attendance/useAttendanceStreak
 *
 * @overview Attendance Streak System
 * Streaks track consecutive days of attendance and serve multiple purposes:
 *
 * 1. Student Motivation: Visual progress indicator encourages consistent attendance
 * 2. Badge Triggers: Streak milestones automatically award achievement badges
 * 3. Parent Insights: Shows attendance patterns and consistency
 * 4. Gamification: Creates friendly competition through leaderboards
 *
 * @overview Streak Calculation Rules
 * Streaks are calculated based on these rules:
 * - `current_streak`: Consecutive class attendances ending on the most recent class
 * - `longest_streak`: Highest consecutive attendance count ever achieved
 * - Only 'present' status counts toward streaks
 * - 'late' attendance typically counts as present for streaks
 * - 'absent' or 'excused' breaks the current streak
 * - Streaks are enrollment-specific (per class, not global)
 *
 * Calculation Triggers:
 * - Automatically calculated when attendance is marked (via cache invalidation)
 * - Recalculated on query refetch
 * - Backend performs the calculation based on chronological attendance records
 *
 * @overview Badge Integration
 * Streak milestones trigger automatic badge eligibility checks:
 *
 * Common Streak Badges:
 * - 3-day streak: "Getting Started" badge
 * - 7-day streak: "Week Warrior" badge
 * - 14-day streak: "Fortnight Fighter" badge
 * - 30-day streak: "Month Master" badge
 * - 90-day streak: "Season Champion" badge
 *
 * When a student reaches a milestone, the system:
 * 1. Detects the streak achievement via this hook
 * 2. Checks badge eligibility via badge service
 * 3. Automatically awards the badge if eligible
 * 4. Sends notification to student/parent
 * 5. Updates badge progress queries
 *
 * @overview Real-Time Updates
 * Streak queries are invalidated when:
 * - Attendance is marked (via useMarkAttendance)
 * - Attendance is updated (via useUpdateAttendance)
 * - Check-in is performed (via useCheckIn)
 *
 * This ensures streaks are always current and badge triggers fire immediately.
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendance.service';
import { queryKeys } from '../../constants/query-keys';
import type { AttendanceStreak, AttendanceStats } from '../../types/attendance.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Query hook to fetch current attendance streak for a student enrollment
 *
 * @description
 * Retrieves the attendance streak information for a specific enrollment.
 * This hook is central to the gamification system and is displayed prominently
 * in student dashboards to encourage consistent attendance.
 *
 * Streak Data Returned:
 * - `current_streak`: Number of consecutive recent attendances
 * - `longest_streak`: The longest streak ever achieved
 * - `last_attendance_date`: Date of most recent attendance
 * - `enrollment_id`: The enrollment this streak belongs to
 *
 * Caching Strategy:
 * - Stale time: 1 minute - Streaks can change with each attendance
 * - Garbage collection: 3 minutes
 * - Automatically invalidated when attendance is marked
 *
 * Badge Trigger Integration:
 * When the streak reaches certain milestones (7, 14, 30, 90 days), the UI
 * should check badge eligibility using useBadgeEligibility. The backend may
 * also automatically award badges via webhook/background job.
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.enrollmentId - The enrollment ID to fetch streak for
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<AttendanceStreak, ApiErrorResponse>} React Query result with streak data
 *
 * @example Student Dashboard Streak Display
 * ```tsx
 * function StreakDisplay({ enrollmentId }: { enrollmentId: string }) {
 *   const { data: streak, isLoading } = useAttendanceStreak({ enrollmentId });
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!streak) return null;
 *
 *   return (
 *     <Card>
 *       <h3>Current Streak</h3>
 *       <div className="streak-count">{streak.current_streak} days</div>
 *       <p>Longest streak: {streak.longest_streak} days</p>
 *       {streak.current_streak >= 7 && (
 *         <Badge>Week Warrior!</Badge>
 *       )}
 *     </Card>
 *   );
 * }
 * ```
 *
 * @example Streak Progress with Milestone Indicator
 * ```tsx
 * function StreakProgress({ enrollmentId }: { enrollmentId: string }) {
 *   const { data: streak } = useAttendanceStreak({ enrollmentId });
 *
 *   const nextMilestone = [7, 14, 30, 90].find(m => m > (streak?.current_streak || 0));
 *   const progress = nextMilestone
 *     ? ((streak?.current_streak || 0) / nextMilestone) * 100
 *     : 100;
 *
 *   return (
 *     <div>
 *       <h4>Streak: {streak?.current_streak || 0} days</h4>
 *       <ProgressBar value={progress} />
 *       <p>Next milestone: {nextMilestone} days</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With Badge Eligibility Check
 * ```tsx
 * function StreakWithBadges({ enrollmentId, childId }: Props) {
 *   const { data: streak } = useAttendanceStreak({ enrollmentId });
 *   const { data: eligibility } = useBadgeEligibility({
 *     childId,
 *     badgeId: 'week-warrior-badge',
 *     queryOptions: {
 *       enabled: (streak?.current_streak || 0) >= 7
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       <StreakDisplay streak={streak} />
 *       {eligibility?.eligible && (
 *         <EligibleBadgeNotification badge={eligibility.badge} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Streak Leaderboard
 * ```tsx
 * function ClassStreakLeaderboard({ enrollmentIds }: { enrollmentIds: string[] }) {
 *   const streakQueries = enrollmentIds.map(id =>
 *     useAttendanceStreak({ enrollmentId: id })
 *   );
 *
 *   const streaks = streakQueries
 *     .map(q => q.data)
 *     .filter(Boolean)
 *     .sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0));
 *
 *   return (
 *     <div>
 *       <h2>Top Streaks</h2>
 *       {streaks.map((streak, i) => (
 *         <div key={i}>#{i + 1}: {streak.current_streak} days</div>
 *       ))}
 *     </div>
 *   );
 * }
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
 * Query hook to fetch comprehensive attendance statistics for a child
 *
 * @description
 * Retrieves aggregated attendance statistics across all of a child's enrollments.
 * This provides a high-level overview of attendance patterns and performance.
 *
 * Statistics Returned:
 * - `total_classes`: Total number of class sessions
 * - `present_count`: Number of times marked present
 * - `absent_count`: Number of times marked absent
 * - `late_count`: Number of times marked late
 * - `excused_count`: Number of excused absences
 * - `attendance_rate`: Percentage of classes attended (present/total)
 * - `on_time_rate`: Percentage of on-time attendances
 *
 * Caching Strategy:
 * - Stale time: 2 minutes - Stats change less frequently than individual records
 * - Garbage collection: 5 minutes
 * - Longer cache than individual attendance records
 *
 * Use Cases:
 * - Parent dashboards showing overall performance
 * - Admin reports on student engagement
 * - Identifying at-risk students (low attendance rate)
 * - Generating attendance certificates
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.childId - The child ID to fetch statistics for
 * @param {Object} [params.filters] - Optional filters (date range, class, etc.)
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<AttendanceStats, ApiErrorResponse>} React Query result with attendance stats
 *
 * @example Parent Dashboard Stats
 * ```tsx
 * function ParentAttendanceStats({ childId }: { childId: string }) {
 *   const { data: stats, isLoading } = useAttendanceStats({ childId });
 *
 *   if (isLoading) return <Spinner />;
 *   if (!stats) return null;
 *
 *   return (
 *     <StatsCard>
 *       <h3>Attendance Overview</h3>
 *       <div className="stat">
 *         <label>Attendance Rate:</label>
 *         <span>{stats.attendance_rate}%</span>
 *       </div>
 *       <div className="stat">
 *         <label>Classes Attended:</label>
 *         <span>{stats.present_count} / {stats.total_classes}</span>
 *       </div>
 *       <div className="stat">
 *         <label>On-Time Rate:</label>
 *         <span>{stats.on_time_rate}%</span>
 *       </div>
 *     </StatsCard>
 *   );
 * }
 * ```
 *
 * @example Filtered Stats (Semester View)
 * ```tsx
 * function SemesterStats({ childId }: { childId: string }) {
 *   const { data: stats } = useAttendanceStats({
 *     childId,
 *     filters: {
 *       start_date: '2025-09-01',
 *       end_date: '2025-12-31'
 *     }
 *   });
 *
 *   return <AttendanceReport stats={stats} period="Fall Semester 2025" />;
 * }
 * ```
 *
 * @example Performance Indicator
 * ```tsx
 * function AttendancePerformance({ childId }: { childId: string }) {
 *   const { data: stats } = useAttendanceStats({ childId });
 *
 *   const getPerformanceLevel = (rate: number) => {
 *     if (rate >= 95) return { label: 'Excellent', color: 'green' };
 *     if (rate >= 85) return { label: 'Good', color: 'blue' };
 *     if (rate >= 75) return { label: 'Fair', color: 'yellow' };
 *     return { label: 'Needs Improvement', color: 'red' };
 *   };
 *
 *   const performance = getPerformanceLevel(stats?.attendance_rate || 0);
 *
 *   return (
 *     <Badge color={performance.color}>
 *       {performance.label} ({stats?.attendance_rate}%)
 *     </Badge>
 *   );
 * }
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

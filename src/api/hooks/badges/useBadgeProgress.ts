/**
 * @file useBadgeProgress Hook
 * @description React Query hooks for tracking badge eligibility and progress toward earning badges.
 * These hooks power the badge progression system that motivates students through visible progress.
 *
 * @module hooks/badges/useBadgeProgress
 *
 * @overview Badge Progression System
 * The badge progression system shows students how close they are to earning badges:
 *
 * 1. Eligibility Checking:
 *    - Determines if a student meets all requirements for a badge
 *    - Returns boolean eligible status and any missing requirements
 *    - Used for automatic badge award triggers
 *    - Checked after attendance streaks update
 *
 * 2. Progress Tracking:
 *    - Shows percentage completion toward badge requirements
 *    - Displays what's been completed and what's remaining
 *    - Creates visual progress indicators
 *    - Motivates students to reach the next milestone
 *
 * @overview Badge Requirements
 * Badges can have various requirement types:
 * - Attendance streaks (e.g., 7 consecutive classes)
 * - Total attendance count (e.g., 30 total classes)
 * - Performance metrics (e.g., test scores above 90%)
 * - Participation (e.g., completed 10 activities)
 * - Time-based (e.g., enrolled for 3 months)
 * - Combination of multiple criteria
 *
 * @overview Integration with Attendance System
 * Badge progress is tightly coupled with attendance tracking:
 * - Attendance hooks invalidate streak queries
 * - Streak updates trigger eligibility checks
 * - Eligible badges are automatically awarded
 * - Badge awards invalidate progress queries
 * - Creates a reactive feedback loop
 *
 * @overview Automatic Award Flow
 * When a student becomes eligible for a badge:
 * 1. Attendance is marked (useMarkAttendance)
 * 2. Streak query is invalidated and refetches
 * 3. New streak value triggers eligibility check
 * 4. useBadgeEligibility detects the student is now eligible
 * 5. Backend automatically awards the badge (or UI triggers useAwardBadge)
 * 6. Badge queries are invalidated and show new award
 * 7. Student sees notification of achievement
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { badgeService } from '../../services/badge.service';
import { queryKeys } from '../../constants/query-keys';
import type { BadgeEligibility, BadgeProgress } from '../../types/badge.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Query hook to check if a child is eligible for a specific badge
 *
 * @description
 * Determines whether a student meets all the requirements to receive a badge.
 * This hook is critical for triggering automatic badge awards and displaying
 * achievement notifications to students.
 *
 * Eligibility Response:
 * - `eligible`: Boolean indicating if all requirements are met
 * - `missing_requirements`: Array of requirements not yet satisfied
 * - `current_progress`: Current values for each requirement
 * - `badge`: The badge being checked
 *
 * Use Cases:
 * - Automatic badge award triggers
 * - Displaying "You're eligible!" notifications
 * - Admin badge award validation
 * - Progress milestone detection
 *
 * Caching Strategy:
 * - Stale time: 2 minutes - Eligibility can change with attendance
 * - This query should be refetched when attendance streaks update
 * - Consider conditionally enabling based on progress proximity
 *
 * Integration Points:
 * - Called after attendance streak updates
 * - Triggers badge award flows when eligible becomes true
 * - May trigger notification systems
 * - Updates badge progress displays
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.childId - The child ID to check eligibility for
 * @param {string} params.badgeId - The badge ID to check
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<BadgeEligibility, ApiErrorResponse>} React Query result with eligibility status
 *
 * @example Auto-Award on Eligibility
 * ```tsx
 * function BadgeEligibilityChecker({ childId, badgeId }: Props) {
 *   const { data: eligibility } = useBadgeEligibility({ childId, badgeId });
 *   const { mutate: awardBadge } = useAwardBadge();
 *
 *   useEffect(() => {
 *     if (eligibility?.eligible && !eligibility?.already_awarded) {
 *       // Automatically award the badge
 *       awardBadge({
 *         badge_id: badgeId,
 *         child_id: childId,
 *         notes: 'Auto-awarded on eligibility'
 *       });
 *     }
 *   }, [eligibility?.eligible]);
 *
 *   return null; // Background checker
 * }
 * ```
 *
 * @example Eligibility Notification
 * ```tsx
 * function EligibilityAlert({ childId, badgeId }: Props) {
 *   const { data: eligibility } = useBadgeEligibility({ childId, badgeId });
 *
 *   if (!eligibility?.eligible || eligibility?.already_awarded) {
 *     return null;
 *   }
 *
 *   return (
 *     <Alert type="success">
 *       <h4>Congratulations!</h4>
 *       <p>You're now eligible for the {eligibility.badge.name} badge!</p>
 *       <Button>Claim Badge</Button>
 *     </Alert>
 *   );
 * }
 * ```
 *
 * @example Conditional Check (Performance Optimization)
 * ```tsx
 * function StreakBadgeEligibility({ childId, enrollmentId }: Props) {
 *   const { data: streak } = useAttendanceStreak({ enrollmentId });
 *
 *   // Only check eligibility when close to milestone
 *   const { data: eligibility } = useBadgeEligibility({
 *     childId,
 *     badgeId: 'week-warrior-badge',
 *     queryOptions: {
 *       enabled: (streak?.current_streak || 0) >= 6 // Close to 7-day milestone
 *     }
 *   });
 *
 *   return eligibility?.eligible ? <BadgeReadyBanner /> : null;
 * }
 * ```
 */
export function useBadgeEligibility({
  childId,
  badgeId,
  queryOptions,
}: {
  childId: string;
  badgeId: string;
  queryOptions?: Omit<UseQueryOptions<BadgeEligibility, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: [...queryKeys.badges.all, 'eligibility', childId, badgeId],
    queryFn: () => badgeService.checkEligibility(childId, badgeId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    enabled: !!childId && !!badgeId,
    ...queryOptions,
  });
}

/**
 * Query hook to track progress toward earning a specific badge
 *
 * @description
 * Fetches detailed progress information showing how close a student is to
 * earning a badge. This creates visible progress indicators that motivate
 * students to complete the remaining requirements.
 *
 * Progress Response:
 * - `progress_percentage`: Overall completion percentage (0-100)
 * - `requirements`: Array of individual requirement progress
 * - `completed_requirements`: Requirements that are satisfied
 * - `remaining_requirements`: What still needs to be done
 * - `estimated_completion`: Projected date to earn badge
 *
 * Requirement Progress Format:
 * Each requirement includes:
 * - `type`: The requirement type (streak, attendance_count, etc.)
 * - `current_value`: Student's current progress
 * - `required_value`: Target value needed
 * - `percentage`: Completion percentage for this requirement
 * - `is_met`: Boolean if requirement is satisfied
 *
 * Use Cases:
 * - Progress bars and visual indicators
 * - "X more classes to earn badge" messages
 * - Student motivation through visible goals
 * - Gamification dashboards
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.childId - The child ID to track progress for
 * @param {string} params.badgeId - The badge ID to track
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<BadgeProgress, ApiErrorResponse>} React Query result with progress data
 *
 * @example Progress Bar Display
 * ```tsx
 * function BadgeProgressBar({ childId, badgeId, badgeName }: Props) {
 *   const { data: progress, isLoading } = useBadgeProgress({ childId, badgeId });
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!progress) return null;
 *
 *   return (
 *     <Card>
 *       <h4>{badgeName}</h4>
 *       <ProgressBar value={progress.progress_percentage} />
 *       <p>{progress.progress_percentage}% Complete</p>
 *
 *       <div className="requirements">
 *         {progress.requirements.map((req, i) => (
 *           <div key={i}>
 *             <span>{req.type}:</span>
 *             <span>{req.current_value} / {req.required_value}</span>
 *             {req.is_met && <CheckIcon />}
 *           </div>
 *         ))}
 *       </div>
 *     </Card>
 *   );
 * }
 * ```
 *
 * @example Attendance Streak Progress
 * ```tsx
 * function StreakBadgeProgress({ childId }: { childId: string }) {
 *   const { data: progress } = useBadgeProgress({
 *     childId,
 *     badgeId: 'week-warrior-badge'
 *   });
 *
 *   const streakReq = progress?.requirements.find(r => r.type === 'attendance_streak');
 *   const remaining = streakReq
 *     ? streakReq.required_value - streakReq.current_value
 *     : 0;
 *
 *   return (
 *     <div>
 *       <h4>Week Warrior Badge</h4>
 *       <p>
 *         {remaining > 0
 *           ? `${remaining} more consecutive classes to earn!`
 *           : 'All requirements met! Claim your badge!'}
 *       </p>
 *       <ProgressRing percentage={progress?.progress_percentage || 0} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Multi-Badge Progress Dashboard
 * ```tsx
 * function BadgeProgressDashboard({ childId }: { childId: string }) {
 *   const { data: availableBadges } = useBadges();
 *   const progressQueries = availableBadges?.map(badge =>
 *     useBadgeProgress({ childId, badgeId: badge.id })
 *   );
 *
 *   const inProgress = progressQueries
 *     ?.filter(q => q.data && q.data.progress_percentage > 0 && q.data.progress_percentage < 100)
 *     .sort((a, b) => (b.data?.progress_percentage || 0) - (a.data?.progress_percentage || 0));
 *
 *   return (
 *     <div>
 *       <h3>Badges In Progress</h3>
 *       {inProgress?.map((query, i) => (
 *         <BadgeProgressCard key={i} progress={query.data} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBadgeProgress({
  childId,
  badgeId,
  queryOptions,
}: {
  childId: string;
  badgeId: string;
  queryOptions?: Omit<UseQueryOptions<BadgeProgress, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.badges.progress(childId),
    queryFn: () => badgeService.getProgress(childId, badgeId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    enabled: !!childId && !!badgeId,
    ...queryOptions,
  });
}

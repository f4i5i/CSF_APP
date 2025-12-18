/**
 * @file useBadges Hook
 * @description React Query hooks for fetching badges and badge awards.
 * Badges are achievement awards that gamify the learning experience and recognize student accomplishments.
 *
 * @module hooks/badges/useBadges
 *
 * @overview Badge System Architecture
 * The badge system consists of two main entities:
 *
 * 1. Badges (Badge templates):
 *    - Define the achievement criteria
 *    - Include metadata (name, description, icon, category)
 *    - Set the requirements for earning the badge
 *    - Can be active or inactive
 *
 * 2. Badge Awards (Student achievements):
 *    - Link a student to a badge they've earned
 *    - Include award date and optional notes
 *    - May include the person who awarded it (for manual awards)
 *    - Permanent record of achievement
 *
 * @overview Badge Categories
 * Badges are typically categorized by achievement type:
 * - Attendance: Based on attendance streaks and consistency
 * - Performance: Based on academic or skill achievements
 * - Participation: Based on class engagement and activities
 * - Milestone: Based on program completion or time-based goals
 * - Special: Awarded for unique accomplishments or events
 *
 * @overview Badge Award Triggers
 * Badges can be awarded through multiple mechanisms:
 *
 * 1. Automatic (System-triggered):
 *    - Attendance streaks reaching milestones
 *    - Completing specific number of classes
 *    - Performance metrics crossing thresholds
 *    - Backend jobs check eligibility and auto-award
 *
 * 2. Manual (Coach/Admin-triggered):
 *    - Exceptional performance recognition
 *    - Special achievements or behavior
 *    - Event participation
 *    - Use useAwardBadge hook
 *
 * @overview Cache Strategy
 * Badge data is cached longer than attendance data because:
 * - Badge templates rarely change (5 minutes stale time)
 * - Badge awards are permanent records (5 minutes stale time)
 * - Reduces API calls for badge lists and galleries
 * - Invalidated when new badges are awarded
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { badgeService } from '../../services/badge.service';
import { queryKeys } from '../../constants/query-keys';
import type { Badge, BadgeFilters, BadgeAward } from '../../types/badge.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Query hook to fetch all available badge templates
 *
 * @description
 * Retrieves the complete list of badge templates in the system.
 * These are the badge definitions that students can earn, not the awards themselves.
 *
 * Use Cases:
 * - Displaying badge catalog/gallery to students
 * - Showing available badges to coaches for manual awards
 * - Admin badge management interface
 * - Filtering badges by category or status
 *
 * Filter Options:
 * - `category`: Filter by badge category (attendance, performance, etc.)
 * - `is_active`: Show only active or inactive badges
 * - `search`: Search badge names or descriptions
 *
 * Caching:
 * - Stale time: 5 minutes - Badge templates change infrequently
 * - GC time: 10 minutes - Can be kept in memory longer
 *
 * @param {Object} [params] - Hook parameters
 * @param {BadgeFilters} [params.filters] - Optional filters for badge query
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Badge[], ApiErrorResponse>} React Query result with badge templates
 *
 * @example Badge Gallery
 * ```tsx
 * function BadgeGallery() {
 *   const { data: badges, isLoading } = useBadges();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div className="badge-gallery">
 *       {badges?.map(badge => (
 *         <BadgeCard key={badge.id} badge={badge} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Filtered by Category
 * ```tsx
 * function AttendanceBadges() {
 *   const { data: badges } = useBadges({
 *     filters: { category: 'attendance', is_active: true }
 *   });
 *
 *   return (
 *     <div>
 *       <h2>Attendance Achievement Badges</h2>
 *       <BadgeList badges={badges} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Coach Award Interface
 * ```tsx
 * function ManualBadgeAward() {
 *   const { data: activeBadges } = useBadges({
 *     filters: { is_active: true }
 *   });
 *
 *   return (
 *     <Select placeholder="Select a badge to award">
 *       {activeBadges?.map(badge => (
 *         <Option key={badge.id} value={badge.id}>
 *           {badge.name} - {badge.description}
 *         </Option>
 *       ))}
 *     </Select>
 *   );
 * }
 * ```
 */
export function useBadges({
  filters,
  queryOptions,
}: {
  filters?: BadgeFilters;
  queryOptions?: Omit<UseQueryOptions<Badge[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
} = {}) {
  return useQuery({
    queryKey: queryKeys.badges.list(filters),
    queryFn: () => badgeService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes (badges don't change often)
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });
}

/**
 * Query hook to fetch all badges earned by a specific child
 *
 * @description
 * Retrieves all badge awards for a child across all their enrollments.
 * Returns BadgeAward objects which include both the badge details and award metadata.
 *
 * Award Information Includes:
 * - The badge that was earned (badge object with name, icon, etc.)
 * - Date the badge was awarded
 * - Person who awarded it (for manual awards)
 * - Optional notes about the achievement
 * - Enrollment context (which class/program)
 *
 * Use Cases:
 * - Student profile badge showcase
 * - Parent dashboard showing child's achievements
 * - Student achievement history
 * - Generating achievement certificates
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.childId - The child ID to fetch badge awards for
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<BadgeAward[], ApiErrorResponse>} React Query result with badge awards
 *
 * @example Student Profile Badge Display
 * ```tsx
 * function StudentBadges({ childId }: { childId: string }) {
 *   const { data: badgeAwards, isLoading } = useChildBadges({ childId });
 *
 *   if (isLoading) return <Skeleton count={3} />;
 *
 *   return (
 *     <div className="badge-showcase">
 *       <h3>Achievements ({badgeAwards?.length || 0})</h3>
 *       <div className="badge-grid">
 *         {badgeAwards?.map(award => (
 *           <BadgeDisplay
 *             key={award.id}
 *             badge={award.badge}
 *             awardDate={award.awarded_date}
 *           />
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Parent Dashboard
 * ```tsx
 * function ParentAchievements({ childId }: { childId: string }) {
 *   const { data: badges } = useChildBadges({ childId });
 *
 *   const recentBadges = badges
 *     ?.sort((a, b) => new Date(b.awarded_date).getTime() - new Date(a.awarded_date).getTime())
 *     .slice(0, 5);
 *
 *   return (
 *     <Card>
 *       <h3>Recent Achievements</h3>
 *       {recentBadges?.map(award => (
 *         <div key={award.id}>
 *           <span>{award.badge.name}</span>
 *           <small>{new Date(award.awarded_date).toLocaleDateString()}</small>
 *         </div>
 *       ))}
 *     </Card>
 *   );
 * }
 * ```
 */
export function useChildBadges({
  childId,
  queryOptions,
}: {
  childId: string;
  queryOptions?: Omit<UseQueryOptions<BadgeAward[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.badges.byEnrollment(childId),
    queryFn: () => badgeService.getByChild(childId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!childId,
    ...queryOptions,
  });
}

/**
 * Query hook to fetch badges earned for a specific enrollment
 *
 * @description
 * Retrieves badge awards for a single enrollment (student in a specific class/program).
 * This is more granular than useChildBadges which returns badges across all enrollments.
 *
 * Use Cases:
 * - Class-specific achievement display
 * - Enrollment report generation
 * - Progress tracking within a single program
 * - Coach view of student achievements in their class
 *
 * Enrollment Scope:
 * Only badges earned in the context of this specific enrollment are returned.
 * This allows filtering achievements by class or program.
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.enrollmentId - The enrollment ID to fetch badges for
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<BadgeAward[], ApiErrorResponse>} React Query result with enrollment badges
 *
 * @example Class-Specific Badges
 * ```tsx
 * function EnrollmentBadges({ enrollmentId }: { enrollmentId: string }) {
 *   const { data: badges } = useEnrollmentBadges({ enrollmentId });
 *
 *   return (
 *     <section>
 *       <h4>Badges Earned in This Class</h4>
 *       <BadgeList badges={badges} />
 *     </section>
 *   );
 * }
 * ```
 *
 * @example Coach Class Report
 * ```tsx
 * function ClassBadgeReport({ enrollmentIds }: { enrollmentIds: string[] }) {
 *   const badgeQueries = enrollmentIds.map(id =>
 *     useEnrollmentBadges({ enrollmentId: id })
 *   );
 *
 *   const totalBadges = badgeQueries.reduce(
 *     (sum, q) => sum + (q.data?.length || 0),
 *     0
 *   );
 *
 *   return (
 *     <div>
 *       <h3>Class Achievement Summary</h3>
 *       <p>Total badges earned: {totalBadges}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEnrollmentBadges({
  enrollmentId,
  queryOptions,
}: {
  enrollmentId: string;
  queryOptions?: Omit<UseQueryOptions<BadgeAward[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.badges.byEnrollment(enrollmentId),
    queryFn: () => badgeService.getByEnrollment(enrollmentId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!enrollmentId,
    ...queryOptions,
  });
}

/**
 * Query hook to fetch badge leaderboard rankings
 *
 * @description
 * Retrieves a ranked list of students based on their badge achievement counts.
 * Creates friendly competition and motivation through gamification.
 *
 * Leaderboard Features:
 * - Ranks students by total badge count
 * - Can be filtered by time period, class, or badge category
 * - Updates more frequently than other badge queries (2 min stale time)
 * - Encourages engagement through visible progress
 *
 * Use Cases:
 * - Public leaderboard display in student areas
 * - Class competition dashboards
 * - Monthly achievement rankings
 * - Program-wide gamification
 *
 * @param {Object} [params] - Hook parameters
 * @param {Object} [params.params] - Leaderboard filter parameters
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<any[], ApiErrorResponse>} React Query result with leaderboard data
 *
 * @example Global Leaderboard
 * ```tsx
 * function BadgeLeaderboard() {
 *   const { data: leaderboard, isLoading } = useBadgeLeaderboard();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div className="leaderboard">
 *       <h2>Top Achievers</h2>
 *       {leaderboard?.map((entry, index) => (
 *         <div key={entry.child_id} className="leaderboard-entry">
 *           <span className="rank">#{index + 1}</span>
 *           <span className="name">{entry.child_name}</span>
 *           <span className="count">{entry.badge_count} badges</span>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Filtered Leaderboard
 * ```tsx
 * function MonthlyLeaderboard() {
 *   const startOfMonth = new Date();
 *   startOfMonth.setDate(1);
 *
 *   const { data: leaderboard } = useBadgeLeaderboard({
 *     params: {
 *       start_date: startOfMonth.toISOString().split('T')[0],
 *       limit: 10
 *     }
 *   });
 *
 *   return <LeaderboardDisplay data={leaderboard} title="This Month's Top 10" />;
 * }
 * ```
 */
export function useBadgeLeaderboard({
  params,
  queryOptions,
}: {
  params?: any;
  queryOptions?: Omit<UseQueryOptions<any[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
} = {}) {
  return useQuery({
    queryKey: [...queryKeys.badges.all, 'leaderboard', params],
    queryFn: () => badgeService.getLeaderboard(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    ...queryOptions,
  });
}

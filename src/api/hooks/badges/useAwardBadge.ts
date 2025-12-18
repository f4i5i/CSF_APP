/**
 * @file useAwardBadge Hook
 * @description React Query mutation hooks for awarding and revoking badges.
 * These hooks complete the badge lifecycle by creating permanent achievement records.
 *
 * @module hooks/badges/useAwardBadge
 *
 * @overview Badge Award System
 * Badge awards are the culmination of student achievement:
 *
 * 1. Award Creation:
 *    - Links a badge to a student permanently
 *    - Records the date, awarder, and context
 *    - Triggers celebration notifications
 *    - Updates student achievement history
 *
 * 2. Award Types:
 *    - Automatic: System-triggered based on eligibility
 *    - Manual: Coach/admin recognition for special achievements
 *    - Retroactive: Historical awards for past achievements
 *
 * 3. Award Metadata:
 *    - Badge ID and student/enrollment ID
 *    - Award date (usually current date)
 *    - Awarder information (for manual awards)
 *    - Optional notes explaining the achievement
 *
 * @overview Award Triggers
 * Badges can be awarded through multiple pathways:
 *
 * Automatic Awards:
 * 1. Student marks attendance
 * 2. Attendance updates streak count
 * 3. Streak reaches milestone (e.g., 7 days)
 * 4. Backend/frontend checks badge eligibility
 * 5. System automatically awards badge
 * 6. Student receives notification
 *
 * Manual Awards:
 * 1. Coach observes exceptional achievement
 * 2. Coach selects badge and student in UI
 * 3. useAwardBadge mutation is called
 * 4. Badge is awarded with coach's notes
 * 5. Student and parents are notified
 *
 * @overview Cache Invalidation Strategy
 * When a badge is awarded, comprehensive invalidation ensures all views update:
 *
 * Invalidated Queries:
 * - `badges.lists()` - All badge list queries
 * - `badges.byEnrollment(enrollmentId)` - Student's badge awards
 * - `badges.progress(enrollmentId)` - Badge progress for that enrollment
 *
 * This ensures:
 * - Student profile shows new badge immediately
 * - Badge galleries reflect the award
 * - Progress indicators update to 100%
 * - Eligibility checks reflect the award
 * - Leaderboards recalculate rankings
 *
 * @overview Revocation
 * While rare, badges can be revoked for:
 * - Administrative errors
 * - Policy violations
 * - Duplicate awards
 *
 * Revocation maintains an audit trail and can include a reason.
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { badgeService } from '../../services/badge.service';
import { queryKeys } from '../../constants/query-keys';
import type { BadgeAward, AwardBadgeRequest } from '../../types/badge.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Mutation hook to award a badge to a student
 *
 * @description
 * Creates a permanent badge award record for a student. This is the final step
 * in the achievement process and represents a significant milestone that should
 * be celebrated.
 *
 * Award Process:
 * 1. Validates student eligibility (optional, based on use case)
 * 2. Creates the badge award record
 * 3. Triggers success notification with celebration
 * 4. Invalidates all related queries for immediate UI updates
 * 5. May trigger additional notifications (email, push, etc.)
 *
 * Award Context:
 * Awards can be linked to either:
 * - `enrollment_id`: Badge earned in context of specific class
 * - `child_id`: Badge earned globally (not class-specific)
 *
 * Cache Invalidation:
 * On success, invalidates:
 * - All badge list queries
 * - Student's badge awards query
 * - Badge progress queries for the enrollment
 *
 * This ensures the badge appears immediately in:
 * - Student profile badge showcase
 * - Parent dashboard
 * - Badge leaderboards
 * - Progress indicators
 *
 * @param {Object} [options] - Additional mutation options
 *
 * @returns {UseMutationResult} React Query mutation result with mutate function
 *
 * @example Manual Badge Award by Coach
 * ```tsx
 * function ManualBadgeAward({ studentId, enrollmentId }: Props) {
 *   const [selectedBadge, setSelectedBadge] = useState('');
 *   const [notes, setNotes] = useState('');
 *   const { data: badges } = useBadges({ filters: { is_active: true } });
 *   const { mutate: awardBadge, isPending } = useAwardBadge();
 *
 *   const handleAward = () => {
 *     awardBadge({
 *       badge_id: selectedBadge,
 *       child_id: studentId,
 *       enrollment_id: enrollmentId,
 *       notes: notes
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleAward}>
 *       <Select value={selectedBadge} onChange={setSelectedBadge}>
 *         {badges?.map(badge => (
 *           <option key={badge.id} value={badge.id}>{badge.name}</option>
 *         ))}
 *       </Select>
 *       <textarea
 *         value={notes}
 *         onChange={(e) => setNotes(e.target.value)}
 *         placeholder="Why is this student receiving this badge?"
 *       />
 *       <button type="submit" disabled={isPending}>
 *         Award Badge
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @example Automatic Award on Eligibility
 * ```tsx
 * function AutoBadgeAward({ childId, enrollmentId, badgeId }: Props) {
 *   const { data: eligibility } = useBadgeEligibility({ childId, badgeId });
 *   const { data: existingBadges } = useEnrollmentBadges({ enrollmentId });
 *   const { mutate: awardBadge } = useAwardBadge();
 *
 *   useEffect(() => {
 *     // Check if eligible and not already awarded
 *     const alreadyHasBadge = existingBadges?.some(
 *       award => award.badge.id === badgeId
 *     );
 *
 *     if (eligibility?.eligible && !alreadyHasBadge) {
 *       awardBadge({
 *         badge_id: badgeId,
 *         child_id: childId,
 *         enrollment_id: enrollmentId,
 *         notes: 'Automatically awarded for meeting requirements'
 *       });
 *     }
 *   }, [eligibility?.eligible, existingBadges]);
 *
 *   return null; // Silent background operation
 * }
 * ```
 *
 * @example Award with Celebration
 * ```tsx
 * function BadgeAwardWithCelebration({ studentId, badgeId }: Props) {
 *   const { mutate: awardBadge } = useAwardBadge({
 *     onSuccess: (award) => {
 *       // Show celebration modal
 *       showCelebrationModal({
 *         title: 'Badge Earned!',
 *         badge: award.badge,
 *         message: `Congratulations on earning the ${award.badge.name} badge!`,
 *         confetti: true
 *       });
 *
 *       // Log analytics
 *       trackEvent('badge_awarded', {
 *         badge_id: award.badge.id,
 *         student_id: studentId
 *       });
 *     }
 *   });
 *
 *   // Award logic...
 * }
 * ```
 *
 * @example Batch Badge Awards
 * ```tsx
 * function BatchBadgeAward({ students, badgeId }: Props) {
 *   const { mutate: awardBadge } = useAwardBadge();
 *   const [progress, setProgress] = useState(0);
 *
 *   const awardToAll = async () => {
 *     for (let i = 0; i < students.length; i++) {
 *       await new Promise((resolve) => {
 *         awardBadge(
 *           {
 *             badge_id: badgeId,
 *             child_id: students[i].id,
 *             notes: 'Batch award for class achievement'
 *           },
 *           { onSettled: () => resolve(undefined) }
 *         );
 *       });
 *       setProgress(((i + 1) / students.length) * 100);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={awardToAll}>Award to All Students</button>
 *       <ProgressBar value={progress} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useAwardBadge(
  options?: Omit<
    UseMutationOptions<BadgeAward, ApiErrorResponse, AwardBadgeRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (awardData: AwardBadgeRequest) => badgeService.awardBadge(awardData),

    onSuccess: (_award, variables) => {
      // Invalidate badge queries
      queryClient.invalidateQueries({ queryKey: queryKeys.badges.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.badges.byEnrollment(variables.enrollment_id || variables.child_id),
      });

      // Invalidate badge progress if enrollment provided
      if (variables.enrollment_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.badges.progress(variables.enrollment_id),
        });
      }

      toast.success('Badge awarded successfully! 🏆');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to award badge');
    },

    ...options,
  });
}

/**
 * Mutation hook to revoke a previously awarded badge
 *
 * @description
 * Removes a badge award from a student's record. This is an administrative
 * action that should be used sparingly and typically only for:
 * - Correcting mistaken awards
 * - Addressing policy violations
 * - Removing duplicate awards
 *
 * Revocation Considerations:
 * - Creates an audit trail with reason
 * - May disappoint students - use with care
 * - Should be accompanied by explanation to student/parent
 * - Cannot be undone (would require re-awarding)
 *
 * The revocation invalidates all badge queries to immediately remove the
 * badge from all displays and recalculate leaderboards.
 *
 * @param {Object} [options] - Additional mutation options
 *
 * @returns {UseMutationResult} React Query mutation result with mutate function
 *
 * @example Admin Badge Revocation
 * ```tsx
 * function RevokeBadgeDialog({ awardId, studentName }: Props) {
 *   const [reason, setReason] = useState('');
 *   const { mutate: revokeBadge, isPending } = useRevokeBadge();
 *
 *   const handleRevoke = () => {
 *     if (!reason.trim()) {
 *       alert('Please provide a reason for revocation');
 *       return;
 *     }
 *
 *     revokeBadge(
 *       { awardId, reason },
 *       {
 *         onSuccess: () => {
 *           closeDialog();
 *           notifyStudent(studentName, reason); // Notify about revocation
 *         }
 *       }
 *     );
 *   };
 *
 *   return (
 *     <Dialog>
 *       <h3>Revoke Badge Award</h3>
 *       <p className="warning">
 *         This will remove the badge from {studentName}'s profile.
 *       </p>
 *       <textarea
 *         value={reason}
 *         onChange={(e) => setReason(e.target.value)}
 *         placeholder="Reason for revocation (required)"
 *         required
 *       />
 *       <button onClick={handleRevoke} disabled={isPending}>
 *         Confirm Revocation
 *       </button>
 *     </Dialog>
 *   );
 * }
 * ```
 *
 * @example Revoke Duplicate Award
 * ```tsx
 * function RemoveDuplicateBadges({ enrollmentId }: { enrollmentId: string }) {
 *   const { data: badges } = useEnrollmentBadges({ enrollmentId });
 *   const { mutate: revokeBadge } = useRevokeBadge();
 *
 *   const duplicates = findDuplicateAwards(badges);
 *
 *   const removeDuplicates = () => {
 *     duplicates.forEach(duplicate => {
 *       revokeBadge({
 *         awardId: duplicate.id,
 *         reason: 'Duplicate award - keeping earliest award'
 *       });
 *     });
 *   };
 *
 *   if (duplicates.length === 0) return null;
 *
 *   return (
 *     <Alert type="warning">
 *       {duplicates.length} duplicate badge(s) found.
 *       <button onClick={removeDuplicates}>Remove Duplicates</button>
 *     </Alert>
 *   );
 * }
 * ```
 */
export function useRevokeBadge(
  options?: Omit<
    UseMutationOptions<any, ApiErrorResponse, { awardId: string; reason?: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ awardId, reason }: { awardId: string; reason?: string }) =>
      badgeService.revokeBadge(awardId, { reason }),

    onSuccess: () => {
      // Invalidate all badge queries
      queryClient.invalidateQueries({ queryKey: queryKeys.badges.all });

      toast.success('Badge revoked successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to revoke badge');
    },

    ...options,
  });
}

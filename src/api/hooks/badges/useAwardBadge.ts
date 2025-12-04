/**
 * useAwardBadge Hook
 * React Query mutation hook to award badges
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { badgeService } from '../../services/badge.service';
import { queryKeys } from '../../constants/query-keys';
import type { BadgeAward, AwardBadgeRequest } from '../../types/badge.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to award badge to child
 *
 * @example
 * ```tsx
 * const { mutate: awardBadge } = useAwardBadge();
 *
 * awardBadge({
 *   badge_id: 'badge-123',
 *   child_id: 'child-456',
 *   notes: 'Great performance!'
 * });
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
 * Hook to revoke badge from child
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

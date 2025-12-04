/**
 * useBadgeProgress Hook
 * React Query hooks for badge eligibility and progress tracking
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { badgeService } from '../../services/badge.service';
import { queryKeys } from '../../constants/query-keys';
import type { BadgeEligibility, BadgeProgress } from '../../types/badge.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to check badge eligibility for a child
 *
 * @example
 * ```tsx
 * const { data: eligibility } = useBadgeEligibility({
 *   childId: 'child-123',
 *   badgeId: 'badge-456'
 * });
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
 * Hook to get badge progress for a child
 *
 * @example
 * ```tsx
 * const { data: progress } = useBadgeProgress({
 *   childId: 'child-123',
 *   badgeId: 'badge-456'
 * });
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

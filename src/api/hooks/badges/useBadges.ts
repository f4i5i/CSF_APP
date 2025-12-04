/**
 * useBadges Hook
 * React Query hooks to fetch badges
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { badgeService } from '../../services/badge.service';
import { queryKeys } from '../../constants/query-keys';
import type { Badge, BadgeFilters, BadgeAward } from '../../types/badge.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch all badges
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
 * Hook to fetch badges earned by a child
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
 * Hook to fetch badges by enrollment
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
 * Hook to fetch badge leaderboard
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

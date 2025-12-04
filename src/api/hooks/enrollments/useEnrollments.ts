/**
 * useEnrollments Hook
 * React Query hook to fetch enrollments
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { enrollmentService } from '../../services/enrollment.service';
import { queryKeys } from '../../constants/query-keys';
import type { Enrollment, EnrollmentFilters } from '../../types/enrollment.types';
import { EnrollmentStatus } from '../../types/enrollment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseEnrollmentsOptions {
  filters?: EnrollmentFilters;
  queryOptions?: Omit<
    UseQueryOptions<Enrollment[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch user's enrollments
 *
 * @example
 * ```tsx
 * const { data: enrollments, isLoading } = useEnrollments({
 *   filters: { status: 'ACTIVE' }
 * });
 * ```
 */
export function useEnrollments(options: UseEnrollmentsOptions = {}) {
  const { filters, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.enrollments.list(filters),
    queryFn: () => enrollmentService.getMy(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });
}

/**
 * Hook to fetch active enrollments
 */
export function useActiveEnrollments(
  queryOptions?: Omit<UseQueryOptions<Enrollment[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useEnrollments({
    filters: { status: EnrollmentStatus.ACTIVE },
    queryOptions,
  });
}

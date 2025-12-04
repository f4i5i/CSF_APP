/**
 * useClass Hook
 * React Query hook to fetch single class details
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { classService } from '../../services/class.service';
import { queryKeys } from '../../constants/query-keys';
import type { Class, ClassId } from '../../types/class.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseClassOptions {
  classId: ClassId;
  queryOptions?: Omit<
    UseQueryOptions<Class, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch single class details
 *
 * Includes full class information:
 * - Schedule details
 * - Enrollment capacity and current count
 * - Pricing information
 * - Location details
 * - Associated program and area
 *
 * @example
 * ```tsx
 * const { data: classDetail, isLoading } = useClass({
 *   classId: '123'
 * });
 * ```
 */
export function useClass({ classId, queryOptions }: UseClassOptions) {
  return useQuery({
    queryKey: queryKeys.classes.detail(classId),
    queryFn: () => classService.getById(classId),
    staleTime: 2 * 60 * 1000, // 2 minutes (capacity can change)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!classId, // Only fetch if classId is provided
    ...queryOptions,
  });
}

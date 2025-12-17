/**
 * useClasses Hook
 * React Query hook to fetch classes with filters
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { classService } from '../../services/class.service';
import { queryKeys } from '../../constants/query-keys';
import type { Class, ClassFilters } from '../../types/class.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseClassesOptions {
  filters?: ClassFilters;
  queryOptions?: Omit<
    UseQueryOptions<Class[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch classes with optional filters
 *
 * Supports filtering by:
 * - Program ID
 * - Area ID
 * - Age group
 * - Day of week
 * - Available capacity
 * - Active status
 *
 * @example
 * ```tsx
 * const { data: classes, isLoading } = useClasses({
 *   filters: {
 *     program_id: '123',
 *     is_active: true,
 *     has_capacity: true
 *   }
 * });
 * ```
 */
export function useClasses(options: UseClassesOptions = {}) {
  const { filters, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.classes.list(filters),
    queryFn: () => classService.getAll(filters),
    staleTime: 0, // Always fetch fresh data (capacity changes frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
}

/**
 * Hook to fetch active classes with available capacity
 *
 * @example
 * ```tsx
 * const { data: availableClasses } = useAvailableClasses();
 * ```
 */
export function useAvailableClasses(
  queryOptions?: Omit<UseQueryOptions<Class[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useClasses({
    filters: {
      is_active: true,
      has_capacity: true,
    },
    queryOptions,
  });
}

/**
 * Hook to fetch classes by program
 *
 * @example
 * ```tsx
 * const { data: programClasses } = useClassesByProgram('program-123');
 * ```
 */
export function useClassesByProgram(
  programId: string,
  queryOptions?: Omit<UseQueryOptions<Class[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useClasses({
    filters: {
      program_id: programId,
      is_active: true,
    },
    queryOptions,
  });
}

/**
 * Hook to fetch classes by area
 *
 * @example
 * ```tsx
 * const { data: areaClasses } = useClassesByArea('area-456');
 * ```
 */
export function useClassesByArea(
  areaId: string,
  queryOptions?: Omit<UseQueryOptions<Class[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useClasses({
    filters: {
      area_id: areaId,
      is_active: true,
    },
    queryOptions,
  });
}

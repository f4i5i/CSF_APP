/**
 * useAreas Hook
 * React Query hook to fetch areas
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { areaService } from '../../services/class.service';
import { queryKeys } from '../../constants/query-keys';
import type { Area, AreaId } from '../../types/class.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options for areas list
 */
interface UseAreasOptions {
  queryOptions?: Omit<
    UseQueryOptions<Area[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch all areas
 *
 * @example
 * ```tsx
 * const { data: areas, isLoading } = useAreas();
 * ```
 */
export function useAreas(options: UseAreasOptions = {}) {
  const { queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.areas.lists(),
    queryFn: () => areaService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes (areas don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...queryOptions,
  });
}

/**
 * Hook options for single area
 */
interface UseAreaOptions {
  areaId: AreaId;
  queryOptions?: Omit<
    UseQueryOptions<Area, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch single area details
 *
 * @example
 * ```tsx
 * const { data: area } = useArea({ areaId: '123' });
 * ```
 */
export function useArea({ areaId, queryOptions }: UseAreaOptions) {
  return useQuery({
    queryKey: queryKeys.areas.detail(areaId),
    queryFn: () => areaService.getById(areaId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!areaId,
    ...queryOptions,
  });
}

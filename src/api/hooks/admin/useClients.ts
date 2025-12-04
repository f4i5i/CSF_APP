/**
 * useClients Hook
 * React Query hooks for admin client management
 */

import { useQuery, useInfiniteQuery, type UseQueryOptions, type UseInfiniteQueryOptions } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { queryKeys } from '../../constants/query-keys';
import type { ClientSummary, ClientDetail, ClientFilters, ClassRoster } from '../../types/admin.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch clients with filters
 *
 * @example
 * ```tsx
 * const { data: clients } = useClients({
 *   filters: { role: 'parent', is_active: true }
 * });
 * ```
 */
export function useClients({
  filters,
  queryOptions,
}: {
  filters?: ClientFilters;
  queryOptions?: Omit<UseQueryOptions<ClientSummary[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
} = {}) {
  return useQuery({
    queryKey: queryKeys.admin.clients(filters),
    queryFn: () => adminService.getClients(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Hook to fetch clients with infinite scroll/pagination
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage
 * } = useInfiniteClients({
 *   filters: { is_active: true }
 * });
 * ```
 */
export function useInfiniteClients({
  filters,
  queryOptions,
}: {
  filters?: Omit<ClientFilters, 'skip' | 'limit'>;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<ClientSummary[], ApiErrorResponse>,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >;
} = {}) {
  return useInfiniteQuery({
    ...queryOptions,
    queryKey: queryKeys.admin.clients(filters),
    queryFn: ({ pageParam = 0 }) =>
      adminService.getClients({ ...filters, skip: pageParam as number, limit: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * 20;
      return lastPage.length === 20 ? nextOffset : undefined;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch single client detail
 *
 * @example
 * ```tsx
 * const { data: client } = useClientDetail({ userId: 'user-123' });
 * ```
 */
export function useClientDetail({
  userId,
  queryOptions,
}: {
  userId: string;
  queryOptions?: Omit<UseQueryOptions<ClientDetail, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.admin.client(userId),
    queryFn: () => adminService.getClientDetail(userId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!userId,
    ...queryOptions,
  });
}

/**
 * Hook to fetch class roster
 *
 * @example
 * ```tsx
 * const { data: roster } = useClassRoster({ classId: 'class-123' });
 * ```
 */
export function useClassRoster({
  classId,
  queryOptions,
}: {
  classId: string;
  queryOptions?: Omit<UseQueryOptions<ClassRoster, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.admin.roster(classId),
    queryFn: () => adminService.getClassRoster(classId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!classId,
    ...queryOptions,
  });
}

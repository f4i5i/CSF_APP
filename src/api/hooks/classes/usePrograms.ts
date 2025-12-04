/**
 * usePrograms Hook
 * React Query hook to fetch programs
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { programService } from '../../services/class.service';
import { queryKeys } from '../../constants/query-keys';
import type { Program, ProgramId } from '../../types/class.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options for programs list
 */
interface UseProgramsOptions {
  queryOptions?: Omit<
    UseQueryOptions<Program[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch all programs
 *
 * @example
 * ```tsx
 * const { data: programs, isLoading } = usePrograms();
 * ```
 */
export function usePrograms(options: UseProgramsOptions = {}) {
  const { queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.programs.lists(),
    queryFn: () => programService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes (programs don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...queryOptions,
  });
}

/**
 * Hook options for single program
 */
interface UseProgramOptions {
  programId: ProgramId;
  queryOptions?: Omit<
    UseQueryOptions<Program, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch single program details
 *
 * @example
 * ```tsx
 * const { data: program } = useProgram({ programId: '123' });
 * ```
 */
export function useProgram({ programId, queryOptions }: UseProgramOptions) {
  return useQuery({
    queryKey: queryKeys.programs.detail(programId),
    queryFn: () => programService.getById(programId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!programId,
    ...queryOptions,
  });
}

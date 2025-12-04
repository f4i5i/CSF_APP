/**
 * useRefunds Hook
 * React Query hooks for refund management
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import { queryKeys } from '../../constants/query-keys';
import type { RefundRequest, RefundFilters } from '../../types/admin.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch refund requests
 *
 * @example
 * ```tsx
 * const { data: refunds } = useRefunds({
 *   filters: { status: 'pending' }
 * });
 * ```
 */
export function useRefunds({
  filters,
  queryOptions,
}: {
  filters?: RefundFilters;
  queryOptions?: Omit<UseQueryOptions<RefundRequest[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
} = {}) {
  return useQuery({
    queryKey: queryKeys.admin.refunds(filters),
    queryFn: () => adminService.getRefunds(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Hook to fetch pending refunds
 */
export function usePendingRefunds(
  queryOptions?: Omit<UseQueryOptions<RefundRequest[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useRefunds({
    filters: { status: 'pending' },
    queryOptions,
  });
}

/**
 * Hook to approve refund
 *
 * @example
 * ```tsx
 * const { mutate: approveRefund } = useApproveRefund();
 * approveRefund('refund-123');
 * ```
 */
export function useApproveRefund(
  options?: Omit<UseMutationOptions<RefundRequest, ApiErrorResponse, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refundId: string) => adminService.approveRefund(refundId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.refunds() });
      toast.success('Refund approved successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to approve refund');
    },

    ...options,
  });
}

/**
 * Hook to reject refund
 *
 * @example
 * ```tsx
 * const { mutate: rejectRefund } = useRejectRefund();
 * rejectRefund({ refundId: 'refund-123', reason: 'Policy violation' });
 * ```
 */
export function useRejectRefund(
  options?: Omit<
    UseMutationOptions<RefundRequest, ApiErrorResponse, { refundId: string; reason: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ refundId, reason }: { refundId: string; reason: string }) =>
      adminService.rejectRefund(refundId, reason),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.refunds() });
      toast.success('Refund rejected');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to reject refund');
    },

    ...options,
  });
}

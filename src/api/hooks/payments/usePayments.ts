/**
 * usePayments Hook
 * React Query hook to fetch payments
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { paymentService } from '../../services/payment.service';
import { queryKeys } from '../../constants/query-keys';
import type { Payment } from '../../types/payment.types';
import { PaymentStatus } from '../../types/payment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UsePaymentsOptions {
  status?: PaymentStatus;
  queryOptions?: Omit<
    UseQueryOptions<Payment[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch user's payments
 *
 * @example
 * ```tsx
 * const { data: payments, isLoading } = usePayments();
 * ```
 */
export function usePayments(options: UsePaymentsOptions = {}) {
  const { status, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.payments.list({ status }),
    queryFn: () => paymentService.getMy(),
    staleTime: 1 * 60 * 1000, // 1 minute (status can change)
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
}

/**
 * Hook to fetch pending payments
 *
 * @example
 * ```tsx
 * const { data: pendingPayments } = usePendingPayments();
 * ```
 */
export function usePendingPayments(
  queryOptions?: Omit<UseQueryOptions<Payment[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return usePayments({
    status: PaymentStatus.PENDING,
    queryOptions,
  });
}

/**
 * Hook to fetch completed payments
 *
 * @example
 * ```tsx
 * const { data: completedPayments } = useCompletedPayments();
 * ```
 */
export function useCompletedPayments(
  queryOptions?: Omit<UseQueryOptions<Payment[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return usePayments({
    status: PaymentStatus.COMPLETED,
    queryOptions,
  });
}

/**
 * usePayment Hook
 * React Query hook to fetch single payment details
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { paymentService } from '../../services/payment.service';
import { queryKeys } from '../../constants/query-keys';
import type { Payment, PaymentId } from '../../types/payment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UsePaymentOptions {
  paymentId: PaymentId;
  queryOptions?: Omit<
    UseQueryOptions<Payment, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * Hook to fetch single payment details
 *
 * Includes:
 * - Payment amount and status
 * - Payment method information
 * - Stripe payment intent details
 * - Associated order
 * - Timestamps
 *
 * @example
 * ```tsx
 * const { data: payment, isLoading } = usePayment({
 *   paymentId: '123'
 * });
 * ```
 */
export function usePayment({ paymentId, queryOptions }: UsePaymentOptions) {
  return useQuery({
    queryKey: queryKeys.payments.detail(paymentId),
    queryFn: () => paymentService.getById(paymentId),
    staleTime: 1 * 60 * 1000, // 1 minute (status can change)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!paymentId,
    ...queryOptions,
  });
}

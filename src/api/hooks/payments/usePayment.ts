/**
 * @file usePayment Hook
 * @description React Query hook for fetching individual payment details.
 *
 * This hook provides access to complete payment information including transaction
 * details, payment method info, Stripe metadata, and associated order data. It's
 * used for payment history, receipt viewing, and financial tracking.
 *
 * @module hooks/payments/usePayment
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { paymentService } from '../../services/payment.service';
import { queryKeys } from '../../constants/query-keys';
import type { Payment, PaymentId } from '../../types/payment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Options for the usePayment hook
 *
 * @interface UsePaymentOptions
 * @property {PaymentId} paymentId - The unique identifier of the payment to fetch
 * @property {Object} [queryOptions] - Additional React Query options to customize behavior
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
 * @description
 * Retrieves comprehensive payment information by ID. This hook is used for:
 * - Payment history detail pages
 * - Receipt/invoice generation
 * - Transaction verification
 * - Refund processing
 * - Financial reporting
 *
 * **Payment Data Includes:**
 * - Amount charged (with breakdown if installments)
 * - Payment status (pending, completed, failed, refunded)
 * - Payment method details (card brand, last 4 digits, expiry)
 * - Stripe transaction IDs (PaymentIntent, Charge ID)
 * - Associated order information
 * - Transaction timestamps
 * - Metadata (installment info, fees, etc.)
 *
 * **Caching Strategy:**
 * - Stale time: 1 minute (payment status can change)
 * - Cache time: 5 minutes
 * - Auto-disabled when paymentId is not provided
 *
 * **Cache Invalidation:**
 * This query is invalidated by:
 * - useConfirmOrder (when new payment is created)
 * - Payment webhook handlers (on Stripe events)
 * - Refund operations (when payment is refunded)
 *
 * @param {UsePaymentOptions} options - Hook configuration options
 * @param {PaymentId} options.paymentId - The payment ID to fetch
 * @param {Object} [options.queryOptions] - Additional React Query configuration
 *
 * @returns {UseQueryResult<Payment, ApiErrorResponse>} React Query result object containing:
 * - data: The payment object with all transaction details
 * - isLoading: Loading state indicator
 * - isError: Error state indicator
 * - error: Error details if request failed
 * - refetch: Function to manually refetch the payment
 *
 * @example
 * // Basic usage - fetch payment details for receipt
 * ```tsx
 * const { data: payment, isLoading } = usePayment({
 *   paymentId: 'pay_123'
 * });
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <PaymentReceipt
 *     amount={payment.amount}
 *     date={payment.created_at}
 *     method={payment.payment_method}
 *     orderId={payment.order_id}
 *   />
 * );
 * ```
 *
 * @example
 * // With invoice download
 * ```tsx
 * const { data: payment } = usePayment({ paymentId });
 * const { mutate: downloadInvoice } = useDownloadInvoice();
 *
 * return (
 *   <div>
 *     <PaymentDetails payment={payment} />
 *     <Button onClick={() => downloadInvoice(paymentId)}>
 *       Download Invoice
 *     </Button>
 *   </div>
 * );
 * ```
 *
 * @example
 * // Conditional fetching from URL parameter
 * ```tsx
 * const { paymentId } = useParams();
 * const { data: payment, error } = usePayment({
 *   paymentId: paymentId || '',
 *   queryOptions: {
 *     enabled: !!paymentId,
 *     onError: (err) => {
 *       toast.error('Payment not found');
 *       navigate('/payments');
 *     }
 *   }
 * });
 * ```
 *
 * @example
 * // Display payment status with real-time updates
 * ```tsx
 * const { data: payment, isLoading } = usePayment({
 *   paymentId,
 *   queryOptions: {
 *     refetchInterval: (data) => {
 *       // Poll every 5 seconds if payment is pending
 *       return data?.status === 'pending' ? 5000 : false;
 *     }
 *   }
 * });
 *
 * const statusConfig = {
 *   completed: { color: 'green', icon: CheckIcon },
 *   pending: { color: 'yellow', icon: ClockIcon },
 *   failed: { color: 'red', icon: XIcon }
 * };
 *
 * return (
 *   <StatusBadge {...statusConfig[payment.status]}>
 *     {payment.status}
 *   </StatusBadge>
 * );
 * ```
 *
 * @see {@link usePayments} for fetching all user payments
 * @see {@link useDownloadInvoice} for downloading payment invoices
 * @see {@link useOrder} for associated order details
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

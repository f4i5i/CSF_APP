/**
 * useInvoice Hook
 * React Query mutation hook for invoice download
 */

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { paymentService } from '../../services/payment.service';
import type { PaymentId } from '../../types/payment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to download invoice PDF
 *
 * @example
 * ```tsx
 * const { mutate: downloadInvoice, isPending } = useDownloadInvoice();
 *
 * downloadInvoice('payment-123');
 * ```
 */
export function useDownloadInvoice(
  options?: Omit<UseMutationOptions<Blob, ApiErrorResponse, PaymentId>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: (paymentId: PaymentId) => paymentService.downloadInvoice(paymentId),

    onSuccess: (blob, paymentId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${paymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to download invoice');
    },

    ...options,
  });
}

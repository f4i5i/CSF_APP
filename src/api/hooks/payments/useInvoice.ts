/**
 * @file useInvoice Hook
 * @description React Query mutation hook for downloading payment invoices/receipts.
 *
 * This hook provides functionality to download PDF invoices for completed
 * payments. Invoices include transaction details, payment information,
 * and itemized breakdowns suitable for record-keeping and tax purposes.
 *
 * **Invoice Features:**
 * - PDF format for easy printing and storage
 * - Complete transaction details
 * - Itemized order breakdown
 * - Payment method information
 * - Company/billing information
 * - Tax documentation (if applicable)
 *
 * **Use Cases:**
 * - User downloads receipt after payment
 * - Accounting and bookkeeping
 * - Tax documentation
 * - Expense reporting
 * - Payment verification
 *
 * @module hooks/payments/useInvoice
 */

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { paymentService } from '../../services/payment.service';
import type { PaymentId } from '../../types/payment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to download payment invoice as PDF
 *
 * @description
 * Downloads a PDF invoice for a completed payment. The invoice is generated
 * server-side and includes all relevant transaction details. The download
 * happens automatically in the browser with proper filename.
 *
 * **What This Hook Does:**
 * - Fetches invoice PDF blob from server
 * - Creates temporary download link
 * - Triggers browser download with proper filename
 * - Cleans up temporary resources
 * - Shows success/error notifications
 *
 * **Important Notes:**
 * - Only works for completed payments
 * - PDF generated on-demand (not pre-generated)
 * - Filename format: invoice-{paymentId}.pdf
 * - Automatically cleaned up after download
 *
 * **Browser Compatibility:**
 * - Works in all modern browsers
 * - Uses Blob API and URL.createObjectURL
 * - Falls back gracefully in older browsers
 *
 * **Error Scenarios:**
 * - Payment not found
 * - Payment not completed (pending/failed)
 * - Invoice generation failed
 * - Network errors
 *
 * @param {Object} [options] - React Query mutation options
 *
 * @returns {UseMutationResult} Mutation result containing:
 * - mutate: Function to download invoice (takes paymentId as string)
 * - isPending: Loading state indicator (useful for showing spinner)
 * - isSuccess: Success state indicator
 * - error: Error details if download failed
 *
 * @example
 * // Basic usage - download invoice button
 * ```tsx
 * const { mutate: downloadInvoice, isPending } = useDownloadInvoice();
 *
 * return (
 *   <Button
 *     onClick={() => downloadInvoice(paymentId)}
 *     disabled={isPending}
 *   >
 *     {isPending ? 'Downloading...' : 'Download Invoice'}
 *   </Button>
 * );
 * ```
 *
 * @example
 * // Payment history with download buttons
 * ```tsx
 * const { data: payments } = useCompletedPayments();
 * const { mutate: downloadInvoice, isPending, variables } = useDownloadInvoice();
 *
 * return (
 *   <PaymentHistory>
 *     {payments?.map(payment => (
 *       <PaymentRow key={payment.id}>
 *         <PaymentInfo payment={payment} />
 *         <Button
 *           onClick={() => downloadInvoice(payment.id)}
 *           disabled={isPending && variables === payment.id}
 *           icon={<DownloadIcon />}
 *         >
 *           {isPending && variables === payment.id ? 'Downloading...' : 'Invoice'}
 *         </Button>
 *       </PaymentRow>
 *     ))}
 *   </PaymentHistory>
 * );
 * ```
 *
 * @example
 * // Auto-download after successful payment
 * ```tsx
 * const { mutate: confirmOrder } = useConfirmOrder({
 *   onSuccess: (order) => {
 *     toast.success('Payment successful!');
 *     // Auto-download invoice
 *     if (order.payment_id) {
 *       downloadInvoice(order.payment_id);
 *     }
 *   }
 * });
 *
 * const { mutate: downloadInvoice } = useDownloadInvoice({
 *   onSuccess: () => {
 *     toast.success('Invoice downloaded successfully');
 *   }
 * });
 * ```
 *
 * @example
 * // Bulk download invoices
 * ```tsx
 * const { mutate: downloadInvoice } = useDownloadInvoice();
 * const [downloading, setDownloading] = useState(false);
 *
 * const downloadAllInvoices = async (payments: Payment[]) => {
 *   setDownloading(true);
 *   for (const payment of payments) {
 *     await new Promise((resolve) => {
 *       downloadInvoice(payment.id, {
 *         onSettled: () => {
 *           // Wait 500ms between downloads to avoid rate limiting
 *           setTimeout(resolve, 500);
 *         }
 *       });
 *     });
 *   }
 *   setDownloading(false);
 *   toast.success(`Downloaded ${payments.length} invoices`);
 * };
 *
 * return (
 *   <Button
 *     onClick={() => downloadAllInvoices(selectedPayments)}
 *     disabled={downloading}
 *   >
 *     Download All Selected Invoices
 *   </Button>
 * );
 * ```
 *
 * @example
 * // With error handling and retry
 * ```tsx
 * const { mutate: downloadInvoice, error } = useDownloadInvoice({
 *   onError: (error, paymentId) => {
 *     console.error('Failed to download invoice:', error);
 *     // Offer retry
 *     const retry = confirm('Download failed. Would you like to retry?');
 *     if (retry) {
 *       downloadInvoice(paymentId);
 *     }
 *   }
 * });
 * ```
 *
 * @example
 * // Email invoice option (if backend supports it)
 * ```tsx
 * const { mutate: downloadInvoice } = useDownloadInvoice();
 * const [emailDialogOpen, setEmailDialogOpen] = useState(false);
 *
 * const handleInvoiceAction = (action: 'download' | 'email') => {
 *   if (action === 'download') {
 *     downloadInvoice(paymentId);
 *   } else {
 *     setEmailDialogOpen(true);
 *   }
 * };
 *
 * return (
 *   <DropdownMenu>
 *     <DropdownItem onClick={() => handleInvoiceAction('download')}>
 *       Download Invoice
 *     </DropdownItem>
 *     <DropdownItem onClick={() => handleInvoiceAction('email')}>
 *       Email Invoice
 *     </DropdownItem>
 *   </DropdownMenu>
 * );
 * ```
 *
 * @see {@link usePayment} for fetching payment details
 * @see {@link useCompletedPayments} for getting all completed payments
 * @see {@link useOrder} for associated order information
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

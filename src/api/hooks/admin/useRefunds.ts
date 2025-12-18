/**
 * @file Admin Refund Management Hooks
 *
 * @description
 * React Query hooks for managing refund requests in the admin interface.
 * Provides functionality to view, approve, and reject refund requests with
 * automatic cache invalidation and user feedback.
 *
 * **ADMIN-ONLY ACCESS**: All hooks in this file require administrator privileges.
 * Refund management operations are restricted to authorized admin users only.
 *
 * @module hooks/admin/useRefunds
 *
 * @features
 * - Fetch and filter refund requests by status
 * - Approve refund requests with payment processing
 * - Reject refund requests with reason tracking
 * - Automatic query cache invalidation on mutations
 * - Built-in toast notifications for user feedback
 * - Optimistic updates for better UX
 *
 * @requires @tanstack/react-query
 * @requires react-hot-toast
 * @requires Admin role authentication
 *
 * @see {@link adminService} for underlying API calls
 * @see {@link RefundRequest} for refund data structure
 * @see {@link RefundFilters} for available filter options
 *
 * @workflow Refund Processing
 * 1. Fetch refund requests (pending, approved, rejected)
 * 2. Admin reviews refund request details
 * 3. Admin approves or rejects with reason
 * 4. System processes refund or notifies user of rejection
 * 5. Query cache automatically refreshes
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import { queryKeys } from '../../constants/query-keys';
import type { RefundRequest, RefundFilters } from '../../types/admin.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Fetches refund requests with optional filtering by status.
 *
 * @description
 * Retrieves all refund requests with support for filtering by status (pending,
 * approved, rejected), date range, and user. Useful for displaying refund queues,
 * generating reports, and tracking refund processing.
 *
 * **Admin Access Required**: This hook requires administrator authentication.
 *
 * @param {Object} params - Configuration object
 * @param {RefundFilters} [params.filters] - Optional filters to apply
 * @param {string} [params.filters.status] - Filter by status: 'pending' | 'approved' | 'rejected'
 * @param {string} [params.filters.start_date] - Filter by start date (ISO format)
 * @param {string} [params.filters.end_date] - Filter by end date (ISO format)
 * @param {string} [params.filters.user_id] - Filter by specific user
 * @param {UseQueryOptions} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<RefundRequest[], ApiErrorResponse>} Query result containing:
 * - data: Array of refund request objects
 * - isLoading: Loading state
 * - error: Error object if request failed
 * - refetch: Function to manually refetch data
 *
 * @example
 * // Fetch all refund requests
 * const { data: refunds, isLoading } = useRefunds();
 *
 * @example
 * // Filter by status
 * const { data: pendingRefunds } = useRefunds({
 *   filters: { status: 'pending' }
 * });
 *
 * const { data: approvedRefunds } = useRefunds({
 *   filters: { status: 'approved' }
 * });
 *
 * @example
 * // Filter by date range for reporting
 * const { data: monthlyRefunds } = useRefunds({
 *   filters: {
 *     start_date: '2025-01-01',
 *     end_date: '2025-01-31'
 *   }
 * });
 *
 * @example
 * // Display refund queue with counts
 * const { data: refunds } = useRefunds();
 *
 * const pendingCount = refunds?.filter(r => r.status === 'pending').length;
 * const approvedCount = refunds?.filter(r => r.status === 'approved').length;
 * const rejectedCount = refunds?.filter(r => r.status === 'rejected').length;
 *
 * return (
 *   <RefundStats
 *     pending={pendingCount}
 *     approved={approvedCount}
 *     rejected={rejectedCount}
 *   />
 * );
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
 * Fetches only pending refund requests requiring admin review.
 *
 * @description
 * Convenience hook that automatically filters for pending refunds only.
 * Useful for displaying notification badges, pending refund queues, and
 * admin action dashboards.
 *
 * **Admin Access Required**: This hook requires administrator authentication.
 *
 * @param {UseQueryOptions} [queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<RefundRequest[], ApiErrorResponse>} Query result with pending refunds
 *
 * @example
 * // Display pending refunds badge
 * const { data: pendingRefunds } = usePendingRefunds();
 *
 * return (
 *   <Badge count={pendingRefunds?.length || 0}>
 *     Refunds
 *   </Badge>
 * );
 *
 * @example
 * // Pending refund queue
 * const { data: pendingRefunds, isLoading } = usePendingRefunds();
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <RefundQueue>
 *     {pendingRefunds?.map(refund => (
 *       <RefundCard
 *         key={refund.id}
 *         refund={refund}
 *         onApprove={handleApprove}
 *         onReject={handleReject}
 *       />
 *     ))}
 *   </RefundQueue>
 * );
 *
 * @example
 * // Check if there are pending refunds
 * const { data: pendingRefunds } = usePendingRefunds();
 * const hasPendingRefunds = (pendingRefunds?.length || 0) > 0;
 *
 * {hasPendingRefunds && (
 *   <Alert severity="info">
 *     You have {pendingRefunds.length} pending refund requests
 *   </Alert>
 * )}
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
 * Mutation hook to approve a refund request and process the refund payment.
 *
 * @description
 * Approves a pending refund request, triggering the payment processor to
 * refund the original payment to the customer. This action is irreversible
 * and will update the refund status to 'approved' and initiate the refund
 * transaction.
 *
 * **Features:**
 * - Automatic cache invalidation for refund queries
 * - Success toast notification
 * - Error handling with user feedback
 * - Optimistic updates available via options
 *
 * **Admin Access Required**: This hook requires administrator authentication.
 *
 * @param {UseMutationOptions} [options] - Additional mutation options
 * @param {Function} [options.onSuccess] - Callback after successful approval
 * @param {Function} [options.onError] - Callback when approval fails
 * @param {Function} [options.onMutate] - Callback before mutation (for optimistic updates)
 *
 * @returns {UseMutationResult<RefundRequest, ApiErrorResponse, string>} Mutation result:
 * - mutate: Function to trigger refund approval
 * - mutateAsync: Async version of mutate
 * - isLoading: Loading state during approval
 * - isSuccess: Success state
 * - isError: Error state
 * - error: Error object if approval failed
 *
 * @example
 * // Basic usage
 * const { mutate: approveRefund, isLoading } = useApproveRefund();
 *
 * const handleApprove = (refundId: string) => {
 *   if (confirm('Are you sure you want to approve this refund?')) {
 *     approveRefund(refundId);
 *   }
 * };
 *
 * @example
 * // With custom success handling
 * const { mutate: approveRefund } = useApproveRefund({
 *   onSuccess: (data) => {
 *     console.log('Refund approved:', data);
 *     navigate('/admin/refunds');
 *   },
 *   onError: (error) => {
 *     console.error('Approval failed:', error);
 *     // Custom error handling
 *   }
 * });
 *
 * @example
 * // With loading state and async/await
 * const { mutateAsync: approveRefund, isLoading } = useApproveRefund();
 *
 * const handleBatchApproval = async (refundIds: string[]) => {
 *   try {
 *     for (const id of refundIds) {
 *       await approveRefund(id);
 *     }
 *     toast.success(`Approved ${refundIds.length} refunds`);
 *   } catch (error) {
 *     toast.error('Batch approval failed');
 *   }
 * };
 *
 * @example
 * // With optimistic updates
 * const { mutate: approveRefund } = useApproveRefund({
 *   onMutate: async (refundId) => {
 *     // Cancel outgoing queries
 *     await queryClient.cancelQueries({ queryKey: queryKeys.admin.refunds() });
 *
 *     // Snapshot previous value
 *     const previousRefunds = queryClient.getQueryData(queryKeys.admin.refunds());
 *
 *     // Optimistically update
 *     queryClient.setQueryData(queryKeys.admin.refunds(), (old: RefundRequest[]) =>
 *       old?.map(r => r.id === refundId ? { ...r, status: 'approved' } : r)
 *     );
 *
 *     return { previousRefunds };
 *   },
 *   onError: (err, refundId, context) => {
 *     // Rollback on error
 *     queryClient.setQueryData(queryKeys.admin.refunds(), context.previousRefunds);
 *   }
 * });
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
 * Mutation hook to reject a refund request with a reason.
 *
 * @description
 * Rejects a pending refund request and records the rejection reason.
 * This action will update the refund status to 'rejected' and notify
 * the customer with the provided reason. The customer will not receive
 * a refund.
 *
 * **Features:**
 * - Automatic cache invalidation for refund queries
 * - Success toast notification
 * - Error handling with user feedback
 * - Reason tracking for audit and customer communication
 *
 * **Admin Access Required**: This hook requires administrator authentication.
 *
 * @param {UseMutationOptions} [options] - Additional mutation options
 * @param {Function} [options.onSuccess] - Callback after successful rejection
 * @param {Function} [options.onError] - Callback when rejection fails
 * @param {Function} [options.onMutate] - Callback before mutation (for optimistic updates)
 *
 * @returns {UseMutationResult} Mutation result:
 * - mutate: Function to trigger refund rejection
 * - mutateAsync: Async version of mutate
 * - isLoading: Loading state during rejection
 * - isSuccess: Success state
 * - isError: Error state
 * - error: Error object if rejection failed
 *
 * @example
 * // Basic usage
 * const { mutate: rejectRefund, isLoading } = useRejectRefund();
 *
 * const handleReject = (refundId: string) => {
 *   const reason = prompt('Please provide a reason for rejection:');
 *   if (reason) {
 *     rejectRefund({ refundId, reason });
 *   }
 * };
 *
 * @example
 * // With modal for reason input
 * const { mutate: rejectRefund } = useRejectRefund();
 * const [rejectModalOpen, setRejectModalOpen] = useState(false);
 * const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
 *
 * const handleRejectClick = (refundId: string) => {
 *   setSelectedRefundId(refundId);
 *   setRejectModalOpen(true);
 * };
 *
 * const handleRejectSubmit = (reason: string) => {
 *   if (selectedRefundId) {
 *     rejectRefund({ refundId: selectedRefundId, reason });
 *     setRejectModalOpen(false);
 *   }
 * };
 *
 * @example
 * // With predefined rejection reasons
 * const { mutate: rejectRefund } = useRejectRefund();
 *
 * const REJECTION_REASONS = [
 *   'Outside refund policy window',
 *   'Class already started',
 *   'Multiple refund requests',
 *   'Fraudulent activity suspected',
 *   'Other (see notes)'
 * ];
 *
 * const handleReject = (refundId: string, reason: string) => {
 *   rejectRefund(
 *     { refundId, reason },
 *     {
 *       onSuccess: () => {
 *         console.log('Refund rejected with reason:', reason);
 *       }
 *     }
 *   );
 * };
 *
 * @example
 * // With custom success handling and navigation
 * const { mutate: rejectRefund } = useRejectRefund({
 *   onSuccess: (data, variables) => {
 *     console.log('Rejected refund:', data.id);
 *     console.log('Reason:', variables.reason);
 *     navigate('/admin/refunds?filter=rejected');
 *   }
 * });
 *
 * @example
 * // Batch rejection with confirmation
 * const { mutateAsync: rejectRefund } = useRejectRefund();
 *
 * const handleBatchReject = async (refundIds: string[], reason: string) => {
 *   const confirmed = confirm(
 *     `Reject ${refundIds.length} refunds with reason: "${reason}"?`
 *   );
 *
 *   if (confirmed) {
 *     try {
 *       await Promise.all(
 *         refundIds.map(id => rejectRefund({ refundId: id, reason }))
 *       );
 *       toast.success(`Rejected ${refundIds.length} refunds`);
 *     } catch (error) {
 *       toast.error('Batch rejection failed');
 *     }
 *   }
 * };
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

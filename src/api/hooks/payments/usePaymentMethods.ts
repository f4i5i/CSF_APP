/**
 * usePaymentMethods Hook
 * React Query hooks for managing payment methods
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { paymentService } from '../../services/payment.service';
import { queryKeys } from '../../constants/query-keys';
import type {
  PaymentMethod,
  SetupIntentRequest,
  SetupIntentResponse,
  AttachPaymentMethodRequest,
} from '../../types/payment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch user's payment methods
 *
 * @example
 * ```tsx
 * const { data: paymentMethods, isLoading } = usePaymentMethods();
 * ```
 */
export function usePaymentMethods(
  queryOptions?: Omit<UseQueryOptions<PaymentMethod[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.paymentMethods.lists(),
    queryFn: () => paymentService.getPaymentMethods(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });
}

/**
 * Hook to create Stripe Setup Intent for adding payment method
 *
 * @example
 * ```tsx
 * const { mutate: createSetupIntent, data: setupIntent } = useCreateSetupIntent();
 *
 * createSetupIntent({
 *   return_url: 'https://app.com/payment-success'
 * });
 * ```
 */
export function useCreateSetupIntent(
  options?: Omit<
    UseMutationOptions<SetupIntentResponse, ApiErrorResponse, SetupIntentRequest | undefined>,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: (request?: SetupIntentRequest) => paymentService.createSetupIntent(request),

    onError: (error) => {
      toast.error(error.message || 'Failed to initialize payment method setup');
    },

    ...options,
  });
}

/**
 * Hook to attach payment method to user account
 *
 * @example
 * ```tsx
 * const { mutate: attachPaymentMethod } = useAttachPaymentMethod();
 *
 * attachPaymentMethod({
 *   payment_method_id: 'pm_123'
 * });
 * ```
 */
export function useAttachPaymentMethod(
  options?: Omit<
    UseMutationOptions<
      PaymentMethod,
      ApiErrorResponse,
      AttachPaymentMethodRequest,
      { previousMethods: PaymentMethod[] | undefined }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AttachPaymentMethodRequest) =>
      paymentService.attachPaymentMethod(request),

    onMutate: async (): Promise<{ previousMethods: PaymentMethod[] | undefined }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.paymentMethods.lists() });

      // Snapshot
      const previousMethods = queryClient.getQueryData<PaymentMethod[]>(queryKeys.paymentMethods.lists());
      return { previousMethods };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousMethods) {
        queryClient.setQueryData(queryKeys.paymentMethods.lists(), context.previousMethods);
      }
      toast.error(error.message || 'Failed to add payment method');
    },

    onSuccess: () => {
      // Invalidate payment methods query
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.lists() });
      toast.success('Payment method added successfully!');
    },

    ...options,
  });
}

/**
 * Hook to set default payment method
 *
 * @example
 * ```tsx
 * const { mutate: setDefault } = useSetDefaultPaymentMethod();
 *
 * setDefault({ payment_method_id: 'pm_123' });
 * ```
 */
export function useSetDefaultPaymentMethod(
  options?: Omit<
    UseMutationOptions<PaymentMethod, ApiErrorResponse, { payment_method_id: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payment_method_id }: { payment_method_id: string }) =>
      paymentService.setDefaultPaymentMethod(payment_method_id),

    onSuccess: () => {
      // Invalidate payment methods query
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.lists() });
      toast.success('Default payment method updated!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to set default payment method');
    },

    ...options,
  });
}

/**
 * Hook to delete payment method
 *
 * @example
 * ```tsx
 * const { mutate: deleteMethod } = useDeletePaymentMethod();
 *
 * deleteMethod('pm_123');
 * ```
 */
export function useDeletePaymentMethod(
  options?: Omit<
    UseMutationOptions<
      void,
      ApiErrorResponse,
      string,
      { previousMethods: PaymentMethod[] | undefined }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      paymentService.deletePaymentMethod(paymentMethodId),

    onMutate: async (paymentMethodId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.paymentMethods.lists() });

      // Snapshot
      const previousMethods = queryClient.getQueryData<PaymentMethod[]>(
        queryKeys.paymentMethods.lists()
      );

      // Optimistically remove the payment method
      queryClient.setQueryData<PaymentMethod[]>(
        queryKeys.paymentMethods.lists(),
        (old = []) => old.filter((method) => method.id !== paymentMethodId)
      );

      return { previousMethods };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousMethods) {
        queryClient.setQueryData(queryKeys.paymentMethods.lists(), context.previousMethods);
      }
      toast.error(error.message || 'Failed to delete payment method');
    },

    onSuccess: () => {
      toast.success('Payment method deleted successfully!');
    },

    ...options,
  });
}

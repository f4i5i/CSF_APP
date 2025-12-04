/**
 * useInstallments Hook
 * React Query hooks for installment plans
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { installmentService } from '../../services/payment.service';
import { queryKeys } from '../../constants/query-keys';
import type { InstallmentPlan, InstallmentPlanId } from '../../types/payment.types';
import { InstallmentPlanStatus } from '../../types/payment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch available installment plans
 *
 * @example
 * ```tsx
 * const { data: plans, isLoading } = useInstallmentPlans();
 * ```
 */
export function useInstallmentPlans(
  queryOptions?: Omit<UseQueryOptions<InstallmentPlan[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.installmentPlans.lists(),
    queryFn: () => installmentService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes (plans don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...queryOptions,
  });
}

/**
 * Hook to fetch single installment plan
 *
 * @example
 * ```tsx
 * const { data: plan } = useInstallmentPlan({ planId: '123' });
 * ```
 */
export function useInstallmentPlan({
  planId,
  queryOptions,
}: {
  planId: InstallmentPlanId;
  queryOptions?: Omit<UseQueryOptions<InstallmentPlan, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.installmentPlans.detail(planId),
    queryFn: () => installmentService.getById(planId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!planId,
    ...queryOptions,
  });
}

/**
 * Hook to fetch active installment plans
 *
 * @example
 * ```tsx
 * const { data: activePlans } = useActiveInstallmentPlans();
 * ```
 */
export function useActiveInstallmentPlans(
  queryOptions?: Omit<UseQueryOptions<InstallmentPlan[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.installmentPlans.lists(),
    queryFn: async () => {
      const plans = await installmentService.getAll();
      return plans.filter((plan) => plan.status === InstallmentPlanStatus.ACTIVE);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * @file useInstallments Hooks
 * @description React Query hooks for managing installment payment plans.
 *
 * This file provides hooks for working with installment plans that allow
 * users to split payments into multiple scheduled charges. Installment plans
 * are useful for expensive classes or programs.
 *
 * Hooks provided:
 * - useInstallmentPlans: Fetch all available installment plans
 * - useInstallmentPlan: Fetch a specific installment plan
 * - useActiveInstallmentPlans: Fetch only active/enabled plans
 *
 * **Installment Plan Features:**
 * - Split payments into multiple charges
 * - Configurable number of payments
 * - Scheduled automatic charges
 * - Integration with Stripe subscriptions
 * - Support for different payment schedules (monthly, weekly, etc.)
 *
 * **Use in Checkout:**
 * Installment plans are selected during checkout with useCheckoutOrder.
 * The installment_plan_id is passed to create a subscription schedule
 * rather than a one-time payment.
 *
 * @module hooks/payments/useInstallments
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { installmentService } from '../../services/payment.service';
import { queryKeys } from '../../constants/query-keys';
import type { InstallmentPlan, InstallmentPlanId } from '../../types/payment.types';
import { InstallmentPlanStatus } from '../../types/payment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch all available installment plans
 *
 * @description
 * Retrieves all installment plans configured in the system. Plans define
 * how payments can be split over time, including the number of payments,
 * schedule, and any fees.
 *
 * **Installment Plan Data Includes:**
 * - Number of payments (e.g., 3, 6, 12 months)
 * - Payment schedule (monthly, bi-weekly, etc.)
 * - Processing fees or interest (if any)
 * - Minimum/maximum order amounts
 * - Active status
 * - Description and terms
 *
 * **Use Cases:**
 * - Display payment options at checkout
 * - Show installment calculator
 * - Compare payment plans
 * - Admin plan management
 *
 * **Caching Strategy:**
 * - Stale time: 10 minutes (plans rarely change)
 * - Cache time: 30 minutes
 * - Long cache appropriate for mostly-static configuration data
 *
 * @param {Object} [queryOptions] - Additional React Query configuration options
 *
 * @returns {UseQueryResult<InstallmentPlan[], ApiErrorResponse>} React Query result containing:
 * - data: Array of all installment plans
 * - isLoading: Loading state indicator
 * - isError: Error state indicator
 * - error: Error details if request failed
 * - refetch: Function to manually refetch plans
 *
 * @example
 * // Basic usage - display available installment options
 * ```tsx
 * const { data: plans, isLoading } = useInstallmentPlans();
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <div>
 *     <h3>Payment Plans</h3>
 *     {plans?.map(plan => (
 *       <PlanOption key={plan.id}>
 *         <h4>{plan.num_payments} Payments</h4>
 *         <p>{plan.schedule}</p>
 *         <p>Fee: ${plan.fee_amount || 0}</p>
 *       </PlanOption>
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @example
 * // Installment calculator
 * ```tsx
 * const { data: plans } = useInstallmentPlans();
 * const [selectedPlan, setSelectedPlan] = useState<string>();
 * const orderTotal = 1200;
 *
 * const calculateInstallment = (plan: InstallmentPlan) => {
 *   const totalWithFees = orderTotal + (plan.fee_amount || 0);
 *   return totalWithFees / plan.num_payments;
 * };
 *
 * return (
 *   <div>
 *     <h3>Choose Your Payment Plan</h3>
 *     {plans?.map(plan => (
 *       <PlanCard
 *         key={plan.id}
 *         selected={selectedPlan === plan.id}
 *         onClick={() => setSelectedPlan(plan.id)}
 *       >
 *         <h4>{plan.num_payments} Monthly Payments</h4>
 *         <p className="amount">
 *           ${calculateInstallment(plan).toFixed(2)}/month
 *         </p>
 *         <p className="total">
 *           Total: ${orderTotal + (plan.fee_amount || 0)}
 *         </p>
 *       </PlanCard>
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @example
 * // Filter plans by order amount
 * ```tsx
 * const { data: allPlans } = useInstallmentPlans();
 * const orderTotal = 500;
 *
 * const eligiblePlans = allPlans?.filter(plan =>
 *   (!plan.min_amount || orderTotal >= plan.min_amount) &&
 *   (!plan.max_amount || orderTotal <= plan.max_amount) &&
 *   plan.status === InstallmentPlanStatus.ACTIVE
 * );
 *
 * if (!eligiblePlans || eligiblePlans.length === 0) {
 *   return <p>Installment plans not available for this order amount</p>;
 * }
 * ```
 *
 * @see {@link useActiveInstallmentPlans} for only active plans
 * @see {@link useInstallmentPlan} for fetching a specific plan
 * @see {@link useCheckoutOrder} for using installment plans at checkout
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
 * Hook to fetch details of a specific installment plan
 *
 * @description
 * Retrieves detailed information about a single installment plan by ID.
 * Useful for displaying plan details, terms, and conditions before
 * confirming installment payment selection.
 *
 * **Use Cases:**
 * - Display plan details page
 * - Show full terms and conditions
 * - Verify plan before checkout
 * - Admin plan editing
 *
 * **Caching Strategy:**
 * - Stale time: 10 minutes
 * - Cache time: 30 minutes
 * - Auto-disabled when planId is not provided
 *
 * @param {Object} params - Hook parameters
 * @param {InstallmentPlanId} params.planId - The installment plan ID to fetch
 * @param {Object} [params.queryOptions] - Additional React Query configuration options
 *
 * @returns {UseQueryResult<InstallmentPlan, ApiErrorResponse>} React Query result containing:
 * - data: The installment plan object
 * - isLoading: Loading state indicator
 * - isError: Error state indicator
 * - error: Error details if request failed
 * - refetch: Function to manually refetch the plan
 *
 * @example
 * // Basic usage - display plan details
 * ```tsx
 * const { planId } = useParams();
 * const { data: plan, isLoading } = useInstallmentPlan({ planId: planId || '' });
 *
 * if (isLoading) return <Spinner />;
 * if (!plan) return <NotFound />;
 *
 * return (
 *   <PlanDetails>
 *     <h2>{plan.name}</h2>
 *     <p>{plan.description}</p>
 *     <ul>
 *       <li>Payments: {plan.num_payments}</li>
 *       <li>Schedule: {plan.schedule}</li>
 *       <li>Fee: ${plan.fee_amount || 0}</li>
 *     </ul>
 *   </PlanDetails>
 * );
 * ```
 *
 * @example
 * // Confirm installment selection before checkout
 * ```tsx
 * const [selectedPlanId, setSelectedPlanId] = useState<string>();
 * const { data: selectedPlan } = useInstallmentPlan({
 *   planId: selectedPlanId || '',
 *   queryOptions: { enabled: !!selectedPlanId }
 * });
 *
 * return (
 *   <div>
 *     <InstallmentSelector onChange={setSelectedPlanId} />
 *     {selectedPlan && (
 *       <ConfirmationPanel>
 *         <h4>Selected Plan</h4>
 *         <p>{selectedPlan.num_payments} payments of ${paymentAmount}</p>
 *         <p>Processing fee: ${selectedPlan.fee_amount}</p>
 *         <Button onClick={handleCheckout}>Confirm and Pay</Button>
 *       </ConfirmationPanel>
 *     )}
 *   </div>
 * );
 * ```
 *
 * @see {@link useInstallmentPlans} for fetching all plans
 * @see {@link useCheckoutOrder} for using the plan at checkout
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
 * Hook to fetch only active/enabled installment plans
 *
 * @description
 * Convenience hook that filters installment plans to show only those that
 * are currently active and available for use. Inactive or archived plans
 * are excluded from the results.
 *
 * This is the preferred hook for checkout flows where only active plans
 * should be displayed to users.
 *
 * **Filtering:**
 * - Only plans with status === ACTIVE
 * - Excludes disabled, archived, or draft plans
 * - Client-side filtering after fetching all plans
 *
 * **Use Cases:**
 * - Checkout payment plan selection
 * - Public-facing plan displays
 * - Available payment options
 *
 * **Note:** This hook fetches all plans and filters client-side. For
 * better performance, consider server-side filtering if the plan list
 * is very large.
 *
 * @param {Object} [queryOptions] - Additional React Query configuration options
 *
 * @returns {UseQueryResult<InstallmentPlan[], ApiErrorResponse>} React Query result containing:
 * - data: Array of active installment plans only
 * - isLoading: Loading state indicator
 * - isError: Error state indicator
 * - error: Error details if request failed
 * - refetch: Function to manually refetch plans
 *
 * @example
 * // Display only active plans at checkout
 * ```tsx
 * const { data: activePlans } = useActiveInstallmentPlans();
 * const [selectedPlan, setSelectedPlan] = useState<string>();
 *
 * return (
 *   <CheckoutSection>
 *     <h3>Payment Options</h3>
 *     <RadioGroup value={selectedPlan} onChange={setSelectedPlan}>
 *       <Radio value="">Pay in Full</Radio>
 *       {activePlans?.map(plan => (
 *         <Radio key={plan.id} value={plan.id}>
 *           {plan.num_payments} payments - {plan.name}
 *         </Radio>
 *       ))}
 *     </RadioGroup>
 *   </CheckoutSection>
 * );
 * ```
 *
 * @example
 * // Show installment options with eligibility
 * ```tsx
 * const { data: activePlans, isLoading } = useActiveInstallmentPlans();
 * const orderTotal = 1500;
 *
 * const eligiblePlans = activePlans?.filter(plan =>
 *   (!plan.min_amount || orderTotal >= plan.min_amount) &&
 *   (!plan.max_amount || orderTotal <= plan.max_amount)
 * );
 *
 * if (isLoading) return <Spinner />;
 *
 * if (!eligiblePlans || eligiblePlans.length === 0) {
 *   return (
 *     <div>
 *       <p>Pay in full: ${orderTotal}</p>
 *       <p className="text-muted">
 *         Installment plans not available for this order
 *       </p>
 *     </div>
 *   );
 * }
 *
 * return (
 *   <InstallmentOptions plans={eligiblePlans} orderTotal={orderTotal} />
 * );
 * ```
 *
 * @see {@link useInstallmentPlans} for all plans including inactive
 * @see {@link useInstallmentPlan} for fetching a specific plan
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

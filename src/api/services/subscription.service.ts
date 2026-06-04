/**
 * Subscription service - parent-facing recurring membership operations.
 *
 * Cancellation follows the "15 days before the next billing date" policy:
 * - On/before the cutoff: the membership ends at the current period end, no
 *   further charge.
 * - Inside the cutoff window: one more charge applies, then it ends one billing
 *   interval later.
 *
 * Use getCancellationPreview() to show the parent exactly what will happen before
 * they confirm.
 */
import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../constants/endpoints';

export interface SubscriptionCancellationPreview {
  within_window: boolean;
  deadline: string;
  effective_end_date: string;
  will_charge_again: boolean;
  billing_amount: string;
  billing_interval: string;
  message: string;
}

export interface SubscriptionCancelResult {
  message: string;
  within_window: boolean;
  effective_end_date: string;
  will_charge_again: boolean;
}

export const subscriptionService = {
  /**
   * Preview the effect of cancelling now. Read-only; does not change anything.
   */
  async getCancellationPreview(
    enrollmentId: string
  ): Promise<SubscriptionCancellationPreview> {
    const { data } = await apiClient.get<SubscriptionCancellationPreview>(
      ENDPOINTS.SUBSCRIPTIONS.CANCELLATION_PREVIEW(enrollmentId)
    );
    return data;
  },

  /**
   * Cancel the membership under the month-end cutoff policy. Returns when it
   * will end and whether one more charge will occur.
   */
  async cancel(enrollmentId: string): Promise<SubscriptionCancelResult> {
    const { data } = await apiClient.post<SubscriptionCancelResult>(
      ENDPOINTS.SUBSCRIPTIONS.CANCEL(enrollmentId),
      {}
    );
    return data;
  },
};

export default subscriptionService;

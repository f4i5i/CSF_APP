/**
 * Payment Service
 * Handles payments, payment methods, and installment plans
 */

import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Payment,
  PaymentFilters,
  PaymentMethod,
  SetupIntentRequest,
  SetupIntentResponse,
  AttachPaymentMethodRequest,
  RefundRequest,
  RefundResponse,
  InstallmentPlan,
  InstallmentPlanFilters,
  InstallmentPayment,
  CreateInstallmentPlanRequest,
  InstallmentPreviewRequest,
  InstallmentPreviewResponse,
  InstallmentSummary,
} from '../types/payment.types';

/**
 * Payment service
 * Pure API functions for payment management
 */
export const paymentService = {
  /**
   * Get current user's payments
   */
  async getMy(filters?: PaymentFilters): Promise<Payment[]> {
    const { data } = await apiClient.get<Payment[]>(ENDPOINTS.PAYMENTS.MY, {
      params: filters,
    });
    return data;
  },

  /**
   * Get all payments (admin only)
   */
  async getAll(filters?: PaymentFilters): Promise<Payment[]> {
    const { data } = await apiClient.get<Payment[]>(ENDPOINTS.PAYMENTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get payment by ID
   */
  async getById(id: string): Promise<Payment> {
    const { data } = await apiClient.get<Payment>(ENDPOINTS.PAYMENTS.BY_ID(id));
    return data;
  },

  /**
   * Create setup intent (for saving payment method)
   */
  async createSetupIntent(
    request?: SetupIntentRequest
  ): Promise<SetupIntentResponse> {
    const { data } = await apiClient.post<SetupIntentResponse>(
      ENDPOINTS.PAYMENTS.SETUP_INTENT,
      request
    );
    return data;
  },

  /**
   * Get saved payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data } = await apiClient.get<PaymentMethod[]>(
      ENDPOINTS.PAYMENTS.METHODS
    );
    return data;
  },

  /**
   * Attach payment method to user account
   */
  async attachPaymentMethod(
    request: AttachPaymentMethodRequest
  ): Promise<PaymentMethod> {
    const { data } = await apiClient.post<PaymentMethod>(
      ENDPOINTS.PAYMENTS.ATTACH_METHOD,
      request
    );
    return data;
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId: string): Promise<PaymentMethod> {
    const { data } = await apiClient.post<PaymentMethod>(
      ENDPOINTS.PAYMENTS.SET_DEFAULT_METHOD(methodId)
    );
    return data;
  },

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    await apiClient.delete(
      ENDPOINTS.PAYMENTS.DELETE_METHOD(methodId)
    );
  },

  /**
   * Request refund (admin only)
   */
  async requestRefund(refundData: RefundRequest): Promise<RefundResponse> {
    const { data } = await apiClient.post<RefundResponse>(
      ENDPOINTS.PAYMENTS.REFUND,
      refundData
    );
    return data;
  },

  /**
   * Download invoice PDF
   */
  async downloadInvoice(paymentId: string): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(
      ENDPOINTS.PAYMENTS.INVOICE_DOWNLOAD(paymentId),
      { responseType: 'blob' }
    );
    return data;
  },
};

/**
 * Installment service
 */
export const installmentService = {
  /**
   * Get current user's installment plans
   */
  async getMy(filters?: InstallmentPlanFilters): Promise<InstallmentPlan[]> {
    const { data } = await apiClient.get<InstallmentPlan[]>(
      ENDPOINTS.INSTALLMENTS.MY,
      { params: filters }
    );
    return data;
  },

  /**
   * Get all installment plans (admin only)
   */
  async getAll(filters?: InstallmentPlanFilters): Promise<InstallmentPlan[]> {
    const { data } = await apiClient.get<InstallmentPlan[]>(
      ENDPOINTS.INSTALLMENTS.LIST,
      { params: filters }
    );
    return data;
  },

  /**
   * Get installment plan by ID
   */
  async getById(id: string): Promise<InstallmentPlan> {
    const { data } = await apiClient.get<InstallmentPlan>(
      ENDPOINTS.INSTALLMENTS.BY_ID(id)
    );
    return data;
  },

  /**
   * Preview installment schedule
   */
  async preview(
    previewData: InstallmentPreviewRequest
  ): Promise<InstallmentPreviewResponse> {
    const { data } = await apiClient.post<InstallmentPreviewResponse>(
      ENDPOINTS.INSTALLMENTS.PREVIEW,
      previewData
    );
    return data;
  },

  /**
   * Create installment plan
   */
  async create(
    planData: CreateInstallmentPlanRequest
  ): Promise<InstallmentPlan> {
    const { data } = await apiClient.post<InstallmentPlan>(
      ENDPOINTS.INSTALLMENTS.CREATE,
      planData
    );
    return data;
  },

  /**
   * Cancel installment plan
   */
  async cancel(planId: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      ENDPOINTS.INSTALLMENTS.DELETE(planId)
    );
    return data;
  },

  /**
   * Get installment summary
   */
  async getSummary(): Promise<InstallmentSummary> {
    const { data } = await apiClient.get<InstallmentSummary>(
      ENDPOINTS.INSTALLMENTS.SUMMARY
    );
    return data;
  },

  /**
   * Get installment payments for a plan
   */
  async getPayments(planId: string): Promise<InstallmentPayment[]> {
    const { data } = await apiClient.get<InstallmentPayment[]>(
      ENDPOINTS.INSTALLMENTS.PAYMENTS(planId)
    );
    return data;
  },

  /**
   * Attempt installment payment
   */
  async attemptPayment(
    planId: string,
    paymentId: string
  ): Promise<{ message: string; payment: Payment }> {
    const { data } = await apiClient.post<{
      message: string;
      payment: Payment;
    }>(ENDPOINTS.INSTALLMENTS.ATTEMPT_PAYMENT(planId, paymentId));
    return data;
  },
};

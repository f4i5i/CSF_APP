/**
 * Payment Type Definitions
 * Types for payments, installments, and payment methods
 */

import type {
  PaymentId,
  OrderId,
  UserId,
  InstallmentPlanId,
  Timestamped,
} from './common.types';

// Re-export for convenience
export type { PaymentId, InstallmentPlanId };

// ============================================================================
// Payment Status Enum
// ============================================================================

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

/**
 * Payment type
 */
export enum PaymentType {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  ACCOUNT_CREDIT = 'ACCOUNT_CREDIT',
  CASH = 'CASH',
  CHECK = 'CHECK',
}

// ============================================================================
// Payment Interface
// ============================================================================

/**
 * Payment entity
 */
export interface Payment extends Timestamped {
  id: PaymentId;
  user_id: UserId;
  order_id?: OrderId;
  installment_plan_id?: InstallmentPlanId;
  amount: number;
  payment_type: PaymentType;
  status: PaymentStatus;
  stripe_payment_intent_id?: string;
  stripe_payment_method_id?: string;
  transaction_id?: string;
  notes?: string;
  refund_amount?: number;
}

// ============================================================================
// Payment Method
// ============================================================================

/**
 * Saved payment method (Stripe)
 */
export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
  created_at: string;
}

// ============================================================================
// Installment Plan
// ============================================================================

/**
 * Installment frequency
 */
export enum InstallmentFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

/**
 * Installment plan status
 */
export enum InstallmentPlanStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

/**
 * Installment plan
 */
export interface InstallmentPlan extends Timestamped {
  id: InstallmentPlanId;
  user_id: UserId;
  order_id: OrderId;
  total_amount: number;
  down_payment: number;
  remaining_amount: number;
  installment_amount: number;
  frequency: InstallmentFrequency;
  number_of_installments: number;
  completed_installments: number;
  status: InstallmentPlanStatus;
  start_date: string;
  next_payment_date?: string;
  payment_method_id?: string;
}

/**
 * Installment payment
 */
export interface InstallmentPayment extends Timestamped {
  id: string;
  installment_plan_id: InstallmentPlanId;
  payment_id?: PaymentId;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: PaymentStatus;
  attempt_count: number;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Setup intent request (save payment method)
 */
export interface SetupIntentRequest {
  return_url?: string;
}

/**
 * Setup intent response
 */
export interface SetupIntentResponse {
  client_secret: string;
  setup_intent_id: string;
}

/**
 * Attach payment method request
 */
export interface AttachPaymentMethodRequest {
  payment_method_id: string;
}

/**
 * Refund request
 */
export interface RefundRequest {
  payment_id: PaymentId;
  amount?: number; // Partial refund if specified
  reason?: string;
}

/**
 * Refund response
 */
export interface RefundResponse {
  refund_id: string;
  amount: number;
  status: string;
  created_at: string;
}

/**
 * Create installment plan request
 */
export interface CreateInstallmentPlanRequest {
  order_id: OrderId;
  down_payment: number;
  frequency: InstallmentFrequency;
  number_of_installments: number;
  start_date: string;
  payment_method_id?: string;
}

/**
 * Installment preview request
 */
export interface InstallmentPreviewRequest {
  total_amount: number;
  down_payment: number;
  frequency: InstallmentFrequency;
  number_of_installments: number;
  start_date: string;
}

/**
 * Installment preview response
 */
export interface InstallmentPreviewResponse {
  down_payment: number;
  installment_amount: number;
  total_installments: number;
  schedule: Array<{
    installment_number: number;
    due_date: string;
    amount: number;
  }>;
  total_amount: number;
}

/**
 * Installment summary
 */
export interface InstallmentSummary {
  active_plans: number;
  total_remaining: number;
  next_payment_date?: string;
  next_payment_amount?: number;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Filter parameters for payment list
 */
export interface PaymentFilters {
  status?: PaymentStatus;
  payment_type?: PaymentType;
  search?: string;
  skip?: number;
  limit?: number;
}

/**
 * Filter parameters for installment plan list
 */
export interface InstallmentPlanFilters {
  status?: InstallmentPlanStatus;
  skip?: number;
  limit?: number;
}

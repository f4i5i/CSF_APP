/**
 * Order Type Definitions
 * Types for orders and checkout
 */

import type {
  OrderId,
  UserId,
  EnrollmentId,
  Timestamped,
} from './common.types';

// Re-export for convenience
export type { OrderId };

// ============================================================================
// Order Status Enum
// ============================================================================

/**
 * Order status
 */
export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

// ============================================================================
// Order Line Item
// ============================================================================

/**
 * Order line item
 */
export interface OrderLineItem {
  id: string;
  enrollment_id: EnrollmentId;
  description: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total: number;
}

// ============================================================================
// Order Interface
// ============================================================================

/**
 * Order entity
 */
export interface Order extends Timestamped {
  id: OrderId;
  user_id: UserId;
  status: OrderStatus;
  subtotal: number;
  discount_total: number;
  tax: number;
  total: number;
  line_items: OrderLineItem[];
  discount_code?: string;
  stripe_payment_intent_id?: string;
  notes?: string;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Create order request
 */
export interface CreateOrderRequest {
  enrollment_ids: EnrollmentId[];
  discount_code?: string;
  notes?: string;
}

/**
 * Calculate order request (preview pricing)
 */
export interface CalculateOrderRequest {
  enrollment_ids: EnrollmentId[];
  discount_code?: string;
}

/**
 * Calculate order response
 */
export interface CalculateOrderResponse {
  subtotal: number;
  discount_amount: number;
  discount_details?: {
    code: string;
    type: string;
    amount: number;
  };
  tax: number;
  total: number;
  line_items: OrderLineItem[];
}

/**
 * Pay order request (create payment intent for an order)
 */
export interface PayOrderRequest {
  order_id: OrderId;
  payment_method_id?: string; // Saved payment method
  save_payment_method?: boolean;
  installment_plan_id?: string; // Optional installment plan
}

/**
 * Checkout request (alias for PayOrderRequest)
 */
export interface CheckoutRequest extends PayOrderRequest {}

/**
 * Checkout response (payment intent details)
 */
export interface CheckoutResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  stripe_checkout_url?: string; // Stripe hosted checkout URL
}

/**
 * Confirm order request (after payment succeeds)
 */
export interface ConfirmOrderRequest {
  order_id: OrderId;
  payment_intent_id: string;
  status?: string; // Payment status from Stripe
}

/**
 * Confirm payment request (alias)
 */
export interface ConfirmPaymentRequest extends ConfirmOrderRequest {}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Filter parameters for order list
 */
export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  skip?: number;
  limit?: number;
}

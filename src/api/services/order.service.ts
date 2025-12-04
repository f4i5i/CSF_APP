/**
 * Order Service
 * Handles order creation and checkout
 */

import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Order,
  OrderFilters,
  CreateOrderRequest,
  CalculateOrderRequest,
  CalculateOrderResponse,
  CheckoutRequest,
  CheckoutResponse,
  ConfirmPaymentRequest,
} from '../types/order.types';

/**
 * Order service
 * Pure API functions for order management
 */
export const orderService = {
  /**
   * Get current user's orders
   */
  async getMy(filters?: OrderFilters): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>(ENDPOINTS.ORDERS.MY, {
      params: filters,
    });
    return data;
  },

  /**
   * Get all orders (admin only)
   */
  async getAll(filters?: OrderFilters): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>(ENDPOINTS.ORDERS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get order by ID
   */
  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(ENDPOINTS.ORDERS.BY_ID(id));
    return data;
  },

  /**
   * Calculate order total (preview pricing)
   */
  async calculate(
    calculateData: CalculateOrderRequest
  ): Promise<CalculateOrderResponse> {
    const { data } = await apiClient.post<CalculateOrderResponse>(
      ENDPOINTS.ORDERS.CALCULATE,
      calculateData
    );
    return data;
  },

  /**
   * Alias for calculate
   */
  async calculateTotal(
    calculateData: CalculateOrderRequest
  ): Promise<CalculateOrderResponse> {
    return this.calculate(calculateData);
  },

  /**
   * Create new order
   */
  async create(orderData: CreateOrderRequest): Promise<Order> {
    const { data } = await apiClient.post<Order>(
      ENDPOINTS.ORDERS.CREATE,
      orderData
    );
    return data;
  },

  /**
   * Checkout - create payment intent
   */
  async checkout(
    orderId: string,
    checkoutData: CheckoutRequest
  ): Promise<CheckoutResponse> {
    const { data } = await apiClient.post<CheckoutResponse>(
      ENDPOINTS.ORDERS.CHECKOUT(orderId),
      checkoutData
    );
    return data;
  },

  /**
   * Confirm payment completion
   */
  async confirm(
    orderId: string,
    confirmData: ConfirmPaymentRequest
  ): Promise<Order> {
    const { data } = await apiClient.post<Order>(
      ENDPOINTS.ORDERS.CONFIRM(orderId),
      confirmData
    );
    return data;
  },

  /**
   * Cancel order
   */
  async cancel(orderId: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      ENDPOINTS.ORDERS.CANCEL(orderId)
    );
    return data;
  },
};

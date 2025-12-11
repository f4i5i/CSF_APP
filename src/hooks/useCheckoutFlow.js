/**
 * useCheckoutFlow Hook
 * Manages the complete checkout flow state and business logic for class enrollment
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import classesService from '../api/services/classes.service';
import childrenService from '../api/services/children.service';
import ordersService from '../api/services/orders.service';
import paymentsService from '../api/services/payments.service';
import enrollmentsService from '../api/services/enrollments.service';
import installmentsService from '../api/services/installments.service';

export const useCheckoutFlow = () => {
  const navigate = useNavigate();

  // State
  const [state, setState] = useState({
    // Step tracking
    currentStep: 'selection', // 'selection' | 'payment' | 'processing' | 'success' | 'error'

    // Data
    classData: null,
    children: [],
    selectedChildId: null,

    // Payment
    paymentMethod: 'full', // 'full' | 'subscribe' | 'installments'
    installmentPlan: null,

    // Order
    orderId: null,
    orderTotal: 0,
    appliedDiscount: null,
    discountCode: '',

    // Stripe
    clientSecret: null,
    paymentIntentId: null,

    // Status
    isLoading: false,
    error: null,
    hasCapacity: true,
  });

  /**
   * Initialize checkout - fetch class details, children, and check capacity
   */
  const initializeCheckout = useCallback(async (classId) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch all required data in parallel
      const [classData, children, capacity] = await Promise.all([
        classesService.getById(classId),
        childrenService.getMy(),
        classesService.checkCapacity(classId),
      ]);

      setState((prev) => ({
        ...prev,
        classData,
        children,
        hasCapacity: capacity?.available !== false,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to initialize checkout:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to load checkout data',
        isLoading: false,
      }));
    }
  }, []);

  /**
   * Select a child for enrollment
   */
  const selectChild = useCallback((childId) => {
    setState((prev) => ({ ...prev, selectedChildId: childId }));
  }, []);

  /**
   * Select payment method
   */
  const selectPaymentMethod = useCallback((method) => {
    setState((prev) => ({
      ...prev,
      paymentMethod: method,
      installmentPlan: method !== 'installments' ? null : prev.installmentPlan,
    }));
  }, []);

  /**
   * Select installment plan
   */
  const selectInstallmentPlan = useCallback((plan) => {
    setState((prev) => ({ ...prev, installmentPlan: plan }));
  }, []);

  /**
   * Apply discount code
   */
  const applyDiscount = useCallback(async (code) => {
    if (!state.orderId) {
      // If order not created yet, just store the code
      setState((prev) => ({ ...prev, discountCode: code }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const updatedOrder = await ordersService.applyDiscount(state.orderId, { code });

      setState((prev) => ({
        ...prev,
        appliedDiscount: updatedOrder.discount,
        orderTotal: updatedOrder.total,
        discountCode: code,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to apply discount:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Invalid discount code',
        isLoading: false,
      }));
    }
  }, [state.orderId]);

  /**
   * Remove discount
   */
  const removeDiscount = useCallback(async () => {
    if (!state.orderId) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const updatedOrder = await ordersService.removeDiscount(state.orderId);

      setState((prev) => ({
        ...prev,
        appliedDiscount: null,
        orderTotal: updatedOrder.total,
        discountCode: '',
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to remove discount:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.orderId]);

  /**
   * Create order
   */
  const createOrder = useCallback(async () => {
    const { classData, selectedChildId, paymentMethod, installmentPlan, discountCode } = state;

    if (!classData || !selectedChildId) {
      setState((prev) => ({
        ...prev,
        error: 'Please select a child to enroll',
      }));
      return null;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const orderData = {
        items: [
          {
            class_id: classData.id,
            child_id: selectedChildId,
            amount: classData.base_price || classData.price,
          },
        ],
        payment_plan: paymentMethod,
      };

      if (discountCode) {
        orderData.discount_code = discountCode;
      }

      if (paymentMethod === 'installments' && installmentPlan) {
        orderData.installments_count = installmentPlan.count;
      }

      const order = await ordersService.create(orderData);

      setState((prev) => ({
        ...prev,
        orderId: order.id,
        orderTotal: order.total,
        appliedDiscount: order.discount,
        isLoading: false,
      }));

      return order;
    } catch (error) {
      console.error('Failed to create order:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to create order',
        isLoading: false,
      }));
      return null;
    }
  }, [state]);

  /**
   * Initiate payment - create payment intent
   */
  const initiatePayment = useCallback(async () => {
    const { orderId, orderTotal, paymentMethod, installmentPlan } = state;

    if (!orderId) {
      setState((prev) => ({ ...prev, error: 'Order not created' }));
      return null;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null, currentStep: 'payment' }));

    try {
      let paymentAmount = orderTotal;

      // For installments, only charge the first installment amount
      if (paymentMethod === 'installments' && installmentPlan) {
        paymentAmount = installmentPlan.firstPaymentAmount || orderTotal;
      }

      const paymentIntent = await paymentsService.createIntent({
        order_id: orderId,
        amount: paymentAmount,
        payment_method: 'card',
      });

      setState((prev) => ({
        ...prev,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.payment_intent_id,
        isLoading: false,
      }));

      return paymentIntent;
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to initiate payment',
        isLoading: false,
      }));
      return null;
    }
  }, [state]);

  /**
   * Confirm payment and create enrollment
   */
  const confirmPayment = useCallback(async (paymentIntent) => {
    const { classData, selectedChildId, orderId } = state;

    setState((prev) => ({ ...prev, isLoading: true, currentStep: 'processing' }));

    try {
      // Confirm payment with backend
      await paymentsService.confirm(paymentIntent.id);

      // Create enrollment
      const enrollment = await enrollmentsService.create({
        child_id: selectedChildId,
        class_id: classData.id,
        order_id: orderId,
        payment_completed: true,
      });

      setState((prev) => ({
        ...prev,
        currentStep: 'success',
        isLoading: false,
      }));

      // Redirect to dashboard with success message
      setTimeout(() => {
        navigate('/dashboard?success=true');
      }, 2000);

      return enrollment;
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Payment confirmation failed',
        currentStep: 'error',
        isLoading: false,
      }));
      return null;
    }
  }, [state, navigate]);

  /**
   * Handle payment error
   */
  const handlePaymentError = useCallback((error) => {
    console.error('Payment error:', error);

    const errorMessages = {
      card_declined: 'Your card was declined. Please try another card.',
      insufficient_funds: 'Insufficient funds. Please try another card.',
      expired_card: 'Your card has expired. Please use a different card.',
      incorrect_cvc: 'The CVC code is incorrect.',
      processing_error: 'An error occurred processing your card. Please try again.',
      rate_limit: 'Too many attempts. Please wait a moment and try again.',
    };

    const errorMessage =
      errorMessages[error.code] || error.message || 'Payment failed. Please try again.';

    setState((prev) => ({
      ...prev,
      error: errorMessage,
      currentStep: 'error',
      isLoading: false,
    }));
  }, []);

  /**
   * Reset checkout state
   */
  const reset = useCallback(() => {
    setState({
      currentStep: 'selection',
      classData: null,
      children: [],
      selectedChildId: null,
      paymentMethod: 'full',
      installmentPlan: null,
      orderId: null,
      orderTotal: 0,
      appliedDiscount: null,
      discountCode: '',
      clientSecret: null,
      paymentIntentId: null,
      isLoading: false,
      error: null,
      hasCapacity: true,
    });
  }, []);

  return {
    // State
    ...state,

    // Methods
    initializeCheckout,
    selectChild,
    selectPaymentMethod,
    selectInstallmentPlan,
    applyDiscount,
    removeDiscount,
    createOrder,
    initiatePayment,
    confirmPayment,
    handlePaymentError,
    reset,
  };
};

export default useCheckoutFlow;

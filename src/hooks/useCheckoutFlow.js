/**
 * useCheckoutFlow Hook
 * Manages the complete checkout flow state and business logic for class enrollment
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import classesService from "../api/services/classes.service";
import childrenService from "../api/services/children.service";
import ordersService from "../api/services/orders.service";
import paymentsService from "../api/services/payments.service";
import enrollmentsService from "../api/services/enrollments.service";
import discountsService from "../api/services/discounts.service";

/**
 * Build an appliedDiscount object from an OrderResponse.
 * OrderResponse has discount_total (number) and line_items with discount_description/discount_amount.
 */
function buildDiscountFromOrder(order, code) {
  if (!order.discount_total || parseFloat(order.discount_total) <= 0) {
    return null;
  }

  // Try to extract discount type/value from the first line item's discount_description
  // e.g. "20% off (CODE123)" or "$10 off (CODE123)"
  const lineItem = order.line_items?.find(
    (item) => item.discount_amount && parseFloat(item.discount_amount) > 0,
  );

  let type = "fixed_amount";
  let value = parseFloat(order.discount_total);

  if (lineItem?.discount_description) {
    const percentMatch =
      lineItem.discount_description.match(/(\d+(?:\.\d+)?)%/);
    const fixedMatch = lineItem.discount_description.match(/\$(\d+(?:\.\d+)?)/);
    if (percentMatch) {
      type = "percentage";
      value = parseFloat(percentMatch[1]);
    } else if (fixedMatch) {
      type = "fixed_amount";
      value = parseFloat(fixedMatch[1]);
    }
  }

  return { code, type, value };
}

export const useCheckoutFlow = () => {
  const navigate = useNavigate();

  // Refs to track if we're already processing to prevent duplicate calls
  const isCreatingOrder = useRef(false);
  const isCreatingPayment = useRef(false);

  // Refs to track if we've had errors to prevent retry bombardment
  const orderCreationFailed = useRef(false);
  const paymentCreationFailed = useRef(false);

  // State
  const [state, setState] = useState({
    // Step tracking
    currentStep: "selection", // 'selection' | 'payment' | 'processing' | 'success' | 'error'

    // Data
    classData: null,
    children: [],
    selectedChildId: null, // Keep for backward compatibility
    selectedChildIds: [], // NEW: Support multiple children selection

    // Sibling discount preview
    siblingDiscountPreview: null, // NEW: Store calculated sibling discounts

    // Custom fee selections per child: { [childId]: [0, 2] } (indices of selected optional fees)
    selectedFeesByChild: {},

    // Classroom / Teacher (optional free-text)
    classroomTeacher: "",

    // Payment
    paymentMethod: "full", // 'full' | 'subscribe' | 'installments'
    installmentPlan: null,

    // Order
    orderId: null,
    orderTotal: 0,
    appliedDiscount: null,
    discountCode: "",
    orderData: null,
    enrollmentData: null,

    // Stripe
    clientSecret: null,
    paymentIntentId: null,

    // Status
    isLoading: false,
    loading: false,
    error: null,
    hasCapacity: true,
    paymentSucceeded: false,
  });

  /**
   * Initialize checkout - fetch class details, children, and check capacity
   */
  const initializeCheckout = useCallback(async (classId) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      loading: true,
      error: null,
    }));

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
        loading: false,
      }));
    } catch (error) {
      console.error("❌ Failed to initialize checkout:", error);
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to load checkout data",
        isLoading: false,
        loading: false,
      }));
    }
  }, []);

  /**
   * Select a child for enrollment (single selection - backward compatible)
   */
  const selectChild = useCallback((childId) => {
    setState((prev) => ({
      ...prev,
      selectedChildId: childId,
      selectedChildIds: [childId], // Also update the array for consistency
    }));
  }, []);

  /**
   * Toggle child selection (multi-select mode)
   */
  const toggleChildSelection = useCallback((childId) => {
    // Reset creation flags to allow new order creation
    isCreatingOrder.current = false;
    isCreatingPayment.current = false;
    orderCreationFailed.current = false;
    paymentCreationFailed.current = false;

    setState((prev) => {
      const currentIds = prev.selectedChildIds || [];
      const isSelected = currentIds.includes(childId);

      let newSelectedIds;
      if (isSelected) {
        // Remove child from selection
        newSelectedIds = currentIds.filter((id) => id !== childId);
      } else {
        // Add child to selection
        newSelectedIds = [...currentIds, childId];
      }

      return {
        ...prev,
        selectedChildIds: newSelectedIds,
        // Update single selection for backward compatibility (use first selected)
        selectedChildId: newSelectedIds.length > 0 ? newSelectedIds[0] : null,
        // Reset order when selection changes - forces new order with all children
        orderId: null,
        clientSecret: null,
        siblingDiscountPreview: null,
        selectedFeesByChild: {},
        isLoading: false,
      };
    });
  }, []);

  /**
   * Toggle a custom fee selection for a specific child
   */
  const toggleCustomFee = useCallback((childId, feeIndex) => {
    // Reset creation flags to allow new order creation
    isCreatingOrder.current = false;
    isCreatingPayment.current = false;
    orderCreationFailed.current = false;
    paymentCreationFailed.current = false;

    setState((prev) => {
      const currentFees = prev.selectedFeesByChild[childId] || [];
      const isSelected = currentFees.includes(feeIndex);
      const newFees = isSelected
        ? currentFees.filter((i) => i !== feeIndex)
        : [...currentFees, feeIndex];

      return {
        ...prev,
        selectedFeesByChild: {
          ...prev.selectedFeesByChild,
          [childId]: newFees,
        },
        // Reset order when fee selection changes
        orderId: null,
        clientSecret: null,
        siblingDiscountPreview: null,
      };
    });
  }, []);

  /**
   * Select payment method
   */
  const selectPaymentMethod = useCallback((method) => {
    setState((prev) => ({
      ...prev,
      paymentMethod: method,
      installmentPlan: method !== "installments" ? null : prev.installmentPlan,
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
  const applyDiscount = useCallback(
    async (code) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Validate the discount code via API
        const result = await discountsService.validate({ code });

        if (!result.is_valid) {
          throw new Error(result.error_message || "Invalid discount code");
        }

        // Store validated discount info
        setState((prev) => ({
          ...prev,
          discountCode: code,
          appliedDiscount: {
            code,
            type: result.discount_type,
            value: parseFloat(result.discount_value),
          },
          // Reset order so it gets recreated with the discount code
          orderId: prev.orderId ? null : prev.orderId,
          clientSecret: prev.orderId ? null : prev.clientSecret,
          isLoading: false,
        }));

        // Reset creation flags so order can be recreated with discount
        if (state.orderId) {
          isCreatingOrder.current = false;
          isCreatingPayment.current = false;
          orderCreationFailed.current = false;
          paymentCreationFailed.current = false;
        }
      } catch (error) {
        console.error("Failed to apply discount:", error);
        setState((prev) => ({
          ...prev,
          error: error.message || "Invalid discount code",
          isLoading: false,
        }));
        throw error; // Re-throw so DiscountCodeInput can show its own error
      }
    },
    [state.orderId],
  );

  /**
   * Remove discount
   */
  const removeDiscount = useCallback(async () => {
    // Clear the discount and reset order so it gets recreated without the code
    setState((prev) => ({
      ...prev,
      appliedDiscount: null,
      discountCode: "",
      // Reset order if it was created with the discount
      orderId: prev.orderId ? null : prev.orderId,
      clientSecret: prev.orderId ? null : prev.clientSecret,
    }));

    // Reset creation flags so order can be recreated
    if (state.orderId) {
      isCreatingOrder.current = false;
      isCreatingPayment.current = false;
      orderCreationFailed.current = false;
      paymentCreationFailed.current = false;
    }
  }, [state.orderId]);

  /**
   * Create order - supports multiple children with sibling discount
   */
  const createOrder = useCallback(async () => {
    const {
      classData,
      selectedChildId,
      selectedChildIds,
      paymentMethod,
      installmentPlan,
      discountCode,
    } = state;

    // Use selectedChildIds if available, otherwise fall back to single selectedChildId
    const childIdsToEnroll =
      selectedChildIds?.length > 0
        ? selectedChildIds
        : selectedChildId
          ? [selectedChildId]
          : [];

    console.log("[DEBUG] createOrder called");
    console.log("[DEBUG] selectedChildIds:", selectedChildIds);
    console.log("[DEBUG] childIdsToEnroll:", childIdsToEnroll);

    if (!classData || childIdsToEnroll.length === 0) {
      setState((prev) => ({
        ...prev,
        error: "Please select at least one child to enroll",
      }));
      return null;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Build items array for all selected children (with optional fee selections)
      const items = childIdsToEnroll.map((childId) => {
        const item = {
          class_id: classData.id,
          child_id: childId,
          amount: classData.base_price || classData.price,
          selected_optional_fee_indices:
            state.selectedFeesByChild[childId] || [],
        };
        if (state.classroomTeacher?.trim()) {
          item.classroom_teacher = state.classroomTeacher.trim();
        }
        return item;
      });

      console.log("[DEBUG] Creating order with items:", items);
      console.log("[DEBUG] Items count:", items.length);

      const orderData = {
        items,
        payment_plan: paymentMethod,
      };

      if (discountCode) {
        orderData.discount_code = discountCode;
      }

      if (paymentMethod === "installments" && installmentPlan) {
        orderData.installments_count = installmentPlan.count;
      }

      const order = await ordersService.create(orderData);

      console.log("[DEBUG] Order created:", order.id);
      console.log(
        "[DEBUG] Order line_items count:",
        order.line_items?.length || 0,
      );
      console.log("[DEBUG] Order line_items:", order.line_items);

      // Build appliedDiscount from order response fields
      const discountInfo = buildDiscountFromOrder(order, discountCode);

      setState((prev) => ({
        ...prev,
        orderId: order.id,
        orderTotal: order.total,
        appliedDiscount: discountInfo || prev.appliedDiscount,
        // Store line items for sibling discount display
        siblingDiscountPreview: order.line_items || null,
        backendProcessingFee: order.processing_fee || 0,
        isLoading: false,
      }));

      return order;
    } catch (error) {
      console.error("Failed to create order:", error);
      orderCreationFailed.current = true; // Mark as failed to prevent retry bombardment
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to create order",
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

    console.log("[DEBUG] initiatePayment called with orderId:", orderId);

    if (!orderId) {
      setState((prev) => ({ ...prev, error: "Order not created" }));
      return null;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      currentStep: "payment",
    }));

    try {
      let paymentAmount = orderTotal;

      // For installments, only charge the first installment amount
      if (paymentMethod === "installments" && installmentPlan) {
        paymentAmount = installmentPlan.firstPaymentAmount || orderTotal;
      }

      const paymentIntent = await paymentsService.createIntent({
        order_id: orderId,
        amount: paymentAmount,
        payment_method: "card",
      });

      console.log("[DEBUG] Payment created for orderId:", orderId);

      // FREE ORDER: Backend already activated enrollments, skip Stripe
      if (paymentIntent.client_secret === "FREE") {
        console.log(
          "[DEBUG] Free order detected, enrollment activated directly",
        );
        setState((prev) => ({
          ...prev,
          clientSecret: "FREE",
          paymentSucceeded: true,
          currentStep: "success",
          isLoading: false,
        }));
        return paymentIntent;
      }

      // Store the checkout URL in clientSecret
      // IMPORTANT: Only set clientSecret if the orderId hasn't changed during the request
      // This prevents stale payment responses from overwriting newer orders
      setState((prev) => {
        if (prev.orderId !== orderId) {
          console.log(
            "[DEBUG] Order changed during payment creation, ignoring response. Current:",
            prev.orderId,
            "Response for:",
            orderId,
          );
          return prev; // Don't update state, order has changed
        }
        return {
          ...prev,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.payment_intent_id,
          isLoading: false,
        };
      });

      return paymentIntent;
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      // Only mark as failed if this is still the current order
      setState((prev) => {
        if (prev.orderId !== orderId) {
          console.log(
            "[DEBUG] Order changed during payment error, ignoring. Current:",
            prev.orderId,
            "Error for:",
            orderId,
          );
          return prev; // Don't update state, order has changed
        }
        paymentCreationFailed.current = true; // Mark as failed to prevent retry bombardment
        return {
          ...prev,
          error: error.message || "Failed to initiate payment",
          isLoading: false,
        };
      });
      return null;
    }
  }, [state]);

  /**
   * Confirm payment and create enrollment
   */
  const confirmPayment = useCallback(
    async (paymentIntent) => {
      const { classData, selectedChildId, orderId } = state;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        currentStep: "processing",
      }));

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
          currentStep: "success",
          isLoading: false,
        }));

        // Redirect to dashboard with success message
        setTimeout(() => {
          navigate("/dashboard?success=true");
        }, 2000);

        return enrollment;
      } catch (error) {
        console.error("Failed to confirm payment:", error);
        setState((prev) => ({
          ...prev,
          error: error.message || "Payment confirmation failed",
          currentStep: "error",
          isLoading: false,
        }));
        return null;
      }
    },
    [state, navigate],
  );

  /**
   * Handle payment error
   */
  const handlePaymentError = useCallback((error) => {
    console.error("Payment error:", error);

    const errorMessages = {
      card_declined: "Your card was declined. Please try another card.",
      insufficient_funds: "Insufficient funds. Please try another card.",
      expired_card: "Your card has expired. Please use a different card.",
      incorrect_cvc: "The CVC code is incorrect.",
      processing_error:
        "An error occurred processing your card. Please try again.",
      rate_limit: "Too many attempts. Please wait a moment and try again.",
    };

    const errorMessage =
      errorMessages[error.code] ||
      error.message ||
      "Payment failed. Please try again.";

    setState((prev) => ({
      ...prev,
      error: errorMessage,
      currentStep: "error",
      isLoading: false,
    }));
  }, []);

  /**
   * Reset checkout state
   */
  const reset = useCallback(() => {
    // Reset error flags
    orderCreationFailed.current = false;
    paymentCreationFailed.current = false;
    isCreatingOrder.current = false;
    isCreatingPayment.current = false;

    setState({
      currentStep: "selection",
      classData: null,
      children: [],
      selectedChildId: null,
      selectedChildIds: [], // NEW: Reset multi-select array
      siblingDiscountPreview: null, // NEW: Reset sibling discount preview
      selectedFeesByChild: {}, // Reset custom fee selections
      paymentMethod: "full",
      installmentPlan: null,
      orderId: null,
      orderTotal: 0,
      appliedDiscount: null,
      discountCode: "",
      orderData: null,
      enrollmentData: null,
      clientSecret: null,
      paymentIntentId: null,
      isLoading: false,
      loading: false,
      error: null,
      hasCapacity: true,
      paymentSucceeded: false,
    });
  }, []);

  /**
   * Handle successful payment
   */
  const handlePaymentSuccess = useCallback(
    async (paymentIntent) => {
      await confirmPayment(paymentIntent);
    },
    [confirmPayment],
  );

  /**
   * Join waitlist
   */
  const joinWaitlist = useCallback(async () => {
    // TODO: Implement waitlist functionality
  }, []);

  /**
   * Download receipt
   */
  const downloadReceipt = useCallback(() => {
    // TODO: Implement receipt download
  }, []);

  /**
   * Retry after error
   */
  const retry = useCallback(() => {
    // Reset error flags to allow retry
    orderCreationFailed.current = false;
    paymentCreationFailed.current = false;
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // REMOVED: Auto-create order on child selection
  // Order is now created manually when user clicks "Review Order" button
  // This gives users time to select all children before order creation

  // Auto-create payment intent when order is created
  useEffect(() => {
    const shouldCreatePaymentIntent =
      state.orderId &&
      !state.clientSecret &&
      !state.isLoading &&
      !isCreatingPayment.current &&
      !paymentCreationFailed.current; // Don't retry if payment creation failed

    console.log("[DEBUG] Payment effect check:", {
      orderId: state.orderId,
      clientSecret: !!state.clientSecret,
      isLoading: state.isLoading,
      isCreatingPayment: isCreatingPayment.current,
      paymentCreationFailed: paymentCreationFailed.current,
      shouldCreate: shouldCreatePaymentIntent,
    });

    if (shouldCreatePaymentIntent) {
      console.log(
        "[DEBUG] Starting payment creation for order:",
        state.orderId,
      );
      isCreatingPayment.current = true;
      initiatePayment().finally(() => {
        isCreatingPayment.current = false;
      });
    }
  }, [
    state.orderId,
    state.clientSecret,
    state.isLoading,
    initiatePayment, // Add initiatePayment to ensure we use the latest version
  ]);

  return {
    // State
    ...state,

    // Methods
    initializeCheckout,
    selectChild,
    toggleChildSelection, // NEW: Multi-select support
    toggleCustomFee, // Custom fee selection
    selectPaymentMethod,
    selectInstallmentPlan,
    applyDiscount,
    removeDiscount,
    createOrder,
    initiatePayment,
    confirmPayment,
    handlePaymentError,
    handlePaymentSuccess,
    joinWaitlist,
    downloadReceipt,
    retry,
    reset,
    setClassroomTeacher: (value) =>
      setState((prev) => ({ ...prev, classroomTeacher: value })),
  };
};

export default useCheckoutFlow;

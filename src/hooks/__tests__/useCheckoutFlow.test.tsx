/**
 * Unit Tests for useCheckoutFlow Hook
 * Tests checkout step management, child selection, payment flow, and state reset
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useCheckoutFlow } from '../useCheckoutFlow';

// ==========================================
// MOCK SETUP
// ==========================================

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockClassData = {
  id: 'class-1',
  name: 'Soccer Basics',
  base_price: 150,
  price: 150,
  capacity: 20,
};

const mockChildren = [
  { id: 'child-1', first_name: 'Johnny' },
  { id: 'child-2', first_name: 'Jenny' },
];

const mockClassesService = {
  getById: jest.fn(),
  checkCapacity: jest.fn(),
};

const mockChildrenService = {
  getMy: jest.fn(),
};

const mockOrdersService = {
  create: jest.fn(),
  applyDiscount: jest.fn(),
  removeDiscount: jest.fn(),
};

const mockPaymentsService = {
  createIntent: jest.fn(),
  confirm: jest.fn(),
};

const mockEnrollmentsService = {
  create: jest.fn(),
};

jest.mock('../../api/services/classes.service', () => ({
  __esModule: true,
  default: {
    getById: (...args: unknown[]) => mockClassesService.getById(...args),
    checkCapacity: (...args: unknown[]) => mockClassesService.checkCapacity(...args),
  },
}));

jest.mock('../../api/services/children.service', () => ({
  __esModule: true,
  default: {
    getMy: (...args: unknown[]) => mockChildrenService.getMy(...args),
  },
}));

jest.mock('../../api/services/orders.service', () => ({
  __esModule: true,
  default: {
    create: (...args: unknown[]) => mockOrdersService.create(...args),
    applyDiscount: (...args: unknown[]) => mockOrdersService.applyDiscount(...args),
    removeDiscount: (...args: unknown[]) => mockOrdersService.removeDiscount(...args),
  },
}));

jest.mock('../../api/services/payments.service', () => ({
  __esModule: true,
  default: {
    createIntent: (...args: unknown[]) => mockPaymentsService.createIntent(...args),
    confirm: (...args: unknown[]) => mockPaymentsService.confirm(...args),
  },
}));

jest.mock('../../api/services/enrollments.service', () => ({
  __esModule: true,
  default: {
    create: (...args: unknown[]) => mockEnrollmentsService.create(...args),
  },
}));

// Wrapper with router context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useCheckoutFlow Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClassesService.getById.mockResolvedValue(mockClassData);
    mockClassesService.checkCapacity.mockResolvedValue({ available: true });
    mockChildrenService.getMy.mockResolvedValue(mockChildren);
    mockOrdersService.create.mockResolvedValue({
      id: 'order-1',
      total: 150,
      discount: null,
      line_items: [],
    });
    mockPaymentsService.createIntent.mockResolvedValue({
      client_secret: 'pi_secret_123',
      payment_intent_id: 'pi_123',
    });
    mockPaymentsService.confirm.mockResolvedValue({ success: true });
    mockEnrollmentsService.create.mockResolvedValue({
      id: 'enroll-1',
      status: 'active',
    });
  });

  // ===========================================
  // INITIAL STATE TESTS
  // ===========================================

  describe('Initial State', () => {
    it('should have default state values', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      expect(result.current.currentStep).toBe('selection');
      expect(result.current.classData).toBeNull();
      expect(result.current.children).toEqual([]);
      expect(result.current.selectedChildId).toBeNull();
      expect(result.current.selectedChildIds).toEqual([]);
      expect(result.current.paymentMethod).toBe('full');
      expect(result.current.orderId).toBeNull();
      expect(result.current.clientSecret).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.hasCapacity).toBe(true);
      expect(result.current.paymentSucceeded).toBe(false);
    });
  });

  // ===========================================
  // INITIALIZE CHECKOUT TESTS
  // ===========================================

  describe('initializeCheckout', () => {
    it('should fetch class data, children, and capacity', async () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      await act(async () => {
        await result.current.initializeCheckout('class-1');
      });

      expect(mockClassesService.getById).toHaveBeenCalledWith('class-1');
      expect(mockChildrenService.getMy).toHaveBeenCalled();
      expect(mockClassesService.checkCapacity).toHaveBeenCalledWith('class-1');

      expect(result.current.classData).toEqual(mockClassData);
      expect(result.current.children).toEqual(mockChildren);
      expect(result.current.hasCapacity).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set hasCapacity to false when class is full', async () => {
      mockClassesService.checkCapacity.mockResolvedValue({ available: false });
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      await act(async () => {
        await result.current.initializeCheckout('class-1');
      });

      expect(result.current.hasCapacity).toBe(false);
    });

    it('should set error on initialization failure', async () => {
      mockClassesService.getById.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      await act(async () => {
        await result.current.initializeCheckout('class-1');
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ===========================================
  // CHILD SELECTION TESTS
  // ===========================================

  describe('selectChild (single)', () => {
    it('should set selectedChildId and selectedChildIds', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.selectChild('child-1');
      });

      expect(result.current.selectedChildId).toBe('child-1');
      expect(result.current.selectedChildIds).toEqual(['child-1']);
    });
  });

  describe('toggleChildSelection (multi)', () => {
    it('should add child to selection', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.toggleChildSelection('child-1');
      });

      expect(result.current.selectedChildIds).toEqual(['child-1']);
      expect(result.current.selectedChildId).toBe('child-1');
    });

    it('should remove child from selection on second toggle', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.toggleChildSelection('child-1');
      });
      act(() => {
        result.current.toggleChildSelection('child-1');
      });

      expect(result.current.selectedChildIds).toEqual([]);
      expect(result.current.selectedChildId).toBeNull();
    });

    it('should support multi-child selection', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.toggleChildSelection('child-1');
      });
      act(() => {
        result.current.toggleChildSelection('child-2');
      });

      expect(result.current.selectedChildIds).toEqual(['child-1', 'child-2']);
      // First selected is backward-compatible single
      expect(result.current.selectedChildId).toBe('child-1');
    });

    it('should reset order state when selection changes', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.toggleChildSelection('child-1');
      });

      // orderId and clientSecret should be reset
      expect(result.current.orderId).toBeNull();
      expect(result.current.clientSecret).toBeNull();
    });
  });

  // ===========================================
  // PAYMENT METHOD SELECTION TESTS
  // ===========================================

  describe('selectPaymentMethod', () => {
    it('should update payment method', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.selectPaymentMethod('subscribe');
      });

      expect(result.current.paymentMethod).toBe('subscribe');
    });

    it('should clear installment plan when switching away from installments', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.selectPaymentMethod('installments');
        result.current.selectInstallmentPlan({ count: 3, firstPaymentAmount: 50 });
      });

      act(() => {
        result.current.selectPaymentMethod('full');
      });

      expect(result.current.installmentPlan).toBeNull();
    });
  });

  describe('selectInstallmentPlan', () => {
    it('should set installment plan', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      const plan = { count: 3, firstPaymentAmount: 50 };
      act(() => {
        result.current.selectInstallmentPlan(plan);
      });

      expect(result.current.installmentPlan).toEqual(plan);
    });
  });

  // ===========================================
  // CUSTOM FEE SELECTION TESTS
  // ===========================================

  describe('toggleCustomFee', () => {
    it('should add a fee selection for a child', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.toggleCustomFee('child-1', 0);
      });

      expect(result.current.selectedFeesByChild).toEqual({ 'child-1': [0] });
    });

    it('should remove a fee selection on second toggle', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.toggleCustomFee('child-1', 0);
      });
      act(() => {
        result.current.toggleCustomFee('child-1', 0);
      });

      expect(result.current.selectedFeesByChild).toEqual({ 'child-1': [] });
    });

    it('should support multiple fee selections per child', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.toggleCustomFee('child-1', 0);
      });
      act(() => {
        result.current.toggleCustomFee('child-1', 2);
      });

      expect(result.current.selectedFeesByChild).toEqual({ 'child-1': [0, 2] });
    });
  });

  // ===========================================
  // CREATE ORDER TESTS
  // ===========================================

  describe('createOrder', () => {
    it('should create order with selected children', async () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      // Initialize and select a child
      await act(async () => {
        await result.current.initializeCheckout('class-1');
      });
      act(() => {
        result.current.toggleChildSelection('child-1');
      });

      let order: unknown;
      await act(async () => {
        order = await result.current.createOrder();
      });

      expect(order).toBeDefined();
      expect(mockOrdersService.create).toHaveBeenCalled();
      expect(result.current.orderId).toBe('order-1');
      expect(result.current.orderTotal).toBe(150);
    });

    it('should return null and set error when no child is selected', async () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      await act(async () => {
        await result.current.initializeCheckout('class-1');
      });

      let order: unknown;
      await act(async () => {
        order = await result.current.createOrder();
      });

      expect(order).toBeNull();
      expect(result.current.error).toBe('Please select at least one child to enroll');
    });

    it('should handle order creation failure', async () => {
      mockOrdersService.create.mockRejectedValue(new Error('Order failed'));
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      await act(async () => {
        await result.current.initializeCheckout('class-1');
      });
      act(() => {
        result.current.toggleChildSelection('child-1');
      });

      let order: unknown;
      await act(async () => {
        order = await result.current.createOrder();
      });

      expect(order).toBeNull();
      expect(result.current.error).toBe('Order failed');
    });
  });

  // ===========================================
  // DISCOUNT TESTS
  // ===========================================

  describe('applyDiscount', () => {
    it('should store discount code when no order exists yet', async () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      await act(async () => {
        await result.current.applyDiscount('SAVE10');
      });

      expect(result.current.discountCode).toBe('SAVE10');
      expect(mockOrdersService.applyDiscount).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // PAYMENT ERROR HANDLING TESTS
  // ===========================================

  describe('handlePaymentError', () => {
    it('should set error for card_declined', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.handlePaymentError({ code: 'card_declined', message: '' });
      });

      expect(result.current.error).toBe('Your card was declined. Please try another card.');
      expect(result.current.currentStep).toBe('error');
    });

    it('should set error for insufficient_funds', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.handlePaymentError({ code: 'insufficient_funds', message: '' });
      });

      expect(result.current.error).toBe('Insufficient funds. Please try another card.');
    });

    it('should set error for expired_card', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.handlePaymentError({ code: 'expired_card', message: '' });
      });

      expect(result.current.error).toBe('Your card has expired. Please use a different card.');
    });

    it('should use generic message for unknown error codes', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.handlePaymentError({ code: 'unknown', message: 'Something bad' });
      });

      expect(result.current.error).toBe('Something bad');
    });

    it('should fallback to default message when no message is provided', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      act(() => {
        result.current.handlePaymentError({ code: 'unknown' });
      });

      expect(result.current.error).toBe('Payment failed. Please try again.');
    });
  });

  // ===========================================
  // RESET TESTS
  // ===========================================

  describe('reset', () => {
    it('should reset all state to defaults', async () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      // Modify some state
      await act(async () => {
        await result.current.initializeCheckout('class-1');
      });
      act(() => {
        result.current.selectChild('child-1');
      });
      act(() => {
        result.current.selectPaymentMethod('installments');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentStep).toBe('selection');
      expect(result.current.classData).toBeNull();
      expect(result.current.children).toEqual([]);
      expect(result.current.selectedChildId).toBeNull();
      expect(result.current.selectedChildIds).toEqual([]);
      expect(result.current.paymentMethod).toBe('full');
      expect(result.current.orderId).toBeNull();
      expect(result.current.clientSecret).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.paymentSucceeded).toBe(false);
    });
  });

  // ===========================================
  // RETRY TESTS
  // ===========================================

  describe('retry', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      // Set an error
      act(() => {
        result.current.handlePaymentError({ code: 'card_declined', message: '' });
      });
      expect(result.current.error).toBeTruthy();

      // Retry
      act(() => {
        result.current.retry();
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ===========================================
  // RETURN VALUE STRUCTURE TESTS
  // ===========================================

  describe('Return Values', () => {
    it('should return all expected methods and state', () => {
      const { result } = renderHook(() => useCheckoutFlow(), { wrapper });

      // State values
      expect(result.current).toHaveProperty('currentStep');
      expect(result.current).toHaveProperty('classData');
      expect(result.current).toHaveProperty('children');
      expect(result.current).toHaveProperty('selectedChildId');
      expect(result.current).toHaveProperty('selectedChildIds');
      expect(result.current).toHaveProperty('selectedFeesByChild');
      expect(result.current).toHaveProperty('paymentMethod');
      expect(result.current).toHaveProperty('orderId');
      expect(result.current).toHaveProperty('clientSecret');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('hasCapacity');

      // Methods
      expect(typeof result.current.initializeCheckout).toBe('function');
      expect(typeof result.current.selectChild).toBe('function');
      expect(typeof result.current.toggleChildSelection).toBe('function');
      expect(typeof result.current.toggleCustomFee).toBe('function');
      expect(typeof result.current.selectPaymentMethod).toBe('function');
      expect(typeof result.current.selectInstallmentPlan).toBe('function');
      expect(typeof result.current.applyDiscount).toBe('function');
      expect(typeof result.current.removeDiscount).toBe('function');
      expect(typeof result.current.createOrder).toBe('function');
      expect(typeof result.current.initiatePayment).toBe('function');
      expect(typeof result.current.confirmPayment).toBe('function');
      expect(typeof result.current.handlePaymentError).toBe('function');
      expect(typeof result.current.handlePaymentSuccess).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.retry).toBe('function');
    });
  });
});

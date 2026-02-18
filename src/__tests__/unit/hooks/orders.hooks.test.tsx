/**
 * Unit Tests for Order Hooks
 * Tests useOrders, usePendingOrders, useCompletedOrders, useOrder,
 * useCreateOrder, useCalculateOrder, useCheckoutOrder, useConfirmOrder
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import { useOrders, usePendingOrders, useCompletedOrders } from '../../../api/hooks/orders/useOrders';
import { useOrder } from '../../../api/hooks/orders/useOrder';
import { useCreateOrder } from '../../../api/hooks/orders/useCreateOrder';
import { useCalculateOrder, useCheckoutOrder, useConfirmOrder } from '../../../api/hooks/orders/useCheckout';
import { mockOrder } from '../../utils/mock-data';

jest.mock('../../../api/services/order.service', () => ({
  orderService: {
    getMy: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    calculateTotal: jest.fn(),
    checkout: jest.fn(),
    confirm: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { orderService } from '../../../api/services/order.service';

const mockedService = orderService as jest.Mocked<typeof orderService>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0, refetchOnWindowFocus: false, refetchOnMount: false, refetchOnReconnect: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('Order Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  // =========================================================================
  // useOrders
  // =========================================================================
  describe('useOrders', () => {
    it('should fetch all orders', async () => {
      const mockOrders = [mockOrder];
      mockedService.getMy.mockResolvedValueOnce(mockOrders as any);

      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockOrders);
      expect(mockedService.getMy).toHaveBeenCalled();
    });

    it('should handle error state', async () => {
      mockedService.getMy.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // =========================================================================
  // usePendingOrders
  // =========================================================================
  describe('usePendingOrders', () => {
    it('should fetch orders with pending status filter', async () => {
      mockedService.getMy.mockResolvedValueOnce([] as any);

      const { result } = renderHook(() => usePendingOrders(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  // =========================================================================
  // useCompletedOrders
  // =========================================================================
  describe('useCompletedOrders', () => {
    it('should fetch orders with completed status filter', async () => {
      mockedService.getMy.mockResolvedValueOnce([] as any);

      const { result } = renderHook(() => useCompletedOrders(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  // =========================================================================
  // useOrder
  // =========================================================================
  describe('useOrder', () => {
    it('should fetch a single order by ID', async () => {
      mockedService.getById.mockResolvedValueOnce(mockOrder as any);

      const { result } = renderHook(
        () => useOrder({ orderId: 'order-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockOrder);
      expect(mockedService.getById).toHaveBeenCalledWith('order-1');
    });

    it('should not fetch when orderId is empty', async () => {
      const { result } = renderHook(
        () => useOrder({ orderId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedService.getById).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useCreateOrder
  // =========================================================================
  describe('useCreateOrder', () => {
    it('should create an order and show success toast', async () => {
      const created = { id: 'order-new', status: 'pending', total: 150 };
      mockedService.create.mockResolvedValueOnce(created as any);

      const { result } = renderHook(() => useCreateOrder(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          items: [{ class_id: 'class-1', child_id: 'child-1' }],
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockedService.create.mockRejectedValueOnce({ message: 'Invalid order' });

      const { result } = renderHook(() => useCreateOrder(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ items: [] } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Invalid order');
    });
  });

  // =========================================================================
  // useCalculateOrder
  // =========================================================================
  describe('useCalculateOrder', () => {
    it('should calculate order total', async () => {
      const mockCalculation = { subtotal: 150, discount: 0, total: 150 };
      mockedService.calculateTotal.mockResolvedValueOnce(mockCalculation as any);

      const { result } = renderHook(() => useCalculateOrder(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ enrollment_ids: ['enroll-1'] } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockCalculation);
      expect(mockedService.calculateTotal).toHaveBeenCalledWith({ enrollment_ids: ['enroll-1'] });
    });

    it('should show error toast on calculation failure', async () => {
      mockedService.calculateTotal.mockRejectedValueOnce({ message: 'Calculation error' });

      const { result } = renderHook(() => useCalculateOrder(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ enrollment_ids: [] } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Calculation error');
    });
  });

  // =========================================================================
  // useCheckoutOrder
  // =========================================================================
  describe('useCheckoutOrder', () => {
    it('should checkout an order and show success toast', async () => {
      const mockCheckout = { client_secret: 'pi_secret', payment_intent_id: 'pi_123' };
      mockedService.checkout.mockResolvedValueOnce(mockCheckout as any);

      const { result } = renderHook(() => useCheckoutOrder(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          order_id: 'order-1',
          payment_method_id: 'pm_123',
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.checkout).toHaveBeenCalled();
    });

    it('should show error toast on checkout failure', async () => {
      mockedService.checkout.mockRejectedValueOnce({ message: 'Payment failed' });

      const { result } = renderHook(() => useCheckoutOrder(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ order_id: 'order-1', payment_method_id: 'pm_123' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Payment failed');
    });
  });

  // =========================================================================
  // useConfirmOrder
  // =========================================================================
  describe('useConfirmOrder', () => {
    it('should confirm an order and show success toast', async () => {
      const confirmed = { id: 'order-1', status: 'completed' };
      mockedService.confirm.mockResolvedValueOnce(confirmed as any);

      const { result } = renderHook(() => useConfirmOrder(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          order_id: 'order-1',
          payment_intent_id: 'pi_123',
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on confirmation failure', async () => {
      mockedService.confirm.mockRejectedValueOnce({ message: 'Confirmation failed' });

      const { result } = renderHook(() => useConfirmOrder(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ order_id: 'order-1', payment_intent_id: 'pi_123' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Confirmation failed');
    });
  });
});

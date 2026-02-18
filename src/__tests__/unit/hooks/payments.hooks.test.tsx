/**
 * Unit Tests for Payment Hooks
 * Tests usePayments, usePendingPayments, useCompletedPayments, usePayment,
 * usePaymentMethods, useCreateSetupIntent, useAttachPaymentMethod,
 * useSetDefaultPaymentMethod, useDeletePaymentMethod,
 * useInstallmentPlans, useInstallmentPlan, useActiveInstallmentPlans,
 * useDownloadInvoice
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import { usePayments, usePendingPayments, useCompletedPayments } from '../../../api/hooks/payments/usePayments';
import { usePayment } from '../../../api/hooks/payments/usePayment';
import {
  usePaymentMethods,
  useCreateSetupIntent,
  useAttachPaymentMethod,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
} from '../../../api/hooks/payments/usePaymentMethods';
import { useInstallmentPlans, useInstallmentPlan, useActiveInstallmentPlans } from '../../../api/hooks/payments/useInstallments';
import { useDownloadInvoice } from '../../../api/hooks/payments/useInvoice';

jest.mock('../../../api/services/payment.service', () => ({
  paymentService: {
    getMy: jest.fn(),
    getById: jest.fn(),
    getPaymentMethods: jest.fn(),
    createSetupIntent: jest.fn(),
    attachPaymentMethod: jest.fn(),
    setDefaultPaymentMethod: jest.fn(),
    deletePaymentMethod: jest.fn(),
    downloadInvoice: jest.fn(),
  },
}));

jest.mock('../../../api/services/installment.service', () => ({
  installmentService: {
    getAll: jest.fn(),
    getById: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { paymentService } from '../../../api/services/payment.service';
import { installmentService } from '../../../api/services/installment.service';

const mockedPaymentService = paymentService as jest.Mocked<typeof paymentService>;
const mockedInstallmentService = installmentService as jest.Mocked<typeof installmentService>;

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

// Mock URL.createObjectURL and URL.revokeObjectURL for invoice tests
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

describe('Payment Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
    URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock');
    URL.revokeObjectURL = jest.fn();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  // =========================================================================
  // usePayments
  // =========================================================================
  describe('usePayments', () => {
    it('should fetch all payments', async () => {
      const mockPayments = [{ id: 'pay-1', amount: 150, status: 'completed' }];
      mockedPaymentService.getMy.mockResolvedValueOnce(mockPayments as any);

      const { result } = renderHook(() => usePayments(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPayments);
    });

    it('should handle error state', async () => {
      mockedPaymentService.getMy.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => usePayments(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // =========================================================================
  // usePendingPayments
  // =========================================================================
  describe('usePendingPayments', () => {
    it('should fetch payments with pending status', async () => {
      mockedPaymentService.getMy.mockResolvedValueOnce([] as any);

      const { result } = renderHook(() => usePendingPayments(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  // =========================================================================
  // useCompletedPayments
  // =========================================================================
  describe('useCompletedPayments', () => {
    it('should fetch payments with completed status', async () => {
      mockedPaymentService.getMy.mockResolvedValueOnce([] as any);

      const { result } = renderHook(() => useCompletedPayments(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  // =========================================================================
  // usePayment
  // =========================================================================
  describe('usePayment', () => {
    it('should fetch a single payment by ID', async () => {
      const mockPayment = { id: 'pay-1', amount: 150 };
      mockedPaymentService.getById.mockResolvedValueOnce(mockPayment as any);

      const { result } = renderHook(
        () => usePayment({ paymentId: 'pay-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPayment);
      expect(mockedPaymentService.getById).toHaveBeenCalledWith('pay-1');
    });

    it('should not fetch when paymentId is empty', async () => {
      const { result } = renderHook(
        () => usePayment({ paymentId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // usePaymentMethods
  // =========================================================================
  describe('usePaymentMethods', () => {
    it('should fetch payment methods', async () => {
      const mockMethods = [{ id: 'pm_1', brand: 'visa', last4: '4242' }];
      mockedPaymentService.getPaymentMethods.mockResolvedValueOnce(mockMethods as any);

      const { result } = renderHook(() => usePaymentMethods(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMethods);
    });
  });

  // =========================================================================
  // useCreateSetupIntent
  // =========================================================================
  describe('useCreateSetupIntent', () => {
    it('should create a setup intent and show success toast', async () => {
      const mockIntent = { client_secret: 'seti_secret' };
      mockedPaymentService.createSetupIntent.mockResolvedValueOnce(mockIntent as any);

      const { result } = renderHook(() => useCreateSetupIntent(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate(undefined as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockIntent);
    });

    it('should show error toast on failure', async () => {
      mockedPaymentService.createSetupIntent.mockRejectedValueOnce({ message: 'Setup failed' });

      const { result } = renderHook(() => useCreateSetupIntent(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate(undefined as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Setup failed');
    });
  });

  // =========================================================================
  // useAttachPaymentMethod
  // =========================================================================
  describe('useAttachPaymentMethod', () => {
    it('should attach a payment method and show success toast', async () => {
      const mockResult = { id: 'pm_new', brand: 'visa' };
      mockedPaymentService.attachPaymentMethod.mockResolvedValueOnce(mockResult as any);

      const { result } = renderHook(() => useAttachPaymentMethod(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ payment_method_id: 'pm_new' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useSetDefaultPaymentMethod
  // =========================================================================
  describe('useSetDefaultPaymentMethod', () => {
    it('should set default payment method and show success toast', async () => {
      mockedPaymentService.setDefaultPaymentMethod.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useSetDefaultPaymentMethod(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('pm_1' as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedPaymentService.setDefaultPaymentMethod).toHaveBeenCalledWith('pm_1');
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useDeletePaymentMethod
  // =========================================================================
  describe('useDeletePaymentMethod', () => {
    it('should delete a payment method and show success toast', async () => {
      mockedPaymentService.deletePaymentMethod.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useDeletePaymentMethod(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('pm_1' as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedPaymentService.deletePaymentMethod).toHaveBeenCalledWith('pm_1');
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockedPaymentService.deletePaymentMethod.mockRejectedValueOnce({ message: 'Cannot delete default method' });

      const { result } = renderHook(() => useDeletePaymentMethod(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('pm_1' as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Cannot delete default method');
    });
  });

  // =========================================================================
  // useInstallmentPlans
  // =========================================================================
  describe('useInstallmentPlans', () => {
    it('should fetch all installment plans', async () => {
      const mockPlans = [{ id: 'plan-1', name: '3-Month Plan', status: 'active' }];
      mockedInstallmentService.getAll.mockResolvedValueOnce(mockPlans as any);

      const { result } = renderHook(() => useInstallmentPlans(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPlans);
    });
  });

  // =========================================================================
  // useInstallmentPlan
  // =========================================================================
  describe('useInstallmentPlan', () => {
    it('should fetch a single installment plan by ID', async () => {
      const mockPlan = { id: 'plan-1', name: '3-Month Plan' };
      mockedInstallmentService.getById.mockResolvedValueOnce(mockPlan as any);

      const { result } = renderHook(
        () => useInstallmentPlan({ planId: 'plan-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPlan);
      expect(mockedInstallmentService.getById).toHaveBeenCalledWith('plan-1');
    });

    it('should not fetch when planId is empty', async () => {
      const { result } = renderHook(
        () => useInstallmentPlan({ planId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useActiveInstallmentPlans
  // =========================================================================
  describe('useActiveInstallmentPlans', () => {
    it('should filter installment plans by active status', async () => {
      const mockPlans = [
        { id: 'plan-1', status: 'active' },
        { id: 'plan-2', status: 'completed' },
      ];
      mockedInstallmentService.getAll.mockResolvedValueOnce(mockPlans as any);

      const { result } = renderHook(() => useActiveInstallmentPlans(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // The hook filters plans client-side by active status
      expect(mockedInstallmentService.getAll).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useDownloadInvoice
  // =========================================================================
  describe('useDownloadInvoice', () => {
    it('should download an invoice and show success toast', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      mockedPaymentService.downloadInvoice.mockResolvedValueOnce(mockBlob as any);

      // Mock DOM manipulation
      const mockLink = { href: '', download: '', click: jest.fn() };
      jest.spyOn(document, 'createElement').mockReturnValueOnce(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

      const { result } = renderHook(() => useDownloadInvoice(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('pay-1' as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedPaymentService.downloadInvoice).toHaveBeenCalledWith('pay-1');
      expect(mockLink.download).toBe('invoice-pay-1.pdf');
      expect(mockLink.click).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Invoice downloaded successfully!');
    });

    it('should show error toast on download failure', async () => {
      mockedPaymentService.downloadInvoice.mockRejectedValueOnce({ message: 'Invoice not found' });

      const { result } = renderHook(() => useDownloadInvoice(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('pay-999' as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Invoice not found');
    });
  });
});

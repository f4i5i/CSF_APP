/**
 * Unit Tests for Admin Hooks
 * Tests useClients, useClientDetail, useClassRoster, useDashboardMetrics,
 * useRefunds, usePendingRefunds, useApproveRefund, useRejectRefund, useRevenueReport
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

// Import hooks
import { useClients, useInfiniteClients, useClientDetail, useClassRoster } from '../../../api/hooks/admin/useClients';
import { useDashboardMetrics } from '../../../api/hooks/admin/useDashboardMetrics';
import { useRefunds, usePendingRefunds, useApproveRefund, useRejectRefund } from '../../../api/hooks/admin/useRefunds';
import { useRevenueReport } from '../../../api/hooks/admin/useRevenueReport';

// Mock services
jest.mock('../../../api/services/admin.service', () => ({
  adminService: {
    getClients: jest.fn(),
    getClientDetail: jest.fn(),
    getClassRoster: jest.fn(),
    getDashboardMetrics: jest.fn(),
    getRefunds: jest.fn(),
    approveRefund: jest.fn(),
    rejectRefund: jest.fn(),
    getRevenueReport: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { adminService } from '../../../api/services/admin.service';

const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

// Helper: create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Admin Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  // =========================================================================
  // useClients
  // =========================================================================
  describe('useClients', () => {
    it('should fetch clients successfully', async () => {
      const mockClients = [{ id: 'user-1', name: 'Test User' }];
      mockedAdminService.getClients.mockResolvedValueOnce(mockClients as any);

      const { result } = renderHook(() => useClients(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockClients);
      expect(mockedAdminService.getClients).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters to the service', async () => {
      const filters = { role: 'parent', is_active: true };
      mockedAdminService.getClients.mockResolvedValueOnce([] as any);

      const { result } = renderHook(() => useClients({ filters: filters as any }), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAdminService.getClients).toHaveBeenCalledWith(filters);
    });

    it('should handle error state', async () => {
      mockedAdminService.getClients.mockRejectedValueOnce(new Error('Forbidden'));

      const { result } = renderHook(() => useClients(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  // =========================================================================
  // useClientDetail
  // =========================================================================
  describe('useClientDetail', () => {
    it('should fetch client detail by userId', async () => {
      const mockDetail = { id: 'user-1', email: 'admin@test.com', role: 'PARENT' };
      mockedAdminService.getClientDetail.mockResolvedValueOnce(mockDetail as any);

      const { result } = renderHook(
        () => useClientDetail({ userId: 'user-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockDetail);
      expect(mockedAdminService.getClientDetail).toHaveBeenCalledWith('user-1');
    });

    it('should not fetch when userId is empty', async () => {
      const { result } = renderHook(
        () => useClientDetail({ userId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedAdminService.getClientDetail).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useClassRoster
  // =========================================================================
  describe('useClassRoster', () => {
    it('should fetch class roster by classId', async () => {
      const mockRoster = { class_name: 'Soccer', enrollments: [] };
      mockedAdminService.getClassRoster.mockResolvedValueOnce(mockRoster as any);

      const { result } = renderHook(
        () => useClassRoster({ classId: 'class-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockRoster);
      expect(mockedAdminService.getClassRoster).toHaveBeenCalledWith('class-1');
    });

    it('should not fetch when classId is empty', async () => {
      const { result } = renderHook(
        () => useClassRoster({ classId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedAdminService.getClassRoster).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useDashboardMetrics
  // =========================================================================
  describe('useDashboardMetrics', () => {
    it('should fetch dashboard metrics', async () => {
      const mockMetrics = { total_revenue: 25000, active_enrollments: 150 };
      mockedAdminService.getDashboardMetrics.mockResolvedValueOnce(mockMetrics as any);

      const { result } = renderHook(() => useDashboardMetrics(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMetrics);
    });

    it('should handle error state', async () => {
      mockedAdminService.getDashboardMetrics.mockRejectedValueOnce(new Error('Server Error'));

      const { result } = renderHook(() => useDashboardMetrics(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  // =========================================================================
  // useRefunds
  // =========================================================================
  describe('useRefunds', () => {
    it('should fetch refunds', async () => {
      const mockRefunds = [{ id: 'ref-1', status: 'pending', amount: 100 }];
      mockedAdminService.getRefunds.mockResolvedValueOnce(mockRefunds as any);

      const { result } = renderHook(() => useRefunds(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockRefunds);
    });

    it('should pass filters to service', async () => {
      const filters = { status: 'pending' };
      mockedAdminService.getRefunds.mockResolvedValueOnce([] as any);

      const { result } = renderHook(
        () => useRefunds({ filters: filters as any }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAdminService.getRefunds).toHaveBeenCalledWith(filters);
    });
  });

  // =========================================================================
  // usePendingRefunds
  // =========================================================================
  describe('usePendingRefunds', () => {
    it('should fetch refunds with pending status filter', async () => {
      mockedAdminService.getRefunds.mockResolvedValueOnce([] as any);

      const { result } = renderHook(() => usePendingRefunds(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAdminService.getRefunds).toHaveBeenCalledWith({ status: 'pending' });
    });
  });

  // =========================================================================
  // useApproveRefund
  // =========================================================================
  describe('useApproveRefund', () => {
    it('should approve a refund and show success toast', async () => {
      const mockResult = { id: 'ref-1', status: 'approved' };
      mockedAdminService.approveRefund.mockResolvedValueOnce(mockResult as any);

      const { result } = renderHook(() => useApproveRefund(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('ref-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAdminService.approveRefund).toHaveBeenCalledWith('ref-1');
      expect(toast.success).toHaveBeenCalledWith('Refund approved successfully!');
    });

    it('should show error toast on failure', async () => {
      mockedAdminService.approveRefund.mockRejectedValueOnce({ message: 'Refund not found' });

      const { result } = renderHook(() => useApproveRefund(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('ref-999');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith('Refund not found');
    });
  });

  // =========================================================================
  // useRejectRefund
  // =========================================================================
  describe('useRejectRefund', () => {
    it('should reject a refund with reason and show success toast', async () => {
      const mockResult = { id: 'ref-1', status: 'rejected' };
      mockedAdminService.rejectRefund.mockResolvedValueOnce(mockResult as any);

      const { result } = renderHook(() => useRejectRefund(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ refundId: 'ref-1', reason: 'Outside policy' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAdminService.rejectRefund).toHaveBeenCalledWith('ref-1', 'Outside policy');
      expect(toast.success).toHaveBeenCalledWith('Refund rejected');
    });

    it('should show error toast on failure', async () => {
      mockedAdminService.rejectRefund.mockRejectedValueOnce({ message: 'Server error' });

      const { result } = renderHook(() => useRejectRefund(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ refundId: 'ref-1', reason: 'test' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith('Server error');
    });
  });

  // =========================================================================
  // useRevenueReport
  // =========================================================================
  describe('useRevenueReport', () => {
    it('should fetch revenue report with filters', async () => {
      const mockReport = { total_revenue: 50000, net_revenue: 45000 };
      mockedAdminService.getRevenueReport.mockResolvedValueOnce(mockReport as any);

      const filters = { start_date: '2025-01-01', end_date: '2025-01-31' };
      const { result } = renderHook(
        () => useRevenueReport({ filters: filters as any }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockReport);
      expect(mockedAdminService.getRevenueReport).toHaveBeenCalledWith(filters);
    });

    it('should not fetch when start_date is missing', async () => {
      const filters = { start_date: '', end_date: '2025-01-31' };

      const { result } = renderHook(
        () => useRevenueReport({ filters: filters as any }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedAdminService.getRevenueReport).not.toHaveBeenCalled();
    });

    it('should not fetch when end_date is missing', async () => {
      const filters = { start_date: '2025-01-01', end_date: '' };

      const { result } = renderHook(
        () => useRevenueReport({ filters: filters as any }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedAdminService.getRevenueReport).not.toHaveBeenCalled();
    });
  });
});

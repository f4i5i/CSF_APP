/**
 * Unit Tests for Enrollment Hooks
 * Tests useEnrollments, useActiveEnrollments, useCreateEnrollment,
 * useCancelEnrollment, useTransferEnrollment, usePauseEnrollment, useResumeEnrollment
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import { useEnrollments, useActiveEnrollments } from '../../../api/hooks/enrollments/useEnrollments';
import { useCreateEnrollment } from '../../../api/hooks/enrollments/useCreateEnrollment';
import { useCancelEnrollment } from '../../../api/hooks/enrollments/useCancelEnrollment';
import { useTransferEnrollment } from '../../../api/hooks/enrollments/useTransferEnrollment';
import { usePauseEnrollment } from '../../../api/hooks/enrollments/usePauseEnrollment';
import { useResumeEnrollment } from '../../../api/hooks/enrollments/useResumeEnrollment';
import { mockEnrollment1, mockEnrollments } from '../../utils/mock-data';

jest.mock('../../../api/services/enrollment.service', () => ({
  enrollmentService: {
    getMy: jest.fn(),
    create: jest.fn(),
    cancel: jest.fn(),
    transfer: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { enrollmentService } from '../../../api/services/enrollment.service';

const mockedService = enrollmentService as jest.Mocked<typeof enrollmentService>;

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

describe('Enrollment Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  // =========================================================================
  // useEnrollments
  // =========================================================================
  describe('useEnrollments', () => {
    it('should fetch enrollments', async () => {
      mockedService.getMy.mockResolvedValueOnce(mockEnrollments as any);

      const { result } = renderHook(() => useEnrollments(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockEnrollments);
      expect(mockedService.getMy).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters to the service', async () => {
      const filters = { status: 'active', child_id: 'child-1' };
      mockedService.getMy.mockResolvedValueOnce([] as any);

      renderHook(() => useEnrollments({ filters: filters as any }), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(mockedService.getMy).toHaveBeenCalledWith(filters));
    });

    it('should handle error state', async () => {
      mockedService.getMy.mockRejectedValueOnce(new Error('Fetch failed'));

      const { result } = renderHook(() => useEnrollments(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // =========================================================================
  // useActiveEnrollments
  // =========================================================================
  describe('useActiveEnrollments', () => {
    it('should fetch enrollments with active status filter', async () => {
      mockedService.getMy.mockResolvedValueOnce([] as any);

      const { result } = renderHook(() => useActiveEnrollments(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.getMy).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ACTIVE' })
      );
    });
  });

  // =========================================================================
  // useCreateEnrollment
  // =========================================================================
  describe('useCreateEnrollment', () => {
    it('should create an enrollment and show success toast', async () => {
      const created = { id: 'enroll-new', status: 'active' };
      mockedService.create.mockResolvedValueOnce(created as any);

      const { result } = renderHook(() => useCreateEnrollment(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          child_id: 'child-1',
          class_id: 'class-1',
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.create).toHaveBeenCalledWith({ child_id: 'child-1', class_id: 'class-1' });
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockedService.create.mockRejectedValueOnce({ message: 'Class is full' });

      const { result } = renderHook(() => useCreateEnrollment(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ child_id: 'child-1', class_id: 'class-1' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Class is full');
    });
  });

  // =========================================================================
  // useCancelEnrollment
  // =========================================================================
  describe('useCancelEnrollment', () => {
    it('should cancel an enrollment and show success toast', async () => {
      const cancelled = { id: 'enroll-1', status: 'cancelled' };
      mockedService.cancel.mockResolvedValueOnce(cancelled as any);

      const { result } = renderHook(() => useCancelEnrollment(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ enrollmentId: 'enroll-1', data: { reason: 'Moving away' } } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockedService.cancel.mockRejectedValueOnce({ message: 'Enrollment not found' });

      const { result } = renderHook(() => useCancelEnrollment(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ enrollmentId: 'enroll-999', data: {} } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Enrollment not found');
    });
  });

  // =========================================================================
  // useTransferEnrollment
  // =========================================================================
  describe('useTransferEnrollment', () => {
    it('should transfer an enrollment and show success toast', async () => {
      const transferred = { id: 'enroll-1', class_id: 'class-2' };
      mockedService.transfer.mockResolvedValueOnce(transferred as any);

      const { result } = renderHook(() => useTransferEnrollment(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          enrollmentId: 'enroll-1',
          data: { target_class_id: 'class-2' },
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockedService.transfer.mockRejectedValueOnce({ message: 'Target class is full' });

      const { result } = renderHook(() => useTransferEnrollment(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          enrollmentId: 'enroll-1',
          data: { target_class_id: 'class-full' },
        } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Target class is full');
    });
  });

  // =========================================================================
  // usePauseEnrollment
  // =========================================================================
  describe('usePauseEnrollment', () => {
    it('should pause an enrollment and show success toast', async () => {
      const paused = { id: 'enroll-1', status: 'paused' };
      mockedService.pause.mockResolvedValueOnce(paused as any);

      const { result } = renderHook(() => usePauseEnrollment(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          enrollmentId: 'enroll-1',
          data: { reason: 'Vacation' },
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useResumeEnrollment
  // =========================================================================
  describe('useResumeEnrollment', () => {
    it('should resume an enrollment and show success toast', async () => {
      const resumed = { id: 'enroll-1', status: 'active' };
      mockedService.resume.mockResolvedValueOnce(resumed as any);

      const { result } = renderHook(() => useResumeEnrollment(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('enroll-1' as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockedService.resume.mockRejectedValueOnce({ message: 'Cannot resume cancelled enrollment' });

      const { result } = renderHook(() => useResumeEnrollment(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('enroll-1' as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Cannot resume cancelled enrollment');
    });
  });
});

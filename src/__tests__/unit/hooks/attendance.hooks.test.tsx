/**
 * Unit Tests for Attendance Hooks
 * Tests useAttendance, useChildAttendance, useClassAttendance,
 * useCheckInStatus, useCheckIn, useBulkCheckIn, useCheckInHistory,
 * useMarkAttendance, useUpdateAttendance, useBulkMarkAttendance,
 * useAttendanceStreak, useAttendanceStats
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import { useAttendance, useChildAttendance, useClassAttendance } from '../../../api/hooks/attendance/useAttendance';
import { useCheckInStatus, useCheckIn, useBulkCheckIn, useCheckInHistory } from '../../../api/hooks/attendance/useCheckIn';
import { useMarkAttendance, useUpdateAttendance, useBulkMarkAttendance } from '../../../api/hooks/attendance/useMarkAttendance';
import { useAttendanceStreak, useAttendanceStats } from '../../../api/hooks/attendance/useAttendanceStreak';

jest.mock('../../../api/services/attendance.service', () => ({
  attendanceService: {
    getAll: jest.fn(),
    getByClass: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
    update: jest.fn(),
    getStreak: jest.fn(),
    getStats: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { attendanceService } from '../../../api/services/attendance.service';

const mockedService = attendanceService as jest.Mocked<typeof attendanceService>;

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

describe('Attendance Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  // =========================================================================
  // useAttendance
  // =========================================================================
  describe('useAttendance', () => {
    it('should fetch attendance records', async () => {
      const mockRecords = [{ id: 'att-1', status: 'present' }];
      mockedService.getAll.mockResolvedValueOnce(mockRecords as any);

      const { result } = renderHook(() => useAttendance(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockRecords);
    });

    it('should pass filters to the service', async () => {
      const filters = { class_id: 'class-1', status: 'present' };
      mockedService.getAll.mockResolvedValueOnce([] as any);

      renderHook(() => useAttendance({ filters: filters as any }), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(mockedService.getAll).toHaveBeenCalledWith(filters));
    });
  });

  // =========================================================================
  // useChildAttendance
  // =========================================================================
  describe('useChildAttendance', () => {
    it('should fetch attendance for a specific child', async () => {
      mockedService.getAll.mockResolvedValueOnce([] as any);

      const { result } = renderHook(() => useChildAttendance('child-1'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.getAll).toHaveBeenCalledWith(expect.objectContaining({ child_id: 'child-1' }));
    });
  });

  // =========================================================================
  // useClassAttendance
  // =========================================================================
  describe('useClassAttendance', () => {
    it('should fetch attendance for a specific class', async () => {
      mockedService.getAll.mockResolvedValueOnce([] as any);

      const { result } = renderHook(() => useClassAttendance('class-1'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.getAll).toHaveBeenCalledWith(expect.objectContaining({ class_id: 'class-1' }));
    });
  });

  // =========================================================================
  // useCheckInStatus
  // =========================================================================
  describe('useCheckInStatus', () => {
    it('should fetch check-in status for a class', async () => {
      const mockStatus = [{ id: 'att-1', status: 'present' }];
      mockedService.getByClass.mockResolvedValueOnce(mockStatus as any);

      const { result } = renderHook(
        () => useCheckInStatus({ classId: 'class-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockStatus);
      expect(mockedService.getByClass).toHaveBeenCalledWith('class-1', { date: undefined });
    });

    it('should not fetch when classId is empty', async () => {
      const { result } = renderHook(
        () => useCheckInStatus({ classId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useCheckIn
  // =========================================================================
  describe('useCheckIn', () => {
    it('should check in a student and show success toast', async () => {
      const mockResult = { id: 'att-1', status: 'present', class_id: 'class-1' };
      mockedService.create.mockResolvedValueOnce(mockResult as any);

      const { result } = renderHook(() => useCheckIn(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          child_id: 'child-1',
          class_id: 'class-1',
          date: '2025-01-15',
          status: 'present',
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalledWith('Checked in successfully!');
    });

    it('should show error toast on failure', async () => {
      mockedService.create.mockRejectedValueOnce({ message: 'Already checked in' });

      const { result } = renderHook(() => useCheckIn(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ child_id: 'child-1', class_id: 'class-1', date: '2025-01-15', status: 'present' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Already checked in');
    });
  });

  // =========================================================================
  // useBulkCheckIn
  // =========================================================================
  describe('useBulkCheckIn', () => {
    it('should bulk check in students and show success toast', async () => {
      const mockResult = { created_count: 5, failed_count: 0 };
      mockedService.bulkCreate.mockResolvedValueOnce(mockResult as any);

      const { result } = renderHook(() => useBulkCheckIn(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ class_id: 'class-1', date: '2025-01-15', records: [] });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalledWith('Successfully checked in 5 student(s)!');
    });
  });

  // =========================================================================
  // useCheckInHistory
  // =========================================================================
  describe('useCheckInHistory', () => {
    it('should fetch check-in history for an enrollment', async () => {
      const mockHistory = [{ id: 'att-1', status: 'present', date: '2025-01-15' }];
      mockedService.getAll.mockResolvedValueOnce(mockHistory as any);

      const { result } = renderHook(
        () => useCheckInHistory({ enrollmentId: 'enroll-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockHistory);
      expect(mockedService.getAll).toHaveBeenCalledWith({ enrollment_id: 'enroll-1' });
    });

    it('should not fetch when enrollmentId is empty', async () => {
      const { result } = renderHook(
        () => useCheckInHistory({ enrollmentId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useMarkAttendance
  // =========================================================================
  describe('useMarkAttendance', () => {
    it('should mark attendance and show success toast', async () => {
      const mockResult = { id: 'att-1', enrollment_id: 'enroll-1', status: 'present' };
      mockedService.create.mockResolvedValueOnce(mockResult as any);

      const { result } = renderHook(() => useMarkAttendance(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          child_id: 'child-1',
          class_id: 'class-1',
          date: '2025-01-15',
          status: 'present',
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalledWith('Attendance marked successfully!');
    });

    it('should show error toast on failure', async () => {
      mockedService.create.mockRejectedValueOnce({ message: 'Invalid data' });

      const { result } = renderHook(() => useMarkAttendance(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ child_id: '', class_id: '', date: '', status: '' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Invalid data');
    });
  });

  // =========================================================================
  // useUpdateAttendance
  // =========================================================================
  describe('useUpdateAttendance', () => {
    it('should update attendance and show success toast', async () => {
      const mockResult = { id: 'att-1', enrollment_id: 'enroll-1', status: 'excused' };
      mockedService.update.mockResolvedValueOnce(mockResult as any);

      const { result } = renderHook(() => useUpdateAttendance(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: 'att-1', data: { status: 'excused' } as any });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.update).toHaveBeenCalledWith('att-1', { status: 'excused' });
      expect(toast.success).toHaveBeenCalledWith('Attendance updated successfully!');
    });
  });

  // =========================================================================
  // useBulkMarkAttendance
  // =========================================================================
  describe('useBulkMarkAttendance', () => {
    it('should bulk mark attendance and show success toast', async () => {
      const mockResult = { created_count: 10, failed_count: 0 };
      mockedService.bulkCreate.mockResolvedValueOnce(mockResult as any);

      const { result } = renderHook(() => useBulkMarkAttendance(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ class_id: 'class-1', date: '2025-01-15', records: [] } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Successfully marked 10 attendance record(s)')
      );
    });

    it('should report failures in success message', async () => {
      const mockResult = { created_count: 8, failed_count: 2 };
      mockedService.bulkCreate.mockResolvedValueOnce(mockResult as any);

      const { result } = renderHook(() => useBulkMarkAttendance(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ class_id: 'class-1', date: '2025-01-15', records: [] } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('2 failed')
      );
    });
  });

  // =========================================================================
  // useAttendanceStreak
  // =========================================================================
  describe('useAttendanceStreak', () => {
    it('should fetch attendance streak for an enrollment', async () => {
      const mockStreak = { current_streak: 5, longest_streak: 10 };
      mockedService.getStreak.mockResolvedValueOnce(mockStreak as any);

      const { result } = renderHook(
        () => useAttendanceStreak({ enrollmentId: 'enroll-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockStreak);
      expect(mockedService.getStreak).toHaveBeenCalledWith('enroll-1');
    });

    it('should not fetch when enrollmentId is empty', async () => {
      const { result } = renderHook(
        () => useAttendanceStreak({ enrollmentId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useAttendanceStats
  // =========================================================================
  describe('useAttendanceStats', () => {
    it('should fetch attendance stats for a child', async () => {
      const mockStats = { total_classes: 20, present_count: 18, attendance_rate: 90 };
      mockedService.getStats.mockResolvedValueOnce(mockStats as any);

      const { result } = renderHook(
        () => useAttendanceStats({ childId: 'child-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockStats);
      expect(mockedService.getStats).toHaveBeenCalledWith('child-1', undefined);
    });

    it('should not fetch when childId is empty', async () => {
      const { result } = renderHook(
        () => useAttendanceStats({ childId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });
});

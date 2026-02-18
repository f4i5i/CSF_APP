/**
 * Unit Tests for Badge Hooks
 * Tests useBadges, useChildBadges, useEnrollmentBadges, useBadgeLeaderboard,
 * useBadgeEligibility, useBadgeProgress,
 * useAwardBadge, useRevokeBadge
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import { useBadges, useChildBadges, useEnrollmentBadges, useBadgeLeaderboard } from '../../../api/hooks/badges/useBadges';
import { useBadgeEligibility, useBadgeProgress } from '../../../api/hooks/badges/useBadgeProgress';
import { useAwardBadge, useRevokeBadge } from '../../../api/hooks/badges/useAwardBadge';

jest.mock('../../../api/services/badge.service', () => ({
  badgeService: {
    getAll: jest.fn(),
    getByChild: jest.fn(),
    getByEnrollment: jest.fn(),
    getLeaderboard: jest.fn(),
    checkEligibility: jest.fn(),
    getProgress: jest.fn(),
    awardBadge: jest.fn(),
    revokeBadge: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { badgeService } from '../../../api/services/badge.service';

const mockedService = badgeService as jest.Mocked<typeof badgeService>;

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

describe('Badge Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  // =========================================================================
  // useBadges
  // =========================================================================
  describe('useBadges', () => {
    it('should fetch all badges', async () => {
      const mockBadges = [{ id: 'badge-1', name: 'Perfect Attendance' }];
      mockedService.getAll.mockResolvedValueOnce(mockBadges as any);

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockBadges);
      expect(mockedService.getAll).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters to the service', async () => {
      const filters = { category: 'attendance', is_active: true };
      mockedService.getAll.mockResolvedValueOnce([] as any);

      renderHook(() => useBadges({ filters: filters as any }), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(mockedService.getAll).toHaveBeenCalledWith(filters));
    });

    it('should handle error state', async () => {
      mockedService.getAll.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => useBadges(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // =========================================================================
  // useChildBadges
  // =========================================================================
  describe('useChildBadges', () => {
    it('should fetch badges for a child', async () => {
      const mockAwards = [{ id: 'award-1', badge: { name: 'Team Player' } }];
      mockedService.getByChild.mockResolvedValueOnce(mockAwards as any);

      const { result } = renderHook(
        () => useChildBadges({ childId: 'child-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAwards);
      expect(mockedService.getByChild).toHaveBeenCalledWith('child-1');
    });

    it('should not fetch when childId is empty', async () => {
      const { result } = renderHook(
        () => useChildBadges({ childId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useEnrollmentBadges
  // =========================================================================
  describe('useEnrollmentBadges', () => {
    it('should fetch badges for an enrollment', async () => {
      mockedService.getByEnrollment.mockResolvedValueOnce([] as any);

      const { result } = renderHook(
        () => useEnrollmentBadges({ enrollmentId: 'enroll-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.getByEnrollment).toHaveBeenCalledWith('enroll-1');
    });

    it('should not fetch when enrollmentId is empty', async () => {
      const { result } = renderHook(
        () => useEnrollmentBadges({ enrollmentId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useBadgeLeaderboard
  // =========================================================================
  describe('useBadgeLeaderboard', () => {
    it('should fetch badge leaderboard', async () => {
      const mockLeaderboard = [{ child_id: 'child-1', badge_count: 10 }];
      mockedService.getLeaderboard.mockResolvedValueOnce(mockLeaderboard as any);

      const { result } = renderHook(() => useBadgeLeaderboard(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockLeaderboard);
    });

    it('should pass params to the service', async () => {
      const params = { limit: 10 };
      mockedService.getLeaderboard.mockResolvedValueOnce([] as any);

      renderHook(() => useBadgeLeaderboard({ params }), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(mockedService.getLeaderboard).toHaveBeenCalledWith(params));
    });
  });

  // =========================================================================
  // useBadgeEligibility
  // =========================================================================
  describe('useBadgeEligibility', () => {
    it('should check badge eligibility for a child', async () => {
      const mockEligibility = { eligible: true, missing_requirements: [] };
      mockedService.checkEligibility.mockResolvedValueOnce(mockEligibility as any);

      const { result } = renderHook(
        () => useBadgeEligibility({ childId: 'child-1', badgeId: 'badge-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockEligibility);
      expect(mockedService.checkEligibility).toHaveBeenCalledWith('child-1', 'badge-1');
    });

    it('should not fetch when childId is empty', async () => {
      const { result } = renderHook(
        () => useBadgeEligibility({ childId: '', badgeId: 'badge-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not fetch when badgeId is empty', async () => {
      const { result } = renderHook(
        () => useBadgeEligibility({ childId: 'child-1', badgeId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useBadgeProgress
  // =========================================================================
  describe('useBadgeProgress', () => {
    it('should fetch badge progress for a child', async () => {
      const mockProgress = { progress_percentage: 75, requirements: [] };
      mockedService.getProgress.mockResolvedValueOnce(mockProgress as any);

      const { result } = renderHook(
        () => useBadgeProgress({ childId: 'child-1', badgeId: 'badge-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockProgress);
      expect(mockedService.getProgress).toHaveBeenCalledWith('child-1', 'badge-1');
    });

    it('should not fetch when childId is empty', async () => {
      const { result } = renderHook(
        () => useBadgeProgress({ childId: '', badgeId: 'badge-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useAwardBadge
  // =========================================================================
  describe('useAwardBadge', () => {
    it('should award a badge and show success toast', async () => {
      const mockAward = { id: 'award-1', badge: { name: 'Week Warrior' } };
      mockedService.awardBadge.mockResolvedValueOnce(mockAward as any);

      const { result } = renderHook(() => useAwardBadge(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          badge_id: 'badge-1',
          child_id: 'child-1',
          enrollment_id: 'enroll-1',
          notes: 'Great job!',
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Badge awarded'));
    });

    it('should show error toast on failure', async () => {
      mockedService.awardBadge.mockRejectedValueOnce({ message: 'Badge already awarded' });

      const { result } = renderHook(() => useAwardBadge(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ badge_id: 'badge-1', child_id: 'child-1' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Badge already awarded');
    });
  });

  // =========================================================================
  // useRevokeBadge
  // =========================================================================
  describe('useRevokeBadge', () => {
    it('should revoke a badge and show success toast', async () => {
      mockedService.revokeBadge.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useRevokeBadge(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ awardId: 'award-1', reason: 'Duplicate award' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.revokeBadge).toHaveBeenCalledWith('award-1', { reason: 'Duplicate award' });
      expect(toast.success).toHaveBeenCalledWith('Badge revoked successfully');
    });

    it('should show error toast on failure', async () => {
      mockedService.revokeBadge.mockRejectedValueOnce({ message: 'Award not found' });

      const { result } = renderHook(() => useRevokeBadge(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ awardId: 'award-999', reason: 'Error' });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Award not found');
    });
  });
});

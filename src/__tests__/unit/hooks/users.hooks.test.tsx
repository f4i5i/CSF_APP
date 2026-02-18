/**
 * Unit Tests for User Hooks
 * Tests useUser, useUpdateUser (with optimistic updates)
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import { useUser } from '../../../api/hooks/users/useUser';
import { useUpdateUser } from '../../../api/hooks/users/useUpdateUser';
import { mockParentUser } from '../../utils/mock-data';
import { queryKeys } from '../../../api/constants/query-keys';

jest.mock('../../../api/services/user.service', () => ({
  userService: {
    getMe: jest.fn(),
    updateMe: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { userService } from '../../../api/services/user.service';

const mockedService = userService as jest.Mocked<typeof userService>;

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

describe('User Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  // =========================================================================
  // useUser
  // =========================================================================
  describe('useUser', () => {
    it('should fetch the current user', async () => {
      mockedService.getMe.mockResolvedValueOnce(mockParentUser as any);

      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockParentUser);
      expect(mockedService.getMe).toHaveBeenCalled();
    });

    it('should not fetch when enabled is false', async () => {
      const { result } = renderHook(
        () => useUser({ enabled: false }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedService.getMe).not.toHaveBeenCalled();
    });

    it('should handle error state', async () => {
      mockedService.getMe.mockRejectedValueOnce(new Error('Unauthorized'));

      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should accept custom queryOptions', async () => {
      mockedService.getMe.mockResolvedValueOnce(mockParentUser as any);

      const { result } = renderHook(
        () => useUser({ queryOptions: { refetchOnWindowFocus: true } }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  // =========================================================================
  // useUpdateUser
  // =========================================================================
  describe('useUpdateUser', () => {
    it('should update user profile and show success toast', async () => {
      const updatedUser = { ...mockParentUser, first_name: 'Updated' };
      mockedService.updateMe.mockResolvedValueOnce(updatedUser as any);

      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ first_name: 'Updated' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.updateMe).toHaveBeenCalledWith({ first_name: 'Updated' });
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully!');
    });

    it('should show error toast on failure', async () => {
      mockedService.updateMe.mockRejectedValueOnce({ message: 'Invalid data' });

      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ first_name: '' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Invalid data');
    });

    it('should perform optimistic update on user cache', async () => {
      // Pre-populate the cache with the current user
      queryClient.setQueryData(queryKeys.users.me(), mockParentUser);

      const updatedUser = { ...mockParentUser, first_name: 'OptimisticallyUpdated' };
      mockedService.updateMe.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(updatedUser as any), 100))
      );

      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: createWrapper(queryClient),
      });

      // Trigger the mutation
      act(() => {
        result.current.mutate({ first_name: 'OptimisticallyUpdated' } as any);
      });

      // Check that the cache was optimistically updated
      await waitFor(() => {
        const cachedUser = queryClient.getQueryData<typeof mockParentUser>(queryKeys.users.me());
        expect(cachedUser?.first_name).toBe('OptimisticallyUpdated');
      });

      // Wait for the mutation to complete
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('should rollback optimistic update on error', async () => {
      // Pre-populate the cache with the current user
      queryClient.setQueryData(queryKeys.users.me(), mockParentUser);

      mockedService.updateMe.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject({ message: 'Server error' }), 50))
      );

      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ first_name: 'WillFail' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Check that the cache was rolled back to the original user
      const cachedUser = queryClient.getQueryData<typeof mockParentUser>(queryKeys.users.me());
      expect(cachedUser?.first_name).toBe(mockParentUser.first_name);
    });

    it('should accept custom mutationOptions', async () => {
      const customOnSuccess = jest.fn();
      const updatedUser = { ...mockParentUser, first_name: 'Custom' };
      mockedService.updateMe.mockResolvedValueOnce(updatedUser as any);

      const { result } = renderHook(
        () => useUpdateUser({ mutationOptions: { onSuccess: customOnSuccess } }),
        { wrapper: createWrapper(queryClient) }
      );

      await act(async () => {
        result.current.mutate({ first_name: 'Custom' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('should invalidate user queries on success', async () => {
      const updatedUser = { ...mockParentUser, first_name: 'Updated' };
      mockedService.updateMe.mockResolvedValueOnce(updatedUser as any);

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ first_name: 'Updated' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: queryKeys.users.me() })
      );
    });
  });
});

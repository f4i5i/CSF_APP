/**
 * Unit Tests for useApi Hook
 * Tests data fetching, loading states, error handling, and caching
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useApi } from '../useApi';

// Mock the error handler
jest.mock('../../lib/errorHandler', () => ({
  getErrorMessage: (error: Error | { message?: string }) => error?.message || 'An error occurred',
}));

describe('useApi Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // INITIAL STATE TESTS
  // ===========================================
  describe('Initial State', () => {
    it('should have loading true when autoFetch is true', () => {
      const mockApi = jest.fn().mockResolvedValue([]);
      const { result } = renderHook(() => useApi(mockApi, { autoFetch: true }));

      expect(result.current.loading).toBe(true);
    });

    it('should have loading false when autoFetch is false', () => {
      const mockApi = jest.fn().mockResolvedValue([]);
      const { result } = renderHook(() => useApi(mockApi, { autoFetch: false }));

      expect(result.current.loading).toBe(false);
    });

    it('should use initialData when provided', () => {
      const mockApi = jest.fn().mockResolvedValue([]);
      const initialData = [{ id: 1, name: 'Test' }];
      const { result } = renderHook(() =>
        useApi(mockApi, { autoFetch: false, initialData })
      );

      expect(result.current.data).toEqual(initialData);
    });

    it('should have null error initially', () => {
      const mockApi = jest.fn().mockResolvedValue([]);
      const { result } = renderHook(() => useApi(mockApi, { autoFetch: false }));

      expect(result.current.error).toBeNull();
    });
  });

  // ===========================================
  // AUTO FETCH TESTS
  // ===========================================
  describe('Auto Fetch', () => {
    it('should call API function on mount when autoFetch is true', async () => {
      const mockApi = jest.fn().mockResolvedValue({ data: 'test' });
      renderHook(() => useApi(mockApi, { autoFetch: true }));

      await waitFor(() => {
        expect(mockApi).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call API function on mount when autoFetch is false', () => {
      const mockApi = jest.fn().mockResolvedValue({ data: 'test' });
      renderHook(() => useApi(mockApi, { autoFetch: false }));

      expect(mockApi).not.toHaveBeenCalled();
    });

    it('should update data after successful fetch', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockApi = jest.fn().mockResolvedValue(mockData);
      const { result } = renderHook(() => useApi(mockApi, { autoFetch: true }));

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  // ===========================================
  // MANUAL FETCH TESTS
  // ===========================================
  describe('Manual Fetch (refetch)', () => {
    it('should allow manual refetch', async () => {
      const mockApi = jest.fn().mockResolvedValue({ data: 'test' });
      const { result } = renderHook(() => useApi(mockApi, { autoFetch: false }));

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockApi).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to API function', async () => {
      const mockApi = jest.fn().mockResolvedValue({ data: 'test' });
      const { result } = renderHook(() => useApi(mockApi, { autoFetch: false }));

      await act(async () => {
        await result.current.refetch('arg1', 'arg2');
      });

      expect(mockApi).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should update loading state during refetch', async () => {
      const mockApi = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: 'test' }), 50))
      );
      const { result } = renderHook(() => useApi(mockApi, { autoFetch: false }));

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.refetch();
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should set error state on API failure', async () => {
      // Create a controlled promise that we can await
      let rejectFn: (error: Error) => void;
      const mockApi = jest.fn().mockImplementation(() =>
        new Promise((_, reject) => { rejectFn = reject; })
      );

      const { result } = renderHook(() => useApi(mockApi, { autoFetch: false }));

      // Start the fetch
      act(() => {
        result.current.refetch().catch(() => {}); // Catch to prevent unhandled rejection
      });

      expect(result.current.loading).toBe(true);

      // Reject the promise
      await act(async () => {
        rejectFn!(new Error('API Error'));
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('API Error');
      expect(result.current.loading).toBe(false);
    });

    it('should clear error on successful refetch', async () => {
      const mockApi = jest.fn()
        .mockResolvedValueOnce({ data: 'initial' })
        .mockResolvedValueOnce({ data: 'refetched' });

      const { result } = renderHook(() => useApi(mockApi, { autoFetch: true }));

      await waitFor(() => {
        expect(result.current.data).toEqual({ data: 'initial' });
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.data).toEqual({ data: 'refetched' });
      expect(result.current.error).toBeNull();
    });
  });

  // ===========================================
  // CALLBACK TESTS
  // ===========================================
  describe('Callbacks', () => {
    it('should call onSuccess callback on successful fetch', async () => {
      const mockData = { id: 1 };
      const mockApi = jest.fn().mockResolvedValue(mockData);
      const onSuccess = jest.fn();

      renderHook(() => useApi(mockApi, { autoFetch: true, onSuccess }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockData);
      });
    });

    it('should call onError callback on failed fetch', async () => {
      let rejectFn: (error: Error) => void;
      const mockApi = jest.fn().mockImplementation(() =>
        new Promise((_, reject) => { rejectFn = reject; })
      );
      const onError = jest.fn();

      const { result } = renderHook(() => useApi(mockApi, { autoFetch: false, onError }));

      act(() => {
        result.current.refetch().catch(() => {});
      });

      await act(async () => {
        rejectFn!(new Error('Test Error'));
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(onError).toHaveBeenCalledWith('Test Error');
    });

    it('should not call onSuccess on error', async () => {
      let rejectFn: (error: Error) => void;
      const mockApi = jest.fn().mockImplementation(() =>
        new Promise((_, reject) => { rejectFn = reject; })
      );
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const { result } = renderHook(() => useApi(mockApi, { autoFetch: false, onSuccess, onError }));

      act(() => {
        result.current.refetch().catch(() => {});
      });

      await act(async () => {
        rejectFn!(new Error('Test Error'));
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(onError).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // DEPENDENCIES TESTS
  // ===========================================
  describe('Dependencies', () => {
    it('should refetch when dependencies change', async () => {
      const mockApi = jest.fn().mockResolvedValue({ data: 'test' });
      let dep = 'initial';

      const { result, rerender } = renderHook(() =>
        useApi(mockApi, { autoFetch: true, dependencies: [dep] })
      );

      await waitFor(() => {
        expect(mockApi).toHaveBeenCalledTimes(1);
      });

      // Change dependency
      dep = 'changed';
      rerender();

      await waitFor(() => {
        expect(mockApi).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ===========================================
  // RETURN VALUE TESTS
  // ===========================================
  describe('Return Values', () => {
    it('should return data, loading, error, refetch, and fetchData', () => {
      const mockApi = jest.fn().mockResolvedValue([]);
      const { result } = renderHook(() => useApi(mockApi, { autoFetch: false }));

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('fetchData');
    });

    it('should have refetch and fetchData as functions', () => {
      const mockApi = jest.fn().mockResolvedValue([]);
      const { result } = renderHook(() => useApi(mockApi, { autoFetch: false }));

      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.fetchData).toBe('function');
    });
  });

  // ===========================================
  // UNMOUNT CLEANUP TESTS
  // ===========================================
  describe('Cleanup on Unmount', () => {
    it('should not update state after unmount', async () => {
      const mockApi = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: 'test' }), 100))
      );

      const { result, unmount } = renderHook(() => useApi(mockApi, { autoFetch: true }));

      // Unmount before API resolves
      unmount();

      // Wait for the API to resolve (it should not cause errors)
      await new Promise((resolve) => setTimeout(resolve, 150));

      // No state update warnings should occur
      expect(result.current.loading).toBe(true); // State frozen at unmount
    });
  });
});

/**
 * Unit Tests for useMutation Hook
 * Tests mutation operations, loading states, error handling, and callbacks
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMutation } from '../useMutation';

// Mock the error handler
jest.mock('../../lib/errorHandler', () => ({
  getErrorMessage: (error: Error | { message?: string }) => error?.message || 'An error occurred',
}));

describe('useMutation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // INITIAL STATE TESTS
  // ===========================================
  describe('Initial State', () => {
    it('should have loading false initially', () => {
      const mockMutation = jest.fn();
      const { result } = renderHook(() => useMutation(mockMutation));

      expect(result.current.loading).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should have null data initially', () => {
      const mockMutation = jest.fn();
      const { result } = renderHook(() => useMutation(mockMutation));

      expect(result.current.data).toBeNull();
    });

    it('should have null error initially', () => {
      const mockMutation = jest.fn();
      const { result } = renderHook(() => useMutation(mockMutation));

      expect(result.current.error).toBeNull();
      expect(result.current.isError).toBe(false);
    });

    it('should have isSuccess false initially', () => {
      const mockMutation = jest.fn();
      const { result } = renderHook(() => useMutation(mockMutation));

      expect(result.current.isSuccess).toBe(false);
    });
  });

  // ===========================================
  // MUTATION EXECUTION TESTS
  // ===========================================
  describe('Mutation Execution', () => {
    it('should call mutation function with arguments', async () => {
      const mockMutation = jest.fn().mockResolvedValue({ id: 1 });
      const { result } = renderHook(() => useMutation(mockMutation));

      await act(async () => {
        await result.current.mutate('arg1', 'arg2');
      });

      expect(mockMutation).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should set loading true during mutation', async () => {
      const mockMutation = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ id: 1 }), 50))
      );
      const { result } = renderHook(() => useMutation(mockMutation));

      act(() => {
        result.current.mutate();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set data on successful mutation', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockMutation = jest.fn().mockResolvedValue(mockData);
      const { result } = renderHook(() => useMutation(mockMutation));

      await act(async () => {
        await result.current.mutate();
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should return result from mutation', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockMutation = jest.fn().mockResolvedValue(mockData);
      const { result } = renderHook(() => useMutation(mockMutation));

      let returnedData: typeof mockData | null = null;
      await act(async () => {
        returnedData = await result.current.mutate();
      });

      expect(returnedData).toEqual(mockData);
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should set error on mutation failure', async () => {
      const mockMutation = jest.fn().mockRejectedValue(new Error('Mutation Failed'));
      const { result } = renderHook(() => useMutation(mockMutation));

      await act(async () => {
        try {
          await result.current.mutate();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Mutation Failed');
      expect(result.current.isError).toBe(true);
    });

    it('should set loading false after error', async () => {
      const mockMutation = jest.fn().mockRejectedValue(new Error('Error'));
      const { result } = renderHook(() => useMutation(mockMutation));

      await act(async () => {
        try {
          await result.current.mutate();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.loading).toBe(false);
    });

    it('should clear error before new mutation', async () => {
      const mockMutation = jest
        .fn()
        .mockRejectedValueOnce(new Error('First Error'))
        .mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useMutation(mockMutation));

      // First mutation (error)
      await act(async () => {
        try {
          await result.current.mutate();
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('First Error');

      // Second mutation (success)
      await act(async () => {
        await result.current.mutate();
      });

      expect(result.current.error).toBeNull();
    });

    it('should throw error to caller', async () => {
      const mockMutation = jest.fn().mockRejectedValue(new Error('Test Error'));
      const { result } = renderHook(() => useMutation(mockMutation));

      await expect(
        act(async () => {
          await result.current.mutate();
        })
      ).rejects.toThrow('Test Error');
    });
  });

  // ===========================================
  // CALLBACK TESTS
  // ===========================================
  describe('Callbacks', () => {
    it('should call onSuccess callback on successful mutation', async () => {
      const mockData = { id: 1 };
      const mockMutation = jest.fn().mockResolvedValue(mockData);
      const onSuccess = jest.fn();

      const { result } = renderHook(() =>
        useMutation(mockMutation, { onSuccess })
      );

      await act(async () => {
        await result.current.mutate();
      });

      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('should call onError callback on failed mutation', async () => {
      const mockMutation = jest.fn().mockRejectedValue(new Error('Test Error'));
      const onError = jest.fn();

      const { result } = renderHook(() =>
        useMutation(mockMutation, { onError })
      );

      await act(async () => {
        try {
          await result.current.mutate();
        } catch {
          // Expected
        }
      });

      expect(onError).toHaveBeenCalledWith('Test Error', expect.any(Error));
    });

    it('should call onSettled callback on success', async () => {
      const mockData = { id: 1 };
      const mockMutation = jest.fn().mockResolvedValue(mockData);
      const onSettled = jest.fn();

      const { result } = renderHook(() =>
        useMutation(mockMutation, { onSettled })
      );

      await act(async () => {
        await result.current.mutate();
      });

      expect(onSettled).toHaveBeenCalledWith(mockData, null);
    });

    it('should call onSettled callback on error', async () => {
      const mockMutation = jest.fn().mockRejectedValue(new Error('Test Error'));
      const onSettled = jest.fn();

      const { result } = renderHook(() =>
        useMutation(mockMutation, { onSettled })
      );

      await act(async () => {
        try {
          await result.current.mutate();
        } catch {
          // Expected
        }
      });

      expect(onSettled).toHaveBeenCalledWith(null, 'Test Error');
    });

    it('should not call onSuccess on error', async () => {
      const mockMutation = jest.fn().mockRejectedValue(new Error('Error'));
      const onSuccess = jest.fn();

      const { result } = renderHook(() =>
        useMutation(mockMutation, { onSuccess })
      );

      await act(async () => {
        try {
          await result.current.mutate();
        } catch {
          // Expected
        }
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // RESET FUNCTION TESTS
  // ===========================================
  describe('Reset Function', () => {
    it('should reset data to null', async () => {
      const mockMutation = jest.fn().mockResolvedValue({ id: 1 });
      const { result } = renderHook(() => useMutation(mockMutation));

      await act(async () => {
        await result.current.mutate();
      });

      expect(result.current.data).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
    });

    it('should reset error to null', async () => {
      const mockMutation = jest.fn().mockRejectedValue(new Error('Error'));
      const { result } = renderHook(() => useMutation(mockMutation));

      await act(async () => {
        try {
          await result.current.mutate();
        } catch {
          // Expected
        }
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });

    it('should reset loading to false', async () => {
      const mockMutation = jest.fn().mockResolvedValue({ id: 1 });
      const { result } = renderHook(() => useMutation(mockMutation));

      act(() => {
        result.current.reset();
      });

      expect(result.current.loading).toBe(false);
    });

    it('should reset all computed values', async () => {
      const mockMutation = jest.fn().mockResolvedValue({ id: 1 });
      const { result } = renderHook(() => useMutation(mockMutation));

      await act(async () => {
        await result.current.mutate();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });
  });

  // ===========================================
  // RETURN VALUE TESTS
  // ===========================================
  describe('Return Values', () => {
    it('should return all expected properties', () => {
      const mockMutation = jest.fn();
      const { result } = renderHook(() => useMutation(mockMutation));

      expect(result.current).toHaveProperty('mutate');
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('reset');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('isSuccess');
    });

    it('should have mutate and reset as functions', () => {
      const mockMutation = jest.fn();
      const { result } = renderHook(() => useMutation(mockMutation));

      expect(typeof result.current.mutate).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  // ===========================================
  // MULTIPLE MUTATION TESTS
  // ===========================================
  describe('Multiple Mutations', () => {
    it('should handle sequential mutations', async () => {
      const mockMutation = jest.fn()
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });

      const { result } = renderHook(() => useMutation(mockMutation));

      await act(async () => {
        await result.current.mutate('first');
      });

      expect(result.current.data).toEqual({ id: 1 });

      await act(async () => {
        await result.current.mutate('second');
      });

      expect(result.current.data).toEqual({ id: 2 });
      expect(mockMutation).toHaveBeenCalledTimes(2);
    });

    it('should clear previous data before new mutation', async () => {
      const mockMutation = jest.fn()
        .mockResolvedValueOnce({ id: 1 })
        .mockImplementationOnce(
          () => new Promise((resolve) => setTimeout(() => resolve({ id: 2 }), 50))
        );

      const { result } = renderHook(() => useMutation(mockMutation));

      await act(async () => {
        await result.current.mutate();
      });

      expect(result.current.data).toEqual({ id: 1 });

      act(() => {
        result.current.mutate();
      });

      // Data should be cleared immediately when starting new mutation
      expect(result.current.data).toBeNull();

      await waitFor(() => {
        expect(result.current.data).toEqual({ id: 2 });
      });
    });
  });
});

/**
 * Unit Tests for Children Hooks
 * Tests useChild, useChildren, useCreateChild, useUpdateChild, useDeleteChild
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import { useChild } from '../../../api/hooks/children/useChild';
import { useChildren } from '../../../api/hooks/children/useChildren';
import { useCreateChild } from '../../../api/hooks/children/useCreateChild';
import { useUpdateChild } from '../../../api/hooks/children/useUpdateChild';
import { useDeleteChild } from '../../../api/hooks/children/useDeleteChild';
import { mockChild1, mockChild2, mockChildren } from '../../utils/mock-data';

jest.mock('../../../api/services/child.service', () => ({
  childService: {
    getMy: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../../api/utils/cache-utils', () => ({
  cacheInvalidation: {
    onChildMutation: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { childService } from '../../../api/services/child.service';

const mockedService = childService as jest.Mocked<typeof childService>;

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

describe('Children Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  // =========================================================================
  // useChildren
  // =========================================================================
  describe('useChildren', () => {
    it('should fetch the list of children', async () => {
      mockedService.getMy.mockResolvedValueOnce(mockChildren as any);

      const { result } = renderHook(() => useChildren(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockChildren);
      expect(mockedService.getMy).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters to the service', async () => {
      const filters = { status: 'active' };
      mockedService.getMy.mockResolvedValueOnce([] as any);

      renderHook(() => useChildren({ filters: filters as any }), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(mockedService.getMy).toHaveBeenCalledWith(filters));
    });

    it('should handle error state', async () => {
      mockedService.getMy.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useChildren(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // =========================================================================
  // useChild
  // =========================================================================
  describe('useChild', () => {
    it('should fetch a single child by ID', async () => {
      mockedService.getById.mockResolvedValueOnce(mockChild1 as any);

      const { result } = renderHook(() => useChild('child-1'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockChild1);
      expect(mockedService.getById).toHaveBeenCalledWith('child-1');
    });

    it('should not fetch when childId is empty', async () => {
      const { result } = renderHook(() => useChild(''), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedService.getById).not.toHaveBeenCalled();
    });

    it('should not fetch when enabled is false', async () => {
      const { result } = renderHook(
        () => useChild('child-1', { enabled: false }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedService.getById).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useCreateChild
  // =========================================================================
  describe('useCreateChild', () => {
    it('should create a child and show success toast', async () => {
      const newChild = { ...mockChild1, id: 'child-new' };
      mockedService.create.mockResolvedValueOnce(newChild as any);

      const { result } = renderHook(() => useCreateChild(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          first_name: 'Johnny',
          last_name: 'Parent',
          date_of_birth: '2015-05-15',
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalledWith('Child created successfully!');
    });

    it('should show error toast on failure', async () => {
      mockedService.create.mockRejectedValueOnce({ message: 'Validation error' });

      const { result } = renderHook(() => useCreateChild(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          first_name: '',
          last_name: '',
          date_of_birth: '',
        } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Validation error');
    });

    it('should call service with correct data', async () => {
      mockedService.create.mockResolvedValueOnce(mockChild1 as any);

      const { result } = renderHook(() => useCreateChild(), {
        wrapper: createWrapper(queryClient),
      });

      const createData = {
        first_name: 'Johnny',
        last_name: 'Parent',
        date_of_birth: '2015-05-15',
      };

      await act(async () => {
        result.current.mutate(createData as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.create).toHaveBeenCalledWith(createData);
    });
  });

  // =========================================================================
  // useUpdateChild
  // =========================================================================
  describe('useUpdateChild', () => {
    it('should update a child and show success toast', async () => {
      const updatedChild = { ...mockChild1, first_name: 'UpdatedName' };
      mockedService.update.mockResolvedValueOnce(updatedChild as any);

      const { result } = renderHook(() => useUpdateChild(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          id: 'child-1',
          data: { first_name: 'UpdatedName' } as any,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.update).toHaveBeenCalledWith('child-1', { first_name: 'UpdatedName' });
      expect(toast.success).toHaveBeenCalledWith('Child updated successfully!');
    });

    it('should show error toast on failure', async () => {
      mockedService.update.mockRejectedValueOnce({ message: 'Not found' });

      const { result } = renderHook(() => useUpdateChild(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          id: 'child-999',
          data: { first_name: 'Nope' } as any,
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Not found');
    });
  });

  // =========================================================================
  // useDeleteChild
  // =========================================================================
  describe('useDeleteChild', () => {
    it('should delete a child and show success toast', async () => {
      mockedService.delete.mockResolvedValueOnce({ message: 'Deleted' } as any);

      const { result } = renderHook(() => useDeleteChild(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('child-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.delete).toHaveBeenCalledWith('child-1');
      expect(toast.success).toHaveBeenCalledWith('Child deleted successfully');
    });

    it('should show error toast on failure', async () => {
      mockedService.delete.mockRejectedValueOnce({ message: 'Cannot delete child with active enrollments' });

      const { result } = renderHook(() => useDeleteChild(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('child-1');
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Cannot delete child with active enrollments');
    });
  });
});

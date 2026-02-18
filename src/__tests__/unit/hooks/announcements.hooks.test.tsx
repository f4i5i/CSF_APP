/**
 * Unit Tests for Announcement Hooks
 * Tests useAnnouncements, useUnreadAnnouncements, useUnreadCount, useMarkAsRead,
 * useMarkAllAsRead, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement,
 * usePinAnnouncement
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import {
  useAnnouncements,
  useUnreadAnnouncements,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from '../../../api/hooks/announcements/useAnnouncements';
import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  usePinAnnouncement,
} from '../../../api/hooks/announcements/useCreateAnnouncement';

jest.mock('../../../api/services/announcement.service', () => ({
  announcementService: {
    getAll: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    pin: jest.fn(),
    unpin: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { announcementService } from '../../../api/services/announcement.service';

const mockedService = announcementService as jest.Mocked<typeof announcementService>;

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

describe('Announcement Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  // =========================================================================
  // useAnnouncements
  // =========================================================================
  describe('useAnnouncements', () => {
    it('should fetch announcements successfully', async () => {
      const mockData = [{ id: 'a-1', title: 'Test Announcement' }];
      mockedService.getAll.mockResolvedValueOnce(mockData as any);

      const { result } = renderHook(() => useAnnouncements(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(mockedService.getAll).toHaveBeenCalledWith(undefined);
    });

    it('should pass filters to the service', async () => {
      const filters = { priority: 'high' };
      mockedService.getAll.mockResolvedValueOnce([] as any);

      renderHook(() => useAnnouncements({ filters: filters as any }), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(mockedService.getAll).toHaveBeenCalledWith(filters));
    });
  });

  // =========================================================================
  // useUnreadAnnouncements
  // =========================================================================
  describe('useUnreadAnnouncements', () => {
    it('should fetch announcements with unread filter', async () => {
      mockedService.getAll.mockResolvedValueOnce([] as any);

      const { result } = renderHook(() => useUnreadAnnouncements(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.getAll).toHaveBeenCalledWith({ unread: true });
    });
  });

  // =========================================================================
  // useUnreadCount
  // =========================================================================
  describe('useUnreadCount', () => {
    it('should fetch unread count', async () => {
      const mockCount = { count: 5 };
      mockedService.getUnreadCount.mockResolvedValueOnce(mockCount as any);

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockCount);
    });
  });

  // =========================================================================
  // useMarkAsRead
  // =========================================================================
  describe('useMarkAsRead', () => {
    it('should mark an announcement as read and invalidate queries', async () => {
      mockedService.markAsRead.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useMarkAsRead(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('a-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.markAsRead).toHaveBeenCalledWith('a-1');
    });
  });

  // =========================================================================
  // useMarkAllAsRead
  // =========================================================================
  describe('useMarkAllAsRead', () => {
    it('should mark all announcements as read and show success toast', async () => {
      mockedService.markAllAsRead.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useMarkAllAsRead(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalledWith('All announcements marked as read');
    });

    it('should show error toast on failure', async () => {
      mockedService.markAllAsRead.mockRejectedValueOnce({ message: 'Failed' });

      const { result } = renderHook(() => useMarkAllAsRead(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed');
    });
  });

  // =========================================================================
  // useCreateAnnouncement
  // =========================================================================
  describe('useCreateAnnouncement', () => {
    it('should create an announcement and show success toast', async () => {
      const created = { id: 'a-new', title: 'New Announcement' };
      mockedService.create.mockResolvedValueOnce(created as any);

      const { result } = renderHook(() => useCreateAnnouncement(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          title: 'New Announcement',
          content: 'Content here',
          type: 'general',
          priority: 'normal',
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalledWith('Announcement created successfully!');
    });

    it('should show error toast on failure', async () => {
      mockedService.create.mockRejectedValueOnce({ message: 'Validation error' });

      const { result } = renderHook(() => useCreateAnnouncement(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ title: '', content: '' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Validation error');
    });
  });

  // =========================================================================
  // useUpdateAnnouncement
  // =========================================================================
  describe('useUpdateAnnouncement', () => {
    it('should update an announcement and show success toast', async () => {
      const updated = { id: 'a-1', title: 'Updated' };
      mockedService.update.mockResolvedValueOnce(updated as any);

      const { result } = renderHook(() => useUpdateAnnouncement(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: 'a-1', data: { title: 'Updated' } as any });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.update).toHaveBeenCalledWith('a-1', { title: 'Updated' });
      expect(toast.success).toHaveBeenCalledWith('Announcement updated successfully!');
    });
  });

  // =========================================================================
  // useDeleteAnnouncement
  // =========================================================================
  describe('useDeleteAnnouncement', () => {
    it('should delete an announcement and show success toast', async () => {
      mockedService.delete.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useDeleteAnnouncement(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('a-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.delete).toHaveBeenCalledWith('a-1');
      expect(toast.success).toHaveBeenCalledWith('Announcement deleted successfully');
    });
  });

  // =========================================================================
  // usePinAnnouncement
  // =========================================================================
  describe('usePinAnnouncement', () => {
    it('should pin an announcement and show success toast', async () => {
      mockedService.pin.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => usePinAnnouncement(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: 'a-1', pin: true });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.pin).toHaveBeenCalledWith('a-1');
      expect(toast.success).toHaveBeenCalledWith('Announcement pinned');
    });

    it('should unpin an announcement', async () => {
      mockedService.unpin.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => usePinAnnouncement(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: 'a-1', pin: false });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.unpin).toHaveBeenCalledWith('a-1');
      expect(toast.success).toHaveBeenCalledWith('Announcement unpinned');
    });
  });
});

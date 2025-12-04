/**
 * useAnnouncements Hook
 * React Query hooks to fetch announcements
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { announcementService } from '../../services/announcement.service';
import { queryKeys } from '../../constants/query-keys';
import type { Announcement, AnnouncementFilters, UnreadCountResponse } from '../../types/announcement.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch announcements
 */
export function useAnnouncements({
  filters,
  queryOptions,
}: {
  filters?: AnnouncementFilters;
  queryOptions?: Omit<UseQueryOptions<Announcement[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
} = {}) {
  return useQuery({
    queryKey: queryKeys.announcements.list(filters),
    queryFn: () => announcementService.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Hook to fetch unread announcements
 */
export function useUnreadAnnouncements(
  queryOptions?: Omit<UseQueryOptions<Announcement[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useAnnouncements({
    filters: { unread: true },
    queryOptions,
  });
}

/**
 * Hook to fetch unread count
 */
export function useUnreadCount(
  queryOptions?: Omit<UseQueryOptions<UnreadCountResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...queryKeys.announcements.all, 'unreadCount'],
    queryFn: () => announcementService.getUnreadCount(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for notifications
    ...queryOptions,
  });
}

/**
 * Hook to mark announcement as read
 */
export function useMarkAsRead(
  options?: Omit<UseMutationOptions<any, ApiErrorResponse, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) => announcementService.markAsRead(announcementId),

    onSuccess: () => {
      // Invalidate announcements and unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },

    ...options,
  });
}

/**
 * Hook to mark all announcements as read
 */
export function useMarkAllAsRead(
  options?: Omit<UseMutationOptions<any, ApiErrorResponse, void>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => announcementService.markAllAsRead(),

    onSuccess: () => {
      // Invalidate all announcement queries
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      toast.success('All announcements marked as read');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to mark announcements as read');
    },

    ...options,
  });
}

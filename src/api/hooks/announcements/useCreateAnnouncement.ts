/**
 * useCreateAnnouncement Hook
 * React Query mutation hooks for creating/updating announcements
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { announcementService } from '../../services/announcement.service';
import { queryKeys } from '../../constants/query-keys';
import type { Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '../../types/announcement.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to create announcement
 *
 * @example
 * ```tsx
 * const { mutate: createAnnouncement } = useCreateAnnouncement();
 *
 * createAnnouncement({
 *   title: 'Important Update',
 *   content: 'Practice cancelled tomorrow',
 *   type: 'urgent',
 *   priority: 'high'
 * });
 * ```
 */
export function useCreateAnnouncement(
  options?: Omit<
    UseMutationOptions<Announcement, ApiErrorResponse, CreateAnnouncementRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementData: CreateAnnouncementRequest) =>
      announcementService.create(announcementData),

    onSuccess: () => {
      // Invalidate all announcement queries
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });

      toast.success('Announcement created successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to create announcement');
    },

    ...options,
  });
}

/**
 * Hook to update announcement
 */
export function useUpdateAnnouncement(
  options?: Omit<
    UseMutationOptions<
      Announcement,
      ApiErrorResponse,
      { id: string; data: UpdateAnnouncementRequest }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementRequest }) =>
      announcementService.update(id, data),

    onSuccess: (announcement) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.announcements.detail(announcement.id),
      });

      toast.success('Announcement updated successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update announcement');
    },

    ...options,
  });
}

/**
 * Hook to delete announcement
 */
export function useDeleteAnnouncement(
  options?: Omit<UseMutationOptions<any, ApiErrorResponse, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) => announcementService.delete(announcementId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      toast.success('Announcement deleted successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete announcement');
    },

    ...options,
  });
}

/**
 * Hook to pin/unpin announcement
 */
export function usePinAnnouncement(
  options?: Omit<
    UseMutationOptions<any, ApiErrorResponse, { id: string; pin: boolean }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, pin }: { id: string; pin: boolean }) =>
      pin ? announcementService.pin(id) : announcementService.unpin(id),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      toast.success(variables.pin ? 'Announcement pinned' : 'Announcement unpinned');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update pin status');
    },

    ...options,
  });
}

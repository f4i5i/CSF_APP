/**
 * @file Announcement Mutation Hooks
 * @description React Query mutation hooks for creating, updating, and managing announcements.
 * These hooks enable administrators to broadcast important information to parents and users,
 * manage announcement visibility through pinning, and control the announcement lifecycle.
 *
 * All announcement mutations automatically invalidate relevant queries to ensure real-time
 * updates across the application, keeping all users informed of the latest communications.
 *
 * @module hooks/announcements/useCreateAnnouncement
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { announcementService } from '../../services/announcement.service';
import { queryKeys } from '../../constants/query-keys';
import type { Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '../../types/announcement.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to create a new announcement.
 *
 * @description Creates a new announcement to broadcast to parents and users. Announcements
 * can have different priority levels (low, normal, high, urgent) and types (general, event,
 * schedule, urgent) to help organize and display important information appropriately.
 * After creation, all announcement queries are invalidated to ensure the new announcement
 * appears immediately for all users.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult<Announcement, ApiErrorResponse, CreateAnnouncementRequest>} Mutation result with mutate function and state
 *
 * @example
 * // Create a standard announcement
 * const { mutate: createAnnouncement, isPending } = useCreateAnnouncement();
 *
 * const handleCreateAnnouncement = () => {
 *   createAnnouncement({
 *     title: 'Practice Schedule Update',
 *     content: 'Practice this week will be at the East Field',
 *     type: 'schedule',
 *     priority: 'normal'
 *   });
 * };
 *
 * @example
 * // Create urgent announcement with high priority
 * const { mutate: createAnnouncement } = useCreateAnnouncement();
 *
 * createAnnouncement({
 *   title: 'Game Cancelled',
 *   content: 'Tomorrow\'s game has been cancelled due to weather. We will reschedule soon.',
 *   type: 'urgent',
 *   priority: 'high',
 *   pinned: true // Pin to top of announcement list
 * });
 *
 * @example
 * // Create announcement with navigation after success
 * const { mutate: createAnnouncement } = useCreateAnnouncement({
 *   onSuccess: (announcement) => {
 *     navigate(`/announcements/${announcement.id}`);
 *   }
 * });
 *
 * createAnnouncement({
 *   title: 'Tournament Information',
 *   content: 'Details about the upcoming tournament...',
 *   type: 'event',
 *   priority: 'normal'
 * });
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
 * Hook to update an existing announcement.
 *
 * @description Modifies an existing announcement's content, priority, or type. Useful for
 * correcting information, updating status, or adding additional details. Automatically
 * invalidates both list and detail queries to ensure all users see the updated content.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult} Mutation result with mutate function and state
 *
 * @example
 * // Update announcement content
 * const { mutate: updateAnnouncement } = useUpdateAnnouncement();
 *
 * updateAnnouncement({
 *   id: '123',
 *   data: {
 *     content: 'Updated: Practice is now at 5 PM instead of 4 PM'
 *   }
 * });
 *
 * @example
 * // Update priority level
 * const { mutate: updateAnnouncement } = useUpdateAnnouncement();
 *
 * updateAnnouncement({
 *   id: announcementId,
 *   data: {
 *     priority: 'urgent',
 *     title: '[URGENT] ' + announcement.title
 *   }
 * });
 *
 * @example
 * // Complete announcement update
 * const { mutate: updateAnnouncement, isPending } = useUpdateAnnouncement({
 *   onSuccess: () => {
 *     closeEditModal();
 *   }
 * });
 *
 * updateAnnouncement({
 *   id: announcement.id,
 *   data: {
 *     title: 'Updated Title',
 *     content: 'Updated content with more details',
 *     priority: 'high'
 *   }
 * });
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
 * Hook to delete an announcement.
 *
 * @description Permanently removes an announcement from the system. This action cannot
 * be undone. All users will no longer see this announcement in their feed or notification
 * center. Automatically invalidates announcement queries to remove the announcement from
 * all views immediately.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult<any, ApiErrorResponse, string>} Mutation result with mutate function and state
 *
 * @example
 * // Delete announcement with confirmation
 * const { mutate: deleteAnnouncement } = useDeleteAnnouncement();
 *
 * const handleDelete = (announcementId) => {
 *   if (window.confirm('Are you sure you want to delete this announcement?')) {
 *     deleteAnnouncement(announcementId);
 *   }
 * };
 *
 * @example
 * // Delete with navigation after success
 * const { mutate: deleteAnnouncement, isPending } = useDeleteAnnouncement({
 *   onSuccess: () => {
 *     navigate('/announcements');
 *   }
 * });
 *
 * return (
 *   <Button
 *     onClick={() => deleteAnnouncement(announcement.id)}
 *     disabled={isPending}
 *     variant="danger"
 *   >
 *     Delete Announcement
 *   </Button>
 * );
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
 * Hook to pin or unpin an announcement.
 *
 * @description Pins or unpins an announcement to control its visibility and position in
 * announcement lists. Pinned announcements appear at the top of lists regardless of their
 * creation date, making them ideal for important ongoing information that needs to stay
 * visible. Automatically updates all announcement queries to reflect the new pin status.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult} Mutation result with mutate function and state
 *
 * @example
 * // Pin an important announcement
 * const { mutate: pinAnnouncement } = usePinAnnouncement();
 *
 * pinAnnouncement({
 *   id: announcement.id,
 *   pin: true
 * });
 *
 * @example
 * // Toggle pin status
 * const { mutate: togglePin } = usePinAnnouncement();
 *
 * const handleTogglePin = () => {
 *   togglePin({
 *     id: announcement.id,
 *     pin: !announcement.is_pinned
 *   });
 * };
 *
 * @example
 * // Pin/unpin button component
 * const { mutate: pinAnnouncement, isPending } = usePinAnnouncement();
 *
 * return (
 *   <Button
 *     onClick={() => pinAnnouncement({
 *       id: announcement.id,
 *       pin: !announcement.is_pinned
 *     })}
 *     disabled={isPending}
 *   >
 *     {announcement.is_pinned ? 'Unpin' : 'Pin'} Announcement
 *   </Button>
 * );
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

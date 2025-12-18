/**
 * @file Announcement Query Hooks
 * @description React Query hooks for fetching and managing announcements.
 * These hooks provide access to the announcement broadcasting system, allowing
 * administrators to communicate important information to parents and users to
 * stay informed about updates, schedule changes, and urgent notifications.
 *
 * The announcement system includes:
 * - Real-time unread count tracking with automatic background refetching
 * - Read/unread status management for individual users
 * - Priority-based announcement display
 * - Notification center integration
 *
 * @module hooks/announcements/useAnnouncements
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { announcementService } from '../../services/announcement.service';
import { queryKeys } from '../../constants/query-keys';
import type { Announcement, AnnouncementFilters, UnreadCountResponse } from '../../types/announcement.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch announcements with optional filtering.
 *
 * @description Retrieves announcements from the API with support for various filters
 * including read/unread status, priority level, and date ranges. Announcements are
 * cached for 2 minutes to balance freshness with performance. Commonly used to display
 * announcement lists, notification centers, and dashboard widgets.
 *
 * @param {Object} [params] - Hook parameters
 * @param {AnnouncementFilters} [params.filters] - Optional filters (unread, priority, date range)
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Announcement[], ApiErrorResponse>} Query result with announcements data
 *
 * @example
 * // Fetch all announcements
 * const { data: announcements, isLoading } = useAnnouncements();
 *
 * return (
 *   <div>
 *     {announcements?.map(announcement => (
 *       <AnnouncementCard key={announcement.id} announcement={announcement} />
 *     ))}
 *   </div>
 * );
 *
 * @example
 * // Fetch high priority announcements only
 * const { data: urgentAnnouncements } = useAnnouncements({
 *   filters: {
 *     priority: 'high'
 *   }
 * });
 *
 * @example
 * // Fetch announcements with custom refetch interval
 * const { data: announcements } = useAnnouncements({
 *   queryOptions: {
 *     refetchInterval: 30000 // Refetch every 30 seconds
 *   }
 * });
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
 * Hook to fetch only unread announcements.
 *
 * @description Convenience hook that retrieves announcements the current user has not
 * yet read. Useful for notification badges, popups, and unread announcement sections.
 * This filters the announcement list to show only items requiring user attention.
 *
 * @param {Object} [queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Announcement[], ApiErrorResponse>} Query result with unread announcements
 *
 * @example
 * // Display unread announcements in notification dropdown
 * const { data: unreadAnnouncements } = useUnreadAnnouncements();
 *
 * return (
 *   <NotificationDropdown>
 *     {unreadAnnouncements?.map(announcement => (
 *       <NotificationItem
 *         key={announcement.id}
 *         announcement={announcement}
 *         onRead={() => markAsRead(announcement.id)}
 *       />
 *     ))}
 *   </NotificationDropdown>
 * );
 *
 * @example
 * // Show unread count badge
 * const { data: unreadAnnouncements } = useUnreadAnnouncements();
 *
 * return (
 *   <Badge count={unreadAnnouncements?.length || 0}>
 *     <BellIcon />
 *   </Badge>
 * );
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
 * Hook to fetch the count of unread announcements.
 *
 * @description Retrieves only the count of unread announcements without fetching full
 * announcement data. Optimized for notification badges and indicators. Automatically
 * refetches every 2 minutes to keep the count current without manual intervention.
 *
 * @param {Object} [queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<UnreadCountResponse, ApiErrorResponse>} Query result with unread count
 *
 * @example
 * // Display unread count badge on navigation
 * const { data: unreadCount } = useUnreadCount();
 *
 * return (
 *   <NavItem>
 *     <AnnouncementsIcon />
 *     {unreadCount && unreadCount.count > 0 && (
 *       <Badge variant="danger">{unreadCount.count}</Badge>
 *     )}
 *   </NavItem>
 * );
 *
 * @example
 * // Show notification indicator
 * const { data: unreadCount, isLoading } = useUnreadCount();
 *
 * if (isLoading) return <Skeleton />;
 *
 * return (
 *   <div>
 *     <h2>Announcements</h2>
 *     {unreadCount?.count > 0 && (
 *       <span className="unread-indicator">
 *         {unreadCount.count} new
 *       </span>
 *     )}
 *   </div>
 * );
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
 * Hook to mark a single announcement as read.
 *
 * @description Updates the read status of a specific announcement for the current user.
 * Automatically invalidates announcement queries to update unread counts and remove
 * the announcement from unread lists. Does not show a success toast to avoid
 * overwhelming users when marking multiple items as read.
 *
 * @param {Object} [options] - Additional mutation options
 *
 * @returns {UseMutationResult<any, ApiErrorResponse, string>} Mutation result with mutate function
 *
 * @example
 * // Mark as read when user clicks on announcement
 * const { mutate: markAsRead } = useMarkAsRead();
 *
 * const handleAnnouncementClick = (announcementId) => {
 *   markAsRead(announcementId);
 *   navigate(`/announcements/${announcementId}`);
 * };
 *
 * @example
 * // Auto-mark as read after viewing for a few seconds
 * const { mutate: markAsRead } = useMarkAsRead();
 *
 * useEffect(() => {
 *   const timer = setTimeout(() => {
 *     markAsRead(announcement.id);
 *   }, 3000); // Mark as read after 3 seconds
 *
 *   return () => clearTimeout(timer);
 * }, [announcement.id]);
 *
 * @example
 * // Mark as read with custom callback
 * const { mutate: markAsRead } = useMarkAsRead({
 *   onSuccess: () => {
 *     console.log('Announcement marked as read');
 *   }
 * });
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
 * Hook to mark all announcements as read.
 *
 * @description Marks all announcements as read for the current user in a single operation.
 * Useful for "Mark all as read" buttons in notification centers. Automatically updates
 * all announcement queries to reflect the new read status and displays a success toast.
 *
 * @param {Object} [options] - Additional mutation options
 *
 * @returns {UseMutationResult<any, ApiErrorResponse, void>} Mutation result with mutate function
 *
 * @example
 * // Mark all as read button
 * const { mutate: markAllAsRead, isPending } = useMarkAllAsRead();
 *
 * return (
 *   <Button
 *     onClick={() => markAllAsRead()}
 *     disabled={isPending}
 *   >
 *     {isPending ? 'Marking...' : 'Mark All as Read'}
 *   </Button>
 * );
 *
 * @example
 * // Conditional mark all as read
 * const { data: unreadCount } = useUnreadCount();
 * const { mutate: markAllAsRead } = useMarkAllAsRead();
 *
 * return (
 *   <div>
 *     {unreadCount && unreadCount.count > 0 && (
 *       <Button onClick={() => markAllAsRead()}>
 *         Mark all {unreadCount.count} as read
 *       </Button>
 *     )}
 *   </div>
 * );
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

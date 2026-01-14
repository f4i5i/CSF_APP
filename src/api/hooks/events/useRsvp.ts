/**
 * @file RSVP Hooks
 * @description React Query hooks for managing event RSVP functionality.
 * These hooks enable users to respond to events, update their attendance status,
 * and view their current RSVP details. The RSVP system helps event organizers
 * track attendance and plan accordingly.
 *
 * All RSVP operations automatically update the event detail cache to reflect
 * current attendance counts and user RSVP status in real-time.
 *
 * @module hooks/events/useRsvp
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { eventService } from '../../services/event.service';
import { queryKeys } from '../../constants/query-keys';
import type { Rsvp, CreateRsvpRequest, UpdateRsvpRequest } from '../../types/event.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch the current user's RSVP status for an event.
 *
 * @description Retrieves the authenticated user's RSVP information for a specific event,
 * including attendance status, number of guests, and any notes. Returns null if the user
 * has not RSVP'd to the event. Data is cached for 1 minute with a 3-minute garbage
 * collection time to keep RSVP status relatively fresh.
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.eventId - The unique identifier of the event
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Rsvp | null, ApiErrorResponse>} Query result with RSVP data or null
 *
 * @example
 * // Check if user has RSVP'd to an event
 * const { data: myRsvp, isLoading } = useMyRsvp({ eventId: '123' });
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <div>
 *     {myRsvp ? (
 *       <div>
 *         <p>Status: {myRsvp.status}</p>
 *         <p>Guests: {myRsvp.guests_count}</p>
 *       </div>
 *     ) : (
 *       <p>You have not RSVP'd yet</p>
 *     )}
 *   </div>
 * );
 *
 * @example
 * // Conditionally show RSVP button based on status
 * const { data: myRsvp } = useMyRsvp({ eventId });
 *
 * return myRsvp ? (
 *   <Button onClick={handleUpdateRsvp}>Update RSVP</Button>
 * ) : (
 *   <Button onClick={handleCreateRsvp}>RSVP Now</Button>
 * );
 */
export function useMyRsvp({
  eventId,
  queryOptions,
}: {
  eventId: string;
  queryOptions?: Omit<UseQueryOptions<Rsvp | null, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: [...queryKeys.events.detail(eventId), 'myRsvp'],
    queryFn: () => eventService.getMyRsvp(eventId),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000,
    enabled: !!eventId,
    ...queryOptions,
  });
}

/**
 * Hook to submit an RSVP for an event.
 *
 * @description Creates a new RSVP record for the authenticated user. This allows users
 * to indicate their attendance intention and optionally specify the number of guests
 * and add notes. Automatically invalidates event queries to update attendance counts
 * across all views.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult} Mutation result with mutate function and state
 *
 * @example
 * // Basic RSVP submission
 * const { mutate: submitRsvp, isPending } = useRsvp();
 *
 * const handleRsvp = () => {
 *   submitRsvp({
 *     eventId: '123',
 *     data: {
 *       status: 'attending',
 *       guests_count: 2,
 *       notes: 'Looking forward to it!'
 *     }
 *   });
 * };
 *
 * @example
 * // RSVP with different statuses
 * const { mutate: submitRsvp } = useRsvp();
 *
 * // Decline event
 * submitRsvp({
 *   eventId: eventId,
 *   data: {
 *     status: 'not_attending',
 *     notes: 'Unable to make it, sorry!'
 *   }
 * });
 *
 * // Maybe attending
 * submitRsvp({
 *   eventId: eventId,
 *   data: {
 *     status: 'maybe',
 *     notes: 'Will confirm closer to the date'
 *   }
 * });
 *
 * @example
 * // RSVP with success navigation
 * const { mutate: submitRsvp } = useRsvp({
 *   onSuccess: () => {
 *     navigate('/events');
 *   }
 * });
 */
export function useRsvp(
  options?: Omit<
    UseMutationOptions<Rsvp, ApiErrorResponse, { eventId: string; data: CreateRsvpRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: CreateRsvpRequest }) =>
      eventService.rsvp(eventId, data),

    onSuccess: (newRsvp, variables) => {
      const eventId = String(variables.eventId);
      // Immediately update the myRsvp cache with the new data
      queryClient.setQueryData(
        [...queryKeys.events.detail(eventId), 'myRsvp'],
        newRsvp
      );
      // Force refetch to ensure fresh data
      queryClient.refetchQueries({
        queryKey: [...queryKeys.events.detail(eventId), 'myRsvp'],
        exact: true
      });
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
      toast.success('RSVP submitted successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to submit RSVP');
    },

    ...options,
  });
}

/**
 * Hook to update an existing RSVP.
 *
 * @description Modifies a user's existing RSVP, allowing them to change their attendance
 * status, adjust guest count, or update notes. Useful when plans change or when users
 * need to provide additional information.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult} Mutation result with mutate function and state
 *
 * @example
 * // Change RSVP status from attending to not attending
 * const { mutate: updateRsvp } = useUpdateRsvp();
 *
 * updateRsvp({
 *   eventId: '123',
 *   rsvpId: '456',
 *   data: {
 *     status: 'not_attending',
 *     notes: 'Something came up, cannot attend anymore'
 *   }
 * });
 *
 * @example
 * // Update guest count
 * const { mutate: updateRsvp, isPending } = useUpdateRsvp();
 *
 * const handleGuestCountChange = (newCount) => {
 *   updateRsvp({
 *     eventId: eventId,
 *     rsvpId: rsvpId,
 *     data: {
 *       guests_count: newCount
 *     }
 *   });
 * };
 *
 * @example
 * // Complete RSVP update with all fields
 * updateRsvp({
 *   eventId: '123',
 *   rsvpId: '456',
 *   data: {
 *     status: 'attending',
 *     guests_count: 3,
 *     notes: 'Bringing two family members'
 *   }
 * });
 */
export function useUpdateRsvp(
  options?: Omit<
    UseMutationOptions<
      Rsvp,
      ApiErrorResponse,
      { eventId: string; rsvpId: string; data: UpdateRsvpRequest }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      rsvpId,
      data,
    }: {
      eventId: string;
      rsvpId: string;
      data: UpdateRsvpRequest;
    }) => eventService.updateRsvp(eventId, rsvpId, data),

    onSuccess: (updatedRsvp, variables) => {
      const eventId = String(variables.eventId);
      // Immediately update the myRsvp cache with the updated data
      queryClient.setQueryData(
        [...queryKeys.events.detail(eventId), 'myRsvp'],
        updatedRsvp
      );
      // Force refetch to ensure fresh data
      queryClient.refetchQueries({
        queryKey: [...queryKeys.events.detail(eventId), 'myRsvp'],
        exact: true
      });
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
      toast.success('RSVP updated successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update RSVP');
    },

    ...options,
  });
}

/**
 * Hook to cancel an RSVP.
 *
 * @description Removes a user's RSVP from an event. This is different from declining
 * an event - it completely removes the RSVP record as if the user never responded.
 * Automatically updates event attendance counts across all views.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult} Mutation result with mutate function and state
 *
 * @example
 * // Cancel RSVP with confirmation
 * const { mutate: cancelRsvp } = useCancelRsvp();
 *
 * const handleCancel = () => {
 *   if (window.confirm('Are you sure you want to cancel your RSVP?')) {
 *     cancelRsvp({
 *       eventId: '123',
 *       rsvpId: '456'
 *     });
 *   }
 * };
 *
 * @example
 * // Cancel and navigate back to event list
 * const { mutate: cancelRsvp, isPending } = useCancelRsvp({
 *   onSuccess: () => {
 *     navigate('/events');
 *   }
 * });
 *
 * return (
 *   <Button
 *     onClick={() => cancelRsvp({ eventId, rsvpId })}
 *     disabled={isPending}
 *     variant="danger"
 *   >
 *     Cancel RSVP
 *   </Button>
 * );
 */
export function useCancelRsvp(
  options?: Omit<
    UseMutationOptions<any, ApiErrorResponse, { eventId: string; rsvpId: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, rsvpId }: { eventId: string; rsvpId: string }) =>
      eventService.cancelRsvp(eventId, rsvpId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.eventId) });
      toast.success('RSVP cancelled successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to cancel RSVP');
    },

    ...options,
  });
}

/**
 * Hook to fetch attendee summary for an event (admin only).
 *
 * @description Retrieves a complete summary of all RSVPs for an event, including
 * counts by status (attending, not attending, maybe) and the full list of attendees.
 * This is typically used by admins/coaches to view who has RSVP'd to an event.
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.eventId - The unique identifier of the event
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<EventAttendeeSummary, ApiErrorResponse>} Query result with attendee summary
 *
 * @example
 * // Get RSVP summary for an event
 * const { data: summary, isLoading } = useAttendeeSummary({ eventId: '123' });
 *
 * return (
 *   <div>
 *     <p>Attending: {summary?.attending_count}</p>
 *     <p>Not attending: {summary?.not_attending_count}</p>
 *     <p>Maybe: {summary?.maybe_count}</p>
 *   </div>
 * );
 */
export function useAttendeeSummary({
  eventId,
  queryOptions,
}: {
  eventId: string;
  queryOptions?: Omit<UseQueryOptions<any, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: [...queryKeys.events.detail(eventId), 'attendeeSummary'],
    queryFn: () => eventService.getAttendeeSummary(eventId),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000,
    enabled: !!eventId,
    ...queryOptions,
  });
}

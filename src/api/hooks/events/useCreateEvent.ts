/**
 * @file Event Mutation Hooks
 * @description React Query mutation hooks for creating, updating, and deleting events.
 * These hooks handle all write operations for the event calendar system, including
 * automatic cache invalidation to ensure real-time updates across the application.
 *
 * All mutations include optimistic UI updates through query cache invalidation and
 * display user-friendly toast notifications for success and error states.
 *
 * @module hooks/events/useCreateEvent
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { eventService } from '../../services/event.service';
import { queryKeys } from '../../constants/query-keys';
import type { Event, CreateEventRequest, UpdateEventRequest } from '../../types/event.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to create a new event.
 *
 * @description Creates a new event in the calendar system. After successful creation,
 * automatically invalidates all event-related queries to ensure the new event appears
 * immediately in all event lists and calendar views throughout the application.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult<Event, ApiErrorResponse, CreateEventRequest>} Mutation result with mutate function and state
 *
 * @example
 * // Basic event creation
 * const { mutate: createEvent, isPending } = useCreateEvent();
 *
 * const handleCreateEvent = () => {
 *   createEvent({
 *     title: 'Practice Session',
 *     description: 'Weekly soccer practice',
 *     date: '2024-03-15',
 *     time: '16:00',
 *     location: 'Main Field',
 *     type: 'practice',
 *     require_rsvp: true
 *   });
 * };
 *
 * @example
 * // With custom success callback
 * const { mutate: createEvent } = useCreateEvent({
 *   onSuccess: (newEvent) => {
 *     console.log('Created event:', newEvent);
 *     navigate(`/events/${newEvent.id}`);
 *   }
 * });
 *
 * @example
 * // Creating a game event with location details
 * createEvent({
 *   title: 'Championship Game',
 *   description: 'Final match of the season',
 *   date: '2024-03-20',
 *   time: '18:00',
 *   location: 'Central Stadium',
 *   type: 'game',
 *   require_rsvp: true,
 *   max_attendees: 50
 * });
 */
export function useCreateEvent(
  options?: Omit<
    UseMutationOptions<Event, ApiErrorResponse, CreateEventRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: CreateEventRequest) => eventService.create(eventData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      toast.success('Event created successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to create event');
    },

    ...options,
  });
}

/**
 * Hook to update an existing event.
 *
 * @description Updates event details such as title, date, location, or description.
 * Automatically invalidates both the event list queries and the specific event detail
 * query to ensure all views reflect the updated information immediately.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult} Mutation result with mutate function and state
 *
 * @example
 * // Update event time and location
 * const { mutate: updateEvent } = useUpdateEvent();
 *
 * updateEvent({
 *   id: '123',
 *   data: {
 *     time: '17:00',
 *     location: 'East Field (changed from Main Field)'
 *   }
 * });
 *
 * @example
 * // Update event with custom error handling
 * const { mutate: updateEvent, isPending } = useUpdateEvent({
 *   onError: (error) => {
 *     if (error.status === 403) {
 *       showPermissionDeniedModal();
 *     }
 *   }
 * });
 *
 * @example
 * // Reschedule an event
 * updateEvent({
 *   id: eventId,
 *   data: {
 *     date: '2024-03-22',
 *     time: '15:00',
 *     description: 'Rescheduled due to weather'
 *   }
 * });
 */
export function useUpdateEvent(
  options?: Omit<
    UseMutationOptions<Event, ApiErrorResponse, { id: string; data: UpdateEventRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) =>
      eventService.update(id, data),

    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(event.id) });
      toast.success('Event updated successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update event');
    },

    ...options,
  });
}

/**
 * Hook to delete an event.
 *
 * @description Permanently removes an event from the system. All associated data including
 * RSVPs will be deleted. Automatically invalidates event queries to remove the event from
 * all views immediately. This action cannot be undone.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult<any, ApiErrorResponse, string>} Mutation result with mutate function and state
 *
 * @example
 * // Delete an event with confirmation
 * const { mutate: deleteEvent } = useDeleteEvent();
 *
 * const handleDelete = (eventId) => {
 *   if (window.confirm('Are you sure you want to delete this event?')) {
 *     deleteEvent(eventId);
 *   }
 * };
 *
 * @example
 * // Delete with navigation after success
 * const { mutate: deleteEvent, isPending } = useDeleteEvent({
 *   onSuccess: () => {
 *     navigate('/events');
 *   }
 * });
 *
 * return (
 *   <Button
 *     onClick={() => deleteEvent(event.id)}
 *     disabled={isPending}
 *   >
 *     {isPending ? 'Deleting...' : 'Delete Event'}
 *   </Button>
 * );
 */
export function useDeleteEvent(
  options?: Omit<UseMutationOptions<any, ApiErrorResponse, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventService.delete(eventId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      toast.success('Event deleted successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete event');
    },

    ...options,
  });
}

/**
 * useCreateEvent Hook
 * React Query mutation hooks for creating/updating events
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { eventService } from '../../services/event.service';
import { queryKeys } from '../../constants/query-keys';
import type { Event, CreateEventRequest, UpdateEventRequest } from '../../types/event.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to create event
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
 * Hook to update event
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
 * Hook to delete event
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

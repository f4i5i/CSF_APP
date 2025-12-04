/**
 * useRsvp Hook
 * React Query hooks for RSVP operations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { eventService } from '../../services/event.service';
import { queryKeys } from '../../constants/query-keys';
import type { Rsvp, CreateRsvpRequest, UpdateRsvpRequest } from '../../types/event.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to get user's RSVP status for an event
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
 * Hook to RSVP to an event
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

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.eventId) });
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
 * Hook to update RSVP
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

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.eventId) });
      toast.success('RSVP updated successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update RSVP');
    },

    ...options,
  });
}

/**
 * Hook to cancel RSVP
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

/**
 * useEvents Hook
 * React Query hooks to fetch events
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { eventService } from '../../services/event.service';
import { queryKeys } from '../../constants/query-keys';
import type { Event, EventFilters, CalendarEvent } from '../../types/event.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch events
 */
export function useEvents({
  filters,
  queryOptions,
}: {
  filters?: EventFilters;
  queryOptions?: Omit<UseQueryOptions<Event[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
} = {}) {
  return useQuery({
    queryKey: queryKeys.events.list(filters),
    queryFn: () => eventService.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Hook to fetch single event
 */
export function useEvent({
  eventId,
  queryOptions,
}: {
  eventId: string;
  queryOptions?: Omit<UseQueryOptions<Event, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventService.getById(eventId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!eventId,
    ...queryOptions,
  });
}

/**
 * Hook to fetch upcoming events
 */
export function useUpcomingEvents({
  limit = 10,
  queryOptions,
}: {
  limit?: number;
  queryOptions?: Omit<UseQueryOptions<Event[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
} = {}) {
  return useEvents({
    filters: { upcoming: true, limit },
    queryOptions,
  });
}

/**
 * Hook to fetch calendar events for a month
 */
export function useCalendarEvents({
  month,
  year,
  queryOptions,
}: {
  month: string;
  year: string;
  queryOptions?: Omit<UseQueryOptions<CalendarEvent[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.events.calendar(month, year),
    queryFn: () => eventService.getCalendarEvents(month, year),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!month && !!year,
    ...queryOptions,
  });
}

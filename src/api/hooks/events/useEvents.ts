/**
 * @file Event Query Hooks
 * @description React Query hooks for fetching and managing event data in the application.
 * These hooks provide access to the event calendar system, allowing users to view upcoming
 * events, browse event details, and access calendar views for monthly event scheduling.
 *
 * Events are cached for 2 minutes and include automatic refetching to ensure users always
 * see up-to-date event information, including schedule changes and new events.
 *
 * @module hooks/events/useEvents
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { eventService } from '../../services/event.service';
import { queryKeys } from '../../constants/query-keys';
import type { Event, EventFilters, CalendarEvent } from '../../types/event.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch events with optional filtering.
 *
 * @description Retrieves a list of events from the API with support for various filters
 * such as date range, event type, and status. Data is cached for 2 minutes to reduce
 * unnecessary API calls while keeping information relatively fresh.
 *
 * @param {Object} params - Hook parameters
 * @param {EventFilters} [params.filters] - Optional filters to apply (date range, type, status)
 * @param {Object} [params.queryOptions] - Additional React Query options to customize behavior
 *
 * @returns {UseQueryResult<Event[], ApiErrorResponse>} Query result with events data and loading states
 *
 * @example
 * // Fetch all events
 * const { data: events, isLoading } = useEvents();
 *
 * @example
 * // Fetch events with filters
 * const { data: events } = useEvents({
 *   filters: {
 *     type: 'practice',
 *     start_date: '2024-01-01',
 *     end_date: '2024-12-31'
 *   }
 * });
 *
 * @example
 * // With custom query options
 * const { data: events } = useEvents({
 *   filters: { type: 'game' },
 *   queryOptions: {
 *     enabled: isAuthenticated,
 *     refetchInterval: 60000 // Refetch every minute
 *   }
 * });
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
 * Hook to fetch a single event by ID.
 *
 * @description Retrieves detailed information for a specific event, including description,
 * location, date/time, RSVP count, and attendee information. The query is automatically
 * disabled if no eventId is provided.
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.eventId - The unique identifier of the event to fetch
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Event, ApiErrorResponse>} Query result with event details and loading states
 *
 * @example
 * // Fetch a specific event
 * const { data: event, isLoading, error } = useEvent({
 *   eventId: '123'
 * });
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     <h1>{event.title}</h1>
 *     <p>{event.description}</p>
 *     <p>Date: {new Date(event.date).toLocaleDateString()}</p>
 *   </div>
 * );
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
 * Hook to fetch upcoming events.
 *
 * @description Convenience hook that fetches events scheduled for the future, sorted by date.
 * Useful for displaying event lists on dashboards, home pages, or notification centers.
 *
 * @param {Object} [params] - Hook parameters
 * @param {number} [params.limit=10] - Maximum number of upcoming events to return
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Event[], ApiErrorResponse>} Query result with upcoming events
 *
 * @example
 * // Show next 5 upcoming events on dashboard
 * const { data: upcomingEvents } = useUpcomingEvents({ limit: 5 });
 *
 * return (
 *   <div>
 *     <h2>Upcoming Events</h2>
 *     {upcomingEvents?.map(event => (
 *       <EventCard key={event.id} event={event} />
 *     ))}
 *   </div>
 * );
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
 * Hook to fetch calendar events for a specific month.
 *
 * @description Retrieves events formatted for calendar display, including date positioning
 * and visual indicators. Data is cached for 5 minutes since calendar views change less
 * frequently. This hook is specifically designed for calendar UI components.
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.month - Month to fetch events for (format: '01' to '12')
 * @param {string} params.year - Year to fetch events for (format: 'YYYY')
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<CalendarEvent[], ApiErrorResponse>} Query result with calendar-formatted events
 *
 * @example
 * // Display events for January 2024 in a calendar
 * const { data: calendarEvents, isLoading } = useCalendarEvents({
 *   month: '01',
 *   year: '2024'
 * });
 *
 * if (isLoading) return <CalendarSkeleton />;
 *
 * return (
 *   <Calendar
 *     month={1}
 *     year={2024}
 *     events={calendarEvents}
 *   />
 * );
 *
 * @example
 * // Dynamically fetch based on current month
 * const [currentDate, setCurrentDate] = useState(new Date());
 * const { data: events } = useCalendarEvents({
 *   month: String(currentDate.getMonth() + 1).padStart(2, '0'),
 *   year: String(currentDate.getFullYear())
 * });
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

/**
 * Event Service
 * Handles event management and RSVP operations
 */

import { apiClient } from '../client/axios-client';
import { ENDPOINTS } from '../config/endpoints';
import type {
  Event,
  EventId,
  CreateEventRequest,
  UpdateEventRequest,
  EventFilters,
  Rsvp,
  RsvpId,
  CreateRsvpRequest,
  UpdateRsvpRequest,
  EventAttendeeSummary,
  CalendarEvent,
} from '../types/event.types';

export const eventService = {
  /**
   * Get all events with optional filters
   */
  async getAll(filters?: EventFilters): Promise<Event[]> {
    const { data } = await apiClient.get<Event[]>(ENDPOINTS.EVENTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get event by ID
   */
  async getById(id: EventId): Promise<Event> {
    const { data } = await apiClient.get<Event>(ENDPOINTS.EVENTS.BY_ID(id));
    return data;
  },

  /**
   * Create new event (admin only)
   */
  async create(eventData: CreateEventRequest): Promise<Event> {
    const { data } = await apiClient.post<Event>(ENDPOINTS.EVENTS.CREATE, eventData);
    return data;
  },

  /**
   * Update event information (admin only)
   */
  async update(id: EventId, eventData: UpdateEventRequest): Promise<Event> {
    const { data } = await apiClient.put<Event>(ENDPOINTS.EVENTS.BY_ID(id), eventData);
    return data;
  },

  /**
   * Delete event (admin only)
   */
  async delete(id: EventId): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(ENDPOINTS.EVENTS.BY_ID(id));
    return data;
  },

  /**
   * RSVP to an event
   */
  async rsvp(eventId: EventId, rsvpData: CreateRsvpRequest): Promise<Rsvp> {
    const { data } = await apiClient.post<Rsvp>(
      ENDPOINTS.EVENTS.RSVP(eventId),
      rsvpData
    );
    return data;
  },

  /**
   * Get RSVPs for an event (admin only)
   */
  async getRsvps(eventId: EventId): Promise<Rsvp[]> {
    const { data } = await apiClient.get<Rsvp[]>(ENDPOINTS.EVENTS.RSVPS(eventId));
    return data;
  },

  /**
   * Get user's RSVP status for an event
   */
  async getMyRsvp(eventId: EventId): Promise<Rsvp | null> {
    const { data } = await apiClient.get<Rsvp | null>(ENDPOINTS.EVENTS.MY_RSVP(eventId));
    return data;
  },

  /**
   * Update RSVP status
   */
  async updateRsvp(eventId: EventId, rsvpId: RsvpId, rsvpData: UpdateRsvpRequest): Promise<Rsvp> {
    const { data } = await apiClient.put<Rsvp>(
      ENDPOINTS.EVENTS.RSVP_BY_ID(eventId, rsvpId),
      rsvpData
    );
    return data;
  },

  /**
   * Cancel RSVP
   */
  async cancelRsvp(eventId: EventId, rsvpId: RsvpId): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      ENDPOINTS.EVENTS.RSVP_BY_ID(eventId, rsvpId)
    );
    return data;
  },

  /**
   * Get event attendee summary (admin only)
   */
  async getAttendeeSummary(eventId: EventId): Promise<EventAttendeeSummary> {
    const { data } = await apiClient.get<EventAttendeeSummary>(
      ENDPOINTS.EVENTS.ATTENDEE_SUMMARY(eventId)
    );
    return data;
  },

  /**
   * Get upcoming events
   */
  async getUpcoming(limit: number = 10): Promise<Event[]> {
    return this.getAll({ upcoming: true, limit });
  },

  /**
   * Get events by type
   */
  async getByType(type: string): Promise<Event[]> {
    return this.getAll({ type: type as any });
  },

  /**
   * Get events by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    return this.getAll({ start_date: startDate, end_date: endDate });
  },

  /**
   * Get events for the current month
   */
  async getThisMonth(): Promise<Event[]> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    return this.getByDateRange(startDate, endDate);
  },

  /**
   * Get events for a specific class
   */
  async getByClass(classId: string): Promise<Event[]> {
    const { data } = await apiClient.get<Event[]>(ENDPOINTS.EVENTS.BY_CLASS(classId));
    return data;
  },

  /**
   * Get calendar events for a month
   */
  async getCalendarEvents(month: string, year: string): Promise<CalendarEvent[]> {
    const { data } = await apiClient.get<CalendarEvent[]>(ENDPOINTS.EVENTS.CALENDAR, {
      params: { month, year },
    });
    return data;
  },
};

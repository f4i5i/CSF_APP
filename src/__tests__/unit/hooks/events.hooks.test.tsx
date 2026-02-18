/**
 * Unit Tests for Event Hooks
 * Tests useEvents, useEvent, useUpcomingEvents, useCalendarEvents,
 * useMyRsvp, useRsvp, useUpdateRsvp, useCancelRsvp, useAttendeeSummary,
 * useCreateEvent, useUpdateEvent, useDeleteEvent
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import { useEvents, useEvent, useUpcomingEvents, useCalendarEvents } from '../../../api/hooks/events/useEvents';
import { useMyRsvp, useRsvp, useUpdateRsvp, useCancelRsvp, useAttendeeSummary } from '../../../api/hooks/events/useRsvp';
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from '../../../api/hooks/events/useCreateEvent';
import { mockEndOfSeasonEvent, mockEvents } from '../../utils/mock-data';

jest.mock('../../../api/services/event.service', () => ({
  eventService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getCalendarEvents: jest.fn(),
    getMyRsvp: jest.fn(),
    rsvp: jest.fn(),
    updateRsvp: jest.fn(),
    cancelRsvp: jest.fn(),
    getAttendeeSummary: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { eventService } from '../../../api/services/event.service';

const mockedService = eventService as jest.Mocked<typeof eventService>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0, refetchOnWindowFocus: false, refetchOnMount: false, refetchOnReconnect: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('Event Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  // =========================================================================
  // useEvents
  // =========================================================================
  describe('useEvents', () => {
    it('should fetch all events', async () => {
      mockedService.getAll.mockResolvedValueOnce(mockEvents as any);

      const { result } = renderHook(
        () => useEvents({}),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockEvents);
    });

    it('should pass filters to the service', async () => {
      const filters = { class_id: 'class-1' };
      mockedService.getAll.mockResolvedValueOnce([] as any);

      renderHook(() => useEvents({ filters: filters as any }), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(mockedService.getAll).toHaveBeenCalledWith(filters));
    });
  });

  // =========================================================================
  // useEvent
  // =========================================================================
  describe('useEvent', () => {
    it('should fetch a single event by ID', async () => {
      mockedService.getById.mockResolvedValueOnce(mockEndOfSeasonEvent as any);

      const { result } = renderHook(
        () => useEvent({ eventId: 'event-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockEndOfSeasonEvent);
      expect(mockedService.getById).toHaveBeenCalledWith('event-1');
    });

    it('should not fetch when eventId is empty', async () => {
      const { result } = renderHook(
        () => useEvent({ eventId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useUpcomingEvents
  // =========================================================================
  describe('useUpcomingEvents', () => {
    it('should fetch upcoming events', async () => {
      mockedService.getAll.mockResolvedValueOnce([] as any);

      const { result } = renderHook(
        () => useUpcomingEvents({}),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ upcoming: true })
      );
    });
  });

  // =========================================================================
  // useCalendarEvents
  // =========================================================================
  describe('useCalendarEvents', () => {
    it('should fetch calendar events for a specific month and year', async () => {
      mockedService.getCalendarEvents.mockResolvedValueOnce([] as any);

      const { result } = renderHook(
        () => useCalendarEvents({ month: 3, year: 2025 }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.getCalendarEvents).toHaveBeenCalledWith(3, 2025);
    });
  });

  // =========================================================================
  // useMyRsvp
  // =========================================================================
  describe('useMyRsvp', () => {
    it('should fetch the current user RSVP for an event', async () => {
      const mockRsvp = { id: 'rsvp-1', status: 'attending' };
      mockedService.getMyRsvp.mockResolvedValueOnce(mockRsvp as any);

      const { result } = renderHook(
        () => useMyRsvp({ eventId: 'event-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockRsvp);
    });

    it('should not fetch when eventId is empty', async () => {
      const { result } = renderHook(
        () => useMyRsvp({ eventId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useRsvp
  // =========================================================================
  describe('useRsvp', () => {
    it('should create an RSVP and show success toast', async () => {
      const mockResult = { id: 'rsvp-1', status: 'attending' };
      mockedService.rsvp.mockResolvedValueOnce(mockResult as any);

      const { result } = renderHook(() => useRsvp(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ eventId: 'event-1', data: { status: 'attending' } } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockedService.rsvp.mockRejectedValueOnce({ message: 'Event is full' });

      const { result } = renderHook(() => useRsvp(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ eventId: 'event-1', data: { status: 'attending' } } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Event is full');
    });
  });

  // =========================================================================
  // useUpdateRsvp
  // =========================================================================
  describe('useUpdateRsvp', () => {
    it('should update an RSVP and show success toast', async () => {
      const mockResult = { id: 'rsvp-1', status: 'declined' };
      mockedService.updateRsvp.mockResolvedValueOnce(mockResult as any);

      const { result } = renderHook(() => useUpdateRsvp(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          eventId: 'event-1',
          rsvpId: 'rsvp-1',
          data: { status: 'declined' },
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useCancelRsvp
  // =========================================================================
  describe('useCancelRsvp', () => {
    it('should cancel an RSVP and show success toast', async () => {
      mockedService.cancelRsvp.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useCancelRsvp(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ eventId: 'event-1', rsvpId: 'rsvp-1' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useAttendeeSummary
  // =========================================================================
  describe('useAttendeeSummary', () => {
    it('should fetch attendee summary for an event', async () => {
      const mockSummary = { attending: 10, declined: 2, pending: 5 };
      mockedService.getAttendeeSummary.mockResolvedValueOnce(mockSummary as any);

      const { result } = renderHook(
        () => useAttendeeSummary({ eventId: 'event-1' }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockSummary);
    });

    it('should not fetch when eventId is empty', async () => {
      const { result } = renderHook(
        () => useAttendeeSummary({ eventId: '' }),
        { wrapper: createWrapper(queryClient) }
      );

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =========================================================================
  // useCreateEvent
  // =========================================================================
  describe('useCreateEvent', () => {
    it('should create an event and show success toast', async () => {
      const created = { id: 'event-new', title: 'New Event' };
      mockedService.create.mockResolvedValueOnce(created as any);

      const { result } = renderHook(() => useCreateEvent(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ title: 'New Event', date: '2025-06-15' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockedService.create.mockRejectedValueOnce({ message: 'Validation error' });

      const { result } = renderHook(() => useCreateEvent(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ title: '' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Validation error');
    });
  });

  // =========================================================================
  // useUpdateEvent
  // =========================================================================
  describe('useUpdateEvent', () => {
    it('should update an event and show success toast', async () => {
      const updated = { id: 'event-1', title: 'Updated Event' };
      mockedService.update.mockResolvedValueOnce(updated as any);

      const { result } = renderHook(() => useUpdateEvent(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ id: 'event-1', data: { title: 'Updated Event' } } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useDeleteEvent
  // =========================================================================
  describe('useDeleteEvent', () => {
    it('should delete an event and show success toast', async () => {
      mockedService.delete.mockResolvedValueOnce({} as any);

      const { result } = renderHook(() => useDeleteEvent(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate('event-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.delete).toHaveBeenCalledWith('event-1');
      expect(toast.success).toHaveBeenCalled();
    });
  });
});

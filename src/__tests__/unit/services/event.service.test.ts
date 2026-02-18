/**
 * Event Service Unit Tests (TypeScript version)
 * Tests for event management and RSVP operations
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const eventModule = require('../../../api/services/event.service');
const eventService =
  eventModule.eventService ||
  eventModule.default?.eventService ||
  eventModule.default;

const mock = new MockAdapter(apiClient);

const mockEvent = {
  id: 'event-1',
  title: 'Annual Sports Day',
  description: 'Annual sports event for all students',
  type: 'tournament',
  start_datetime: '2024-06-15T09:00:00Z',
  end_datetime: '2024-06-15T17:00:00Z',
  location: 'Main Field',
  max_attendees: 200,
  created_at: '2024-01-01T00:00:00Z',
};

const mockRsvp = {
  id: 'rsvp-1',
  event_id: 'event-1',
  user_id: 'user-1',
  status: 'attending',
  child_ids: ['child-1'],
  created_at: '2024-06-01T00:00:00Z',
};

const mockAttendeeSummary = {
  total_attending: 50,
  total_not_attending: 10,
  total_maybe: 5,
  attendees: [],
};

describe('eventService (TypeScript)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('csf_access_token', 'mock-access-token');
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  // ===========================================
  // MODULE LOADING
  // ===========================================
  describe('module loading', () => {
    it('should have eventService defined with all methods', () => {
      expect(eventService).toBeDefined();
      expect(typeof eventService.getAll).toBe('function');
      expect(typeof eventService.getById).toBe('function');
      expect(typeof eventService.create).toBe('function');
      expect(typeof eventService.update).toBe('function');
      expect(typeof eventService.delete).toBe('function');
      expect(typeof eventService.rsvp).toBe('function');
      expect(typeof eventService.getRsvps).toBe('function');
      expect(typeof eventService.getMyRsvp).toBe('function');
      expect(typeof eventService.updateRsvp).toBe('function');
      expect(typeof eventService.cancelRsvp).toBe('function');
      expect(typeof eventService.getAttendeeSummary).toBe('function');
      expect(typeof eventService.getUpcoming).toBe('function');
      expect(typeof eventService.getByType).toBe('function');
      expect(typeof eventService.getByDateRange).toBe('function');
      expect(typeof eventService.getThisMonth).toBe('function');
      expect(typeof eventService.getByClass).toBe('function');
      expect(typeof eventService.getCalendarEvents).toBe('function');
    });
  });

  // ===========================================
  // GET ALL
  // ===========================================
  describe('getAll', () => {
    it('should return events', async () => {
      mock.onGet('/events/calendar').reply(200, [mockEvent]);
      const result = await eventService.getAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toBe('Annual Sports Day');
    });

    it('should pass filters', async () => {
      mock.onGet('/events/calendar').reply(200, [mockEvent]);
      await eventService.getAll({ type: 'tournament' });
    });

    it('should throw on 500', async () => {
      mock.onGet('/events/calendar').reply(500, { message: 'Server error' });
      await expect(eventService.getAll()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET BY ID
  // ===========================================
  describe('getById', () => {
    it('should return event by ID', async () => {
      mock.onGet('/events/event-1').reply(200, mockEvent);
      const result = await eventService.getById('event-1');
      expect(result.id).toBe('event-1');
    });

    it('should throw on 404', async () => {
      mock.onGet('/events/bad-id').reply(404, { message: 'Not found' });
      await expect(eventService.getById('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // CREATE
  // ===========================================
  describe('create', () => {
    it('should create event', async () => {
      mock.onPost('/events').reply(201, { id: 'event-2', ...mockEvent });
      const result = await eventService.create(mockEvent as any);
      expect(result.id).toBe('event-2');
    });

    it('should throw on 400', async () => {
      mock.onPost('/events').reply(400, { message: 'Title required' });
      await expect(eventService.create({} as any)).rejects.toThrow();
    });
  });

  // ===========================================
  // UPDATE
  // ===========================================
  describe('update', () => {
    it('should update event', async () => {
      const updated = { ...mockEvent, title: 'Updated Sports Day' };
      mock.onPut('/events/event-1').reply(200, updated);
      const result = await eventService.update('event-1', { title: 'Updated Sports Day' } as any);
      expect(result.title).toBe('Updated Sports Day');
    });
  });

  // ===========================================
  // DELETE
  // ===========================================
  describe('delete', () => {
    it('should delete event', async () => {
      mock.onDelete('/events/event-1').reply(200, { message: 'Deleted' });
      const result = await eventService.delete('event-1');
      expect(result.message).toBe('Deleted');
    });
  });

  // ===========================================
  // RSVP
  // ===========================================
  describe('rsvp', () => {
    it('should create RSVP', async () => {
      mock.onPost('/events/event-1/rsvp').reply(201, mockRsvp);
      const result = await eventService.rsvp('event-1', { status: 'attending', child_ids: ['child-1'] });
      expect(result.status).toBe('attending');
    });
  });

  // ===========================================
  // GET RSVPs
  // ===========================================
  describe('getRsvps', () => {
    it('should return RSVPs for event', async () => {
      mock.onGet('/events/event-1/rsvps').reply(200, [mockRsvp]);
      const result = await eventService.getRsvps('event-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ===========================================
  // GET MY RSVP
  // ===========================================
  describe('getMyRsvp', () => {
    it('should return user RSVP', async () => {
      mock.onGet('/events/event-1/my-rsvp').reply(200, mockRsvp);
      const result = await eventService.getMyRsvp('event-1');
      expect(result.status).toBe('attending');
    });

    it('should return null when no RSVP', async () => {
      mock.onGet('/events/event-1/my-rsvp').reply(200, null);
      const result = await eventService.getMyRsvp('event-1');
      expect(result).toBeNull();
    });
  });

  // ===========================================
  // UPDATE RSVP
  // ===========================================
  describe('updateRsvp', () => {
    it('should update RSVP', async () => {
      const updated = { ...mockRsvp, status: 'not_attending' };
      mock.onPut('/events/event-1/rsvps/rsvp-1').reply(200, updated);
      const result = await eventService.updateRsvp('event-1', 'rsvp-1', { status: 'not_attending' } as any);
      expect(result.status).toBe('not_attending');
    });
  });

  // ===========================================
  // CANCEL RSVP
  // ===========================================
  describe('cancelRsvp', () => {
    it('should cancel RSVP', async () => {
      mock.onDelete('/events/event-1/rsvps/rsvp-1').reply(200, { message: 'RSVP cancelled' });
      const result = await eventService.cancelRsvp('event-1', 'rsvp-1');
      expect(result.message).toBe('RSVP cancelled');
    });
  });

  // ===========================================
  // GET ATTENDEE SUMMARY
  // ===========================================
  describe('getAttendeeSummary', () => {
    it('should return attendee summary', async () => {
      mock.onGet('/events/event-1/attendee-summary').reply(200, mockAttendeeSummary);
      const result = await eventService.getAttendeeSummary('event-1');
      expect(result.total_attending).toBe(50);
    });
  });

  // ===========================================
  // CONVENIENCE METHODS
  // ===========================================
  describe('getUpcoming', () => {
    it('should call getAll with upcoming filter', async () => {
      mock.onGet('/events/calendar').reply(200, [mockEvent]);
      const result = await eventService.getUpcoming(5);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByType', () => {
    it('should call getAll with type filter', async () => {
      mock.onGet('/events/calendar').reply(200, [mockEvent]);
      const result = await eventService.getByType('tournament');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByDateRange', () => {
    it('should call getAll with date range', async () => {
      mock.onGet('/events/calendar').reply(200, [mockEvent]);
      const result = await eventService.getByDateRange('2024-01-01', '2024-12-31');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getThisMonth', () => {
    it('should call getByDateRange for current month', async () => {
      mock.onGet('/events/calendar').reply(200, [mockEvent]);
      const result = await eventService.getThisMonth();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByClass', () => {
    it('should return events for a class', async () => {
      mock.onGet('/events/class/class-1').reply(200, [mockEvent]);
      const result = await eventService.getByClass('class-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getCalendarEvents', () => {
    it('should return calendar events for month/year', async () => {
      mock.onGet('/events/calendar').reply(200, [mockEvent]);
      const result = await eventService.getCalendarEvents('6', '2024');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

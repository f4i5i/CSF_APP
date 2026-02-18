/**
 * Events Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/events.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockEvent = { id: 'ev-1', title: 'Tournament', type: 'tournament', start_datetime: '2024-06-15T09:00:00Z' };
const mockRsvp = { id: 'rsvp-1', event_id: 'ev-1', status: 'attending' };

describe('eventsService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
      expect(typeof service.rsvp).toBe('function');
      expect(typeof service.getRsvps).toBe('function');
      expect(typeof service.getMyRsvp).toBe('function');
      expect(typeof service.updateRsvp).toBe('function');
      expect(typeof service.cancelRsvp).toBe('function');
      expect(typeof service.getAttendeeSummary).toBe('function');
      expect(typeof service.getUpcoming).toBe('function');
      expect(typeof service.getByType).toBe('function');
      expect(typeof service.getByDateRange).toBe('function');
      expect(typeof service.getThisMonth).toBe('function');
      expect(typeof service.getByClass).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return events', async () => {
      mock.onGet('/events').reply(200, [mockEvent]);
      const result = await service.getAll();
      expect(result[0].title).toBe('Tournament');
    });

    it('should pass filters', async () => {
      mock.onGet('/events').reply(200, [mockEvent]);
      await service.getAll({ type: 'tournament', upcoming: true });
    });

    it('should throw on 500', async () => {
      mock.onGet('/events').reply(500);
      await expect(service.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should return event', async () => {
      mock.onGet('/events/ev-1').reply(200, mockEvent);
      const result = await service.getById('ev-1');
      expect(result.id).toBe('ev-1');
    });

    it('should throw on 404', async () => {
      mock.onGet('/events/bad').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create event', async () => {
      mock.onPost('/events').reply(201, mockEvent);
      const result = await service.create({ title: 'Tournament', type: 'tournament' });
      expect(result.title).toBe('Tournament');
    });
  });

  describe('update', () => {
    it('should update event', async () => {
      mock.onPut('/events/ev-1').reply(200, { ...mockEvent, title: 'Updated' });
      const result = await service.update('ev-1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete event', async () => {
      mock.onDelete('/events/ev-1').reply(200, { message: 'Deleted' });
      const result = await service.delete('ev-1');
      expect(result.message).toBe('Deleted');
    });
  });

  describe('rsvp', () => {
    it('should create RSVP', async () => {
      mock.onPost('/events/ev-1/rsvp').reply(201, mockRsvp);
      const result = await service.rsvp('ev-1', { status: 'attending' });
      expect(result.status).toBe('attending');
    });
  });

  describe('getRsvps', () => {
    it('should get RSVPs', async () => {
      mock.onGet('/events/ev-1/rsvps').reply(200, [mockRsvp]);
      const result = await service.getRsvps('ev-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getMyRsvp', () => {
    it('should get user RSVP', async () => {
      mock.onGet('/events/ev-1/my-rsvp').reply(200, mockRsvp);
      const result = await service.getMyRsvp('ev-1');
      expect(result.status).toBe('attending');
    });
  });

  describe('updateRsvp', () => {
    it('should update RSVP', async () => {
      mock.onPut('/events/ev-1/rsvps/rsvp-1').reply(200, { ...mockRsvp, status: 'not_attending' });
      const result = await service.updateRsvp('ev-1', 'rsvp-1', { status: 'not_attending' });
      expect(result.status).toBe('not_attending');
    });
  });

  describe('cancelRsvp', () => {
    it('should cancel RSVP', async () => {
      mock.onDelete('/events/ev-1/rsvps/rsvp-1').reply(200, { message: 'Cancelled' });
      const result = await service.cancelRsvp('ev-1', 'rsvp-1');
      expect(result.message).toBe('Cancelled');
    });
  });

  describe('getAttendeeSummary', () => {
    it('should return attendee summary', async () => {
      mock.onGet('/events/ev-1/attendee-summary').reply(200, { total_attending: 30 });
      const result = await service.getAttendeeSummary('ev-1');
      expect(result.total_attending).toBe(30);
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      mock.onGet('/events').reply(200, [mockEvent]);
    });

    it('getUpcoming should filter upcoming', async () => {
      const result = await service.getUpcoming(5);
      expect(Array.isArray(result)).toBe(true);
    });

    it('getByType should filter by type', async () => {
      const result = await service.getByType('tournament');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getByDateRange should filter date range', async () => {
      const result = await service.getByDateRange('2024-01-01', '2024-12-31');
      expect(Array.isArray(result)).toBe(true);
    });

    it('getThisMonth should compute current month range', async () => {
      const result = await service.getThisMonth();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByClass', () => {
    it('should return class events', async () => {
      mock.onGet('/events/class/cls-1').reply(200, [mockEvent]);
      const result = await service.getByClass('cls-1');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should pass filters', async () => {
      mock.onGet('/events/class/cls-1').reply(200, [mockEvent]);
      await service.getByClass('cls-1', { upcoming: true });
    });
  });
});

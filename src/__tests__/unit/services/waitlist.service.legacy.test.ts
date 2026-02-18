/**
 * Waitlist Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/waitlist.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockEntry = { id: 1, child_id: 'ch-1', class_id: 'cls-1', status: 'waiting', position: 3 };

describe('waitlistService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.add).toBe('function');
      expect(typeof service.moveToEnrolled).toBe('function');
      expect(typeof service.remove).toBe('function');
      expect(typeof service.notifyAvailable).toBe('function');
      expect(typeof service.getPosition).toBe('function');
      expect(typeof service.getCountByClass).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return waitlist entries', async () => {
      mock.onGet(/\/waitlist/).reply(200, [mockEntry]);
      const result = await service.getAll();
      expect(result[0].id).toBe(1);
    });

    it('should pass filter params', async () => {
      mock.onGet(/\/waitlist/).reply(200, [mockEntry]);
      const result = await service.getAll({ class_id: 'cls-1', status: 'waiting' });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw on 500', async () => {
      mock.onGet(/\/waitlist/).reply(500);
      await expect(service.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should return entry by ID', async () => {
      mock.onGet('/waitlist/1').reply(200, mockEntry);
      const result = await service.getById(1);
      expect(result.position).toBe(3);
    });

    it('should throw on 404', async () => {
      mock.onGet('/waitlist/999').reply(404);
      await expect(service.getById(999)).rejects.toThrow();
    });
  });

  describe('add', () => {
    it('should add to waitlist', async () => {
      mock.onPost('/waitlist').reply(201, mockEntry);
      const result = await service.add({ child_id: 'ch-1', class_id: 'cls-1' });
      expect(result.id).toBe(1);
    });

    it('should throw on 400', async () => {
      mock.onPost('/waitlist').reply(400, { message: 'Already on waitlist' });
      await expect(service.add({ child_id: 'ch-1', class_id: 'cls-1' })).rejects.toThrow();
    });
  });

  describe('moveToEnrolled', () => {
    it('should move to enrolled', async () => {
      mock.onPost('/waitlist/1/enroll').reply(200, { message: 'Enrolled', enrollment_id: 'enr-1' });
      const result = await service.moveToEnrolled(1, { notify: true });
      expect(result.enrollment_id).toBe('enr-1');
    });

    it('should throw on 404', async () => {
      mock.onPost('/waitlist/999/enroll').reply(404);
      await expect(service.moveToEnrolled(999)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove from waitlist', async () => {
      mock.onDelete('/waitlist/1').reply(200, { message: 'Removed' });
      const result = await service.remove(1);
      expect(result.message).toBe('Removed');
    });
  });

  describe('notifyAvailable', () => {
    it('should send notification', async () => {
      mock.onPost('/waitlist/1/notify').reply(200, { message: 'Notified' });
      const result = await service.notifyAvailable(1);
      expect(result.message).toBe('Notified');
    });
  });

  describe('getPosition', () => {
    it('should return position', async () => {
      mock.onGet('/waitlist/1/position').reply(200, { position: 3, total: 10 });
      const result = await service.getPosition(1);
      expect(result.position).toBe(3);
    });
  });

  describe('getCountByClass', () => {
    it('should return count for a class', async () => {
      mock.onGet('/waitlist/class/cls-1/count').reply(200, { count: 5 });
      const result = await service.getCountByClass('cls-1');
      expect(result.count).toBe(5);
    });
  });
});

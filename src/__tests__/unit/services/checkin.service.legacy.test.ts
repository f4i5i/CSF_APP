/**
 * Check-In Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/checkin.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockCheckIn = { id: 'ci-1', enrollment_id: 'enr-1', check_in_time: '2024-01-15T09:00:00Z' };

describe('checkinService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getClassStatus).toBe('function');
      expect(typeof service.getByClass).toBe('function');
      expect(typeof service.checkIn).toBe('function');
      expect(typeof service.checkOut).toBe('function');
      expect(typeof service.bulkCheckIn).toBe('function');
      expect(typeof service.toggleCheckIn).toBe('function');
    });
  });

  describe('getClassStatus', () => {
    it('should fetch class check-in status', async () => {
      mock.onGet('/check-in/class/cls-1/status').reply(200, {
        class_id: 'cls-1',
        statuses: [{ enrollment_id: 'enr-1', checked_in: true }],
      });
      const result = await service.getClassStatus('cls-1');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should use provided date', async () => {
      mock.onGet('/check-in/class/cls-1/status').reply((config) => {
        expect(config.params.check_in_date).toBe('2024-06-15');
        return [200, { statuses: [] }];
      });
      await service.getClassStatus('cls-1', '2024-06-15');
    });

    it('should handle raw data response (no statuses key)', async () => {
      mock.onGet('/check-in/class/cls-1/status').reply(200, [
        { enrollment_id: 'enr-1', checked_in: false },
      ]);
      const result = await service.getClassStatus('cls-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByClass', () => {
    it('should return class check-ins', async () => {
      mock.onGet('/check-in/class/cls-1').reply(200, [mockCheckIn]);
      const result = await service.getByClass('cls-1');
      expect(result[0].id).toBe('ci-1');
    });
  });

  describe('checkIn', () => {
    it('should check in student', async () => {
      mock.onPost('/check-in').reply(201, mockCheckIn);
      const result = await service.checkIn({ enrollment_id: 'enr-1' });
      expect(result.enrollment_id).toBe('enr-1');
    });

    it('should throw on 400', async () => {
      mock.onPost('/check-in').reply(400, { message: 'Already checked in' });
      await expect(service.checkIn({ enrollment_id: 'enr-1' })).rejects.toThrow();
    });
  });

  describe('checkOut', () => {
    it('should check out student', async () => {
      mock.onPut('/check-in/ci-1/checkout').reply(200, { ...mockCheckIn, check_out_time: '2024-01-15T12:00:00Z' });
      const result = await service.checkOut('ci-1');
      expect(result.check_out_time).toBeDefined();
    });
  });

  describe('bulkCheckIn', () => {
    it('should bulk check in', async () => {
      mock.onPost('/check-in/bulk').reply(200, { checked_in: 5, failed: 0 });
      const result = await service.bulkCheckIn({ class_id: 'cls-1', enrollment_ids: ['enr-1', 'enr-2'] });
      expect(result.checked_in).toBe(5);
    });
  });

  describe('toggleCheckIn', () => {
    it('should check out when already checked in', async () => {
      mock.onPut('/check-in/ci-1/checkout').reply(200, { ...mockCheckIn, check_out_time: '2024-01-15T12:00:00Z' });
      const result = await service.toggleCheckIn({ enrollment_id: 'enr-1', isCheckedIn: true, checkInId: 'ci-1' });
      expect(result.check_out_time).toBeDefined();
    });

    it('should check in when not checked in', async () => {
      mock.onPost('/check-in').reply(201, mockCheckIn);
      const result = await service.toggleCheckIn({ enrollment_id: 'enr-1', isCheckedIn: false });
      expect(result.enrollment_id).toBe('enr-1');
    });
  });
});

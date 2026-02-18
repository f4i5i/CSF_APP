/**
 * Attendance Service Legacy (JS) Unit Tests
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('../../../api/services/attendance.service.js');
const service = mod.default || mod;

const mock = new MockAdapter(apiClient);

const mockRecord = { id: 'att-1', child_id: 'ch-1', class_id: 'cls-1', date: '2024-01-15', status: 'present' };

describe('attendanceService (legacy JS)', () => {
  beforeEach(() => { localStorage.clear(); localStorage.setItem('csf_access_token', 'tok'); mock.reset(); });
  afterAll(() => { mock.restore(); });

  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof service.getAll).toBe('function');
      expect(typeof service.getByEnrollment).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.create).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
      expect(typeof service.getStatsByChild).toBe('function');
      expect(typeof service.getByClass).toBe('function');
      expect(typeof service.getByDate).toBe('function');
      expect(typeof service.getStats).toBe('function');
      expect(typeof service.getStreak).toBe('function');
      expect(typeof service.bulkCreate).toBe('function');
      expect(typeof service.getSummary).toBe('function');
    });
  });

  describe('getAll', () => {
    it('should return attendance records', async () => {
      mock.onGet('/attendance').reply(200, { items: [mockRecord], total: 1 });
      const result = await service.getAll();
      expect(result.items[0].status).toBe('present');
    });

    it('should pass filters', async () => {
      mock.onGet('/attendance').reply(200, { items: [], total: 0 });
      await service.getAll({ class_id: 'cls-1', date: '2024-01-15' });
    });

    it('should return empty result on 404', async () => {
      mock.onGet('/attendance').reply(404);
      const result = await service.getAll();
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should throw on 500', async () => {
      mock.onGet('/attendance').reply(500);
      await expect(service.getAll()).rejects.toThrow();
    });
  });

  describe('getByEnrollment', () => {
    it('should return enrollment attendance history', async () => {
      mock.onGet('/attendance/enrollment/enr-1/history').reply(200, { items: [mockRecord], total: 1 });
      const result = await service.getByEnrollment('enr-1');
      expect(result.items[0].id).toBe('att-1');
    });

    it('should pass filters', async () => {
      mock.onGet('/attendance/enrollment/enr-1/history').reply(200, { items: [], total: 0 });
      await service.getByEnrollment('enr-1', { limit: 10 });
    });

    it('should return empty on 404', async () => {
      mock.onGet('/attendance/enrollment/enr-1/history').reply(404);
      const result = await service.getByEnrollment('enr-1');
      expect(result.items).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return record', async () => {
      mock.onGet('/attendance/att-1').reply(200, mockRecord);
      const result = await service.getById('att-1');
      expect(result.date).toBe('2024-01-15');
    });

    it('should throw on 404', async () => {
      mock.onGet('/attendance/bad').reply(404);
      await expect(service.getById('bad')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create record', async () => {
      mock.onPost('/attendance').reply(201, mockRecord);
      const result = await service.create({ child_id: 'ch-1', class_id: 'cls-1', date: '2024-01-15', status: 'present' });
      expect(result.id).toBe('att-1');
    });

    it('should throw on 400', async () => {
      mock.onPost('/attendance').reply(400, { message: 'Invalid data' });
      await expect(service.create({})).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update record', async () => {
      mock.onPut('/attendance/att-1').reply(200, { ...mockRecord, status: 'absent' });
      const result = await service.update('att-1', { status: 'absent' });
      expect(result.status).toBe('absent');
    });
  });

  describe('delete', () => {
    it('should delete record', async () => {
      mock.onDelete('/attendance/att-1').reply(200, { message: 'Deleted' });
      const result = await service.delete('att-1');
      expect(result.message).toBe('Deleted');
    });
  });

  describe('getStatsByChild', () => {
    it('should return child stats', async () => {
      mock.onGet('/attendance/child/ch-1/stats').reply(200, { total: 20, present: 18, absent: 2 });
      const result = await service.getStatsByChild('ch-1');
      expect(result.present).toBe(18);
    });
  });

  describe('getByClass', () => {
    it('should call getAll with class_id', async () => {
      mock.onGet('/attendance').reply(200, { items: [mockRecord], total: 1 });
      const result = await service.getByClass('cls-1');
      expect(result.items).toBeDefined();
    });
  });

  describe('getByDate', () => {
    it('should call getAll with date', async () => {
      mock.onGet('/attendance').reply(200, { items: [mockRecord], total: 1 });
      const result = await service.getByDate('2024-01-15');
      expect(result.items).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should return stats for child with optional filters', async () => {
      mock.onGet('/attendance/child/ch-1/stats').reply(200, { total: 20, present: 18 });
      const result = await service.getStats('ch-1', { start_date: '2024-01-01' });
      expect(result.total).toBe(20);
    });
  });

  describe('getStreak', () => {
    it('should return attendance streak', async () => {
      mock.onGet('/attendance/enrollment/enr-1/streak').reply(200, { current_streak: 5, longest_streak: 12 });
      const result = await service.getStreak('enr-1');
      expect(result.current_streak).toBe(5);
      expect(result.longest_streak).toBe(12);
    });

    it('should throw on 404', async () => {
      mock.onGet('/attendance/enrollment/bad/streak').reply(404);
      await expect(service.getStreak('bad')).rejects.toThrow();
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create records', async () => {
      mock.onPost('/attendance/bulk').reply(200, { created: 5, failed: 0 });
      const result = await service.bulkCreate({
        class_id: 'cls-1',
        date: '2024-01-15',
        records: [
          { child_id: 'ch-1', status: 'present' },
          { child_id: 'ch-2', status: 'absent' },
        ],
      });
      expect(result.created).toBe(5);
    });
  });

  describe('getSummary', () => {
    it('should return summary', async () => {
      mock.onGet('/attendance/summary/').reply(200, { total_sessions: 10, avg_attendance: 0.85 });
      const result = await service.getSummary({ start_date: '2024-01-01', end_date: '2024-01-31' });
      expect(result.avg_attendance).toBe(0.85);
    });
  });
});

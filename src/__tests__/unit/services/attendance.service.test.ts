/**
 * Attendance Service Unit Tests (TypeScript version)
 * Tests for attendance tracking and management service methods
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const attendanceModule = require('../../../api/services/attendance.service');
const attendanceService =
  attendanceModule.attendanceService ||
  attendanceModule.default?.attendanceService ||
  attendanceModule.default;

const mock = new MockAdapter(apiClient);

const mockAttendance = {
  id: 'att-1',
  child_id: 'child-1',
  class_id: 'class-1',
  date: '2024-01-15',
  status: 'present',
  notes: 'On time',
  created_at: '2024-01-15T10:00:00Z',
};

const mockStats = {
  total_classes: 20,
  attended: 18,
  missed: 2,
  attendance_rate: 0.9,
};

const mockStreak = {
  current_streak: 5,
  longest_streak: 12,
  streak_start_date: '2024-01-10',
};

const mockBulkResult = {
  created: 3,
  failed: 0,
  records: [],
};

const mockSummary = {
  total_sessions: 10,
  attended_sessions: 9,
  avg_attendance_rate: 0.9,
};

describe('attendanceService (TypeScript)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('csf_access_token', 'mock-access-token');
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  // ===========================================
  // MODULE LOADING TEST
  // ===========================================
  describe('module loading', () => {
    it('should have attendanceService defined with all methods', () => {
      expect(attendanceService).toBeDefined();
      expect(typeof attendanceService.getAll).toBe('function');
      expect(typeof attendanceService.getById).toBe('function');
      expect(typeof attendanceService.create).toBe('function');
      expect(typeof attendanceService.update).toBe('function');
      expect(typeof attendanceService.delete).toBe('function');
      expect(typeof attendanceService.getByChild).toBe('function');
      expect(typeof attendanceService.getByClass).toBe('function');
      expect(typeof attendanceService.getByDate).toBe('function');
      expect(typeof attendanceService.getStats).toBe('function');
      expect(typeof attendanceService.getStreak).toBe('function');
      expect(typeof attendanceService.bulkCreate).toBe('function');
      expect(typeof attendanceService.getSummary).toBe('function');
    });
  });

  // ===========================================
  // GET ALL
  // ===========================================
  describe('getAll', () => {
    it('should return attendance records', async () => {
      mock.onGet('/attendance').reply(200, [mockAttendance]);

      const result = await attendanceService.getAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].status).toBe('present');
    });

    it('should pass filter params', async () => {
      mock.onGet('/attendance').reply((config) => {
        expect(config.params).toEqual({ child_id: 'child-1', class_id: 'class-1' });
        return [200, [mockAttendance]];
      });

      await attendanceService.getAll({ child_id: 'child-1', class_id: 'class-1' });
    });

    it('should throw on 500', async () => {
      mock.onGet('/attendance').reply(500, { message: 'Server error' });

      await expect(attendanceService.getAll()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET BY ID
  // ===========================================
  describe('getById', () => {
    it('should return attendance record by ID', async () => {
      mock.onGet('/attendance/att-1').reply(200, mockAttendance);

      const result = await attendanceService.getById('att-1');

      expect(result.id).toBe('att-1');
      expect(result.status).toBe('present');
    });

    it('should throw on 404', async () => {
      mock.onGet('/attendance/bad-id').reply(404, { message: 'Not found' });

      await expect(attendanceService.getById('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // CREATE
  // ===========================================
  describe('create', () => {
    it('should create attendance record', async () => {
      const newAttendance = {
        child_id: 'child-1',
        class_id: 'class-1',
        date: '2024-01-15',
        status: 'present',
      };

      mock.onPost('/attendance').reply(201, { id: 'att-2', ...newAttendance });

      const result = await attendanceService.create(newAttendance);

      expect(result.id).toBe('att-2');
      expect(result.status).toBe('present');
    });

    it('should throw on 400 validation error', async () => {
      mock.onPost('/attendance').reply(400, { message: 'Invalid data' });

      await expect(
        attendanceService.create({ child_id: 'child-1' } as any)
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // UPDATE
  // ===========================================
  describe('update', () => {
    it('should update attendance record', async () => {
      const updated = { ...mockAttendance, status: 'absent', notes: 'Sick' };
      mock.onPut('/attendance/att-1').reply(200, updated);

      const result = await attendanceService.update('att-1', {
        status: 'absent',
        notes: 'Sick',
      });

      expect(result.status).toBe('absent');
      expect(result.notes).toBe('Sick');
    });

    it('should throw on 404', async () => {
      mock.onPut('/attendance/bad-id').reply(404, { message: 'Not found' });

      await expect(
        attendanceService.update('bad-id', { status: 'absent' })
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // DELETE
  // ===========================================
  describe('delete', () => {
    it('should delete attendance record', async () => {
      mock.onDelete('/attendance/att-1').reply(200, { message: 'Deleted' });

      const result = await attendanceService.delete('att-1');

      expect(result.message).toBe('Deleted');
    });

    it('should throw on 404', async () => {
      mock.onDelete('/attendance/bad-id').reply(404, { message: 'Not found' });

      await expect(attendanceService.delete('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // GET STATS
  // ===========================================
  describe('getStats', () => {
    it('should return attendance stats for child', async () => {
      mock.onGet('/attendance/child/child-1/stats').reply(200, mockStats);

      const result = await attendanceService.getStats('child-1');

      expect(result.total_classes).toBe(20);
      expect(result.attendance_rate).toBe(0.9);
    });

    it('should pass optional filters', async () => {
      mock.onGet('/attendance/child/child-1/stats').reply((config) => {
        expect(config.params).toEqual({ class_id: 'class-1' });
        return [200, mockStats];
      });

      await attendanceService.getStats('child-1', { class_id: 'class-1' });
    });
  });

  // ===========================================
  // GET STREAK
  // ===========================================
  describe('getStreak', () => {
    it('should return attendance streak', async () => {
      mock.onGet('/attendance/enrollment/enr-1/streak').reply(200, mockStreak);

      const result = await attendanceService.getStreak('enr-1');

      expect(result.current_streak).toBe(5);
      expect(result.longest_streak).toBe(12);
    });

    it('should throw on 404', async () => {
      mock.onGet('/attendance/enrollment/bad-id/streak').reply(404, { message: 'Not found' });

      await expect(attendanceService.getStreak('bad-id')).rejects.toThrow();
    });
  });

  // ===========================================
  // BULK CREATE
  // ===========================================
  describe('bulkCreate', () => {
    it('should bulk create attendance records', async () => {
      const bulkData = {
        class_id: 'class-1',
        date: '2024-01-15',
        records: [
          { child_id: 'child-1', status: 'present' },
          { child_id: 'child-2', status: 'absent' },
        ],
      };

      mock.onPost('/attendance/bulk').reply(200, mockBulkResult);

      const result = await attendanceService.bulkCreate(bulkData);

      expect(result.created).toBe(3);
      expect(result.failed).toBe(0);
    });
  });

  // ===========================================
  // GET SUMMARY
  // ===========================================
  describe('getSummary', () => {
    it('should return attendance summary', async () => {
      mock.onGet('/attendance/summary/').reply(200, mockSummary);

      const result = await attendanceService.getSummary({
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });

      expect(result.total_sessions).toBe(10);
      expect(result.avg_attendance_rate).toBe(0.9);
    });
  });

  // ===========================================
  // CONVENIENCE METHODS
  // ===========================================
  describe('getByChild', () => {
    it('should call getAll with child_id', async () => {
      mock.onGet('/attendance').reply(200, [mockAttendance]);

      const result = await attendanceService.getByChild('child-1');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByClass', () => {
    it('should call getAll with class_id', async () => {
      mock.onGet('/attendance').reply(200, [mockAttendance]);

      const result = await attendanceService.getByClass('class-1');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getByDate', () => {
    it('should call getAll with date', async () => {
      mock.onGet('/attendance').reply(200, [mockAttendance]);

      const result = await attendanceService.getByDate('2024-01-15');

      expect(Array.isArray(result)).toBe(true);
    });
  });
});

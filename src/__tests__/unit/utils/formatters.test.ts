/**
 * Unit Tests for formatters.ts utility functions
 * Tests: dayMap, formatSchedule, formatDateRange
 */

import { dayMap, formatSchedule, formatDateRange } from '../../../utils/formatters';

describe('formatters utilities', () => {
  // ==========================================
  // dayMap
  // ==========================================
  describe('dayMap', () => {
    it('should map all days of the week', () => {
      expect(dayMap.MONDAY).toBe('Mon');
      expect(dayMap.TUESDAY).toBe('Tue');
      expect(dayMap.WEDNESDAY).toBe('Wed');
      expect(dayMap.THURSDAY).toBe('Thu');
      expect(dayMap.FRIDAY).toBe('Fri');
      expect(dayMap.SATURDAY).toBe('Sat');
      expect(dayMap.SUNDAY).toBe('Sun');
    });

    it('should have exactly 7 entries', () => {
      expect(Object.keys(dayMap)).toHaveLength(7);
    });
  });

  // ==========================================
  // formatSchedule
  // ==========================================
  describe('formatSchedule', () => {
    it('should format a schedule with day, start and end times', () => {
      const schedule = [{ day_of_week: 'MONDAY', start_time: '15:00', end_time: '16:00' }];
      expect(formatSchedule(schedule)).toBe('Mon • 3:00 PM–4:00 PM');
    });

    it('should handle AM times', () => {
      const schedule = [{ day_of_week: 'TUESDAY', start_time: '09:30', end_time: '10:30' }];
      expect(formatSchedule(schedule)).toBe('Tue • 9:30 AM–10:30 AM');
    });

    it('should handle noon (12:00)', () => {
      const schedule = [{ day_of_week: 'WEDNESDAY', start_time: '12:00', end_time: '13:00' }];
      expect(formatSchedule(schedule)).toBe('Wed • 12:00 PM–1:00 PM');
    });

    it('should handle midnight (00:00)', () => {
      const schedule = [{ day_of_week: 'THURSDAY', start_time: '00:00', end_time: '01:00' }];
      expect(formatSchedule(schedule)).toBe('Thu • 12:00 AM–1:00 AM');
    });

    it('should return "Schedule TBA" for undefined schedule', () => {
      expect(formatSchedule(undefined)).toBe('Schedule TBA');
    });

    it('should return "Schedule TBA" for empty schedule array', () => {
      expect(formatSchedule([])).toBe('Schedule TBA');
    });

    it('should use only the first schedule entry', () => {
      const schedule = [
        { day_of_week: 'MONDAY', start_time: '15:00', end_time: '16:00' },
        { day_of_week: 'WEDNESDAY', start_time: '15:00', end_time: '16:00' },
      ];
      const result = formatSchedule(schedule);
      expect(result).toContain('Mon');
      expect(result).not.toContain('Wed');
    });

    it('should handle missing day_of_week', () => {
      const schedule = [{ start_time: '15:00', end_time: '16:00' }];
      const result = formatSchedule(schedule);
      expect(result).toContain('3:00 PM');
    });

    it('should handle missing start_time', () => {
      const schedule = [{ day_of_week: 'MONDAY', end_time: '16:00' }];
      const result = formatSchedule(schedule);
      expect(result).toContain('Mon');
    });

    it('should handle missing end_time', () => {
      const schedule = [{ day_of_week: 'MONDAY', start_time: '15:00' }];
      const result = formatSchedule(schedule);
      expect(result).toContain('Mon');
      expect(result).toContain('3:00 PM');
    });

    it('should handle unknown day_of_week values', () => {
      const schedule = [{ day_of_week: 'FUNDAY', start_time: '15:00', end_time: '16:00' }];
      const result = formatSchedule(schedule);
      expect(result).toContain('FUNDAY');
    });
  });

  // ==========================================
  // formatDateRange
  // ==========================================
  describe('formatDateRange', () => {
    it('should format start and end dates', () => {
      const result = formatDateRange('2024-02-01', '2024-05-01');
      expect(result).toMatch(/Feb\s+1\s+–\s+May\s+1/);
    });

    it('should return "Dates TBA" when startDate is undefined', () => {
      expect(formatDateRange(undefined, '2024-05-01')).toBe('Dates TBA');
    });

    it('should return "Dates TBA" when endDate is undefined', () => {
      expect(formatDateRange('2024-02-01', undefined)).toBe('Dates TBA');
    });

    it('should return "Dates TBA" when both are undefined', () => {
      expect(formatDateRange(undefined, undefined)).toBe('Dates TBA');
    });

    it('should handle same month start and end dates', () => {
      const result = formatDateRange('2024-03-01', '2024-03-31');
      expect(result).toMatch(/Mar\s+1\s+–\s+Mar\s+31/);
    });

    it('should handle cross-year date ranges', () => {
      const result = formatDateRange('2024-12-01', '2025-01-31');
      expect(result).toMatch(/Dec\s+1\s+–\s+Jan\s+31/);
    });
  });
});

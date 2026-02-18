/**
 * Unit Tests for format.js utility functions
 * Tests: formatDate, formatCurrency, formatDateTime, formatRelativeTime, formatNumber
 */

import { formatDate, formatCurrency, formatDateTime, formatRelativeTime, formatNumber } from '../../../utils/format';

describe('format utilities', () => {
  // ==========================================
  // formatDate
  // ==========================================
  describe('formatDate', () => {
    it('should format a date string to readable format', () => {
      const result = formatDate('2024-01-15');
      expect(result).toMatch(/Jan/);
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2024/);
    });

    it('should format a Date object', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      const result = formatDate(date);
      expect(result).toMatch(/Jan/);
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2024/);
    });

    it('should return "-" for null', () => {
      expect(formatDate(null)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(formatDate(undefined)).toBe('-');
    });

    it('should return "-" for empty string', () => {
      expect(formatDate('')).toBe('-');
    });

    it('should accept custom options', () => {
      const result = formatDate('2024-01-15', { month: 'long' });
      expect(result).toMatch(/January/);
    });

    it('should handle ISO datetime strings', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toMatch(/Jan/);
      expect(result).toMatch(/2024/);
    });
  });

  // ==========================================
  // formatCurrency
  // ==========================================
  describe('formatCurrency', () => {
    it('should format a number as USD currency', () => {
      expect(formatCurrency(150)).toBe('$150.00');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format decimal amounts', () => {
      expect(formatCurrency(99.99)).toBe('$99.99');
    });

    it('should format large numbers with commas', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('should format string amounts', () => {
      expect(formatCurrency('150.50')).toBe('$150.50');
    });

    it('should return "-" for null', () => {
      expect(formatCurrency(null)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(formatCurrency(undefined)).toBe('-');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-25);
      expect(result).toMatch(/-/);
      expect(result).toMatch(/25\.00/);
    });
  });

  // ==========================================
  // formatDateTime
  // ==========================================
  describe('formatDateTime', () => {
    it('should format a datetime string', () => {
      const result = formatDateTime('2024-01-15T10:30:00Z');
      expect(result).toMatch(/Jan/);
      expect(result).toMatch(/2024/);
    });

    it('should include time in 12-hour format', () => {
      const result = formatDateTime('2024-01-15T14:30:00');
      expect(result).toMatch(/PM|AM/);
    });

    it('should return "-" for null', () => {
      expect(formatDateTime(null)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(formatDateTime(undefined)).toBe('-');
    });

    it('should return "-" for empty string', () => {
      expect(formatDateTime('')).toBe('-');
    });

    it('should handle Date objects', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      const result = formatDateTime(date);
      expect(result).toMatch(/Jan/);
      expect(result).toMatch(/15/);
    });
  });

  // ==========================================
  // formatRelativeTime
  // ==========================================
  describe('formatRelativeTime', () => {
    it('should return "just now" for very recent dates', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinAgo)).toBe('5 minutes ago');
    });

    it('should return "1 minute ago" (singular)', () => {
      const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000);
      expect(formatRelativeTime(oneMinAgo)).toBe('1 minute ago');
    });

    it('should return hours ago', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago');
    });

    it('should return "1 hour ago" (singular)', () => {
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
      expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
    });

    it('should return days ago', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago');
    });

    it('should return "1 day ago" (singular)', () => {
      const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
    });

    it('should fall back to formatDate for dates older than a week', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoWeeksAgo);
      expect(result).not.toMatch(/ago/);
      expect(result).toMatch(/\d{4}/); // Should contain year
    });

    it('should return "-" for null', () => {
      expect(formatRelativeTime(null)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(formatRelativeTime(undefined)).toBe('-');
    });

    it('should handle string dates', () => {
      const now = new Date().toISOString();
      expect(formatRelativeTime(now)).toBe('just now');
    });
  });

  // ==========================================
  // formatNumber
  // ==========================================
  describe('formatNumber', () => {
    it('should format a number with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
    });

    it('should format large numbers', () => {
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle small numbers without commas', () => {
      expect(formatNumber(999)).toBe('999');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should return "-" for null', () => {
      expect(formatNumber(null)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(formatNumber(undefined)).toBe('-');
    });

    it('should handle negative numbers', () => {
      const result = formatNumber(-1000);
      expect(result).toMatch(/-1,000/);
    });

    it('should handle decimal numbers', () => {
      const result = formatNumber(1234.56);
      expect(result).toMatch(/1,234/);
    });
  });
});

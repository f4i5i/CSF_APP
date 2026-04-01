/**
 * Check-In Service Unit Tests
 *
 * Tests the checkin.service.js module by mocking the apiClient module directly.
 * This avoids MSW/axios interception compatibility issues while testing
 * the service logic (data transformation, endpoint routing, etc).
 */

// Mock the API client module before any imports
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();

jest.mock('../../../api/client', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
  },
}));

// Import the service after mocking
import checkinService from '../../../api/services/checkin.service';

const mockCheckInResponse = {
  id: 'ci-1',
  enrollment_id: 'enr-1',
  class_id: 'cls-1',
  checked_in_at: '2024-01-15T09:00:00Z',
  check_in_date: '2024-01-15',
  is_late: false,
  created_at: '2024-01-15T09:00:00Z',
};

describe('checkinService', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
    mockPut.mockReset();
  });

  // ========================================================================
  // MODULE LOADING
  // ========================================================================
  describe('module loading', () => {
    it('should export all methods', () => {
      expect(typeof checkinService.getClassStatus).toBe('function');
      expect(typeof checkinService.getByClass).toBe('function');
      expect(typeof checkinService.checkIn).toBe('function');
      expect(typeof checkinService.checkOut).toBe('function');
      expect(typeof checkinService.bulkCheckIn).toBe('function');
      expect(typeof checkinService.toggleCheckIn).toBe('function');
    });
  });

  // ========================================================================
  // getClassStatus
  // ========================================================================
  describe('getClassStatus', () => {
    it('should fetch class check-in status and extract statuses array', async () => {
      const statuses = [
        { enrollment_id: 'enr-1', is_checked_in: true, child_name: 'Johnny' },
        { enrollment_id: 'enr-2', is_checked_in: false, child_name: 'Jenny' },
      ];

      mockGet.mockResolvedValue({
        data: { class_id: 'cls-1', check_in_date: '2024-06-15', statuses },
      });

      const result = await checkinService.getClassStatus('cls-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].enrollment_id).toBe('enr-1');
      expect(result[0].is_checked_in).toBe(true);
      expect(result[1].child_name).toBe('Jenny');
    });

    it('should call the correct endpoint with class ID', async () => {
      mockGet.mockResolvedValue({ data: { statuses: [] } });

      await checkinService.getClassStatus('cls-abc');

      expect(mockGet).toHaveBeenCalledWith(
        '/check-in/class/cls-abc/status',
        expect.objectContaining({ params: expect.any(Object) })
      );
    });

    it("should use today's date by default", async () => {
      mockGet.mockResolvedValue({ data: { statuses: [] } });

      await checkinService.getClassStatus('cls-1');

      const today = new Date().toISOString().split('T')[0];
      expect(mockGet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: { check_in_date: today } })
      );
    });

    it('should use provided date when specified', async () => {
      mockGet.mockResolvedValue({ data: { statuses: [] } });

      await checkinService.getClassStatus('cls-1', '2024-06-15');

      expect(mockGet).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: { check_in_date: '2024-06-15' } })
      );
    });

    it('should handle raw data response (no statuses key - fallback)', async () => {
      // API returns a raw array instead of { statuses: [...] }
      const rawArray = [{ enrollment_id: 'enr-1', is_checked_in: false }];
      mockGet.mockResolvedValue({ data: rawArray });

      const result = await checkinService.getClassStatus('cls-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when statuses is empty', async () => {
      mockGet.mockResolvedValue({
        data: { class_id: 'cls-1', check_in_date: '2024-06-15', statuses: [] },
      });

      const result = await checkinService.getClassStatus('cls-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should return empty array when data is null', async () => {
      mockGet.mockResolvedValue({ data: null });

      const result = await checkinService.getClassStatus('cls-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });

  // ========================================================================
  // getByClass
  // ========================================================================
  describe('getByClass', () => {
    it('should return class check-ins', async () => {
      mockGet.mockResolvedValue({
        data: { items: [mockCheckInResponse], total: 1 },
      });

      const result = await checkinService.getByClass('cls-1');

      expect(result.items[0].id).toBe('ci-1');
      expect(mockGet).toHaveBeenCalledWith('/check-in/class/cls-1');
    });
  });

  // ========================================================================
  // checkIn
  // ========================================================================
  describe('checkIn', () => {
    it('should check in student', async () => {
      mockPost.mockResolvedValue({ data: mockCheckInResponse });

      const result = await checkinService.checkIn({
        enrollment_id: 'enr-1',
        class_id: 'cls-1',
        check_in_date: '2024-01-15',
      });

      expect(result.enrollment_id).toBe('enr-1');
      expect(result.id).toBe('ci-1');
    });

    it('should send check-in data to API', async () => {
      mockPost.mockResolvedValue({ data: mockCheckInResponse });

      const payload = {
        enrollment_id: 'enr-1',
        class_id: 'cls-1',
        check_in_date: '2024-01-15',
      };
      await checkinService.checkIn(payload);

      expect(mockPost).toHaveBeenCalledWith('/check-in', payload);
    });

    it('should throw on API error', async () => {
      mockPost.mockRejectedValue(new Error('Already checked in'));

      await expect(
        checkinService.checkIn({ enrollment_id: 'enr-1' })
      ).rejects.toThrow('Already checked in');
    });
  });

  // ========================================================================
  // checkOut
  // ========================================================================
  describe('checkOut', () => {
    it('should check out student', async () => {
      mockPut.mockResolvedValue({
        data: { ...mockCheckInResponse, check_out_time: '2024-01-15T12:00:00Z' },
      });

      const result = await checkinService.checkOut('ci-1');

      expect(result.check_out_time).toBe('2024-01-15T12:00:00Z');
      expect(mockPut).toHaveBeenCalledWith('/check-in/ci-1/checkout');
    });
  });

  // ========================================================================
  // bulkCheckIn
  // ========================================================================
  describe('bulkCheckIn', () => {
    it('should bulk check in multiple students', async () => {
      mockPost.mockResolvedValue({
        data: { items: [mockCheckInResponse], total: 1 },
      });

      const result = await checkinService.bulkCheckIn({
        class_id: 'cls-1',
        enrollment_ids: ['enr-1', 'enr-2'],
        check_in_date: '2024-01-15',
      });

      expect(result.items).toHaveLength(1);
    });

    it('should send correct bulk data', async () => {
      mockPost.mockResolvedValue({ data: { items: [], total: 0 } });

      const payload = {
        class_id: 'cls-1',
        enrollment_ids: ['enr-1', 'enr-2', 'enr-3'],
        check_in_date: '2024-01-15',
      };
      await checkinService.bulkCheckIn(payload);

      expect(mockPost).toHaveBeenCalledWith('/check-in/bulk', payload);
    });
  });

  // ========================================================================
  // toggleCheckIn
  // ========================================================================
  describe('toggleCheckIn', () => {
    it('should check out when already checked in and has checkInId', async () => {
      mockPut.mockResolvedValue({
        data: { ...mockCheckInResponse, check_out_time: '2024-01-15T12:00:00Z' },
      });

      const result = await checkinService.toggleCheckIn({
        enrollment_id: 'enr-1',
        isCheckedIn: true,
        checkInId: 'ci-1',
      });

      expect(result.check_out_time).toBeDefined();
      expect(mockPut).toHaveBeenCalledWith('/check-in/ci-1/checkout');
    });

    it('should check in when not checked in', async () => {
      mockPost.mockResolvedValue({ data: mockCheckInResponse });

      const result = await checkinService.toggleCheckIn({
        enrollment_id: 'enr-1',
        isCheckedIn: false,
      });

      expect(result.enrollment_id).toBe('enr-1');
      expect(mockPost).toHaveBeenCalledWith('/check-in', { enrollment_id: 'enr-1' });
    });

    it('should call checkIn when isCheckedIn=true but no checkInId', async () => {
      mockPost.mockResolvedValue({ data: mockCheckInResponse });

      await checkinService.toggleCheckIn({
        enrollment_id: 'enr-1',
        isCheckedIn: true,
        checkInId: undefined,
      });

      // Falls through to checkIn since !checkInId
      expect(mockPost).toHaveBeenCalledWith('/check-in', { enrollment_id: 'enr-1' });
    });
  });
});

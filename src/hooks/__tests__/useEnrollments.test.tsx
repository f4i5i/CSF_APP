/**
 * Unit Tests for useEnrollments Hook
 * Tests enrollment data fetching, filtering by status, CRUD operations,
 * eligibility checks, and computed values
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useEnrollments } from '../useEnrollments';

// ==========================================
// MOCK SETUP
// ==========================================

const mockEnrollments = [
  {
    id: 'enroll-1',
    child_id: 'child-1',
    class_id: 'class-1',
    status: 'active',
    enrolled_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'enroll-2',
    child_id: 'child-2',
    class_id: 'class-1',
    status: 'active',
    enrolled_at: '2024-01-16T00:00:00Z',
  },
  {
    id: 'enroll-3',
    child_id: 'child-1',
    class_id: 'class-2',
    status: 'completed',
    enrolled_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'enroll-4',
    child_id: 'child-3',
    class_id: 'class-1',
    status: 'cancelled',
    enrolled_at: '2024-01-12T00:00:00Z',
  },
];

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock services
const mockGetMy = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockCancel = jest.fn();
const mockCheckEligibility = jest.fn();

jest.mock('../../api/services', () => ({
  enrollmentsService: {
    getMy: (...args: unknown[]) => mockGetMy(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    cancel: (...args: unknown[]) => mockCancel(...args),
    checkEligibility: (...args: unknown[]) => mockCheckEligibility(...args),
  },
}));

// Mock error handler
jest.mock('../../lib/errorHandler', () => ({
  getErrorMessage: (error: Error | { message?: string }) => error?.message || 'An error occurred',
}));

describe('useEnrollments Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMy.mockResolvedValue(mockEnrollments);
    mockCreate.mockResolvedValue({
      id: 'enroll-new',
      child_id: 'child-1',
      class_id: 'class-3',
      status: 'active',
    });
    mockUpdate.mockResolvedValue({ id: 'enroll-1', status: 'active' });
    mockCancel.mockResolvedValue({ id: 'enroll-1', status: 'cancelled' });
    mockCheckEligibility.mockResolvedValue({ eligible: true, reason: '' });
  });

  // ===========================================
  // INITIAL STATE TESTS
  // ===========================================

  describe('Initial State', () => {
    it('should start with empty enrollments and loading true', () => {
      const { result } = renderHook(() => useEnrollments());

      expect(result.current.enrollments).toEqual([]);
      expect(result.current.loading).toBe(true);
    });

    it('should have all loading substates false initially', () => {
      const { result } = renderHook(() => useEnrollments({ autoFetch: false }));

      expect(result.current.enrolling).toBe(false);
      expect(result.current.updating).toBe(false);
      expect(result.current.cancelling).toBe(false);
      expect(result.current.checkingEligibility).toBe(false);
    });

    it('should have null errors initially', () => {
      const { result } = renderHook(() => useEnrollments({ autoFetch: false }));

      expect(result.current.error).toBeNull();
      expect(result.current.enrollError).toBeNull();
      expect(result.current.cancelError).toBeNull();
    });
  });

  // ===========================================
  // FETCH TESTS
  // ===========================================

  describe('Fetching Enrollments', () => {
    it('should fetch enrollments on mount when autoFetch is true', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetMy).toHaveBeenCalledTimes(1);
      expect(result.current.enrollments).toEqual(mockEnrollments);
    });

    it('should NOT fetch when autoFetch is false', () => {
      renderHook(() => useEnrollments({ autoFetch: false }));

      expect(mockGetMy).not.toHaveBeenCalled();
    });

    it('should pass childId filter to service', async () => {
      renderHook(() => useEnrollments({ childId: 'child-1' }));

      await waitFor(() => {
        expect(mockGetMy).toHaveBeenCalled();
      });

      const callArgs = mockGetMy.mock.calls[0][0];
      expect(callArgs).toEqual(expect.objectContaining({ child_id: 'child-1' }));
    });

    it('should pass status filter to service', async () => {
      renderHook(() => useEnrollments({ status: 'active' }));

      await waitFor(() => {
        expect(mockGetMy).toHaveBeenCalled();
      });

      const callArgs = mockGetMy.mock.calls[0][0];
      expect(callArgs).toEqual(expect.objectContaining({ status: 'active' }));
    });

    it('should pass both childId and status filters', async () => {
      renderHook(() =>
        useEnrollments({ childId: 'child-1', status: 'active' })
      );

      await waitFor(() => {
        expect(mockGetMy).toHaveBeenCalled();
      });

      const callArgs = mockGetMy.mock.calls[0][0];
      expect(callArgs).toEqual(
        expect.objectContaining({ child_id: 'child-1', status: 'active' })
      );
    });

    it('should handle fetch error', async () => {
      mockGetMy.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  // ===========================================
  // ENROLL CHILD TESTS
  // ===========================================

  describe('enrollChild', () => {
    it('should create an enrollment and refetch', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const enrollmentData = { child_id: 'child-1', class_id: 'class-3' };

      await act(async () => {
        await result.current.enrollChild(enrollmentData);
      });

      expect(mockCreate).toHaveBeenCalledWith(enrollmentData);
    });

    it('should show error toast on enroll failure', async () => {
      const toast = require('react-hot-toast');
      mockCreate.mockRejectedValue(new Error('Enrollment failed'));

      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.enrollChild({ child_id: 'child-1', class_id: 'class-3' });
        } catch {
          // Expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ===========================================
  // UPDATE ENROLLMENT TESTS
  // ===========================================

  describe('updateEnrollment', () => {
    it('should update an enrollment with id and data', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updateData = { notes: 'Updated notes' };

      await act(async () => {
        await result.current.updateEnrollment('enroll-1', updateData);
      });

      expect(mockUpdate).toHaveBeenCalledWith('enroll-1', updateData);
    });
  });

  // ===========================================
  // CANCEL ENROLLMENT TESTS
  // ===========================================

  describe('cancelEnrollment', () => {
    it('should cancel an enrollment by id with reason', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.cancelEnrollment('enroll-1', 'Schedule conflict');
      });

      expect(mockCancel).toHaveBeenCalledWith('enroll-1', { reason: 'Schedule conflict' });
    });

    it('should cancel with empty reason by default', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.cancelEnrollment('enroll-1');
      });

      expect(mockCancel).toHaveBeenCalledWith('enroll-1', { reason: '' });
    });
  });

  // ===========================================
  // CHECK ELIGIBILITY TESTS
  // ===========================================

  describe('checkEligibility', () => {
    it('should check eligibility for a child and class', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.checkEligibility('child-1', 'class-3');
      });

      expect(mockCheckEligibility).toHaveBeenCalledWith('child-1', 'class-3');
    });
  });

  // ===========================================
  // COMPUTED VALUES / FILTERING TESTS
  // ===========================================

  describe('Computed Values', () => {
    it('should filter active enrollments', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.activeEnrollments).toHaveLength(2);
      expect(result.current.activeEnrollments.every(
        (e: { status: string }) => e.status === 'active'
      )).toBe(true);
    });

    it('should filter completed enrollments', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.completedEnrollments).toHaveLength(1);
      expect(result.current.completedEnrollments[0].id).toBe('enroll-3');
    });

    it('should filter cancelled enrollments', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.cancelledEnrollments).toHaveLength(1);
      expect(result.current.cancelledEnrollments[0].id).toBe('enroll-4');
    });

    it('should compute hasEnrollments correctly', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasEnrollments).toBe(true);
    });

    it('should compute hasEnrollments as false when empty', async () => {
      mockGetMy.mockResolvedValue([]);
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasEnrollments).toBe(false);
    });

    it('should compute enrollmentCount correctly', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.enrollmentCount).toBe(4);
    });

    it('should compute activeCount, completedCount, cancelledCount', async () => {
      const { result } = renderHook(() => useEnrollments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.activeCount).toBe(2);
      expect(result.current.completedCount).toBe(1);
      expect(result.current.cancelledCount).toBe(1);
    });

    it('should compute isLoading as OR of all loading states', async () => {
      const { result } = renderHook(() => useEnrollments({ autoFetch: false }));

      expect(result.current.isLoading).toBe(false);
    });
  });

  // ===========================================
  // HELPER FUNCTIONS TESTS
  // ===========================================

  describe('Helper Functions', () => {
    describe('getEnrollmentById', () => {
      it('should find an enrollment by id', async () => {
        const { result } = renderHook(() => useEnrollments());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const enrollment = result.current.getEnrollmentById('enroll-1');
        expect(enrollment).toEqual(mockEnrollments[0]);
      });

      it('should return undefined for unknown id', async () => {
        const { result } = renderHook(() => useEnrollments());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const enrollment = result.current.getEnrollmentById('nonexistent');
        expect(enrollment).toBeUndefined();
      });
    });

    describe('getEnrollmentsByChild', () => {
      it('should return enrollments for a specific child', async () => {
        const { result } = renderHook(() => useEnrollments());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const childEnrollments = result.current.getEnrollmentsByChild('child-1');
        expect(childEnrollments).toHaveLength(2);
        expect(childEnrollments.every(
          (e: { child_id: string }) => e.child_id === 'child-1'
        )).toBe(true);
      });

      it('should return empty array for child with no enrollments', async () => {
        const { result } = renderHook(() => useEnrollments());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const childEnrollments = result.current.getEnrollmentsByChild('child-99');
        expect(childEnrollments).toEqual([]);
      });
    });
  });

  // ===========================================
  // RETURN VALUE STRUCTURE TESTS
  // ===========================================

  describe('Return Values', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useEnrollments({ autoFetch: false }));

      // Data
      expect(result.current).toHaveProperty('enrollments');
      expect(result.current).toHaveProperty('activeEnrollments');
      expect(result.current).toHaveProperty('completedEnrollments');
      expect(result.current).toHaveProperty('cancelledEnrollments');
      expect(result.current).toHaveProperty('eligibilityData');

      // Loading states
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('enrolling');
      expect(result.current).toHaveProperty('updating');
      expect(result.current).toHaveProperty('cancelling');
      expect(result.current).toHaveProperty('checkingEligibility');
      expect(result.current).toHaveProperty('isLoading');

      // Errors
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('enrollError');
      expect(result.current).toHaveProperty('cancelError');

      // Operations
      expect(typeof result.current.enrollChild).toBe('function');
      expect(typeof result.current.updateEnrollment).toBe('function');
      expect(typeof result.current.cancelEnrollment).toBe('function');
      expect(typeof result.current.checkEligibility).toBe('function');
      expect(typeof result.current.refetch).toBe('function');

      // Helpers
      expect(typeof result.current.getEnrollmentById).toBe('function');
      expect(typeof result.current.getEnrollmentsByChild).toBe('function');

      // Computed
      expect(result.current).toHaveProperty('hasEnrollments');
      expect(result.current).toHaveProperty('enrollmentCount');
      expect(result.current).toHaveProperty('activeCount');
      expect(result.current).toHaveProperty('completedCount');
      expect(result.current).toHaveProperty('cancelledCount');
    });
  });
});

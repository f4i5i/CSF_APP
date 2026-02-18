/**
 * Unit Tests for useChildren Hook
 * Tests child CRUD operations, selection, emergency contacts, and computed values
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useChildren } from '../useChildren';

// ==========================================
// MOCK SETUP
// ==========================================

const mockChildren = [
  { id: 'child-1', first_name: 'Johnny', last_name: 'Test', date_of_birth: '2015-05-15' },
  { id: 'child-2', first_name: 'Jenny', last_name: 'Test', date_of_birth: '2017-03-20' },
];

const mockNewChild = {
  id: 'child-3',
  first_name: 'Jake',
  last_name: 'Test',
  date_of_birth: '2019-01-10',
};

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock childrenService
const mockGetMy = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockAddEmergencyContact = jest.fn();
const mockUpdateEmergencyContact = jest.fn();
const mockDeleteEmergencyContact = jest.fn();

jest.mock('../../api/services', () => ({
  childrenService: {
    getMy: (...args: unknown[]) => mockGetMy(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    addEmergencyContact: (...args: unknown[]) => mockAddEmergencyContact(...args),
    updateEmergencyContact: (...args: unknown[]) => mockUpdateEmergencyContact(...args),
    deleteEmergencyContact: (...args: unknown[]) => mockDeleteEmergencyContact(...args),
  },
}));

// Mock error handler
jest.mock('../../lib/errorHandler', () => ({
  getErrorMessage: (error: Error | { message?: string }) => error?.message || 'An error occurred',
}));

describe('useChildren Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMy.mockResolvedValue(mockChildren);
    mockCreate.mockResolvedValue(mockNewChild);
    mockUpdate.mockResolvedValue({ ...mockChildren[0], first_name: 'Updated' });
    mockDelete.mockResolvedValue({ success: true });
    mockAddEmergencyContact.mockResolvedValue({ id: 'ec-1', name: 'Contact' });
    mockUpdateEmergencyContact.mockResolvedValue({ id: 'ec-1', name: 'Updated Contact' });
    mockDeleteEmergencyContact.mockResolvedValue({ success: true });
  });

  // ===========================================
  // INITIAL STATE TESTS
  // ===========================================

  describe('Initial State', () => {
    it('should start with empty children array and loading true', () => {
      const { result } = renderHook(() => useChildren());

      expect(result.current.children).toEqual([]);
      expect(result.current.loading).toBe(true);
    });

    it('should have null selectedChild initially', () => {
      const { result } = renderHook(() => useChildren());

      expect(result.current.selectedChild).toBeNull();
    });

    it('should have all loading substates false initially', () => {
      const { result } = renderHook(() => useChildren({ autoFetch: false }));

      expect(result.current.creating).toBe(false);
      expect(result.current.updating).toBe(false);
      expect(result.current.deleting).toBe(false);
    });
  });

  // ===========================================
  // FETCH TESTS
  // ===========================================

  describe('Fetching Children', () => {
    it('should fetch children on mount when autoFetch is true', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetMy).toHaveBeenCalledTimes(1);
      expect(result.current.children).toEqual(mockChildren);
    });

    it('should NOT fetch children when autoFetch is false', () => {
      renderHook(() => useChildren({ autoFetch: false }));

      expect(mockGetMy).not.toHaveBeenCalled();
    });

    it('should auto-select first child after fetch', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.selectedChild).toEqual(mockChildren[0]);
    });

    it('should handle empty children list', async () => {
      mockGetMy.mockResolvedValue([]);
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.children).toEqual([]);
      expect(result.current.selectedChild).toBeNull();
    });

    it('should handle fetch error', async () => {
      mockGetMy.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  // ===========================================
  // CREATE CHILD TESTS
  // ===========================================

  describe('createChild', () => {
    it('should create a child and refetch', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newChildData = { first_name: 'Jake', last_name: 'Test' };

      await act(async () => {
        await result.current.createChild(newChildData);
      });

      expect(mockCreate).toHaveBeenCalledWith(newChildData);
    });

    it('should show error toast on create failure', async () => {
      const toast = require('react-hot-toast');
      mockCreate.mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.createChild({ first_name: 'Bad' });
        } catch {
          // Expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  // ===========================================
  // UPDATE CHILD TESTS
  // ===========================================

  describe('updateChild', () => {
    it('should update a child with id and data', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updateData = { first_name: 'Updated' };

      await act(async () => {
        await result.current.updateChild('child-1', updateData);
      });

      expect(mockUpdate).toHaveBeenCalledWith('child-1', updateData);
    });
  });

  // ===========================================
  // DELETE CHILD TESTS
  // ===========================================

  describe('deleteChild', () => {
    it('should delete a child by id', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteChild('child-1');
      });

      expect(mockDelete).toHaveBeenCalledWith('child-1');
    });
  });

  // ===========================================
  // SELECT CHILD TESTS
  // ===========================================

  describe('selectChild', () => {
    it('should update selectedChild', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.selectChild(mockChildren[1]);
      });

      expect(result.current.selectedChild).toEqual(mockChildren[1]);
    });

    it('should allow setting selectedChild to null', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.selectChild(null);
      });

      expect(result.current.selectedChild).toBeNull();
    });
  });

  // ===========================================
  // EMERGENCY CONTACTS TESTS
  // ===========================================

  describe('Emergency Contacts', () => {
    it('should add an emergency contact', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const contactData = { name: 'Jane', phone: '+1234567890', relation: 'Aunt' };

      await act(async () => {
        await result.current.addEmergencyContact('child-1', contactData);
      });

      expect(mockAddEmergencyContact).toHaveBeenCalledWith('child-1', contactData);
    });

    it('should update an emergency contact', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const contactData = { name: 'Updated Jane' };

      await act(async () => {
        await result.current.updateEmergencyContact('child-1', 'ec-1', contactData);
      });

      expect(mockUpdateEmergencyContact).toHaveBeenCalledWith('child-1', 'ec-1', contactData);
    });

    it('should delete an emergency contact', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteEmergencyContact('child-1', 'ec-1');
      });

      expect(mockDeleteEmergencyContact).toHaveBeenCalledWith('child-1', 'ec-1');
    });
  });

  // ===========================================
  // COMPUTED VALUES TESTS
  // ===========================================

  describe('Computed Values', () => {
    it('should compute hasChildren correctly when children exist', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasChildren).toBe(true);
    });

    it('should compute hasChildren as false when no children', async () => {
      mockGetMy.mockResolvedValue([]);
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasChildren).toBe(false);
    });

    it('should compute childrenCount correctly', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.childrenCount).toBe(2);
    });

    it('should compute isLoading as OR of all loading states', async () => {
      const { result } = renderHook(() => useChildren({ autoFetch: false }));

      // When nothing is loading
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ===========================================
  // getChildById TESTS
  // ===========================================

  describe('getChildById', () => {
    it('should find a child by id', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const child = result.current.getChildById('child-1');
      expect(child).toEqual(mockChildren[0]);
    });

    it('should return undefined for unknown id', async () => {
      const { result } = renderHook(() => useChildren());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const child = result.current.getChildById('nonexistent');
      expect(child).toBeUndefined();
    });
  });

  // ===========================================
  // RETURN VALUE STRUCTURE TESTS
  // ===========================================

  describe('Return Values', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useChildren({ autoFetch: false }));

      // Data
      expect(result.current).toHaveProperty('children');
      expect(result.current).toHaveProperty('selectedChild');

      // Loading states
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('creating');
      expect(result.current).toHaveProperty('updating');
      expect(result.current).toHaveProperty('deleting');
      expect(result.current).toHaveProperty('isLoading');

      // Contact loading states
      expect(result.current).toHaveProperty('addingContact');
      expect(result.current).toHaveProperty('updatingContact');
      expect(result.current).toHaveProperty('deletingContact');

      // Errors
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('createError');
      expect(result.current).toHaveProperty('updateError');
      expect(result.current).toHaveProperty('deleteError');

      // Operations (functions)
      expect(typeof result.current.createChild).toBe('function');
      expect(typeof result.current.updateChild).toBe('function');
      expect(typeof result.current.deleteChild).toBe('function');
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.selectChild).toBe('function');
      expect(typeof result.current.getChildById).toBe('function');

      // Emergency contacts
      expect(typeof result.current.addEmergencyContact).toBe('function');
      expect(typeof result.current.updateEmergencyContact).toBe('function');
      expect(typeof result.current.deleteEmergencyContact).toBe('function');

      // Computed
      expect(result.current).toHaveProperty('hasChildren');
      expect(result.current).toHaveProperty('childrenCount');
    });
  });
});

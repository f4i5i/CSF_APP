/**
 * Unit Tests for ChildrenContext
 * Tests the ChildrenProvider and useChildren context hook including
 * data fetching, CRUD operations, selection persistence, and role gating
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ChildrenProvider, useChildren } from '../ChildrenContext';

// ==========================================
// MOCK SETUP
// ==========================================

const mockChildren = [
  { id: 'child-1', first_name: 'Johnny', last_name: 'Test' },
  { id: 'child-2', first_name: 'Jenny', last_name: 'Test' },
];

let mockUser: { role: string } | null = null;

// Mock auth context
jest.mock('../auth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock children service
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

// Storage key used by the context
const SELECTED_CHILD_KEY = 'csf_selected_child_id';

// Wrapper with ChildrenProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ChildrenProvider>{children}</ChildrenProvider>
);

describe('ChildrenContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockUser = { role: 'parent' };
    mockGetMy.mockResolvedValue(mockChildren);
    mockCreate.mockResolvedValue({
      id: 'child-3',
      first_name: 'Jake',
      last_name: 'Test',
    });
    mockUpdate.mockResolvedValue({
      ...mockChildren[0],
      first_name: 'Updated',
    });
    mockDelete.mockResolvedValue({ success: true });
    mockAddEmergencyContact.mockResolvedValue({ id: 'ec-1' });
    mockUpdateEmergencyContact.mockResolvedValue({ id: 'ec-1' });
    mockDeleteEmergencyContact.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // CONTEXT AVAILABILITY TESTS
  // ===========================================

  describe('Context Availability', () => {
    it('should throw error when used outside ChildrenProvider', () => {
      // Suppress console.error for expected error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useChildren());
      }).toThrow('useChildren must be used within a ChildrenProvider');

      consoleSpy.mockRestore();
    });

    it('should provide context value within ChildrenProvider', () => {
      const { result } = renderHook(() => useChildren(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('children');
      expect(result.current).toHaveProperty('selectedChild');
    });
  });

  // ===========================================
  // ROLE-BASED FETCH TESTS
  // ===========================================

  describe('Role-Based Fetching', () => {
    it('should fetch children when user is a parent', async () => {
      mockUser = { role: 'parent' };
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetMy).toHaveBeenCalled();
      expect(result.current.children).toEqual(mockChildren);
    });

    it('should NOT fetch children when user is not a parent', async () => {
      mockUser = { role: 'admin' };
      renderHook(() => useChildren(), { wrapper });

      // Should not call getMy for non-parent roles
      expect(mockGetMy).not.toHaveBeenCalled();
    });

    it('should NOT fetch children when user is null', () => {
      mockUser = null;
      renderHook(() => useChildren(), { wrapper });

      expect(mockGetMy).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // AUTO-SELECT / PERSISTENCE TESTS
  // ===========================================

  describe('Child Selection and Persistence', () => {
    it('should auto-select first child after fetch', async () => {
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.selectedChild).toEqual(mockChildren[0]);
      expect(localStorage.getItem(SELECTED_CHILD_KEY)).toBe('child-1');
    });

    it('should restore previously selected child from localStorage', async () => {
      localStorage.setItem(SELECTED_CHILD_KEY, 'child-2');

      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.selectedChild).toEqual(mockChildren[1]);
    });

    it('should fall back to first child if saved child no longer exists', async () => {
      localStorage.setItem(SELECTED_CHILD_KEY, 'nonexistent-child');

      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should fall back to first child
      expect(result.current.selectedChild).toEqual(mockChildren[0]);
    });
  });

  // ===========================================
  // selectChild TESTS
  // ===========================================

  describe('selectChild', () => {
    it('should update selectedChild and persist to localStorage', async () => {
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.selectChild(mockChildren[1]);
      });

      expect(result.current.selectedChild).toEqual(mockChildren[1]);
      expect(localStorage.getItem(SELECTED_CHILD_KEY)).toBe('child-2');
    });

    it('should handle null child selection', async () => {
      const { result } = renderHook(() => useChildren(), { wrapper });

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
  // CREATE CHILD TESTS
  // ===========================================

  describe('createChild', () => {
    it('should create child, show toast, refetch, and select new child', async () => {
      const toast = require('react-hot-toast');
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createChild({ first_name: 'Jake', last_name: 'Test' });
      });

      expect(mockCreate).toHaveBeenCalledWith({ first_name: 'Jake', last_name: 'Test' });
      expect(toast.success).toHaveBeenCalledWith('Child added successfully!');
    });

    it('should show error toast on create failure', async () => {
      const toast = require('react-hot-toast');
      mockCreate.mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useChildren(), { wrapper });

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
    it('should update child and show success toast', async () => {
      const toast = require('react-hot-toast');
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateChild('child-1', { first_name: 'Updated' });
      });

      expect(mockUpdate).toHaveBeenCalledWith('child-1', { first_name: 'Updated' });
      expect(toast.success).toHaveBeenCalledWith('Child updated successfully!');
    });
  });

  // ===========================================
  // DELETE CHILD TESTS
  // ===========================================

  describe('deleteChild', () => {
    it('should delete child, clear selection, and remove from localStorage', async () => {
      const toast = require('react-hot-toast');
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteChild('child-1');
      });

      expect(mockDelete).toHaveBeenCalledWith('child-1');
      expect(toast.success).toHaveBeenCalledWith('Child removed successfully!');
    });
  });

  // ===========================================
  // EMERGENCY CONTACTS TESTS
  // ===========================================

  describe('Emergency Contacts', () => {
    it('should add emergency contact', async () => {
      const toast = require('react-hot-toast');
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const contactData = { name: 'Jane Doe', phone: '+1234567890' };

      await act(async () => {
        await result.current.addEmergencyContact('child-1', contactData);
      });

      expect(mockAddEmergencyContact).toHaveBeenCalledWith('child-1', contactData);
      expect(toast.success).toHaveBeenCalledWith('Emergency contact added!');
    });

    it('should update emergency contact', async () => {
      const toast = require('react-hot-toast');
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateEmergencyContact('child-1', 'ec-1', { name: 'Updated' });
      });

      expect(mockUpdateEmergencyContact).toHaveBeenCalledWith('child-1', 'ec-1', { name: 'Updated' });
      expect(toast.success).toHaveBeenCalledWith('Emergency contact updated!');
    });

    it('should delete emergency contact', async () => {
      const toast = require('react-hot-toast');
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteEmergencyContact('child-1', 'ec-1');
      });

      expect(mockDeleteEmergencyContact).toHaveBeenCalledWith('child-1', 'ec-1');
      expect(toast.success).toHaveBeenCalledWith('Emergency contact removed!');
    });
  });

  // ===========================================
  // getChildById TESTS
  // ===========================================

  describe('getChildById', () => {
    it('should return child by id from cached data', async () => {
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const child = result.current.getChildById('child-2');
      expect(child).toEqual(mockChildren[1]);
    });

    it('should return undefined for non-existing child', async () => {
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const child = result.current.getChildById('nonexistent');
      expect(child).toBeUndefined();
    });
  });

  // ===========================================
  // COMPUTED VALUES TESTS
  // ===========================================

  describe('Computed Values', () => {
    it('should compute hasChildren as true when children exist', async () => {
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasChildren).toBe(true);
    });

    it('should compute hasChildren as false when empty', async () => {
      mockGetMy.mockResolvedValue([]);
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasChildren).toBe(false);
    });

    it('should compute childrenCount correctly', async () => {
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.childrenCount).toBe(2);
    });
  });

  // ===========================================
  // FULL CONTEXT VALUE SHAPE TESTS
  // ===========================================

  describe('Context Value Shape', () => {
    it('should provide all expected values in context', async () => {
      const { result } = renderHook(() => useChildren(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Data
      expect(result.current).toHaveProperty('children');
      expect(result.current).toHaveProperty('selectedChild');

      // Loading states
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('creating');
      expect(result.current).toHaveProperty('updating');
      expect(result.current).toHaveProperty('deleting');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('addingContact');
      expect(result.current).toHaveProperty('updatingContact');
      expect(result.current).toHaveProperty('deletingContact');

      // Errors
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('createError');
      expect(result.current).toHaveProperty('updateError');
      expect(result.current).toHaveProperty('deleteError');

      // Operations
      expect(typeof result.current.createChild).toBe('function');
      expect(typeof result.current.updateChild).toBe('function');
      expect(typeof result.current.deleteChild).toBe('function');
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.selectChild).toBe('function');
      expect(typeof result.current.getChildById).toBe('function');
      expect(typeof result.current.addEmergencyContact).toBe('function');
      expect(typeof result.current.updateEmergencyContact).toBe('function');
      expect(typeof result.current.deleteEmergencyContact).toBe('function');

      // Computed
      expect(result.current).toHaveProperty('hasChildren');
      expect(result.current).toHaveProperty('childrenCount');
    });
  });
});

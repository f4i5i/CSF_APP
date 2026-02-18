/**
 * Unit Tests for reducer.js
 * Tests: actionType constants, reducer function
 */

import reducer, { actionType } from '../../../context/reducer';

describe('reducer', () => {
  // ==========================================
  // actionType
  // ==========================================
  describe('actionType', () => {
    it('should define SET_USER action type', () => {
      expect(actionType.SET_USER).toBe('SET_USER');
    });
  });

  // ==========================================
  // reducer function
  // ==========================================
  describe('reducer function', () => {
    const initialState = { user: null };

    it('should handle SET_USER action', () => {
      const mockUser = { id: '1', name: 'Test User', role: 'PARENT' };
      const action = { type: actionType.SET_USER, user: mockUser };

      const newState = reducer(initialState, action);
      expect(newState.user).toEqual(mockUser);
    });

    it('should preserve other state properties when setting user', () => {
      const stateWithExtra = { user: null, otherProp: 'value' };
      const action = { type: actionType.SET_USER, user: { id: '1' } };

      const newState = reducer(stateWithExtra, action);
      expect(newState.user).toEqual({ id: '1' });
      expect(newState.otherProp).toBe('value');
    });

    it('should return current state for unknown action types', () => {
      const action = { type: 'UNKNOWN_ACTION' };
      const newState = reducer(initialState, action);
      expect(newState).toBe(initialState);
    });

    it('should handle setting user to null (logout)', () => {
      const stateWithUser = { user: { id: '1', name: 'Test' } };
      const action = { type: actionType.SET_USER, user: null };

      const newState = reducer(stateWithUser, action);
      expect(newState.user).toBeNull();
    });

    it('should not mutate the original state', () => {
      const originalState = { user: null };
      const action = { type: actionType.SET_USER, user: { id: '1' } };

      reducer(originalState, action);
      expect(originalState.user).toBeNull();
    });
  });
});

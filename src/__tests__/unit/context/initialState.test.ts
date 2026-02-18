/**
 * Unit Tests for initialState.js
 * Tests: initialState object shape
 */

describe('initialState', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetModules();
  });

  it('should export an object with user property', () => {
    const { initialState } = require('../../../context/initialState');
    expect(initialState).toBeDefined();
    expect(initialState).toHaveProperty('user');
  });

  it('should set user to null when no user in localStorage', () => {
    const { initialState } = require('../../../context/initialState');
    expect(initialState.user).toBeNull();
  });

  it('should set user from localStorage when available', () => {
    const mockUser = { id: '1', name: 'Test', role: 'PARENT' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    jest.resetModules();
    const { initialState } = require('../../../context/initialState');
    expect(initialState.user).toEqual(mockUser);
  });

  it('should handle "undefined" value in localStorage', () => {
    localStorage.setItem('user', 'undefined');

    jest.resetModules();
    const { initialState } = require('../../../context/initialState');
    expect(initialState.user).toBeUndefined();
  });
});

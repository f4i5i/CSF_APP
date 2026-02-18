/**
 * Unit Tests for src/api/client.js (legacy JS Axios client)
 * Tests instance configuration, interceptors, setAuthToken, clearAuth helpers
 */

import MockAdapter from 'axios-mock-adapter';

// We need to mock axios.post for the token refresh flow (raw axios, not apiClient)
jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  const instance = actual.create({
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 30000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420',
    },
  });
  return {
    ...actual,
    __esModule: true,
    default: {
      ...actual,
      create: jest.fn(() => instance),
      post: jest.fn(),
    },
    create: jest.fn(() => instance),
    post: jest.fn(),
  };
});

// Mock window.location
const originalLocation = window.location;

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...originalLocation, href: '' },
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
});

describe('client.js (legacy)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.href = '';
  });

  // =========================================================================
  // Module exports
  // =========================================================================
  describe('exports', () => {
    it('should export apiClient as default', () => {
      const mod = require('../../../api/client');
      expect(mod.default).toBeDefined();
    });

    it('should export setAuthToken function', () => {
      const { setAuthToken } = require('../../../api/client');
      expect(typeof setAuthToken).toBe('function');
    });

    it('should export clearAuth function', () => {
      const { clearAuth } = require('../../../api/client');
      expect(typeof clearAuth).toBe('function');
    });
  });

  // =========================================================================
  // setAuthToken
  // =========================================================================
  describe('setAuthToken', () => {
    it('should store token in localStorage and set header when token is provided', () => {
      const { setAuthToken } = require('../../../api/client');
      const apiClient = require('../../../api/client').default;

      setAuthToken('my-token');

      expect(localStorage.getItem('csf_access_token')).toBe('my-token');
      expect(apiClient.defaults.headers.common['Authorization']).toBe('Bearer my-token');
    });

    it('should remove token from localStorage and header when called with falsy value', () => {
      const { setAuthToken } = require('../../../api/client');
      const apiClient = require('../../../api/client').default;

      // First set it
      setAuthToken('my-token');
      expect(localStorage.getItem('csf_access_token')).toBe('my-token');

      // Then clear it
      setAuthToken(null);

      expect(localStorage.getItem('csf_access_token')).toBeNull();
      expect(localStorage.getItem('csf_refresh_token')).toBeNull();
      expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  // =========================================================================
  // clearAuth
  // =========================================================================
  describe('clearAuth', () => {
    it('should clear auth-related items from localStorage and headers', () => {
      const { clearAuth, setAuthToken } = require('../../../api/client');
      const apiClient = require('../../../api/client').default;

      // Set up auth state
      setAuthToken('token-to-clear');
      localStorage.setItem('csf_refresh_token', 'refresh-to-clear');

      // Clear it
      clearAuth();

      expect(localStorage.getItem('csf_access_token')).toBeNull();
      expect(localStorage.getItem('csf_refresh_token')).toBeNull();
      expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });
});

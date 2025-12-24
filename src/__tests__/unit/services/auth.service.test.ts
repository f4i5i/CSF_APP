/**
 * Auth Service Unit Tests
 * Tests for authentication service methods (utility methods only)
 *
 * NOTE: API-dependent tests are in integration tests due to complex axios interceptor interactions
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const authServiceModule = require('../../../api/services/auth.service');
const authService = authServiceModule.authService || authServiceModule.default?.authService || authServiceModule.default;

const mock = new MockAdapter(apiClient);

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  // ===========================================
  // MODULE LOADING TEST
  // ===========================================
  describe('module loading', () => {
    it('should have authService defined', () => {
      expect(authService).toBeDefined();
      expect(typeof authService.login).toBe('function');
      expect(typeof authService.register).toBe('function');
      expect(typeof authService.refreshToken).toBe('function');
      expect(typeof authService.logout).toBe('function');
      expect(typeof authService.isAuthenticated).toBe('function');
      expect(typeof authService.getAccessToken).toBe('function');
      expect(typeof authService.getRefreshToken).toBe('function');
    });
  });

  // ===========================================
  // UTILITY METHODS TESTS (No API calls)
  // ===========================================
  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorage.setItem('csf_access_token', 'mock-access-token');

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when no access token', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return false when access token is empty', () => {
      localStorage.setItem('csf_access_token', '');

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('should return access token when it exists', () => {
      const token = 'mock-access-token';
      localStorage.setItem('csf_access_token', token);

      expect(authService.getAccessToken()).toBe(token);
    });

    it('should return null when no access token', () => {
      expect(authService.getAccessToken()).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token when it exists', () => {
      const token = 'mock-refresh-token';
      localStorage.setItem('csf_refresh_token', token);

      expect(authService.getRefreshToken()).toBe(token);
    });

    it('should return null when no refresh token', () => {
      expect(authService.getRefreshToken()).toBeNull();
    });
  });

  // ===========================================
  // TOKEN REFRESH VALIDATION TEST
  // ===========================================
  describe('refreshToken', () => {
    it('should throw error when no refresh token available', async () => {
      // Ensure no refresh token is set
      localStorage.removeItem('csf_refresh_token');

      await expect(authService.refreshToken()).rejects.toThrow(
        'No refresh token available'
      );
    });
  });

  // ===========================================
  // LOGOUT TESTS
  // NOTE: API-dependent logout tests are in integration tests
  // due to complex axios interceptor interactions
  // ===========================================
});

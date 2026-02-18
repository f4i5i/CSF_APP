/**
 * Unit Tests for src/api/config/api.config.ts
 * Tests API configuration object values and getApiUrl helper
 */

describe('API_CONFIG (TypeScript)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // =========================================================================
  // Default values (no env vars set)
  // =========================================================================
  describe('default values', () => {
    it('should have correct BASE_URL default when env var is not set', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const { API_CONFIG } = require('../../../api/config/api.config');
      expect(API_CONFIG.BASE_URL).toBe('http://localhost:8000/api');
    });

    it('should have correct API_PREFIX', () => {
      const { API_CONFIG } = require('../../../api/config/api.config');
      expect(API_CONFIG.API_PREFIX).toBe('/v1');
    });

    it('should have a 30-second timeout', () => {
      const { API_CONFIG } = require('../../../api/config/api.config');
      expect(API_CONFIG.TIMEOUT).toBe(30000);
    });

    it('should have correct TOKEN_STORAGE_KEY', () => {
      const { API_CONFIG } = require('../../../api/config/api.config');
      expect(API_CONFIG.TOKEN_STORAGE_KEY).toBe('csf_access_token');
    });

    it('should have correct REFRESH_TOKEN_STORAGE_KEY', () => {
      const { API_CONFIG } = require('../../../api/config/api.config');
      expect(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY).toBe('csf_refresh_token');
    });

    it('should have MAX_RETRIES of 3', () => {
      const { API_CONFIG } = require('../../../api/config/api.config');
      expect(API_CONFIG.MAX_RETRIES).toBe(3);
    });

    it('should have RETRY_DELAY of 1000ms', () => {
      const { API_CONFIG } = require('../../../api/config/api.config');
      expect(API_CONFIG.RETRY_DELAY).toBe(1000);
    });
  });

  // =========================================================================
  // Environment variable override
  // =========================================================================
  describe('environment variable override', () => {
    it('should use REACT_APP_API_BASE_URL when set', () => {
      process.env.REACT_APP_API_BASE_URL = 'https://api.production.com';
      const { API_CONFIG } = require('../../../api/config/api.config');
      expect(API_CONFIG.BASE_URL).toBe('https://api.production.com');
    });
  });

  // =========================================================================
  // getApiUrl helper
  // =========================================================================
  describe('getApiUrl', () => {
    it('should construct full API URL from endpoint', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const { getApiUrl } = require('../../../api/config/api.config');
      expect(getApiUrl('/auth/login')).toBe('http://localhost:8000/api/v1/auth/login');
    });

    it('should work with custom base URL', () => {
      process.env.REACT_APP_API_BASE_URL = 'https://api.example.com';
      const { getApiUrl } = require('../../../api/config/api.config');
      expect(getApiUrl('/users/me')).toBe('https://api.example.com/v1/users/me');
    });

    it('should handle empty endpoint', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const { getApiUrl } = require('../../../api/config/api.config');
      expect(getApiUrl('')).toBe('http://localhost:8000/api/v1');
    });
  });

  // =========================================================================
  // Default export
  // =========================================================================
  describe('default export', () => {
    it('should export API_CONFIG as default', () => {
      const defaultExport = require('../../../api/config/api.config').default;
      const { API_CONFIG } = require('../../../api/config/api.config');
      expect(defaultExport).toEqual(API_CONFIG);
    });
  });

  // =========================================================================
  // Immutability (as const)
  // =========================================================================
  describe('immutability', () => {
    it('should have all expected keys', () => {
      const { API_CONFIG } = require('../../../api/config/api.config');
      const keys = Object.keys(API_CONFIG);
      expect(keys).toEqual(
        expect.arrayContaining([
          'BASE_URL',
          'API_PREFIX',
          'TIMEOUT',
          'TOKEN_STORAGE_KEY',
          'REFRESH_TOKEN_STORAGE_KEY',
          'MAX_RETRIES',
          'RETRY_DELAY',
        ])
      );
    });
  });
});

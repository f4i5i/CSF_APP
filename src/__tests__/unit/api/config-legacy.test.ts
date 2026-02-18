/**
 * Unit Tests for src/api/config.js (legacy JS config)
 * Tests API_CONFIG default export, getApiUrl, getBaseUrl, getUploadsUrl, getFileUrl
 */

describe('API_CONFIG (legacy config.js)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // =========================================================================
  // Default values
  // =========================================================================
  describe('default values', () => {
    it('should have correct BASE_URL default', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const API_CONFIG = require('../../../api/config').default;
      expect(API_CONFIG.BASE_URL).toBe('http://localhost:8000/api');
    });

    it('should have API_PREFIX of /v1', () => {
      const API_CONFIG = require('../../../api/config').default;
      expect(API_CONFIG.API_PREFIX).toBe('/v1');
    });

    it('should have TIMEOUT of 30000', () => {
      const API_CONFIG = require('../../../api/config').default;
      expect(API_CONFIG.TIMEOUT).toBe(30000);
    });

    it('should have correct token storage keys', () => {
      const API_CONFIG = require('../../../api/config').default;
      expect(API_CONFIG.TOKEN_STORAGE_KEY).toBe('csf_access_token');
      expect(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY).toBe('csf_refresh_token');
    });

    it('should have correct retry config', () => {
      const API_CONFIG = require('../../../api/config').default;
      expect(API_CONFIG.MAX_RETRIES).toBe(3);
      expect(API_CONFIG.RETRY_DELAY).toBe(1000);
    });
  });

  // =========================================================================
  // Environment override
  // =========================================================================
  describe('environment override', () => {
    it('should use REACT_APP_API_BASE_URL when set', () => {
      process.env.REACT_APP_API_BASE_URL = 'https://api.prod.com';
      const API_CONFIG = require('../../../api/config').default;
      expect(API_CONFIG.BASE_URL).toBe('https://api.prod.com');
    });
  });

  // =========================================================================
  // getApiUrl
  // =========================================================================
  describe('getApiUrl', () => {
    it('should construct full API URL from endpoint', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const { getApiUrl } = require('../../../api/config');
      expect(getApiUrl('/auth/login')).toBe('http://localhost:8000/api/v1/auth/login');
    });

    it('should handle empty endpoint', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const { getApiUrl } = require('../../../api/config');
      expect(getApiUrl('')).toBe('http://localhost:8000/api/v1');
    });
  });

  // =========================================================================
  // getBaseUrl
  // =========================================================================
  describe('getBaseUrl', () => {
    it('should return BASE_URL + API_PREFIX', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const { getBaseUrl } = require('../../../api/config');
      expect(getBaseUrl()).toBe('http://localhost:8000/api/v1');
    });
  });

  // =========================================================================
  // getUploadsUrl
  // =========================================================================
  describe('getUploadsUrl', () => {
    it('should return server root /uploads (stripping /api from BASE_URL)', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const { getUploadsUrl } = require('../../../api/config');
      expect(getUploadsUrl()).toBe('http://localhost:8000/uploads');
    });
  });

  // =========================================================================
  // getFileUrl
  // =========================================================================
  describe('getFileUrl', () => {
    beforeEach(() => {
      delete process.env.REACT_APP_API_BASE_URL;
    });

    it('should return empty string for falsy input', () => {
      const { getFileUrl } = require('../../../api/config');
      expect(getFileUrl('')).toBe('');
      expect(getFileUrl(null)).toBe('');
      expect(getFileUrl(undefined)).toBe('');
    });

    it('should return full URLs as-is (http)', () => {
      const { getFileUrl } = require('../../../api/config');
      expect(getFileUrl('http://example.com/file.jpg')).toBe('http://example.com/file.jpg');
    });

    it('should return full URLs as-is (https)', () => {
      const { getFileUrl } = require('../../../api/config');
      expect(getFileUrl('https://cdn.example.com/img.png')).toBe('https://cdn.example.com/img.png');
    });

    it('should handle API endpoint URLs (starts with /api/)', () => {
      const { getFileUrl } = require('../../../api/config');
      expect(getFileUrl('/api/v1/children/123/profile-image')).toBe(
        'http://localhost:8000/api/v1/children/123/profile-image'
      );
    });

    it('should handle legacy filesystem-based paths', () => {
      const { getFileUrl } = require('../../../api/config');
      expect(getFileUrl('announcements/xyz.jpg')).toBe(
        'http://localhost:8000/uploads/announcements/xyz.jpg'
      );
    });
  });
});

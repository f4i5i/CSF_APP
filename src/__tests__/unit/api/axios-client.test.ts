/**
 * Unit Tests for src/api/client/axios-client.ts
 * Tests Axios instance configuration, request interceptor (token attachment),
 * and response interceptor (token refresh, error handling).
 */

import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { apiClient } from '../../../api/client/axios-client';
import { API_CONFIG } from '../../../api/config/api.config';

// We use a mock adapter on the exported apiClient
const mock = new MockAdapter(apiClient);

// We also need to mock raw axios.post used by the refresh flow
jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    ...actual,
    __esModule: true,
    default: {
      ...actual,
      create: actual.create,
      post: jest.fn(),
    },
    post: jest.fn(),
  };
});

const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;

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

describe('axios-client', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
    window.location.href = '';
    mockedAxiosPost.mockReset();
  });

  // =========================================================================
  // Instance configuration
  // =========================================================================
  describe('instance configuration', () => {
    it('should have correct baseURL combining BASE_URL and API_PREFIX', () => {
      expect(apiClient.defaults.baseURL).toBe(
        `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`
      );
    });

    it('should have correct timeout', () => {
      expect(apiClient.defaults.timeout).toBe(API_CONFIG.TIMEOUT);
    });

    it('should have withCredentials enabled', () => {
      expect(apiClient.defaults.withCredentials).toBe(true);
    });

    it('should set Content-Type to application/json', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should set ngrok-skip-browser-warning header', () => {
      expect(apiClient.defaults.headers['ngrok-skip-browser-warning']).toBe('69420');
    });
  });

  // =========================================================================
  // Request interceptor - token attachment
  // =========================================================================
  describe('request interceptor', () => {
    it('should attach Bearer token from localStorage when present', async () => {
      localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, 'test-access-token');
      mock.onGet('/test').reply(200, { ok: true });

      const response = await apiClient.get('/test');
      const requestHeaders = mock.history.get[0].headers;

      expect(requestHeaders?.Authorization).toBe('Bearer test-access-token');
      expect(response.data).toEqual({ ok: true });
    });

    it('should not attach Authorization header when no token exists', async () => {
      mock.onGet('/test').reply(200, { ok: true });

      await apiClient.get('/test');
      const requestHeaders = mock.history.get[0].headers;

      // Authorization should not be set (or undefined)
      expect(
        requestHeaders?.Authorization === undefined ||
        requestHeaders?.Authorization === null
      ).toBe(true);
    });
  });

  // =========================================================================
  // Response interceptor - non-401 errors
  // =========================================================================
  describe('response interceptor - non-401 errors', () => {
    it('should pass successful responses through unchanged', async () => {
      mock.onGet('/success').reply(200, { data: 'ok' });

      const response = await apiClient.get('/success');
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ data: 'ok' });
    });

    it('should transform non-401 errors via handleApiError', async () => {
      mock.onGet('/server-error').reply(500, {
        error_code: 'SERVER_ERROR',
        message: 'Internal server error',
      });

      await expect(apiClient.get('/server-error')).rejects.toBeDefined();
    });

    it('should transform 404 errors', async () => {
      mock.onGet('/not-found').reply(404, {
        error_code: 'NOT_FOUND',
        message: 'Not found',
      });

      await expect(apiClient.get('/not-found')).rejects.toBeDefined();
    });
  });

  // =========================================================================
  // Response interceptor - 401 token refresh
  // =========================================================================
  describe('response interceptor - 401 token refresh', () => {
    it('should redirect to /login when 401 and no refresh token', async () => {
      localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, 'expired-token');
      // No refresh token set

      mock.onGet('/protected').reply(401, { message: 'Unauthorized' });

      await expect(apiClient.get('/protected')).rejects.toBeDefined();
      expect(window.location.href).toBe('/login');
    });

    it('should attempt token refresh on 401 when refresh token exists', async () => {
      localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, 'expired-token');
      localStorage.setItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY, 'valid-refresh-token');

      // First request returns 401
      mock.onGet('/protected').replyOnce(401, { message: 'Unauthorized' });
      // After refresh, the retried request succeeds
      mock.onGet('/protected').replyOnce(200, { data: 'success' });

      // Mock the refresh call (uses raw axios.post, not apiClient)
      mockedAxiosPost.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
        },
      });

      const response = await apiClient.get('/protected');
      expect(response.data).toEqual({ data: 'success' });

      // Verify tokens were stored
      expect(localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY)).toBe('new-access-token');
      expect(localStorage.getItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY)).toBe('new-refresh-token');
    });

    it('should redirect to /login when token refresh fails', async () => {
      localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, 'expired-token');
      localStorage.setItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY, 'invalid-refresh');

      mock.onGet('/protected').reply(401, { message: 'Unauthorized' });

      // Refresh call fails
      mockedAxiosPost.mockRejectedValueOnce(new Error('Refresh failed'));

      await expect(apiClient.get('/protected')).rejects.toBeDefined();
      expect(window.location.href).toBe('/login');
    });
  });

  // =========================================================================
  // Default export
  // =========================================================================
  describe('exports', () => {
    it('should export apiClient as both named and default', () => {
      const mod = require('../../../api/client/axios-client');
      expect(mod.apiClient).toBeDefined();
      expect(mod.default).toBeDefined();
      expect(mod.default).toBe(mod.apiClient);
    });
  });
});

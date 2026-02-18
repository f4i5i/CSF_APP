/**
 * Unit Tests for src/api/utils/retry-config.ts
 * Tests shouldRetry, getRetryDelay, shouldRetryMutation, isRetryableError
 */

import {
  shouldRetry,
  getRetryDelay,
  shouldRetryMutation,
  isRetryableError,
} from '../../../api/utils/retry-config';
import { ApiError, NetworkError } from '../../../lib/errors/ApiError';

describe('retry-config', () => {
  // =========================================================================
  // shouldRetry
  // =========================================================================
  describe('shouldRetry', () => {
    it('should not retry after 3 or more failures regardless of error type', () => {
      const networkErr = new NetworkError();
      expect(shouldRetry(3, networkErr)).toBe(false);
      expect(shouldRetry(4, networkErr)).toBe(false);
      expect(shouldRetry(10, networkErr)).toBe(false);
    });

    it('should retry on network errors within limit', () => {
      const networkErr = new NetworkError();
      expect(shouldRetry(0, networkErr)).toBe(true);
      expect(shouldRetry(1, networkErr)).toBe(true);
      expect(shouldRetry(2, networkErr)).toBe(true);
    });

    it('should retry on 5xx server errors within limit', () => {
      const serverErr = new ApiError({ error_code: 'SERVER', message: 'err', status: 500 });
      expect(shouldRetry(0, serverErr)).toBe(true);
      expect(shouldRetry(2, serverErr)).toBe(true);
    });

    it('should retry on 408 Request Timeout within limit', () => {
      const timeoutErr = new ApiError({ error_code: 'TIMEOUT', message: 'err', status: 408 });
      expect(shouldRetry(0, timeoutErr)).toBe(true);
      expect(shouldRetry(2, timeoutErr)).toBe(true);
    });

    it('should retry on 429 Too Many Requests but only twice', () => {
      const rateLimitErr = new ApiError({ error_code: 'RATE_LIMIT', message: 'err', status: 429 });
      expect(shouldRetry(0, rateLimitErr)).toBe(true);
      expect(shouldRetry(1, rateLimitErr)).toBe(true);
      expect(shouldRetry(2, rateLimitErr)).toBe(false);
    });

    it('should retry on 503 Service Unavailable within limit', () => {
      const err = new ApiError({ error_code: 'SERVICE_UNAVAILABLE', message: 'err', status: 503 });
      expect(shouldRetry(0, err)).toBe(true);
      expect(shouldRetry(2, err)).toBe(true);
    });

    it('should not retry on 4xx client errors (except 408, 429)', () => {
      const err400 = new ApiError({ error_code: 'BAD_REQUEST', message: 'err', status: 400 });
      const err404 = new ApiError({ error_code: 'NOT_FOUND', message: 'err', status: 404 });
      const err422 = new ApiError({ error_code: 'VALIDATION', message: 'err', status: 422 });

      expect(shouldRetry(0, err400)).toBe(false);
      expect(shouldRetry(0, err404)).toBe(false);
      expect(shouldRetry(0, err422)).toBe(false);
    });

    it('should retry unknown (non-ApiError) errors once', () => {
      const genericErr = new Error('Something broke');
      expect(shouldRetry(0, genericErr)).toBe(true);
      expect(shouldRetry(1, genericErr)).toBe(false);
    });

    it('should not retry unknown errors after first attempt', () => {
      expect(shouldRetry(1, 'string error')).toBe(false);
    });
  });

  // =========================================================================
  // getRetryDelay
  // =========================================================================
  describe('getRetryDelay', () => {
    it('should return 1000ms for attempt 0', () => {
      expect(getRetryDelay(0)).toBe(1000);
    });

    it('should return 2000ms for attempt 1', () => {
      expect(getRetryDelay(1)).toBe(2000);
    });

    it('should return 4000ms for attempt 2', () => {
      expect(getRetryDelay(2)).toBe(4000);
    });

    it('should return 8000ms for attempt 3', () => {
      expect(getRetryDelay(3)).toBe(8000);
    });

    it('should cap at 30000ms', () => {
      expect(getRetryDelay(10)).toBe(30000);
      expect(getRetryDelay(20)).toBe(30000);
    });

    it('should follow exponential backoff formula', () => {
      for (let i = 0; i < 5; i++) {
        const expected = Math.min(1000 * 2 ** i, 30000);
        expect(getRetryDelay(i)).toBe(expected);
      }
    });
  });

  // =========================================================================
  // shouldRetryMutation
  // =========================================================================
  describe('shouldRetryMutation', () => {
    it('should not retry after 1 or more failures', () => {
      const networkErr = new NetworkError();
      expect(shouldRetryMutation(1, networkErr)).toBe(false);
      expect(shouldRetryMutation(2, networkErr)).toBe(false);
    });

    it('should retry network errors on first failure', () => {
      const networkErr = new NetworkError();
      expect(shouldRetryMutation(0, networkErr)).toBe(true);
    });

    it('should not retry non-network ApiErrors', () => {
      const serverErr = new ApiError({ error_code: 'SERVER', message: 'err', status: 500 });
      expect(shouldRetryMutation(0, serverErr)).toBe(false);
    });

    it('should not retry non-ApiError errors', () => {
      expect(shouldRetryMutation(0, new Error('generic'))).toBe(false);
      expect(shouldRetryMutation(0, 'string')).toBe(false);
    });
  });

  // =========================================================================
  // isRetryableError
  // =========================================================================
  describe('isRetryableError', () => {
    it('should return true for non-ApiError (unknown errors)', () => {
      expect(isRetryableError(new Error('unknown'))).toBe(true);
      expect(isRetryableError('string')).toBe(true);
      expect(isRetryableError(null)).toBe(true);
    });

    it('should return true for network errors', () => {
      expect(isRetryableError(new NetworkError())).toBe(true);
    });

    it('should return true for server errors (5xx)', () => {
      const err = new ApiError({ error_code: 'SERVER', message: 'err', status: 500 });
      expect(isRetryableError(err)).toBe(true);
    });

    it('should return true for retryable status codes 408, 429, 503, 504', () => {
      expect(isRetryableError(new ApiError({ error_code: 'T', message: 'e', status: 408 }))).toBe(true);
      expect(isRetryableError(new ApiError({ error_code: 'T', message: 'e', status: 429 }))).toBe(true);
      expect(isRetryableError(new ApiError({ error_code: 'T', message: 'e', status: 503 }))).toBe(true);
      expect(isRetryableError(new ApiError({ error_code: 'T', message: 'e', status: 504 }))).toBe(true);
    });

    it('should return false for non-retryable client errors', () => {
      expect(isRetryableError(new ApiError({ error_code: 'T', message: 'e', status: 400 }))).toBe(false);
      expect(isRetryableError(new ApiError({ error_code: 'T', message: 'e', status: 401 }))).toBe(false);
      expect(isRetryableError(new ApiError({ error_code: 'T', message: 'e', status: 403 }))).toBe(false);
      expect(isRetryableError(new ApiError({ error_code: 'T', message: 'e', status: 404 }))).toBe(false);
      expect(isRetryableError(new ApiError({ error_code: 'T', message: 'e', status: 422 }))).toBe(false);
    });
  });
});

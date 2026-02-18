/**
 * Unit Tests for src/api/utils/error-handler.ts
 * Tests handleApiError, getErrorMessage, formatValidationErrors,
 * isErrorType, isAuthError, isValidationError, logError
 */

import { AxiosError, AxiosHeaders } from 'axios';
import {
  handleApiError,
  getErrorMessage,
  formatValidationErrors,
  isErrorType,
  isAuthError,
  isValidationError,
  logError,
} from '../../../api/utils/error-handler';
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
} from '../../../lib/errors/ApiError';

/**
 * Helper to create a mock AxiosError
 */
function createAxiosError(
  status: number | null,
  data?: Record<string, any>,
  hasResponse = true
): AxiosError {
  const headers = new AxiosHeaders();
  const error = new AxiosError(
    'Request failed',
    hasResponse ? 'ERR_BAD_RESPONSE' : 'ERR_NETWORK',
    undefined,
    undefined,
    hasResponse && status !== null
      ? {
          status,
          data: data || {},
          statusText: 'Error',
          headers: {},
          config: { headers },
        }
      : undefined
  );
  return error;
}

describe('error-handler', () => {
  // =========================================================================
  // handleApiError
  // =========================================================================
  describe('handleApiError', () => {
    it('should return NetworkError for AxiosError with no response', () => {
      const axiosErr = createAxiosError(null, undefined, false);
      const result = handleApiError(axiosErr);

      expect(result).toBeInstanceOf(NetworkError);
      expect(result.message).toContain('Network error');
    });

    it('should return AuthenticationError for 401', () => {
      const axiosErr = createAxiosError(401, {
        error_code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
      const result = handleApiError(axiosErr);

      expect(result).toBeInstanceOf(AuthenticationError);
      expect(result.status).toBe(401);
    });

    it('should return AuthorizationError for 403', () => {
      const axiosErr = createAxiosError(403, {
        error_code: 'FORBIDDEN',
        message: 'Forbidden',
      });
      const result = handleApiError(axiosErr);

      expect(result).toBeInstanceOf(AuthorizationError);
      expect(result.status).toBe(403);
    });

    it('should return ValidationError for 422', () => {
      const axiosErr = createAxiosError(422, {
        error_code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: { email: ['Invalid email format'] },
      });
      const result = handleApiError(axiosErr);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.status).toBe(422);
    });

    it('should return ApiError for other status codes', () => {
      const axiosErr = createAxiosError(500, {
        error_code: 'SERVER_ERROR',
        message: 'Internal server error',
      });
      const result = handleApiError(axiosErr);

      expect(result).toBeInstanceOf(ApiError);
      expect(result.status).toBe(500);
    });

    it('should use fallback error_code when not provided in response', () => {
      const axiosErr = createAxiosError(404, {});
      const result = handleApiError(axiosErr);

      expect(result.code).toBe('HTTP_404');
    });

    it('should pass through existing ApiError instances', () => {
      const existing = new ApiError({
        error_code: 'EXISTING',
        message: 'Existing error',
        status: 400,
      });
      const result = handleApiError(existing);

      expect(result).toBe(existing);
    });

    it('should handle generic Error objects', () => {
      const genericError = new Error('Something went wrong');
      const result = handleApiError(genericError);

      expect(result).toBeInstanceOf(ApiError);
      expect(result.message).toBe('Something went wrong');
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.status).toBe(500);
    });

    it('should handle non-Error unknown values', () => {
      const result = handleApiError('string error');

      expect(result).toBeInstanceOf(ApiError);
      expect(result.message).toBe('An unknown error occurred');
      expect(result.status).toBe(500);
    });

    it('should handle null/undefined', () => {
      const result = handleApiError(null);
      expect(result).toBeInstanceOf(ApiError);
      expect(result.status).toBe(500);
    });

    it('should include details from response data', () => {
      const axiosErr = createAxiosError(422, {
        error_code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { name: ['Required'] },
      });
      const result = handleApiError(axiosErr);
      expect(result.details).toEqual({ name: ['Required'] });
    });
  });

  // =========================================================================
  // getErrorMessage
  // =========================================================================
  describe('getErrorMessage', () => {
    it('should return message from ApiError instance', () => {
      const err = new ApiError({
        error_code: 'TEST',
        message: 'Test error message',
        status: 400,
      });
      expect(getErrorMessage(err)).toBe('Test error message');
    });

    it('should return message from generic Error', () => {
      const err = new Error('Generic error');
      expect(getErrorMessage(err)).toBe('Generic error');
    });

    it('should return default server error message for unknown types', () => {
      expect(getErrorMessage(42)).toContain('Server error');
    });

    it('should return default for null', () => {
      expect(getErrorMessage(null)).toContain('Server error');
    });
  });

  // =========================================================================
  // formatValidationErrors
  // =========================================================================
  describe('formatValidationErrors', () => {
    it('should return field errors from ValidationError', () => {
      const err = new ValidationError({
        error_code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        status: 422,
        details: {
          email: ['Invalid email format'],
          name: 'Required',
        },
      });

      const fieldErrors = formatValidationErrors(err);
      expect(fieldErrors).toEqual({
        email: 'Invalid email format',
        name: 'Required',
      });
    });

    it('should return empty object for non-ValidationError', () => {
      const err = new ApiError({
        error_code: 'OTHER',
        message: 'Other error',
        status: 400,
      });
      expect(formatValidationErrors(err)).toEqual({});
    });

    it('should return empty object for non-ApiError', () => {
      expect(formatValidationErrors(new Error('generic'))).toEqual({});
    });
  });

  // =========================================================================
  // isErrorType
  // =========================================================================
  describe('isErrorType', () => {
    it('should detect auth errors', () => {
      const err = new ApiError({ error_code: 'UNAUTHORIZED', message: 'Auth', status: 401 });
      expect(isErrorType(err, 'auth')).toBe(true);
    });

    it('should detect validation errors', () => {
      const err = new ApiError({ error_code: 'VALIDATION_ERROR', message: 'Validation', status: 422 });
      expect(isErrorType(err, 'validation')).toBe(true);
    });

    it('should detect network errors', () => {
      const err = new NetworkError();
      expect(isErrorType(err, 'network')).toBe(true);
    });

    it('should detect server errors', () => {
      const err = new ApiError({ error_code: 'SERVER', message: 'Server', status: 500 });
      expect(isErrorType(err, 'server')).toBe(true);
    });

    it('should detect notFound errors', () => {
      const err = new ApiError({ error_code: 'NOT_FOUND', message: 'Not found', status: 404 });
      expect(isErrorType(err, 'notFound')).toBe(true);
    });

    it('should detect forbidden errors', () => {
      const err = new ApiError({ error_code: 'FORBIDDEN', message: 'Forbidden', status: 403 });
      expect(isErrorType(err, 'forbidden')).toBe(true);
    });

    it('should return false for non-ApiError', () => {
      expect(isErrorType(new Error('generic'), 'auth')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isErrorType(null, 'auth')).toBe(false);
    });
  });

  // =========================================================================
  // isAuthError
  // =========================================================================
  describe('isAuthError', () => {
    it('should return true for 401 ApiError', () => {
      const err = new ApiError({ error_code: 'UNAUTHORIZED', message: 'Unauthorized', status: 401 });
      expect(isAuthError(err)).toBe(true);
    });

    it('should return false for non-auth ApiError', () => {
      const err = new ApiError({ error_code: 'NOT_FOUND', message: 'Not found', status: 404 });
      expect(isAuthError(err)).toBe(false);
    });
  });

  // =========================================================================
  // isValidationError
  // =========================================================================
  describe('isValidationError', () => {
    it('should return true for 422 ApiError', () => {
      const err = new ApiError({ error_code: 'VALIDATION_ERROR', message: 'Invalid', status: 422 });
      expect(isValidationError(err)).toBe(true);
    });

    it('should return false for non-validation ApiError', () => {
      const err = new ApiError({ error_code: 'SERVER', message: 'Server', status: 500 });
      expect(isValidationError(err)).toBe(false);
    });
  });

  // =========================================================================
  // logError
  // =========================================================================
  describe('logError', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should log to console.error in development', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const err = new ApiError({ error_code: 'TEST', message: 'Test', status: 400 });
      logError(err, { context: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith('[API Error]', err, { context: 'test' });
      consoleSpy.mockRestore();
    });

    it('should not log to console.error in production', () => {
      process.env.NODE_ENV = 'production';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      logError(new Error('test'));

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

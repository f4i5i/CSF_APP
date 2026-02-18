/**
 * Unit Tests for src/lib/errors/ApiError.ts
 * Tests ApiError, ValidationError, AuthenticationError,
 * AuthorizationError, and NetworkError classes.
 */

import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
} from '../../../lib/errors/ApiError';

describe('ApiError', () => {
  // =========================================================================
  // Constructor
  // =========================================================================
  describe('constructor', () => {
    it('should set message, status, code, and details from response', () => {
      const err = new ApiError({
        error_code: 'TEST_ERROR',
        message: 'Something went wrong',
        status: 400,
        details: { field: 'value' },
      });

      expect(err.message).toBe('Something went wrong');
      expect(err.status).toBe(400);
      expect(err.code).toBe('TEST_ERROR');
      expect(err.details).toEqual({ field: 'value' });
    });

    it('should set name to ApiError', () => {
      const err = new ApiError({ error_code: 'T', message: 'm', status: 400 });
      expect(err.name).toBe('ApiError');
    });

    it('should be instanceof Error', () => {
      const err = new ApiError({ error_code: 'T', message: 'm', status: 400 });
      expect(err).toBeInstanceOf(Error);
    });

    it('should be instanceof ApiError', () => {
      const err = new ApiError({ error_code: 'T', message: 'm', status: 400 });
      expect(err).toBeInstanceOf(ApiError);
    });

    it('should have a stack trace', () => {
      const err = new ApiError({ error_code: 'T', message: 'm', status: 400 });
      expect(err.stack).toBeDefined();
    });

    it('should handle missing details', () => {
      const err = new ApiError({ error_code: 'T', message: 'm', status: 400 });
      expect(err.details).toBeUndefined();
    });
  });

  // =========================================================================
  // Boolean getters
  // =========================================================================
  describe('isAuthError', () => {
    it('should return true for status 401', () => {
      const err = new ApiError({ error_code: 'X', message: 'm', status: 401 });
      expect(err.isAuthError).toBe(true);
    });

    it('should return true for code UNAUTHORIZED', () => {
      const err = new ApiError({ error_code: 'UNAUTHORIZED', message: 'm', status: 999 });
      expect(err.isAuthError).toBe(true);
    });

    it('should return false for non-auth errors', () => {
      const err = new ApiError({ error_code: 'OTHER', message: 'm', status: 403 });
      expect(err.isAuthError).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should return true for status 422', () => {
      const err = new ApiError({ error_code: 'X', message: 'm', status: 422 });
      expect(err.isValidationError).toBe(true);
    });

    it('should return true for code VALIDATION_ERROR', () => {
      const err = new ApiError({ error_code: 'VALIDATION_ERROR', message: 'm', status: 999 });
      expect(err.isValidationError).toBe(true);
    });

    it('should return false for non-validation errors', () => {
      const err = new ApiError({ error_code: 'OTHER', message: 'm', status: 400 });
      expect(err.isValidationError).toBe(false);
    });
  });

  describe('isNotFoundError', () => {
    it('should return true for status 404', () => {
      const err = new ApiError({ error_code: 'X', message: 'm', status: 404 });
      expect(err.isNotFoundError).toBe(true);
    });

    it('should return true for code NOT_FOUND', () => {
      const err = new ApiError({ error_code: 'NOT_FOUND', message: 'm', status: 999 });
      expect(err.isNotFoundError).toBe(true);
    });

    it('should return false for other errors', () => {
      const err = new ApiError({ error_code: 'OTHER', message: 'm', status: 400 });
      expect(err.isNotFoundError).toBe(false);
    });
  });

  describe('isForbiddenError', () => {
    it('should return true for status 403', () => {
      const err = new ApiError({ error_code: 'X', message: 'm', status: 403 });
      expect(err.isForbiddenError).toBe(true);
    });

    it('should return true for code FORBIDDEN', () => {
      const err = new ApiError({ error_code: 'FORBIDDEN', message: 'm', status: 999 });
      expect(err.isForbiddenError).toBe(true);
    });

    it('should return false for other errors', () => {
      const err = new ApiError({ error_code: 'OTHER', message: 'm', status: 401 });
      expect(err.isForbiddenError).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should return true for status >= 500', () => {
      expect(new ApiError({ error_code: 'X', message: 'm', status: 500 }).isServerError).toBe(true);
      expect(new ApiError({ error_code: 'X', message: 'm', status: 502 }).isServerError).toBe(true);
      expect(new ApiError({ error_code: 'X', message: 'm', status: 503 }).isServerError).toBe(true);
      expect(new ApiError({ error_code: 'X', message: 'm', status: 599 }).isServerError).toBe(true);
    });

    it('should return false for status < 500', () => {
      expect(new ApiError({ error_code: 'X', message: 'm', status: 499 }).isServerError).toBe(false);
      expect(new ApiError({ error_code: 'X', message: 'm', status: 400 }).isServerError).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('should return true for code NETWORK_ERROR', () => {
      const err = new ApiError({ error_code: 'NETWORK_ERROR', message: 'm', status: 0 });
      expect(err.isNetworkError).toBe(true);
    });

    it('should return false for other codes', () => {
      const err = new ApiError({ error_code: 'OTHER', message: 'm', status: 0 });
      expect(err.isNetworkError).toBe(false);
    });
  });

  describe('isConflictError', () => {
    it('should return true for status 409', () => {
      const err = new ApiError({ error_code: 'X', message: 'm', status: 409 });
      expect(err.isConflictError).toBe(true);
    });

    it('should return true for code CONFLICT', () => {
      const err = new ApiError({ error_code: 'CONFLICT', message: 'm', status: 999 });
      expect(err.isConflictError).toBe(true);
    });

    it('should return false for other errors', () => {
      const err = new ApiError({ error_code: 'OTHER', message: 'm', status: 400 });
      expect(err.isConflictError).toBe(false);
    });
  });

  // =========================================================================
  // toJSON
  // =========================================================================
  describe('toJSON', () => {
    it('should return object with name, message, status, code, details, stack', () => {
      const err = new ApiError({
        error_code: 'TEST',
        message: 'Test error',
        status: 400,
        details: { key: 'val' },
      });

      const json = err.toJSON();
      expect(json).toEqual({
        name: 'ApiError',
        message: 'Test error',
        status: 400,
        code: 'TEST',
        details: { key: 'val' },
        stack: expect.any(String),
      });
    });
  });
});

// ===========================================================================
// ValidationError
// ===========================================================================
describe('ValidationError', () => {
  it('should extend ApiError', () => {
    const err = new ValidationError({
      error_code: 'VALIDATION_ERROR',
      message: 'Invalid',
      status: 422,
    });
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(Error);
  });

  it('should set name to ValidationError', () => {
    const err = new ValidationError({
      error_code: 'VALIDATION_ERROR',
      message: 'Invalid',
      status: 422,
    });
    expect(err.name).toBe('ValidationError');
  });

  describe('getFieldErrors', () => {
    it('should return formatted field errors from details (array values)', () => {
      const err = new ValidationError({
        error_code: 'VALIDATION_ERROR',
        message: 'Invalid',
        status: 422,
        details: {
          email: ['Invalid email', 'Email is required'],
          name: ['Required'],
        },
      });

      const fieldErrors = err.getFieldErrors();
      expect(fieldErrors).toEqual({
        email: 'Invalid email', // first message in array
        name: 'Required',
      });
    });

    it('should return formatted field errors from details (string values)', () => {
      const err = new ValidationError({
        error_code: 'VALIDATION_ERROR',
        message: 'Invalid',
        status: 422,
        details: {
          email: 'Invalid email',
          name: 'Required',
        },
      });

      const fieldErrors = err.getFieldErrors();
      expect(fieldErrors).toEqual({
        email: 'Invalid email',
        name: 'Required',
      });
    });

    it('should return empty object when no details', () => {
      const err = new ValidationError({
        error_code: 'VALIDATION_ERROR',
        message: 'Invalid',
        status: 422,
      });
      expect(err.getFieldErrors()).toEqual({});
    });

    it('should skip non-string/non-array values', () => {
      const err = new ValidationError({
        error_code: 'VALIDATION_ERROR',
        message: 'Invalid',
        status: 422,
        details: {
          email: 'Valid string',
          count: 42 as any, // neither string nor array
        },
      });

      const fieldErrors = err.getFieldErrors();
      expect(fieldErrors).toEqual({
        email: 'Valid string',
      });
    });
  });
});

// ===========================================================================
// AuthenticationError
// ===========================================================================
describe('AuthenticationError', () => {
  it('should extend ApiError', () => {
    const err = new AuthenticationError({
      error_code: 'UNAUTHORIZED',
      message: 'Unauthorized',
      status: 401,
    });
    expect(err).toBeInstanceOf(ApiError);
  });

  it('should set name to AuthenticationError', () => {
    const err = new AuthenticationError({
      error_code: 'UNAUTHORIZED',
      message: 'Unauthorized',
      status: 401,
    });
    expect(err.name).toBe('AuthenticationError');
  });

  it('should have isAuthError = true', () => {
    const err = new AuthenticationError({
      error_code: 'UNAUTHORIZED',
      message: 'Unauthorized',
      status: 401,
    });
    expect(err.isAuthError).toBe(true);
  });
});

// ===========================================================================
// AuthorizationError
// ===========================================================================
describe('AuthorizationError', () => {
  it('should extend ApiError', () => {
    const err = new AuthorizationError({
      error_code: 'FORBIDDEN',
      message: 'Forbidden',
      status: 403,
    });
    expect(err).toBeInstanceOf(ApiError);
  });

  it('should set name to AuthorizationError', () => {
    const err = new AuthorizationError({
      error_code: 'FORBIDDEN',
      message: 'Forbidden',
      status: 403,
    });
    expect(err.name).toBe('AuthorizationError');
  });

  it('should have isForbiddenError = true', () => {
    const err = new AuthorizationError({
      error_code: 'FORBIDDEN',
      message: 'Forbidden',
      status: 403,
    });
    expect(err.isForbiddenError).toBe(true);
  });
});

// ===========================================================================
// NetworkError
// ===========================================================================
describe('NetworkError', () => {
  it('should extend ApiError', () => {
    const err = new NetworkError();
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(Error);
  });

  it('should set name to NetworkError', () => {
    const err = new NetworkError();
    expect(err.name).toBe('NetworkError');
  });

  it('should have default message about network error', () => {
    const err = new NetworkError();
    expect(err.message).toContain('Network error');
  });

  it('should accept custom message', () => {
    const err = new NetworkError('Custom network message');
    expect(err.message).toBe('Custom network message');
  });

  it('should have status 0', () => {
    const err = new NetworkError();
    expect(err.status).toBe(0);
  });

  it('should have code NETWORK_ERROR', () => {
    const err = new NetworkError();
    expect(err.code).toBe('NETWORK_ERROR');
  });

  it('should have isNetworkError = true', () => {
    const err = new NetworkError();
    expect(err.isNetworkError).toBe(true);
  });
});

/**
 * Unit Tests for src/lib/errorHandler.js (legacy JS error handler)
 * Tests handleApiError, getErrorMessage, isErrorType, isAuthError,
 * isValidationError, logError, and ERROR_CODES.
 */

import errorHandler, {
  handleApiError,
  getErrorMessage,
  isErrorType,
  isAuthError,
  isValidationError,
  logError,
  ERROR_CODES,
} from '../../../lib/errorHandler';

describe('errorHandler (legacy)', () => {
  // =========================================================================
  // ERROR_CODES
  // =========================================================================
  describe('ERROR_CODES', () => {
    it('should define all expected error codes', () => {
      expect(ERROR_CODES.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
      expect(ERROR_CODES.TOKEN_EXPIRED).toBe('TOKEN_EXPIRED');
      expect(ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ERROR_CODES.BAD_REQUEST).toBe('BAD_REQUEST');
      expect(ERROR_CODES.DUPLICATE_EMAIL).toBe('DUPLICATE_EMAIL');
      expect(ERROR_CODES.DUPLICATE_ENROLLMENT).toBe('DUPLICATE_ENROLLMENT');
      expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND');
      expect(ERROR_CODES.FORBIDDEN).toBe('FORBIDDEN');
      expect(ERROR_CODES.CONFLICT).toBe('CONFLICT');
      expect(ERROR_CODES.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(ERROR_CODES.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR');
      expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
    });
  });

  // =========================================================================
  // handleApiError
  // =========================================================================
  describe('handleApiError', () => {
    it('should return network error when no response exists', () => {
      const error = { response: undefined };
      const result = handleApiError(error);

      expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
      expect(result.status).toBeNull();
      expect(result.message).toContain('Network error');
    });

    it('should detect duplicate enrollment constraint errors', () => {
      const error = {
        response: {
          status: 409,
          data: {
            detail: 'uq_enrollment_child_class_organization constraint violated',
          },
        },
      };
      const result = handleApiError(error);

      expect(result.code).toBe(ERROR_CODES.DUPLICATE_ENROLLMENT);
      expect(result.message).toContain('already enrolled');
    });

    it('should detect duplicate key value errors', () => {
      const error = {
        response: {
          status: 409,
          data: {
            detail: 'duplicate key value violates unique constraint',
          },
        },
      };
      const result = handleApiError(error);

      expect(result.code).toBe(ERROR_CODES.DUPLICATE_ENROLLMENT);
    });

    it('should detect already exists enrollment errors', () => {
      const error = {
        response: {
          status: 409,
          data: {
            detail: 'An enrollment already exists for this child',
          },
        },
      };
      const result = handleApiError(error);

      expect(result.code).toBe(ERROR_CODES.DUPLICATE_ENROLLMENT);
    });

    it('should handle Pydantic 422 validation errors with array detail', () => {
      const error = {
        response: {
          status: 422,
          data: {
            detail: [
              { loc: ['body', 'email'], msg: 'value is not a valid email', type: 'value_error' },
            ],
          },
        },
      };
      const result = handleApiError(error);

      expect(result.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(result.status).toBe(422);
      expect(result.message).toContain('email');
      expect(result.message).toContain('value is not a valid email');
    });

    it('should handle 422 with empty detail array', () => {
      const error = {
        response: {
          status: 422,
          data: {
            detail: [
              { loc: [], msg: 'Validation error' },
            ],
          },
        },
      };
      const result = handleApiError(error);

      expect(result.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(result.message).toContain('input');
    });

    it('should handle FastAPI error format with error_code and message', () => {
      const error = {
        response: {
          status: 401,
          data: {
            error_code: 'INVALID_CREDENTIALS',
            message: 'Wrong password',
          },
        },
      };
      const result = handleApiError(error);

      expect(result.code).toBe('INVALID_CREDENTIALS');
      expect(result.message).toBe('Wrong password');
      expect(result.status).toBe(401);
    });

    it('should use fallback error_code and message when data is empty', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };
      const result = handleApiError(error);

      expect(result.code).toBe('HTTP_500');
      expect(result.message).toBe('An error occurred');
    });

    it('should use ERROR_MESSAGES lookup when error_code matches', () => {
      const error = {
        response: {
          status: 401,
          data: {
            error_code: 'INVALID_CREDENTIALS',
          },
        },
      };
      const result = handleApiError(error);

      expect(result.message).toBe('Invalid email or password');
    });

    it('should include data field in details', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error_code: 'BAD_REQUEST',
            message: 'Bad request',
            data: { field: 'extra info' },
          },
        },
      };
      const result = handleApiError(error);

      expect(result.details).toEqual({ field: 'extra info' });
    });
  });

  // =========================================================================
  // getErrorMessage
  // =========================================================================
  describe('getErrorMessage', () => {
    it('should return string directly if input is a string', () => {
      expect(getErrorMessage('Custom error')).toBe('Custom error');
    });

    it('should return message property from error object', () => {
      expect(getErrorMessage({ message: 'Error message' })).toBe('Error message');
    });

    it('should return fallback message for objects without message', () => {
      expect(getErrorMessage({})).toContain('unexpected error');
    });

    it('should return fallback for null', () => {
      expect(getErrorMessage(null)).toContain('unexpected error');
    });

    it('should return fallback for undefined', () => {
      expect(getErrorMessage(undefined)).toContain('unexpected error');
    });
  });

  // =========================================================================
  // isErrorType
  // =========================================================================
  describe('isErrorType', () => {
    it('should return true when error.code matches', () => {
      const error = { code: 'UNAUTHORIZED' };
      expect(isErrorType(error, 'UNAUTHORIZED')).toBe(true);
    });

    it('should return true when error.error_code matches', () => {
      const error = { error_code: 'NOT_FOUND' };
      expect(isErrorType(error, 'NOT_FOUND')).toBe(true);
    });

    it('should return false when neither matches', () => {
      const error = { code: 'OTHER' };
      expect(isErrorType(error, 'NOT_FOUND')).toBe(false);
    });

    it('should return false for null error', () => {
      expect(isErrorType(null, 'UNAUTHORIZED')).toBe(false);
    });
  });

  // =========================================================================
  // isAuthError
  // =========================================================================
  describe('isAuthError', () => {
    it('should return true for UNAUTHORIZED code', () => {
      expect(isAuthError({ code: 'UNAUTHORIZED' })).toBe(true);
    });

    it('should return true for TOKEN_EXPIRED code', () => {
      expect(isAuthError({ code: 'TOKEN_EXPIRED' })).toBe(true);
    });

    it('should return true for status 401', () => {
      expect(isAuthError({ status: 401 })).toBe(true);
    });

    it('should return false for non-auth errors', () => {
      expect(isAuthError({ code: 'NOT_FOUND', status: 404 })).toBe(false);
    });
  });

  // =========================================================================
  // isValidationError
  // =========================================================================
  describe('isValidationError', () => {
    it('should return true for VALIDATION_ERROR code', () => {
      expect(isValidationError({ code: 'VALIDATION_ERROR' })).toBe(true);
    });

    it('should return true for BAD_REQUEST code', () => {
      expect(isValidationError({ code: 'BAD_REQUEST' })).toBe(true);
    });

    it('should return true for status 400', () => {
      expect(isValidationError({ status: 400 })).toBe(true);
    });

    it('should return true for status 422', () => {
      expect(isValidationError({ status: 422 })).toBe(true);
    });

    it('should return false for non-validation errors', () => {
      expect(isValidationError({ code: 'SERVER_ERROR', status: 500 })).toBe(false);
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

      const error = { code: 'TEST', message: 'Test error' };
      logError(error, 'TestContext');

      expect(consoleSpy).toHaveBeenCalledWith('[TestContext] Error:', error);
      consoleSpy.mockRestore();
    });

    it('should not log to console.error in production', () => {
      process.env.NODE_ENV = 'production';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      logError({ message: 'prod error' }, 'ProdContext');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle empty context', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      logError({ message: 'err' });

      expect(consoleSpy).toHaveBeenCalledWith('[] Error:', { message: 'err' });
      consoleSpy.mockRestore();
    });
  });

  // =========================================================================
  // Default export
  // =========================================================================
  describe('default export', () => {
    it('should export an object with all handler functions', () => {
      expect(errorHandler.handleApiError).toBe(handleApiError);
      expect(errorHandler.getErrorMessage).toBe(getErrorMessage);
      expect(errorHandler.isErrorType).toBe(isErrorType);
      expect(errorHandler.isAuthError).toBe(isAuthError);
      expect(errorHandler.isValidationError).toBe(isValidationError);
      expect(errorHandler.logError).toBe(logError);
      expect(errorHandler.ERROR_CODES).toBe(ERROR_CODES);
    });
  });
});

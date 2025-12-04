/**
 * API Error Classes
 * Custom error classes for better error handling and type safety
 */

import { ApiErrorResponse } from '../../api/types/common.types';

/**
 * Base API Error class
 * Extends Error with additional API-specific properties
 */
export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: Record<string, any>;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = 'ApiError';
    this.status = response.status;
    this.code = response.error_code;
    this.details = response.details;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is authentication related (401)
   */
  get isAuthError(): boolean {
    return this.status === 401 || this.code === 'UNAUTHORIZED';
  }

  /**
   * Check if error is validation related (422)
   */
  get isValidationError(): boolean {
    return this.status === 422 || this.code === 'VALIDATION_ERROR';
  }

  /**
   * Check if error is not found (404)
   */
  get isNotFoundError(): boolean {
    return this.status === 404 || this.code === 'NOT_FOUND';
  }

  /**
   * Check if error is forbidden (403)
   */
  get isForbiddenError(): boolean {
    return this.status === 403 || this.code === 'FORBIDDEN';
  }

  /**
   * Check if error is server error (5xx)
   */
  get isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if error is network error
   */
  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  /**
   * Check if error is conflict (409)
   */
  get isConflictError(): boolean {
    return this.status === 409 || this.code === 'CONFLICT';
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Validation Error class
 * Specialized error for validation failures
 */
export class ValidationError extends ApiError {
  constructor(response: ApiErrorResponse) {
    super(response);
    this.name = 'ValidationError';
  }

  /**
   * Get formatted validation errors for forms
   * @returns Object with field names as keys and error messages as values
   */
  getFieldErrors(): Record<string, string> {
    if (!this.details) {
      return {};
    }

    const formattedErrors: Record<string, string> = {};

    for (const [field, messages] of Object.entries(this.details)) {
      if (Array.isArray(messages)) {
        formattedErrors[field] = messages[0];
      } else if (typeof messages === 'string') {
        formattedErrors[field] = messages;
      }
    }

    return formattedErrors;
  }
}

/**
 * Authentication Error class
 * Specialized error for authentication failures
 */
export class AuthenticationError extends ApiError {
  constructor(response: ApiErrorResponse) {
    super(response);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error class
 * Specialized error for authorization failures
 */
export class AuthorizationError extends ApiError {
  constructor(response: ApiErrorResponse) {
    super(response);
    this.name = 'AuthorizationError';
  }
}

/**
 * Network Error class
 * Specialized error for network failures
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Network error. Please check your internet connection.') {
    super({
      error_code: 'NETWORK_ERROR',
      message,
      status: 0,
    });
    this.name = 'NetworkError';
  }
}

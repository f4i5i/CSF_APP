/**
 * Error Handler Utilities
 * Transforms Axios errors to standardized ApiError instances
 */

import { AxiosError } from 'axios';
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
} from '../../lib/errors/ApiError';
import { ApiErrorResponse } from '../types/common.types';

/**
 * User-friendly error messages for common error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  DUPLICATE_EMAIL: 'This email is already registered.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  CONFLICT: 'This action conflicts with existing data.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
  PAYMENT_FAILED: 'Payment failed. Please try again or use a different payment method.',
  ENROLLMENT_FULL: 'This class is full. Please try joining the waitlist.',
};

/**
 * Transform Axios error to ApiError
 * @param error - The error to transform
 * @returns Standardized ApiError instance
 */
export function handleApiError(error: unknown): ApiError {
  // Network error (no response from server)
  if (error instanceof AxiosError && !error.response) {
    return new NetworkError(ERROR_MESSAGES.NETWORK_ERROR);
  }

  // Axios error with response
  if (error instanceof AxiosError && error.response) {
    const { status, data } = error.response;

    const errorResponse: ApiErrorResponse = {
      error_code: data?.error_code || `HTTP_${status}`,
      message:
        data?.message ||
        ERROR_MESSAGES[data?.error_code] ||
        `An error occurred (${status})`,
      status,
      details: data?.details,
      data: data?.data,
    };

    // Return specific error types based on status
    switch (status) {
      case 401:
        return new AuthenticationError(errorResponse);
      case 403:
        return new AuthorizationError(errorResponse);
      case 422:
        return new ValidationError(errorResponse);
      default:
        return new ApiError(errorResponse);
    }
  }

  // ApiError instance (already transformed)
  if (error instanceof ApiError) {
    return error;
  }

  // Generic error
  return new ApiError({
    error_code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    status: 500,
  });
}

/**
 * Get user-friendly error message from any error
 * @param error - The error to get message from
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES.SERVER_ERROR;
}

/**
 * Format validation errors for forms (Formik compatible)
 * @param error - The error to format
 * @returns Object with field names as keys and error messages as values
 */
export function formatValidationErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ValidationError)) {
    return {};
  }

  return error.getFieldErrors();
}

/**
 * Check if error is of a specific type
 * @param error - The error to check
 * @param errorType - The error type to check for
 * @returns True if error matches type
 */
export function isErrorType(
  error: unknown,
  errorType: 'auth' | 'validation' | 'network' | 'server' | 'notFound' | 'forbidden'
): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  switch (errorType) {
    case 'auth':
      return error.isAuthError;
    case 'validation':
      return error.isValidationError;
    case 'network':
      return error.isNetworkError;
    case 'server':
      return error.isServerError;
    case 'notFound':
      return error.isNotFoundError;
    case 'forbidden':
      return error.isForbiddenError;
    default:
      return false;
  }
}

/**
 * Check if error is authentication related
 * @param error - The error to check
 * @returns True if error is auth-related
 */
export function isAuthError(error: unknown): boolean {
  return isErrorType(error, 'auth');
}

/**
 * Check if error is validation related
 * @param error - The error to check
 * @returns True if error is validation-related
 */
export function isValidationError(error: unknown): boolean {
  return isErrorType(error, 'validation');
}

/**
 * Log error to console (development) or error tracking service (production)
 * @param error - The error to log
 * @param context - Additional context for logging
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', error, context);
  } else {
    // TODO: Send to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { extra: context });
  }
}

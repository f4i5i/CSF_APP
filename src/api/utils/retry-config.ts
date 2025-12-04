/**
 * Retry Configuration Utilities
 * Defines when and how to retry failed requests
 */

import { ApiError } from '../../lib/errors/ApiError';

/**
 * Determines if a query should be retried based on failure count and error
 * @param failureCount - Number of times the request has failed
 * @param error - The error that occurred
 * @returns True if request should be retried
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  // Don't retry after 3 attempts
  if (failureCount >= 3) {
    return false;
  }

  if (error instanceof ApiError) {
    // Retry network errors
    if (error.isNetworkError) {
      return true;
    }

    // Retry 5xx server errors
    if (error.isServerError) {
      return true;
    }

    // Retry 408 Request Timeout
    if (error.status === 408) {
      return true;
    }

    // Retry 429 Too Many Requests (with backoff)
    if (error.status === 429) {
      return failureCount < 2; // Only retry twice
    }

    // Retry 503 Service Unavailable
    if (error.status === 503) {
      return true;
    }

    // Don't retry client errors (4xx except above)
    return false;
  }

  // Retry unknown errors once
  return failureCount < 1;
}

/**
 * Calculate retry delay with exponential backoff
 * @param attemptIndex - The attempt number (0-based)
 * @returns Delay in milliseconds
 */
export function getRetryDelay(attemptIndex: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, ...
  // Max 30 seconds
  const baseDelay = 1000;
  const exponentialDelay = baseDelay * 2 ** attemptIndex;
  const maxDelay = 30000;

  return Math.min(exponentialDelay, maxDelay);
}

/**
 * Determines if a mutation should be retried
 * Only retry mutations for network errors (not other failures)
 * @param failureCount - Number of times the mutation has failed
 * @param error - The error that occurred
 * @returns True if mutation should be retried
 */
export function shouldRetryMutation(
  failureCount: number,
  error: unknown
): boolean {
  // Don't retry after 1 attempt
  if (failureCount >= 1) {
    return false;
  }

  if (error instanceof ApiError) {
    // Only retry network errors for mutations
    // Don't retry business logic errors
    return error.isNetworkError;
  }

  return false;
}

/**
 * Check if error is retryable
 * @param error - The error to check
 * @returns True if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return true; // Unknown errors are potentially retryable
  }

  // Network errors are retryable
  if (error.isNetworkError) {
    return true;
  }

  // Server errors are retryable
  if (error.isServerError) {
    return true;
  }

  // Specific retryable status codes
  const retryableStatusCodes = [408, 429, 503, 504];
  return retryableStatusCodes.includes(error.status);
}

/**
 * Centralized Error Handling Utility
 * Transforms API errors to user-friendly messages
 */

/**
 * Standard error codes matching FastAPI backend
 */
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_ENROLLMENT: 'DUPLICATE_ENROLLMENT',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',

  // Server
  SERVER_ERROR: 'SERVER_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please login again.',
  [ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to perform this action',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found',
  [ERROR_CODES.FORBIDDEN]: 'You do not have permission to access this resource',
  [ERROR_CODES.SERVER_ERROR]: 'An unexpected error occurred. Please try again.',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again',
  [ERROR_CODES.BAD_REQUEST]: 'Invalid request. Please check your input.',
  [ERROR_CODES.DUPLICATE_EMAIL]: 'This email address is already registered',
  [ERROR_CODES.DUPLICATE_ENROLLMENT]: 'This child is already enrolled in this class',
  [ERROR_CODES.CONFLICT]: 'A conflict occurred. The resource may already exist.',
};

/**
 * Transform API error to standardized format
 * @param {Error} error - Axios error object
 * @returns {Object} Standardized error object { message, code, status, details }
 */
export const handleApiError = (error) => {
  // Network error (no response from server)
  if (!error.response) {
    return {
      message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      code: ERROR_CODES.NETWORK_ERROR,
      status: null,
      details: null,
    };
  }

  const { status, data } = error.response;

  // Check for specific database constraint errors
  const errorDetail = data?.detail || '';

  // Check for duplicate enrollment constraint
  if (
    errorDetail.includes('uq_enrollment_child_class_organization') ||
    errorDetail.includes('duplicate key value') ||
    (errorDetail.includes('already exists') && errorDetail.includes('enrollment'))
  ) {
    return {
      message: ERROR_MESSAGES[ERROR_CODES.DUPLICATE_ENROLLMENT],
      code: ERROR_CODES.DUPLICATE_ENROLLMENT,
      status,
      details: data?.data || null,
    };
  }

  // Handle Pydantic 422 validation errors: { detail: [{ loc, msg, type }] }
  if (status === 422 && Array.isArray(data?.detail)) {
    const firstError = data.detail[0];
    const fieldName = firstError?.loc?.slice(-1)[0] || 'input';
    const errorMsg = firstError?.msg || 'Validation error';
    return {
      message: `${fieldName}: ${errorMsg}`,
      code: ERROR_CODES.VALIDATION_ERROR,
      status,
      details: data.detail,
    };
  }

  // FastAPI error format: { error_code, message, data }
  const errorCode = data?.error_code || `HTTP_${status}`;
  const errorMessage = data?.message || ERROR_MESSAGES[errorCode] || 'An error occurred';

  return {
    message: errorMessage,
    code: errorCode,
    status,
    details: data?.data || null,
  };
};

/**
 * Extract user-friendly error message from error object
 * @param {Error|Object|string} error - Error object or string
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an error object with message property
  if (error?.message) {
    return error.message;
  }

  // Fallback
  return ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR];
};

/**
 * Check if error is a specific type
 * @param {Object} error - Error object
 * @param {string} errorCode - Error code to check
 * @returns {boolean}
 */
export const isErrorType = (error, errorCode) => {
  return error?.code === errorCode || error?.error_code === errorCode;
};

/**
 * Check if error is authentication related
 * @param {Object} error - Error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return (
    isErrorType(error, ERROR_CODES.UNAUTHORIZED) ||
    isErrorType(error, ERROR_CODES.TOKEN_EXPIRED) ||
    error?.status === 401
  );
};

/**
 * Check if error is validation related
 * @param {Object} error - Error object
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  return (
    isErrorType(error, ERROR_CODES.VALIDATION_ERROR) ||
    isErrorType(error, ERROR_CODES.BAD_REQUEST) ||
    error?.status === 400 ||
    error?.status === 422
  );
};

/**
 * Log error to console in development
 * @param {Object} error - Error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, error);
  }
};

const errorHandler = {
  handleApiError,
  getErrorMessage,
  isErrorType,
  isAuthError,
  isValidationError,
  logError,
  ERROR_CODES,
};

export default errorHandler;

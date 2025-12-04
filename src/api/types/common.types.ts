/**
 * Common Type Definitions
 * Shared types used across the application
 */

// ============================================================================
// Generic API Response Types
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * API Error response format (from FastAPI backend)
 */
export interface ApiErrorResponse {
  error_code: string;
  message: string;
  status: number;
  details?: Record<string, any>;
  data?: any;
}

// ============================================================================
// Query Parameters
// ============================================================================

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

/**
 * Date range filter parameters
 */
export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

/**
 * Sorting parameters
 */
export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ============================================================================
// User Roles and Permissions
// ============================================================================

/**
 * User roles in the system
 */
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  PARENT = 'PARENT',
}

/**
 * Role-based permissions
 */
export type Permission =
  | 'users:read'
  | 'users:write'
  | 'classes:read'
  | 'classes:write'
  | 'enrollments:read'
  | 'enrollments:write'
  | 'payments:read'
  | 'payments:write'
  | 'admin:read'
  | 'admin:write';

// ============================================================================
// ID Types (for type safety)
// ============================================================================

export type UUID = string;

export type UserId = string;
export type ChildId = string;
export type ClassId = string;
export type ProgramId = string;
export type AreaId = string;
export type SchoolId = string;
export type EnrollmentId = string;
export type OrderId = string;
export type PaymentId = string;
export type InstallmentPlanId = string;
export type DiscountCodeId = string;
export type ScholarshipId = string;
export type WaiverTemplateId = string;
export type WaiverAcceptanceId = string;
export type AttendanceId = string;
export type BadgeId = string;
export type CheckInId = string;
export type AnnouncementId = string;
export type EventId = string;
export type PhotoId = string;
export type AlbumId = string;

// ============================================================================
// Common Enums
// ============================================================================

/**
 * Status for active/inactive entities
 */
export enum ActiveStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/**
 * Days of the week
 */
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

// ============================================================================
// Common Interfaces
// ============================================================================

/**
 * Entity with timestamps
 */
export interface Timestamped {
  created_at: string;
  updated_at: string;
}

/**
 * Entity with soft delete
 */
export interface SoftDeletable {
  deleted_at?: string | null;
  is_deleted?: boolean;
}

/**
 * Entity with user ownership
 */
export interface UserOwned {
  user_id: UserId;
}

/**
 * Entity with organization
 */
export interface OrganizationOwned {
  organization_id?: string;
}

// ============================================================================
// Filter and Search Types
// ============================================================================

/**
 * Generic filter parameters
 */
export interface BaseFilters extends PaginationParams, SortParams {
  search?: string;
  status?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if error is ApiErrorResponse
 */
export function isApiErrorResponse(error: any): error is ApiErrorResponse {
  return (
    error &&
    typeof error === 'object' &&
    'error_code' in error &&
    'message' in error &&
    'status' in error
  );
}

/**
 * Check if response is paginated
 */
export function isPaginatedResponse<T>(response: any): response is PaginatedResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    'items' in response &&
    'total' in response &&
    'page' in response &&
    Array.isArray(response.items)
  );
}

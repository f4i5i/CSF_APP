/**
 * API Types Barrel Export
 * Central export point for all type definitions
 */

// Common types
export * from './common.types';

// Auth types
export * from './auth.types';

// User types
export * from './user.types';

// Child types
export * from './child.types';

// Enrollment types
export * from './enrollment.types';

// Class types
export * from './class.types';

// Order types
export * from './order.types';

// Payment types
export * from './payment.types';

// Attendance types
export * from './attendance.types';

// Badge types
export * from './badge.types';

// Announcement types
export * from './announcement.types';

// Event types
export * from './event.types';

// Photo types
export * from './photo.types';

// Admin types (excluding RefundRequest which conflicts with payment.types)
export type {
  DashboardMetrics,
  RevenueReport,
  RevenueReportFilters,
  RevenueReportEntry,
  ClientSummary,
  ClientDetail,
  ClientFilters,
  ClassRoster,
  RosterEntry,
  RefundFilters,
} from './admin.types';

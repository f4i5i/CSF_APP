/**
 * Admin Type Definitions
 * TypeScript types for admin dashboard and management
 */

import type { Timestamped, UUID, UserId, UserRole } from './common.types';

/**
 * Dashboard metrics
 */
export interface DashboardMetrics {
  total_revenue: number;
  total_enrollments: number;
  active_students: number;
  active_classes: number;
  pending_payments: number;
  revenue_this_month: number;
  revenue_last_month: number;
  new_enrollments_this_week: number;
  attendance_rate: number;
  popular_programs?: Array<{
    program_name: string;
    enrollment_count: number;
  }>;
}

/**
 * Revenue report filters
 */
export interface RevenueReportFilters {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  program_id?: string;
  class_id?: string;
  groupBy?: 'day' | 'week' | 'month' | 'program' | 'class';
}

/**
 * Revenue report entry
 */
export interface RevenueReportEntry {
  period: string;
  total_revenue: number;
  payment_count: number;
  enrollment_count: number;
  program_name?: string;
  class_name?: string;
}

/**
 * Revenue report response
 */
export interface RevenueReport {
  total_revenue: number;
  total_payments: number;
  total_enrollments: number;
  entries: RevenueReportEntry[];
  filters: RevenueReportFilters;
}

/**
 * Client (user) summary for admin
 */
export interface ClientSummary {
  id: UserId;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: UserRole;
  total_children: number;
  total_enrollments: number;
  total_spent: number;
  last_payment_date?: string;
  created_at: string;
  is_active: boolean;
}

/**
 * Client detail
 */
export interface ClientDetail extends ClientSummary {
  children: Array<{
    id: string;
    first_name: string;
    last_name: string;
    enrollments_count: number;
  }>;
  payment_history: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
  }>;
  enrollment_history: Array<{
    id: string;
    class_name: string;
    status: string;
    enrollment_date: string;
  }>;
}

/**
 * Filters for client list
 */
export interface ClientFilters {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  has_children?: boolean;
  min_spent?: number;
  skip?: number;
  limit?: number;
}

/**
 * Class roster entry
 */
export interface RosterEntry {
  child_id: string;
  child_name: string;
  enrollment_id: string;
  enrollment_status: string;
  attendance_rate: number;
  total_sessions: number;
  attended_sessions: number;
  parent_name: string;
  parent_email: string;
  parent_phone?: string;
}

/**
 * Class roster
 */
export interface ClassRoster {
  class_id: string;
  class_name: string;
  total_enrolled: number;
  capacity: number;
  roster: RosterEntry[];
}

/**
 * Refund request
 */
export interface RefundRequest extends Timestamped {
  id: UUID;
  enrollment_id: string;
  user_id: UserId;
  amount: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  reviewed_by?: UserId;
  reviewed_at?: string;
  processed_at?: string;
}

/**
 * Refund filters
 */
export interface RefundFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'processed';
  start_date?: string;
  end_date?: string;
}

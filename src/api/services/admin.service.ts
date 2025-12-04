/**
 * Admin Service
 * Handles admin dashboard and management operations
 */

import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../config/endpoints';
import type {
  DashboardMetrics,
  RevenueReportFilters,
  RevenueReport,
  ClientSummary,
  ClientDetail,
  ClientFilters,
  ClassRoster,
  RefundRequest,
  RefundFilters,
} from '../types/admin.types';

export const adminService = {
  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const { data } = await apiClient.get<DashboardMetrics>(
      ENDPOINTS.ADMIN.METRICS
    );
    return data;
  },

  /**
   * Get revenue report
   */
  async getRevenueReport(filters: RevenueReportFilters): Promise<RevenueReport> {
    const { data } = await apiClient.get<RevenueReport>(
      ENDPOINTS.ADMIN.REVENUE,
      { params: filters }
    );
    return data;
  },

  /**
   * Get clients list
   */
  async getClients(filters?: ClientFilters): Promise<ClientSummary[]> {
    const { data } = await apiClient.get<ClientSummary[]>(
      ENDPOINTS.ADMIN.CLIENTS,
      { params: filters }
    );
    return data;
  },

  /**
   * Get client detail
   */
  async getClientDetail(userId: string): Promise<ClientDetail> {
    const { data } = await apiClient.get<ClientDetail>(
      ENDPOINTS.ADMIN.CLIENT_BY_ID(userId)
    );
    return data;
  },

  /**
   * Get class roster
   */
  async getClassRoster(classId: string): Promise<ClassRoster> {
    const { data } = await apiClient.get<ClassRoster>(
      ENDPOINTS.ADMIN.ROSTER(classId)
    );
    return data;
  },

  /**
   * Get refund requests
   */
  async getRefunds(filters?: RefundFilters): Promise<RefundRequest[]> {
    const { data } = await apiClient.get<RefundRequest[]>(
      ENDPOINTS.ADMIN.REFUNDS,
      { params: filters }
    );
    return data;
  },

  /**
   * Approve refund
   */
  async approveRefund(refundId: string): Promise<RefundRequest> {
    const { data } = await apiClient.post<RefundRequest>(
      ENDPOINTS.ADMIN.APPROVE_REFUND(refundId)
    );
    return data;
  },

  /**
   * Reject refund
   */
  async rejectRefund(refundId: string, reason: string): Promise<RefundRequest> {
    const { data } = await apiClient.post<RefundRequest>(
      ENDPOINTS.ADMIN.REJECT_REFUND(refundId),
      { reason }
    );
    return data;
  },
};

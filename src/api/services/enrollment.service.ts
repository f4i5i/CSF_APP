/**
 * Enrollment Service
 * Handles class enrollment operations and waitlist management
 */

import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Enrollment,
  EnrollmentDetail,
  EnrollmentFilters,
  CreateEnrollmentRequest,
  UpdateEnrollmentRequest,
  CancelEnrollmentRequest,
  CancellationPreview,
  TransferEnrollmentRequest,
  WaitlistJoinRequest,
  WaitlistEntry,
} from '../types/enrollment.types';

/**
 * Enrollment service
 * Pure API functions for enrollment management
 */
export const enrollmentService = {
  /**
   * Get current user's enrollments
   */
  async getMy(filters?: EnrollmentFilters): Promise<Enrollment[]> {
    const { data } = await apiClient.get<Enrollment[]>(ENDPOINTS.ENROLLMENTS.MY, {
      params: filters,
    });
    return data;
  },

  /**
   * Get all enrollments (admin only)
   */
  async getAll(filters?: EnrollmentFilters): Promise<Enrollment[]> {
    const { data } = await apiClient.get<Enrollment[]>(ENDPOINTS.ENROLLMENTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get enrollment by ID
   */
  async getById(id: string): Promise<EnrollmentDetail> {
    const { data } = await apiClient.get<EnrollmentDetail>(
      ENDPOINTS.ENROLLMENTS.BY_ID(id)
    );
    return data;
  },

  /**
   * Create new enrollment
   */
  async create(enrollmentData: CreateEnrollmentRequest): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>(
      ENDPOINTS.ENROLLMENTS.CREATE,
      enrollmentData
    );
    return data;
  },

  /**
   * Update enrollment
   */
  async update(
    id: string,
    enrollmentData: UpdateEnrollmentRequest
  ): Promise<Enrollment> {
    const { data } = await apiClient.put<Enrollment>(
      ENDPOINTS.ENROLLMENTS.UPDATE(id),
      enrollmentData
    );
    return data;
  },

  /**
   * Get cancellation preview (refund calculation)
   */
  async getCancellationPreview(id: string): Promise<CancellationPreview> {
    const { data } = await apiClient.get<CancellationPreview>(
      ENDPOINTS.ENROLLMENTS.CANCELLATION_PREVIEW(id)
    );
    return data;
  },

  /**
   * Cancel enrollment
   */
  async cancel(
    id: string,
    cancelData?: CancelEnrollmentRequest
  ): Promise<{ message: string; refund_amount?: number }> {
    const { data } = await apiClient.post<{
      message: string;
      refund_amount?: number;
    }>(ENDPOINTS.ENROLLMENTS.CANCEL(id), cancelData);
    return data;
  },

  /**
   * Transfer enrollment to different class
   */
  async transfer(
    id: string,
    transferData: TransferEnrollmentRequest
  ): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>(
      ENDPOINTS.ENROLLMENTS.TRANSFER(id),
      transferData
    );
    return data;
  },

  /**
   * Activate pending enrollment (admin only)
   */
  async activate(id: string): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>(
      ENDPOINTS.ENROLLMENTS.ACTIVATE(id)
    );
    return data;
  },

  /**
   * Join class waitlist
   */
  async joinWaitlist(waitlistData: WaitlistJoinRequest): Promise<WaitlistEntry> {
    const { data } = await apiClient.post<WaitlistEntry>(
      ENDPOINTS.ENROLLMENTS.WAITLIST_JOIN,
      waitlistData
    );
    return data;
  },

  /**
   * Claim waitlist spot (when notified)
   */
  async claimWaitlist(enrollmentId: string): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>(
      ENDPOINTS.ENROLLMENTS.WAITLIST_CLAIM(enrollmentId)
    );
    return data;
  },

  /**
   * Get waitlist for a class (admin only)
   */
  async getClassWaitlist(classId: string): Promise<WaitlistEntry[]> {
    const { data } = await apiClient.get<WaitlistEntry[]>(
      ENDPOINTS.ENROLLMENTS.WAITLIST_CLASS(classId)
    );
    return data;
  },

  /**
   * Promote from waitlist (admin only)
   */
  async promoteFromWaitlist(enrollmentId: string): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>(
      ENDPOINTS.ENROLLMENTS.WAITLIST_PROMOTE(enrollmentId)
    );
    return data;
  },
};

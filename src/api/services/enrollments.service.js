/**
 * Enrollments Service
 * Handles class enrollment operations and registration
 */

import apiClient from "../client";
import { API_ENDPOINTS } from "../../constants/api.constants";

const enrollmentsService = {
  /**
   * Get current user's enrollments
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.status] - Filter by status (active, completed, cancelled)
   * @param {string} [filters.child_id] - Filter by child ID
   * @returns {Promise<Array>} List of enrollments
   */
  async getMy(filters = {}) {
    const response = await apiClient.get(API_ENDPOINTS.ENROLLMENTS.MY, {
      params: filters,
    });
    const { data } = response;

    // Handle paginated response format {items: [...], total: X}
    if (data && data.items) {
      return data.items;
    }

    // Return data as-is if not paginated (or if it's a direct array)
    return data;
  },

  /**
   * Get enrollment by ID
   * @param {string} id - Enrollment ID
   * @returns {Promise<Object>} Enrollment details with class and child info
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.ENROLLMENTS.BY_ID(id));
    return data;
  },

  /**
   * Create new enrollment (register child for a class)
   * @param {Object} enrollmentData - Enrollment information
   * @param {string} enrollmentData.child_id - Child ID
   * @param {string} enrollmentData.class_id - Class ID
   * @param {string} [enrollmentData.notes] - Additional notes
   * @param {boolean} [enrollmentData.payment_completed] - Payment status
   * @returns {Promise<Object>} Created enrollment
   */
  async create(enrollmentData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ENROLLMENTS.CREATE,
      enrollmentData,
    );
    return data;
  },

  /**
   * Update enrollment information
   * @param {string} id - Enrollment ID
   * @param {Object} enrollmentData - Updated enrollment data
   * @returns {Promise<Object>} Updated enrollment
   */
  async update(id, enrollmentData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.ENROLLMENTS.BY_ID(id),
      enrollmentData,
    );
    return data;
  },

  /**
   * Set or clear an enrollment's roster group number (coach/admin)
   * @param {string} id - Enrollment ID
   * @param {number|null} groupNumber - Group number 1-10, or null to unassign
   * @returns {Promise<Object>} Updated enrollment
   */
  async updateGroup(id, groupNumber) {
    const { data } = await apiClient.patch(
      API_ENDPOINTS.ENROLLMENTS.GROUP(id),
      { group_number: groupNumber },
    );
    return data;
  },

  /**
   * Cancel enrollment
   * @param {string} id - Enrollment ID
   * @param {Object} cancellationData - Cancellation information
   * @param {string} [cancellationData.reason] - Reason for cancellation
   * @returns {Promise<Object>} Cancellation confirmation
   */
  async cancel(id, cancellationData = {}) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ENROLLMENTS.CANCEL(id),
      cancellationData,
    );
    return data;
  },

  /**
   * Get enrollment attendance records
   * @param {string} id - Enrollment ID
   * @returns {Promise<Array>} Attendance records
   */
  async getAttendance(id) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.ENROLLMENTS.ATTENDANCE(id),
    );
    return data;
  },

  /**
   * Check if child can enroll in a class
   * @param {string} childId - Child ID
   * @param {string} classId - Class ID
   * @returns {Promise<Object>} Eligibility info {eligible: boolean, reason: string}
   */
  async checkEligibility(childId, classId) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ENROLLMENTS.CHECK_ELIGIBILITY,
      { child_id: childId, class_id: classId },
    );
    return data;
  },

  /**
   * Get enrollments for a specific child
   * @param {string} childId - Child ID
   * @returns {Promise<Array>} Child's enrollments
   */
  async getByChild(childId) {
    return this.getMy({ child_id: childId });
  },

  /**
   * Get enrollments for a specific class (admin)
   * @param {string} classId - Class ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Class enrollments
   */
  async getByClass(classId, filters = {}) {
    return this.getAll({ class_id: classId, ...filters });
  },

  /**
   * Get active enrollments
   * @returns {Promise<Array>} Active enrollments
   */
  async getActive() {
    return this.getMy({ status: "active" });
  },

  /**
   * Get completed enrollments
   * @returns {Promise<Array>} Completed enrollments
   */
  async getCompleted() {
    return this.getMy({ status: "completed" });
  },

  /**
   * Get cancelled enrollments
   * @returns {Promise<Array>} Cancelled enrollments
   */
  async getCancelled() {
    return this.getMy({ status: "cancelled" });
  },

  // ============== Admin Methods ==============

  /**
   * Get all enrollments (admin only)
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.class_id] - Filter by class ID
   * @param {number} [filters.limit] - Limit results
   * @param {number} [filters.offset] - Offset for pagination
   * @returns {Promise<Object>} Response with items and total
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.ENROLLMENTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Delete an enrollment (admin only)
   * @param {string} id - Enrollment ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.ENROLLMENTS.BY_ID(id),
    );
    return data;
  },

  /**
   * Activate a pending enrollment (admin only)
   * @param {string} id - Enrollment ID
   * @returns {Promise<Object>} Updated enrollment
   */
  async activate(id) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ENROLLMENTS.ACTIVATE(id),
    );
    return data;
  },

  /**
   * Email the parent a hosted Stripe payment link for a pending enrollment (admin only)
   * @param {string} id - Enrollment ID
   * @returns {Promise<Object>} { status, enrollment_id, order_id, payment_url, parent_email }
   */
  async sendPaymentLink(id) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ENROLLMENTS.SEND_PAYMENT_LINK(id),
    );
    return data;
  },

  /**
   * Join the waitlist for a full class.
   * Regular waitlist gives a 12-hour claim window when a spot opens; priority
   * waitlist auto-charges the saved card on file (requires payment_method_id).
   * @param {Object} waitlistData
   * @param {string} waitlistData.class_id - Class ID
   * @param {string} waitlistData.child_id - Child ID
   * @param {('regular'|'priority')} [waitlistData.priority='regular'] - Waitlist tier
   * @param {string} [waitlistData.payment_method_id] - Required for priority tier
   * @returns {Promise<Object>} The created waitlisted enrollment
   */
  async joinWaitlist(waitlistData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ENROLLMENTS.WAITLIST_JOIN,
      { priority: "regular", ...waitlistData },
    );
    return data;
  },

  /**
   * Claim a regular waitlist spot within the 12-hour notification window.
   * Converts the waitlisted entry to a PENDING enrollment ready for payment.
   * @param {string} id - Enrollment ID
   * @returns {Promise<Object>} The enrollment, now PENDING
   */
  async claimWaitlist(id) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ENROLLMENTS.WAITLIST_CLAIM(id),
    );
    return data;
  },

  /**
   * Transfer enrollment to another class
   * @param {string} id - Enrollment ID
   * @param {string} newClassId - New class ID
   * @returns {Promise<Object>} Updated enrollment
   */
  async transfer(id, newClassId) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.ENROLLMENTS.TRANSFER(id),
      {
        new_class_id: newClassId,
      },
    );
    return data;
  },

  /**
   * Admin enrollment with auto-charge to parent's default payment method
   * @param {Object} enrollmentData - Enrollment information
   * @param {string} enrollmentData.child_id - Child ID
   * @param {string} enrollmentData.class_id - Class ID
   * @param {boolean} [enrollmentData.auto_charge] - Whether to auto-charge the parent's default payment method
   * @param {string} [enrollmentData.payment_option_type] - Payment option type (full_payment, monthly_subscription, etc.)
   * @param {number} [enrollmentData.amount] - Amount to charge (if different from class price)
   * @returns {Promise<Object>} Created enrollment with payment info
   */
  async adminEnroll(enrollmentData) {
    const { data } = await apiClient.post(
      "/admin/enrollments/enroll",
      enrollmentData,
    );
    return data;
  },

  /**
   * Get parent's default payment method for a child
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Parent's payment method info
   */
  async getParentPaymentMethod(childId) {
    const { data } = await apiClient.get(
      `/admin/children/${childId}/payment-method`,
    );
    return data;
  },
};

export default enrollmentsService;

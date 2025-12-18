/**
 * @fileoverview Enrollment Service
 *
 * This service manages the complete enrollment lifecycle for class registrations,
 * from initial creation through cancellation or completion. It handles:
 *
 * - Enrollment creation and management
 * - Status transitions and updates
 * - Cancellations with refund calculations
 * - Class transfers between sessions
 * - Waitlist operations and promotions
 *
 * @module api/services/enrollment.service
 *
 * @section Enrollment Lifecycle
 *
 * The enrollment process follows these stages:
 *
 * 1. PENDING - Initial enrollment created, awaiting payment confirmation
 * 2. ACTIVE - Payment completed, child is enrolled and attending class
 * 3. COMPLETED - Class session finished successfully
 * 4. CANCELLED - Enrollment cancelled by user or admin
 * 5. WAITLIST - Child is on waitlist, awaiting available spot
 *
 * @section Enrollment Status Transitions
 *
 * Valid status transitions:
 * - PENDING -> ACTIVE (via activate() after payment)
 * - PENDING -> CANCELLED (via cancel())
 * - ACTIVE -> COMPLETED (automatically when class ends)
 * - ACTIVE -> CANCELLED (via cancel() with refund calculation)
 * - WAITLIST -> PENDING (via claimWaitlist() when spot available)
 * - WAITLIST -> ACTIVE (via promoteFromWaitlist() by admin)
 *
 * @section Refund Policy
 *
 * Cancellations may be eligible for refunds based on timing:
 * - Full refund if cancelled before class start date
 * - Partial refund based on classes attended vs total classes
 * - Cancellation fees may apply per refund policy
 * - Use getCancellationPreview() to calculate refund before cancelling
 *
 * @section Waitlist Management
 *
 * When a class is full, users can join a waitlist:
 * - Waitlist entries are ordered by position and priority status
 * - Users are notified when a spot becomes available
 * - Notification expires after set time period if not claimed
 * - Admins can manually promote waitlist entries to enrollment
 *
 * @example Basic Enrollment Flow
 * ```typescript
 * // 1. Create enrollment for a child in a class
 * const enrollment = await enrollmentService.create({
 *   child_id: 'child-123',
 *   class_id: 'class-456',
 *   discount_code: 'SUMMER25'
 * });
 *
 * // 2. After payment, admin activates the enrollment
 * await enrollmentService.activate(enrollment.id);
 *
 * // 3. View enrollment details
 * const details = await enrollmentService.getById(enrollment.id);
 * ```
 *
 * @example Cancellation Flow
 * ```typescript
 * // 1. Preview refund amount
 * const preview = await enrollmentService.getCancellationPreview('enrollment-123');
 * console.log(`Refund: $${preview.net_refund}`);
 *
 * // 2. Cancel with reason
 * const result = await enrollmentService.cancel('enrollment-123', {
 *   reason: 'Schedule conflict',
 *   refund_requested: true
 * });
 * ```
 *
 * @example Transfer Flow
 * ```typescript
 * // Transfer child to different class session
 * const transferredEnrollment = await enrollmentService.transfer('enrollment-123', {
 *   new_class_id: 'class-789',
 *   reason: 'Requested different time slot'
 * });
 * ```
 *
 * @example Waitlist Flow
 * ```typescript
 * // 1. Join waitlist when class is full
 * const waitlistEntry = await enrollmentService.joinWaitlist({
 *   child_id: 'child-123',
 *   class_id: 'class-456',
 *   is_priority: false
 * });
 *
 * // 2. User receives notification and claims spot
 * const enrollment = await enrollmentService.claimWaitlist(waitlistEntry.enrollment_id);
 *
 * // Admin alternative: Manually promote from waitlist
 * const promoted = await enrollmentService.promoteFromWaitlist(waitlistEntry.enrollment_id);
 * ```
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
 *
 * Provides pure API functions for enrollment management operations.
 * All functions are asynchronous and return Promises.
 */
export const enrollmentService = {
  /**
   * Retrieves all enrollments for the currently authenticated user.
   *
   * Returns a list of enrollments associated with the user's account,
   * including enrollments for all their children. Useful for displaying
   * a parent's dashboard or enrollment history.
   *
   * @param {EnrollmentFilters} [filters] - Optional filters to narrow results
   * @param {EnrollmentStatus} [filters.status] - Filter by enrollment status
   * @param {ChildId} [filters.child_id] - Filter by specific child
   * @param {ClassId} [filters.class_id] - Filter by specific class
   * @param {string} [filters.search] - Search by child name or class name
   *
   * @returns {Promise<Enrollment[]>} Array of user's enrollments
   *
   * @throws {ApiError} If request fails or user is not authenticated
   *
   * @example
   * // Get all enrollments for current user
   * const myEnrollments = await enrollmentService.getMy();
   *
   * @example
   * // Get only active enrollments for a specific child
   * const activeEnrollments = await enrollmentService.getMy({
   *   status: EnrollmentStatus.ACTIVE,
   *   child_id: 'child-123'
   * });
   */
  async getMy(filters?: EnrollmentFilters): Promise<Enrollment[]> {
    const { data } = await apiClient.get<Enrollment[]>(ENDPOINTS.ENROLLMENTS.MY, {
      params: filters,
    });
    return data;
  },

  /**
   * Retrieves all enrollments across all users (admin only).
   *
   * Administrative function that returns enrollments for all users in the system.
   * Used for enrollment management, reporting, and analytics. Requires admin
   * privileges.
   *
   * @param {EnrollmentFilters} [filters] - Optional filters to narrow results
   * @param {EnrollmentStatus} [filters.status] - Filter by enrollment status
   * @param {ChildId} [filters.child_id] - Filter by specific child
   * @param {ClassId} [filters.class_id] - Filter by specific class
   * @param {string} [filters.search] - Search by child name, parent name, or class name
   *
   * @returns {Promise<Enrollment[]>} Array of all enrollments in the system
   *
   * @throws {ApiError} If request fails
   * @throws {ForbiddenError} If user does not have admin privileges
   *
   * @example
   * // Get all pending enrollments (awaiting payment)
   * const pendingEnrollments = await enrollmentService.getAll({
   *   status: EnrollmentStatus.PENDING
   * });
   *
   * @example
   * // Get all enrollments for a specific class
   * const classEnrollments = await enrollmentService.getAll({
   *   class_id: 'class-456'
   * });
   */
  async getAll(filters?: EnrollmentFilters): Promise<Enrollment[]> {
    const { data } = await apiClient.get<Enrollment[]>(ENDPOINTS.ENROLLMENTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Retrieves detailed information for a specific enrollment.
   *
   * Returns comprehensive enrollment details including related child and class
   * information, attendance statistics, and payment details. Useful for displaying
   * enrollment details pages or processing enrollment modifications.
   *
   * @param {string} id - The unique enrollment identifier
   *
   * @returns {Promise<EnrollmentDetail>} Detailed enrollment information including:
   *   - Full enrollment data (status, pricing, dates)
   *   - Child information (name, age, medical info)
   *   - Class information (schedule, instructor, location)
   *   - Attendance statistics (count and percentage)
   *
   * @throws {ApiError} If request fails
   * @throws {NotFoundError} If enrollment does not exist
   * @throws {ForbiddenError} If user does not have access to this enrollment
   *
   * @example
   * // Get enrollment details for display
   * const enrollment = await enrollmentService.getById('enrollment-123');
   * console.log(`${enrollment.child.name} - ${enrollment.class.name}`);
   * console.log(`Attendance: ${enrollment.attendance_percentage}%`);
   */
  async getById(id: string): Promise<EnrollmentDetail> {
    const { data } = await apiClient.get<EnrollmentDetail>(
      ENDPOINTS.ENROLLMENTS.BY_ID(id)
    );
    return data;
  },

  /**
   * Creates a new class enrollment for a child.
   *
   * Initiates the enrollment process by creating a PENDING enrollment record.
   * Calculates pricing based on class base price and any discount codes provided.
   * If the class is full, consider using joinWaitlist() instead.
   *
   * The enrollment will remain in PENDING status until payment is confirmed and
   * an admin activates it via activate().
   *
   * @param {CreateEnrollmentRequest} enrollmentData - Enrollment creation data
   * @param {ChildId} enrollmentData.child_id - ID of the child to enroll
   * @param {ClassId} enrollmentData.class_id - ID of the class to enroll in
   * @param {string} [enrollmentData.notes] - Optional notes (special requirements, etc.)
   * @param {string} [enrollmentData.discount_code] - Optional discount/promo code
   *
   * @returns {Promise<Enrollment>} The newly created enrollment with PENDING status
   *
   * @throws {ApiError} If request fails
   * @throws {ValidationError} If child or class doesn't exist
   * @throws {ConflictError} If child is already enrolled in this class
   * @throws {BadRequestError} If class is full or registration is closed
   *
   * @example
   * // Create enrollment with discount code
   * const enrollment = await enrollmentService.create({
   *   child_id: 'child-123',
   *   class_id: 'class-456',
   *   discount_code: 'SUMMER25',
   *   notes: 'Child has peanut allergy'
   * });
   *
   * console.log(`Enrollment created: ${enrollment.id}`);
   * console.log(`Final price: $${enrollment.final_price}`);
   *
   * @example
   * // Basic enrollment without discount
   * const enrollment = await enrollmentService.create({
   *   child_id: 'child-789',
   *   class_id: 'class-456'
   * });
   */
  async create(enrollmentData: CreateEnrollmentRequest): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>(
      ENDPOINTS.ENROLLMENTS.CREATE,
      enrollmentData
    );
    return data;
  },

  /**
   * Updates an existing enrollment's details.
   *
   * Allows modification of enrollment status, notes, and payment status.
   * Typically used by admins to manage enrollment lifecycle. Users should
   * use specialized methods like activate(), cancel(), or transfer() instead.
   *
   * @param {string} id - The enrollment ID to update
   * @param {UpdateEnrollmentRequest} enrollmentData - Fields to update
   * @param {EnrollmentStatus} [enrollmentData.status] - New enrollment status
   * @param {string} [enrollmentData.notes] - Updated notes
   * @param {boolean} [enrollmentData.payment_completed] - Payment completion flag
   *
   * @returns {Promise<Enrollment>} The updated enrollment
   *
   * @throws {ApiError} If request fails
   * @throws {NotFoundError} If enrollment doesn't exist
   * @throws {ForbiddenError} If user lacks permission to update
   * @throws {ValidationError} If status transition is invalid
   *
   * @example
   * // Admin marks payment as completed
   * const updated = await enrollmentService.update('enrollment-123', {
   *   payment_completed: true
   * });
   *
   * @example
   * // Add notes to enrollment
   * const updated = await enrollmentService.update('enrollment-123', {
   *   notes: 'Parent requested Wednesday pickup'
   * });
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
   * Previews the refund amount for cancelling an enrollment.
   *
   * Calculates potential refund based on cancellation policy, number of classes
   * attended, and timing. Use this before cancel() to show users the expected
   * refund amount. Does not actually cancel the enrollment.
   *
   * Refund calculation factors:
   * - Time until class start date
   * - Number of classes already attended
   * - Cancellation fees per refund policy
   * - Payment method and processing fees
   *
   * @param {string} id - The enrollment ID to preview cancellation for
   *
   * @returns {Promise<CancellationPreview>} Cancellation preview details:
   * @returns {number} .refund_amount - Original amount paid
   * @returns {number} .cancellation_fee - Fee charged for cancellation
   * @returns {number} .net_refund - Final refund amount after fees
   * @returns {string} .refund_policy - Description of applicable refund policy
   *
   * @throws {ApiError} If request fails
   * @throws {NotFoundError} If enrollment doesn't exist
   * @throws {ForbiddenError} If user lacks permission to view
   *
   * @example
   * // Preview refund before cancelling
   * const preview = await enrollmentService.getCancellationPreview('enrollment-123');
   *
   * console.log(`Original Payment: $${preview.refund_amount}`);
   * console.log(`Cancellation Fee: $${preview.cancellation_fee}`);
   * console.log(`Net Refund: $${preview.net_refund}`);
   * console.log(`Policy: ${preview.refund_policy}`);
   *
   * // Show confirmation to user before proceeding with cancel()
   * if (confirm(`You will receive a refund of $${preview.net_refund}. Continue?`)) {
   *   await enrollmentService.cancel('enrollment-123');
   * }
   */
  async getCancellationPreview(id: string): Promise<CancellationPreview> {
    const { data } = await apiClient.get<CancellationPreview>(
      ENDPOINTS.ENROLLMENTS.CANCELLATION_PREVIEW(id)
    );
    return data;
  },

  /**
   * Cancels an enrollment and processes any applicable refund.
   *
   * Changes enrollment status to CANCELLED and initiates refund processing if
   * eligible based on the refund policy. The refund amount depends on timing
   * and number of classes attended. Use getCancellationPreview() first to
   * show the expected refund amount.
   *
   * After cancellation:
   * - Enrollment status changes to CANCELLED
   * - Spot becomes available in the class
   * - Waitlist users (if any) are notified
   * - Refund is processed (if applicable)
   *
   * @param {string} id - The enrollment ID to cancel
   * @param {CancelEnrollmentRequest} [cancelData] - Optional cancellation details
   * @param {string} [cancelData.reason] - Reason for cancellation
   * @param {boolean} [cancelData.refund_requested] - Whether to request refund
   *
   * @returns {Promise<Object>} Cancellation result
   * @returns {string} .message - Confirmation message
   * @returns {number} [.refund_amount] - Refund amount (if applicable)
   *
   * @throws {ApiError} If request fails
   * @throws {NotFoundError} If enrollment doesn't exist
   * @throws {ForbiddenError} If user lacks permission to cancel
   * @throws {BadRequestError} If enrollment is already cancelled or completed
   *
   * @example
   * // Cancel with reason and refund request
   * const result = await enrollmentService.cancel('enrollment-123', {
   *   reason: 'Child has scheduling conflict',
   *   refund_requested: true
   * });
   *
   * console.log(result.message); // "Enrollment cancelled successfully"
   * if (result.refund_amount) {
   *   console.log(`Refund of $${result.refund_amount} will be processed`);
   * }
   *
   * @example
   * // Simple cancellation without reason
   * await enrollmentService.cancel('enrollment-123');
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
   * Transfers a child's enrollment to a different class.
   *
   * Moves an existing enrollment from one class to another, preserving payment
   * information and enrollment history. Useful when a child needs to change
   * schedule, level, or instructor. Price differences are calculated and may
   * result in additional charges or credits.
   *
   * Transfer process:
   * 1. Validates new class has available spots
   * 2. Calculates any price difference
   * 3. Updates enrollment to new class
   * 4. Maintains original enrollment date and payment status
   * 5. Frees up spot in original class
   *
   * @param {string} id - The enrollment ID to transfer
   * @param {TransferEnrollmentRequest} transferData - Transfer details
   * @param {ClassId} transferData.new_class_id - ID of the class to transfer to
   * @param {string} [transferData.reason] - Reason for transfer (for records)
   *
   * @returns {Promise<Enrollment>} The updated enrollment with new class_id
   *
   * @throws {ApiError} If request fails
   * @throws {NotFoundError} If enrollment or new class doesn't exist
   * @throws {BadRequestError} If new class is full or incompatible
   * @throws {ForbiddenError} If user lacks permission to transfer
   * @throws {ConflictError} If child already enrolled in new class
   *
   * @example
   * // Transfer to different time slot
   * const transferred = await enrollmentService.transfer('enrollment-123', {
   *   new_class_id: 'class-789',
   *   reason: 'Parent requested morning class instead of afternoon'
   * });
   *
   * console.log(`Transferred to class: ${transferred.class_id}`);
   *
   * @example
   * // Transfer to advanced level
   * const transferred = await enrollmentService.transfer('enrollment-456', {
   *   new_class_id: 'class-advanced-101',
   *   reason: 'Child ready for next level'
   * });
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
   * Activates a pending enrollment (admin only).
   *
   * Changes enrollment status from PENDING to ACTIVE after payment has been
   * confirmed. This is an administrative function typically called after
   * verifying payment completion through the payment gateway.
   *
   * Once activated:
   * - Child can attend classes
   * - Enrollment appears in active class roster
   * - Parent receives confirmation email
   * - Attendance tracking begins
   *
   * @param {string} id - The enrollment ID to activate
   *
   * @returns {Promise<Enrollment>} The activated enrollment with ACTIVE status
   *
   * @throws {ApiError} If request fails
   * @throws {NotFoundError} If enrollment doesn't exist
   * @throws {ForbiddenError} If user is not an admin
   * @throws {BadRequestError} If enrollment is not in PENDING status
   *
   * @example
   * // Activate enrollment after payment confirmation
   * const activated = await enrollmentService.activate('enrollment-123');
   * console.log(`Status: ${activated.status}`); // "ACTIVE"
   * console.log(`Payment completed: ${activated.payment_completed}`); // true
   *
   * @example
   * // Process multiple pending enrollments
   * const pendingIds = ['enrollment-123', 'enrollment-456', 'enrollment-789'];
   *
   * for (const id of pendingIds) {
   *   try {
   *     await enrollmentService.activate(id);
   *     console.log(`Activated: ${id}`);
   *   } catch (error) {
   *     console.error(`Failed to activate ${id}:`, error);
   *   }
   * }
   */
  async activate(id: string): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>(
      ENDPOINTS.ENROLLMENTS.ACTIVATE(id)
    );
    return data;
  },

  /**
   * Adds a child to a class waitlist when the class is full.
   *
   * Creates a waitlist entry with position tracking. When a spot becomes
   * available, users are notified based on their position. Priority waitlist
   * entries are notified before standard entries at the same position.
   *
   * Waitlist behavior:
   * - Automatically assigns position based on join order
   * - Priority entries (scholarship, returning students) jump to front
   * - User receives notification when spot becomes available
   * - Notification expires after set time period if not claimed
   * - Can join multiple class waitlists simultaneously
   *
   * @param {WaitlistJoinRequest} waitlistData - Waitlist entry data
   * @param {ChildId} waitlistData.child_id - ID of the child to add to waitlist
   * @param {ClassId} waitlistData.class_id - ID of the full class
   * @param {boolean} [waitlistData.is_priority] - Priority status (defaults to false)
   *
   * @returns {Promise<WaitlistEntry>} The created waitlist entry with position
   *
   * @throws {ApiError} If request fails
   * @throws {NotFoundError} If child or class doesn't exist
   * @throws {BadRequestError} If class is not full or registration closed
   * @throws {ConflictError} If child already on waitlist or enrolled in class
   *
   * @example
   * // Join standard waitlist
   * const waitlistEntry = await enrollmentService.joinWaitlist({
   *   child_id: 'child-123',
   *   class_id: 'class-456'
   * });
   *
   * console.log(`Waitlist position: ${waitlistEntry.position}`);
   * console.log(`Enrollment ID: ${waitlistEntry.enrollment_id}`);
   *
   * @example
   * // Join priority waitlist (returning student)
   * const priorityEntry = await enrollmentService.joinWaitlist({
   *   child_id: 'child-789',
   *   class_id: 'class-456',
   *   is_priority: true
   * });
   */
  async joinWaitlist(waitlistData: WaitlistJoinRequest): Promise<WaitlistEntry> {
    const { data } = await apiClient.post<WaitlistEntry>(
      ENDPOINTS.ENROLLMENTS.WAITLIST_JOIN,
      waitlistData
    );
    return data;
  },

  /**
   * Claims a waitlist spot when notified of availability.
   *
   * When a spot becomes available, users on the waitlist are notified in order.
   * They must claim the spot within the expiration window or it goes to the
   * next person. Claiming converts the waitlist entry to a PENDING enrollment.
   *
   * Claim process:
   * 1. User receives notification email/SMS
   * 2. User must claim within expiration window (typically 24-48 hours)
   * 3. Claimed enrollment changes to PENDING status
   * 4. User proceeds to payment to complete enrollment
   * 5. If not claimed in time, next waitlist entry is notified
   *
   * @param {string} enrollmentId - The enrollment ID from the waitlist entry
   *
   * @returns {Promise<Enrollment>} The enrollment converted from waitlist to PENDING
   *
   * @throws {ApiError} If request fails
   * @throws {NotFoundError} If enrollment doesn't exist
   * @throws {BadRequestError} If not notified yet or claim window expired
   * @throws {ConflictError} If spot is no longer available
   *
   * @example
   * // User clicks link in notification email
   * const enrollment = await enrollmentService.claimWaitlist('enrollment-123');
   *
   * console.log(`Status: ${enrollment.status}`); // "PENDING"
   * console.log(`Price: $${enrollment.final_price}`);
   *
   * // Redirect user to payment page
   * window.location.href = `/enrollment/${enrollment.id}/payment`;
   *
   * @example
   * // Check if claim is still valid before attempting
   * try {
   *   const enrollment = await enrollmentService.claimWaitlist(enrollmentId);
   *   // Proceed to payment
   * } catch (error) {
   *   if (error.message.includes('expired')) {
   *     alert('Sorry, the claim window has expired. The spot has been offered to the next person.');
   *   }
   * }
   */
  async claimWaitlist(enrollmentId: string): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>(
      ENDPOINTS.ENROLLMENTS.WAITLIST_CLAIM(enrollmentId)
    );
    return data;
  },

  /**
   * Retrieves the waitlist for a specific class (admin only).
   *
   * Returns all waitlist entries for a class, ordered by position. Shows
   * priority status, notification status, and expiration times. Used by
   * admins to manage waitlists and manually promote entries.
   *
   * @param {string} classId - The class ID to get waitlist for
   *
   * @returns {Promise<WaitlistEntry[]>} Array of waitlist entries ordered by position
   *
   * @throws {ApiError} If request fails
   * @throws {NotFoundError} If class doesn't exist
   * @throws {ForbiddenError} If user is not an admin
   *
   * @example
   * // View class waitlist
   * const waitlist = await enrollmentService.getClassWaitlist('class-456');
   *
   * console.log(`Total on waitlist: ${waitlist.length}`);
   *
   * waitlist.forEach(entry => {
   *   console.log(`Position ${entry.position}: ${entry.enrollment_id}`);
   *   if (entry.is_priority) console.log('  [PRIORITY]');
   *   if (entry.notified_at) console.log(`  Notified: ${entry.notified_at}`);
   *   if (entry.expires_at) console.log(`  Expires: ${entry.expires_at}`);
   * });
   *
   * @example
   * // Find expired notifications
   * const waitlist = await enrollmentService.getClassWaitlist('class-456');
   * const now = new Date();
   *
   * const expired = waitlist.filter(entry =>
   *   entry.expires_at && new Date(entry.expires_at) < now
   * );
   *
   * console.log(`${expired.length} expired notifications to process`);
   */
  async getClassWaitlist(classId: string): Promise<WaitlistEntry[]> {
    const { data } = await apiClient.get<WaitlistEntry[]>(
      ENDPOINTS.ENROLLMENTS.WAITLIST_CLASS(classId)
    );
    return data;
  },

  /**
   * Manually promotes a waitlist entry to active enrollment (admin only).
   *
   * Administrative function to directly convert a waitlist entry to an ACTIVE
   * enrollment, bypassing the notification/claim process. Useful for priority
   * cases, special circumstances, or when a spot opens unexpectedly.
   *
   * This differs from claimWaitlist():
   * - Admin action vs user action
   * - Goes directly to ACTIVE (not PENDING)
   * - No expiration window
   * - Can be done for any waitlist entry
   *
   * @param {string} enrollmentId - The enrollment ID from the waitlist entry
   *
   * @returns {Promise<Enrollment>} The promoted enrollment with ACTIVE status
   *
   * @throws {ApiError} If request fails
   * @throws {NotFoundError} If enrollment doesn't exist
   * @throws {ForbiddenError} If user is not an admin
   * @throws {BadRequestError} If enrollment is not on waitlist
   * @throws {ConflictError} If class is still full
   *
   * @example
   * // Admin promotes next person on waitlist
   * const enrollment = await enrollmentService.promoteFromWaitlist('enrollment-123');
   *
   * console.log(`Promoted to ACTIVE: ${enrollment.id}`);
   * console.log(`Child: ${enrollment.child_id}`);
   * console.log(`Class: ${enrollment.class_id}`);
   *
   * @example
   * // Process entire waitlist when spots open
   * const waitlist = await enrollmentService.getClassWaitlist('class-456');
   * const availableSpots = 3;
   *
   * for (let i = 0; i < Math.min(availableSpots, waitlist.length); i++) {
   *   try {
   *     await enrollmentService.promoteFromWaitlist(waitlist[i].enrollment_id);
   *     console.log(`Promoted position ${i + 1}`);
   *   } catch (error) {
   *     console.error(`Failed to promote:`, error);
   *     break; // Stop if class becomes full
   *   }
   * }
   */
  async promoteFromWaitlist(enrollmentId: string): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>(
      ENDPOINTS.ENROLLMENTS.WAITLIST_PROMOTE(enrollmentId)
    );
    return data;
  },
};

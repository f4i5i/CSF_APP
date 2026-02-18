/**
 * API Endpoints Constants
 * Single source of truth for all API endpoint paths
 *
 * Backend Base URL: http://localhost:8000/api/v1
 */

export const API_ENDPOINTS = {
  // ===================
  // AUTHENTICATION
  // ===================
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    TOKEN: '/auth/token', // OAuth2 compatible endpoint
    GOOGLE: '/auth/google',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // ===================
  // USERS
  // ===================
  USERS: {
    ME: '/users/me', // Get current user profile
    UPDATE: '/users/me', // Update current user profile
    LIST: '/users', // List all users (ADMIN)
    CREATE: '/users', // Create user (ADMIN)
    BY_ID: (id) => `/users/${id}`, // Get/Update/Delete user by ID (ADMIN)
  },

  // ===================
  // CHILDREN
  // ===================
  CHILDREN: {
    LIST: '/children', // List all children (ADMIN only)
    MY: '/children/my', // List current user's children
    CREATE: '/children', // Create new child
    BY_ID: (id) => `/children/${id}`, // Get/Update/Delete child by ID
    EMERGENCY_CONTACTS: (childId) => `/children/${childId}/emergency-contacts`,
    EMERGENCY_CONTACT_BY_ID: (contactId) => `/children/emergency-contacts/${contactId}`,
  },

  // ===================
  // PROGRAMS
  // ===================
  PROGRAMS: {
    LIST: '/programs/', // List all programs (public)
    BY_ID: (id) => `/programs/${id}/`, // Get program by ID
    CREATE: '/programs/', // Create program (ADMIN)
    UPDATE: (id) => `/programs/${id}/`, // Update program (ADMIN)
    DELETE: (id) => `/programs/${id}/`, // Delete program (ADMIN)
  },

  // ===================
  // AREAS
  // ===================
  AREAS: {
    LIST: '/areas/', // List all areas (public)
    BY_ID: (id) => `/areas/${id}/`, // Get area by ID
    CREATE: '/areas/', // Create area (ADMIN)
    UPDATE: (id) => `/areas/${id}/`, // Update area (ADMIN)
    DELETE: (id) => `/areas/${id}/`, // Delete area (ADMIN)
  },

  // ===================
  // SCHOOLS
  // ===================
  SCHOOLS: {
    LIST: '/schools/', // List all schools (public)
    BY_ID: (id) => `/schools/${id}/`, // Get school by ID
    CREATE: '/schools/', // Create school (ADMIN)
    UPDATE: (id) => `/schools/${id}/`, // Update school (ADMIN)
    DELETE: (id) => `/schools/${id}/`, // Delete school (ADMIN)
  },

  // ===================
  // CLASSES
  // ===================
  CLASSES: {
    LIST: '/classes', // List classes with filters (public)
    BY_ID: (id) => `/classes/${id}`, // Get class details (includes schedule, capacity)
    CREATE: '/classes', // Create class (ADMIN)
    UPDATE: (id) => `/classes/${id}`, // Update class (ADMIN)
    DELETE: (id) => `/classes/${id}`, // Delete class (ADMIN)
    IMAGE_UPLOAD: (id) => `/classes/${id}/image`, // Upload class image (ADMIN)
  },

  // ===================
  // ENROLLMENTS
  // ===================
  ENROLLMENTS: {
    MY: '/enrollments/my', // List user's enrollments
    LIST: '/enrollments', // List all enrollments (ADMIN)
    CREATE: '/enrollments', // Create enrollment (ADMIN)
    BY_ID: (id) => `/enrollments/${id}`, // Get/Update/Delete enrollment
    CANCEL: (id) => `/enrollments/${id}/cancel`, // Cancel enrollment
    CANCELLATION_PREVIEW: (id) => `/enrollments/${id}/cancellation-preview`,
    TRANSFER: (id) => `/enrollments/${id}/transfer`, // Transfer to different class
    ACTIVATE: (id) => `/enrollments/${id}/activate`, // Activate pending (ADMIN)
  },

  // ===================
  // ORDERS
  // ===================
  ORDERS: {
    MY: '/orders/my', // List user's orders
    LIST: '/orders', // List all orders (ADMIN)
    BY_ID: (id) => `/orders/${id}`, // Get order details
    CREATE: '/orders', // Create new order
    CALCULATE: '/orders/calculate', // Calculate order total with discounts
    PAY: (id) => `/orders/${id}/pay`, // Create payment intent
    CANCEL: (id) => `/orders/${id}/cancel`, // Cancel draft/pending order
    UPDATE_STATUS: (id) => `/orders/${id}/status`, // Update status (ADMIN)
  },

  // ===================
  // INVOICES
  // ===================
  INVOICES: {
    MY: '/invoices/my', // List user's invoices
    LIST: '/invoices', // List all invoices (ADMIN)
    BY_ID: (id) => `/invoices/${id}`, // Get invoice details
    DOWNLOAD: (id) => `/invoices/${id}/download`, // Download invoice PDF
    BILLING_SUMMARY: '/invoices/billing-summary', // Get billing summary
    SYNC: '/invoices/sync', // Sync user's invoices from Stripe
    SYNC_ALL: '/invoices/sync-all', // Sync all invoices from Stripe (ADMIN)
  },

  // ===================
  // PAYMENTS
  // ===================
  PAYMENTS: {
    MY: '/payments/my', // List user's payment history
    LIST: '/payments', // List all payments (ADMIN)
    BY_ID: (id) => `/payments/${id}`, // Get payment details
    CREATE_INTENT: (orderId) => `/orders/${orderId}/pay`, // Create payment intent for order
    CONFIRM: (paymentIntentId) => `/payments/${paymentIntentId}/confirm`, // Confirm payment
    PROCESS: '/payments/process', // Process direct payment
    METHODS: '/payments/methods', // List saved payment methods
    ADD_METHOD: '/payments/methods', // Add payment method
    REMOVE_METHOD: (id) => `/payments/methods/${id}`, // Delete payment method
    SET_DEFAULT_METHOD: (id) => `/payments/methods/${id}/default`, // Set default payment method
    SETUP_INTENT: '/payments/setup-intent', // Create SetupIntent for card saving
    REFUND: (paymentId) => `/payments/${paymentId}/refund`, // Create refund
    RECEIPT: (paymentId) => `/payments/${paymentId}/receipt`, // Get receipt
    RECEIPT_PDF: (paymentId) => `/payments/${paymentId}/invoice/download`, // Download PDF invoice
    STATS: '/payments/stats', // Payment statistics
    VERIFY_STATUS: (paymentId) => `/payments/${paymentId}/verify`, // Verify payment status
  },

  // ===================
  // INSTALLMENTS
  // ===================
  INSTALLMENTS: {
    MY: '/installments/my', // List user's installment plans
    SUMMARY: '/installments/my', // Get summary (same as MY, calculated on frontend)
    LIST: '/installments', // List all plans (ADMIN)
    BY_ID: (id) => `/installments/${id}`, // Get plan details
    CREATE: '/installments', // Create installment plan
    PREVIEW: '/installments/preview', // Preview payment schedule
    SCHEDULE: (id) => `/installments/${id}/schedule`, // Get payment schedule
    UPCOMING_DUE: '/installments/upcoming/due', // Get upcoming installments
    CANCEL: (id) => `/installments/${id}/cancel`, // Cancel own plan
    CANCEL_ADMIN: (id) => `/installments/${id}/cancel-admin`, // Cancel any plan (ADMIN)
  },

  // ===================
  // DISCOUNTS
  // ===================
  DISCOUNTS: {
    VALIDATE: '/discounts/validate', // Validate discount code
    MY_SCHOLARSHIPS: '/discounts/my-scholarships', // User's scholarships
    SIBLING_ELIGIBILITY: (childId) => `/discounts/sibling-eligibility/${childId}`, // Check sibling discount eligibility

    // Discount Codes (ADMIN)
    CODES: '/discounts/codes',
    CODE_BY_ID: (id) => `/discounts/codes/${id}`,
    // Aliases used by discounts.service.js
    LIST: '/discounts/codes',
    CREATE: '/discounts/codes',
    BY_ID: (id) => `/discounts/codes/${id}`,
    DEACTIVATE: (id) => `/discounts/codes/${id}/deactivate`,
    ACTIVATE: (id) => `/discounts/codes/${id}/activate`,
    USAGE_STATS: (id) => `/discounts/codes/${id}/usage`,
    AVAILABLE: '/discounts/available',
    MY_USAGE: '/discounts/my-usage',
    CHECK_ELIGIBILITY: '/discounts/check-eligibility',
    GENERATE_BULK: '/discounts/codes/bulk',
    EXPORT: '/discounts/codes/export',

    // Scholarships (ADMIN)
    SCHOLARSHIPS: '/discounts/scholarships',
    SCHOLARSHIP_BY_ID: (id) => `/discounts/scholarships/${id}`,
  },

  // ===================
  // WAIVERS
  // ===================
  WAIVERS: {
    BASE: '/waivers',
    REQUIRED: '/waivers/required', // Get required waivers with acceptance status
    PENDING: '/waivers/pending', // Get ONLY pending/unsigned waivers
    ACCEPT: '/waivers/accept', // Accept single waiver
    MY_ACCEPTANCES: '/waivers/my-acceptances', // User's acceptances
    ACCEPTANCE_BY_ID: (id) => `/waivers/acceptances/${id}`,

    // Templates (ADMIN)
    TEMPLATES: '/waivers/templates',
    TEMPLATE_BY_ID: (id) => `/waivers/templates/${id}`,
  },

  // ===================
  // ANNOUNCEMENTS
  // ===================
  ANNOUNCEMENTS: {
    LIST: '/announcements', // List announcements (filter by class_id)
    BY_ID: (id) => `/announcements/${id}`, // Get announcement details
    CREATE: '/announcements', // Create announcement (COACH)
    UPDATE: (id) => `/announcements/${id}`, // Update announcement
    DELETE: (id) => `/announcements/${id}`, // Delete announcement
    ATTACHMENTS: (id) => `/announcements/${id}/attachments`, // Upload attachment
  },

  // ===================
  // ATTENDANCE
  // ===================
  ATTENDANCE: {
    LIST: '/attendance', // List attendance records with filters
    CREATE: '/attendance', // Create attendance record
    BY_ID: (id) => `/attendance/${id}`, // Get/Update/Delete attendance by ID
    MARK: '/attendance/mark', // Mark attendance (bulk) (COACH)
    BULK_CREATE: '/attendance/bulk', // Bulk create attendance
    SUMMARY: '/attendance/summary/', // Get attendance summary
    HISTORY: (enrollmentId) => `/attendance/enrollment/${enrollmentId}/history`,
    STREAK: (enrollmentId) => `/attendance/enrollment/${enrollmentId}/streak`,
    STATS: (childId) => `/attendance/child/${childId}/stats`, // Child stats
    CLASS: (classId) => `/attendance/class/${classId}`, // Get class attendance (COACH)
    BY_CHILD: (childId) => `/attendance/child/${childId}`, // Get child's attendance
  },

  // ===================
  // EVENTS
  // ===================
  EVENTS: {
    LIST: '/events', // List events (supports filters like upcoming, type, etc.)
    BY_ID: (id) => `/events/${id}`, // Get event details
    CREATE: '/events', // Create event (COACH)
    UPDATE: (id) => `/events/${id}`, // Update event
    DELETE: (id) => `/events/${id}`, // Delete event
    BY_CLASS: (classId) => `/events/class/${classId}`, // List class events
    CALENDAR: '/events/calendar', // Calendar view requires class_id/year/month
    RSVP: (id) => `/events/${id}/rsvp`, // RSVP to event
    RSVPS: (id) => `/events/${id}/rsvps`, // Get event RSVPs (admin)
    RSVP_BY_ID: (eventId, rsvpId) => `/events/${eventId}/rsvps/${rsvpId}`, // Get/Update/Delete RSVP
    MY_RSVP: (eventId) => `/events/${eventId}/my-rsvp`, // Get user's RSVP for event
    ATTENDEE_SUMMARY: (eventId) => `/events/${eventId}/attendee-summary`, // Get attendee summary (admin)
  },

  // ===================
  // PHOTOS
  // ===================
  PHOTOS: {
    UPLOAD: '/photos/upload', // Upload single photo (COACH)
    BULK_UPLOAD: '/photos/bulk', // Bulk upload photos (COACH)
    BY_CLASS: (classId) => `/photos/class/${classId}`, // List class photos
    LIST: (classId) => `/photos/class/${classId}`, // Alias for BY_CLASS
    BY_ID: (id) => `/photos/${id}`, // Delete photo
    TAG_CHILD: (photoId) => `/photos/${photoId}/tag`, // Tag child in photo
    UNTAG_CHILD: (photoId, childId) => `/photos/${photoId}/tag/${childId}`, // Remove child tag

    // Categories
    CATEGORIES: '/photos/categories',
    CATEGORIES_BY_CLASS: (classId) => `/photos/categories/class/${classId}`,
  },

  // ===================
  // BADGES
  // ===================
  BADGES: {
    LIST: '/badges', // List available badges (public)
    BY_ID: (id) => `/badges/${id}`, // Get badge details
    BY_ENROLLMENT: (enrollmentId) => `/badges/enrollment/${enrollmentId}`, // Student badges
    BY_CHILD: (enrollmentId) => `/badges/enrollment/${enrollmentId}`, // Alias (use first enrollment)
    AWARD: '/badges/award', // Award badge (COACH)
    PROGRESS: (enrollmentId) => `/badges/enrollment/${enrollmentId}/progress`, // Badge progress
  },

  // ===================
  // CHECK-IN
  // ===================
  CHECKIN: {
    SINGLE: '/check-in', // Check in single student
    BULK: '/check-in/bulk', // Bulk check-in (COACH)
    BY_CLASS: (classId) => `/check-in/class/${classId}`, // Class check-ins (COACH)
    STATUS: (classId) => `/check-in/class/${classId}/status`, // Status for all enrolled
  },

  // ===================
  // ADMIN DASHBOARD
  // ===================
  ADMIN: {
    METRICS: '/admin/dashboard/metrics', // Dashboard KPIs
    REVENUE: '/admin/finance/revenue', // Revenue report
    CLIENTS: '/admin/clients', // List clients with filters
    CLIENT_BY_ID: (id) => `/admin/clients/${id}`, // Client details
    COACHES: '/admin/coaches', // List coaches for class assignment
    ROSTER: (classId) => `/admin/classes/${classId}/roster`, // Class roster

    // Refunds
    REFUNDS_SEARCH: '/admin/refunds/search', // Search/filter refunds
    REFUNDS_PENDING: '/admin/refunds/pending', // List pending refunds
    REFUND_APPROVE: (paymentId) => `/admin/refunds/${paymentId}/approve`, // Approve refund
    REFUND_REJECT: (paymentId) => `/admin/refunds/${paymentId}/reject`, // Reject refund

    // Cancellation Requests
    CANCELLATION_REQUESTS: '/cancellation-requests', // List all cancellation requests
    CANCELLATION_REQUESTS_PENDING: '/cancellation-requests/pending', // List pending only
    CANCELLATION_REQUEST_BY_ID: (id) => `/cancellation-requests/${id}`, // Get by ID
    CANCELLATION_REQUEST_APPROVE: (id) => `/cancellation-requests/${id}/approve`, // Approve
    CANCELLATION_REQUEST_REJECT: (id) => `/cancellation-requests/${id}/reject`, // Reject
    CANCELLATION_REQUESTS_STATS: '/cancellation-requests/stats/summary', // Get stats

    // Bulk Communications
    BULK_EMAIL: '/admin/bulk/email', // Send bulk email

    // Support
    SEND_SUPPORT_LOGS: '/admin/support/send-logs', // Send server logs to developer
  },

  // ===================
  // WEBHOOKS
  // ===================
  WEBHOOKS: {
    STRIPE: '/webhooks/stripe', // Stripe webhook handler
  },
};

/**
 * Query parameter helpers
 */
export const QUERY_PARAMS = {
  // Pagination
  SKIP: 'skip',
  LIMIT: 'limit',

  // Filters
  PROGRAM_ID: 'program_id',
  SCHOOL_ID: 'school_id',
  AREA_ID: 'area_id',
  CLASS_ID: 'class_id',
  STATUS: 'status',

  // Date filters
  START_DATE: 'start_date',
  END_DATE: 'end_date',
  YEAR: 'year',
  MONTH: 'month',

  // Other
  HAS_CAPACITY: 'has_capacity',
  MIN_AGE: 'min_age',
  MAX_AGE: 'max_age',
};

/**
 * HTTP Methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export default API_ENDPOINTS;

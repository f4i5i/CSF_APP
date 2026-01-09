/**
 * API Endpoints Constants
 * Single source of truth for all API endpoint paths
 *
 * Backend Base URL: http://localhost:8000/api/v1
 */

export const ENDPOINTS = {
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
  },

  // ===================
  // USERS
  // ===================
  USERS: {
    ME: '/users/me', // Get current user profile
    UPDATE: '/users/me', // Update current user profile
  },

  // ===================
  // CHILDREN
  // ===================
  CHILDREN: {
    LIST: '/children', // List all children (ADMIN only)
    MY: '/children/my', // List current user's children
    CREATE: '/children', // Create new child
    BY_ID: (id: string) => `/children/${id}`, // Get/Update/Delete child by ID
    EMERGENCY_CONTACTS: (childId: string) => `/children/${childId}/emergency-contacts`,
    EMERGENCY_CONTACT_BY_ID: (contactId: string) => `/children/emergency-contacts/${contactId}`,
  },

  // ===================
  // PROGRAMS
  // ===================
  PROGRAMS: {
    LIST: '/programs/', // List all programs (public)
    BY_ID: (id: string) => `/programs/${id}/`, // Get program by ID
    CREATE: '/programs/', // Create program (ADMIN)
    UPDATE: (id: string) => `/programs/${id}/`, // Update program (ADMIN)
    DELETE: (id: string) => `/programs/${id}/`, // Delete program (ADMIN)
  },

  // ===================
  // AREAS
  // ===================
  AREAS: {
    LIST: '/areas/', // List all areas (public)
    BY_ID: (id: string) => `/areas/${id}/`, // Get area by ID
    CREATE: '/areas/', // Create area (ADMIN)
    UPDATE: (id: string) => `/areas/${id}/`, // Update area (ADMIN)
    DELETE: (id: string) => `/areas/${id}/`, // Delete area (ADMIN)
  },

  // ===================
  // CLASSES
  // ===================
  CLASSES: {
    LIST: '/classes', // List classes with filters (public)
    BY_ID: (id: string) => `/classes/${id}`, // Get class details
    CREATE: '/classes', // Create class (ADMIN)
    UPDATE: (id: string) => `/classes/${id}`, // Update class (ADMIN)
    DELETE: (id: string) => `/classes/${id}`, // Delete class (ADMIN)
  },

  // ===================
  // ENROLLMENTS
  // ===================
  ENROLLMENTS: {
    MY: '/enrollments/my', // List user's enrollments
    LIST: '/enrollments', // List all enrollments (ADMIN)
    BY_ID: (id: string) => `/enrollments/${id}`, // Get enrollment details
    CANCEL: (id: string) => `/enrollments/${id}/cancel`, // Cancel enrollment
    CANCELLATION_PREVIEW: (id: string) => `/enrollments/${id}/cancellation-preview`,
    TRANSFER: (id: string) => `/enrollments/${id}/transfer`, // Transfer to different class
    ACTIVATE: (id: string) => `/enrollments/${id}/activate`, // Activate pending (ADMIN)
  },

  // ===================
  // ORDERS
  // ===================
  ORDERS: {
    MY: '/orders/my', // List user's orders
    LIST: '/orders', // List all orders (ADMIN)
    BY_ID: (id: string) => `/orders/${id}`, // Get order details
    CREATE: '/orders', // Create new order
    CALCULATE: '/orders/calculate', // Calculate order total with discounts
    PAY: (id: string) => `/orders/${id}/pay`, // Create payment intent
    CHECKOUT: (id: string) => `/orders/${id}/pay`, // Alias for PAY
    CONFIRM: (id: string) => `/orders/${id}/confirm`, // Confirm payment
    CANCEL: (id: string) => `/orders/${id}/cancel`, // Cancel draft/pending order
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`, // Update status (ADMIN)
  },

  // ===================
  // PAYMENTS
  // ===================
  PAYMENTS: {
    MY: '/payments/my', // List user's payment history
    LIST: '/payments', // List all payments (ADMIN)
    BY_ID: (id: string) => `/payments/${id}`, // Get payment details
    METHODS: '/payments/methods', // List saved payment methods
    METHOD_BY_ID: (id: string) => `/payments/methods/${id}`, // Delete payment method
    SETUP_INTENT: '/payments/setup-intent', // Create SetupIntent for card saving
    REFUND: '/payments/refund', // Create refund (ADMIN)
    INVOICE_DOWNLOAD: (paymentId: string) => `/payments/${paymentId}/invoice/download`,
  },

  // ===================
  // INSTALLMENTS
  // ===================
  INSTALLMENTS: {
    MY: '/installments/my', // List user's installment plans
    SUMMARY: '/installments/my', // Get summary (same as MY, calculated on frontend)
    LIST: '/installments', // List all plans (ADMIN)
    BY_ID: (id: string) => `/installments/${id}`, // Get plan details
    CREATE: '/installments', // Create installment plan
    PREVIEW: '/installments/preview', // Preview payment schedule
    SCHEDULE: (id: string) => `/installments/${id}/schedule`, // Get payment schedule
    UPCOMING_DUE: '/installments/upcoming/due', // Get upcoming installments
    CANCEL: (id: string) => `/installments/${id}/cancel`, // Cancel own plan
    CANCEL_ADMIN: (id: string) => `/installments/${id}/cancel-admin`, // Cancel any plan (ADMIN)
  },

  // ===================
  // DISCOUNTS
  // ===================
  DISCOUNTS: {
    VALIDATE: '/discounts/validate', // Validate discount code
    MY_SCHOLARSHIPS: '/discounts/my-scholarships', // User's scholarships

    // Discount Codes (ADMIN)
    CODES: '/discounts/codes',
    CODE_BY_ID: (id: string) => `/discounts/codes/${id}`,

    // Scholarships (ADMIN)
    SCHOLARSHIPS: '/discounts/scholarships',
    SCHOLARSHIP_BY_ID: (id: string) => `/discounts/scholarships/${id}`,
  },

  // ===================
  // WAIVERS
  // ===================
  WAIVERS: {
    REQUIRED: '/waivers/required', // Get required waivers (pending waivers)
    PENDING: '/waivers/required', // Alias for required (pending waivers)
    ACCEPT: '/waivers/accept', // Accept waiver
    MY_ACCEPTANCES: '/waivers/my-acceptances', // User's acceptances
    ACCEPTANCE_BY_ID: (id: string) => `/waivers/acceptances/${id}`,

    // Templates (ADMIN)
    TEMPLATES: '/waivers/templates',
    TEMPLATE_BY_ID: (id: string) => `/waivers/templates/${id}`,
  },

  // ===================
  // ANNOUNCEMENTS
  // ===================
  ANNOUNCEMENTS: {
    LIST: '/announcements', // List announcements (filter by class_id)
    BY_ID: (id: string) => `/announcements/${id}`, // Get announcement details
    CREATE: '/announcements', // Create announcement (COACH)
    UPDATE: (id: string) => `/announcements/${id}`, // Update announcement
    DELETE: (id: string) => `/announcements/${id}`, // Delete announcement
    ATTACHMENTS: (id: string) => `/announcements/${id}/attachments`, // Upload attachment
    UNREAD_COUNT: '/announcements/unread/count',
    MARK_READ: (id: string) => `/announcements/${id}/read`,
    MARK_ALL_READ: '/announcements/mark-all-read', // Mark all as read
    PIN: (id: string) => `/announcements/${id}/pin`, // Pin announcement
    UNPIN: (id: string) => `/announcements/${id}/unpin`, // Unpin announcement
    PINNED: '/announcements/pinned', // Get pinned announcements
  },

  // ===================
  // ATTENDANCE
  // ===================
  ATTENDANCE: {
    LIST: '/attendance', // List attendance records with filters
    BY_ID: (id: string) => `/attendance/${id}`, // Get/Update attendance record
    CREATE: '/attendance', // Create attendance record
    MARK: '/attendance/mark', // Mark attendance (bulk) (COACH)
    HISTORY: (enrollmentId: string) => `/attendance/enrollment/${enrollmentId}/history`,
    STREAK: (enrollmentId: string) => `/attendance/enrollment/${enrollmentId}/streak`,
    STATS: (childId: string) => `/attendance/child/${childId}/stats`, // Get attendance stats
    CLASS: (classId: string) => `/attendance/class/${classId}`, // Get class attendance (COACH)
    BULK_CREATE: '/attendance/bulk', // Bulk record attendance
    SUMMARY: '/attendance/summary/', // Get attendance summary for date range
  },

  // ===================
  // EVENTS
  // ===================
  EVENTS: {
    LIST: '/events/calendar', // List events via calendar (use year/month params)
    BY_ID: (id: string) => `/events/${id}`, // Get event details
    CREATE: '/events', // Create event (COACH)
    UPDATE: (id: string) => `/events/${id}`, // Update event
    DELETE: (id: string) => `/events/${id}`, // Delete event
    BY_CLASS: (classId: string) => `/events/class/${classId}`, // List class events
    CALENDAR: '/events/calendar', // Get calendar view (year/month)
    RSVP: (id: string) => `/events/${id}/rsvp`, // RSVP to event
    CANCEL_RSVP: (id: string) => `/events/${id}/rsvp/cancel`, // Cancel RSVP
    UPDATE_RSVP: (id: string) => `/events/${id}/rsvp`, // Update RSVP (PUT)
    RSVPS: (id: string) => `/events/${id}/rsvps`, // Get event RSVPs
    RSVP_BY_ID: (eventId: string, rsvpId: string) => `/events/${eventId}/rsvps/${rsvpId}`, // Get/Update/Delete RSVP
    MY_RSVP: (eventId: string) => `/events/${eventId}/my-rsvp`, // Get user's RSVP for event
    ATTENDEE_SUMMARY: (eventId: string) => `/events/${eventId}/attendee-summary`, // Get attendee summary
  },

  // ===================
  // PHOTOS
  // ===================
  PHOTOS: {
    UPLOAD: '/photos/upload', // Upload photo (COACH)
    BY_CLASS: (classId: string) => `/photos/class/${classId}`, // List class photos
    LIST: '/photos', // List all photos with filters
    GALLERY: '/photos/gallery', // Get gallery with filters
    BY_ID: (id: string) => `/photos/${id}`, // Get/Update/Delete photo
    BULK_UPLOAD: '/photos/bulk-upload', // Bulk upload photos
    TAG_CHILD: (photoId: string) => `/photos/${photoId}/tag-child`, // Tag child in photo
    UNTAG_CHILD: (photoId: string, childId: string) => `/photos/${photoId}/untag-child/${childId}`, // Remove child tag

    // Albums
    ALBUMS: '/photos/albums',
    ALBUM_BY_ID: (id: string) => `/photos/albums/${id}`, // Get/Update/Delete album
    ALBUM_PHOTOS: (id: string) => `/photos/albums/${id}/photos`,
    CREATE_ALBUM: '/photos/albums', // Create album

    // Categories
    CATEGORIES: '/photos/categories',
    CATEGORIES_BY_CLASS: (classId: string) => `/photos/categories/class/${classId}`,
    CATEGORY_BY_ID: (id: string) => `/photos/categories/${id}`,
  },

  // ===================
  // BADGES
  // ===================
  BADGES: {
    LIST: '/badges', // List available badges (public)
    BY_ID: (id: string) => `/badges/${id}`, // Get badge details
    CREATE: '/badges', // Create badge (ADMIN)
    BY_ENROLLMENT: (enrollmentId: string) => `/badges/enrollment/${enrollmentId}`, // Student badges
    BY_CHILD: (childId: string) => `/badges/child/${childId}`, // Get badges by child
    MY_CHILDREN: '/badges/my-children', // Get current user's children's badges
    AWARD: '/badges/award', // Award badge (COACH)
    REVOKE: (awardId: string) => `/badges/awards/${awardId}/revoke`, // Revoke badge
    PROGRESS: (childId: string, badgeId: string) => `/badges/child/${childId}/progress/${badgeId}`, // Badge progress
    CHECK_ELIGIBILITY: '/badges/check-eligibility', // Check badge eligibility
    LEADERBOARD: '/badges/leaderboard', // Badge leaderboard
    STATS: (badgeId: string) => `/badges/${badgeId}/stats`, // Badge statistics
    STATS_OVERALL: '/badges/stats', // Overall badge statistics
    RECENT_AWARDS: '/badges/recent-awards', // Get recent badge awards
    BY_PROGRAM: (programId: string) => `/badges/program/${programId}`, // Program badges
  },

  // ===================
  // CHECK-IN
  // ===================
  CHECKIN: {
    SINGLE: '/check-in', // Check in single student
    BULK: '/check-in/bulk', // Bulk check-in (COACH)
    BY_CLASS: (classId: string) => `/check-in/class/${classId}`, // Class check-ins (COACH)
    STATUS: (classId: string) => `/check-in/class/${classId}/status`, // Status for all enrolled
  },

  // ===================
  // ADMIN DASHBOARD
  // ===================
  ADMIN: {
    METRICS: '/admin/dashboard/metrics', // Dashboard KPIs
    REVENUE: '/admin/finance/revenue', // Revenue report
    CLIENTS: '/admin/clients', // List clients with filters
    CLIENT_BY_ID: (id: string) => `/admin/clients/${id}`, // Client details
    ROSTER: (classId: string) => `/admin/classes/${classId}/roster`, // Class roster
    REFUNDS: '/admin/refunds', // List refund requests
    REFUND_BY_ID: (id: string) => `/admin/refunds/${id}`,
    APPROVE_REFUND: (id: string) => `/admin/refunds/${id}/approve`,
    REJECT_REFUND: (id: string) => `/admin/refunds/${id}/reject`,
  },

  // ===================
  // WEBHOOKS
  // ===================
  WEBHOOKS: {
    STRIPE: '/webhooks/stripe', // Stripe webhook handler
  },
} as const;

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
} as const;

/**
 * HTTP Methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

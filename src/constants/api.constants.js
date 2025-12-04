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
    LIST: '/programs', // List all programs (public)
    BY_ID: (id) => `/programs/${id}`, // Get program by ID
    CREATE: '/programs', // Create program (ADMIN)
    UPDATE: (id) => `/programs/${id}`, // Update program (ADMIN)
    DELETE: (id) => `/programs/${id}`, // Delete program (ADMIN)
  },

  // ===================
  // AREAS
  // ===================
  AREAS: {
    LIST: '/areas', // List all areas (public)
    BY_ID: (id) => `/areas/${id}`, // Get area by ID
    CREATE: '/areas', // Create area (ADMIN)
    UPDATE: (id) => `/areas/${id}`, // Update area (ADMIN)
    DELETE: (id) => `/areas/${id}`, // Delete area (ADMIN)
  },

  // ===================
  // CLASSES
  // ===================
  CLASSES: {
    LIST: '/classes', // List classes with filters (public)
    BY_ID: (id) => `/classes/${id}`, // Get class details
    CREATE: '/classes', // Create class (ADMIN)
    UPDATE: (id) => `/classes/${id}`, // Update class (ADMIN)
    DELETE: (id) => `/classes/${id}`, // Delete class (ADMIN)
  },

  // ===================
  // ENROLLMENTS
  // ===================
  ENROLLMENTS: {
    MY: '/enrollments/my', // List user's enrollments
    LIST: '/enrollments', // List all enrollments (ADMIN)
    BY_ID: (id) => `/enrollments/${id}`, // Get enrollment details
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
  // PAYMENTS
  // ===================
  PAYMENTS: {
    MY: '/payments/my', // List user's payment history
    LIST: '/payments', // List all payments (ADMIN)
    BY_ID: (id) => `/payments/${id}`, // Get payment details
    METHODS: '/payments/methods', // List saved payment methods
    METHOD_BY_ID: (id) => `/payments/methods/${id}`, // Delete payment method
    SETUP_INTENT: '/payments/setup-intent', // Create SetupIntent for card saving
    REFUND: '/payments/refund', // Create refund (ADMIN)
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

    // Discount Codes (ADMIN)
    CODES: '/discounts/codes',
    CODE_BY_ID: (id) => `/discounts/codes/${id}`,

    // Scholarships (ADMIN)
    SCHOLARSHIPS: '/discounts/scholarships',
    SCHOLARSHIP_BY_ID: (id) => `/discounts/scholarships/${id}`,
  },

  // ===================
  // WAIVERS
  // ===================
  WAIVERS: {
    REQUIRED: '/waivers/required', // Get required waivers (pending waivers)
    PENDING: '/waivers/required', // Alias for required (pending waivers)
    ACCEPT: '/waivers/accept', // Accept waiver
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
    MARK: '/attendance/mark', // Mark attendance (bulk) (COACH)
    HISTORY: (enrollmentId) => `/attendance/enrollment/${enrollmentId}/history`,
    STREAK: (enrollmentId) => `/attendance/enrollment/${enrollmentId}/streak`,
    STATS: (enrollmentId) => `/attendance/enrollment/${enrollmentId}/streak`, // Alias for stats
    CLASS: (classId) => `/attendance/class/${classId}`, // Get class attendance (COACH)
  },

  // ===================
  // EVENTS
  // ===================
  EVENTS: {
    LIST: '/events/calendar', // List events via calendar (use year/month params)
    BY_ID: (id) => `/events/${id}`, // Get event details
    CREATE: '/events', // Create event (COACH)
    UPDATE: (id) => `/events/${id}`, // Update event
    DELETE: (id) => `/events/${id}`, // Delete event
    BY_CLASS: (classId) => `/events/class/${classId}`, // List class events
    CALENDAR: '/events/calendar', // Get calendar view (year/month)
  },

  // ===================
  // PHOTOS
  // ===================
  PHOTOS: {
    UPLOAD: '/photos/upload', // Upload photo (COACH)
    BY_CLASS: (classId) => `/photos/class/${classId}`, // List class photos
    LIST: (classId) => `/photos/class/${classId}`, // Alias for BY_CLASS
    BY_ID: (id) => `/photos/${id}`, // Delete photo

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
    ROSTER: (classId) => `/admin/classes/${classId}/roster`, // Class roster
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

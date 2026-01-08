/**
 * API Endpoints
 * Centralized API endpoint definitions
 */

/**
 * API endpoints organized by feature
 */
export const ENDPOINTS = {
  // ============================================================================
  // Authentication
  // ============================================================================
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    TOKEN: '/auth/token',
    GOOGLE: '/auth/google',
    LOGOUT: '/auth/logout',
  },

  // ============================================================================
  // Users
  // ============================================================================
  USERS: {
    ME: '/users/me',
    UPDATE_ME: '/users/me',
  },

  // ============================================================================
  // Children
  // ============================================================================
  CHILDREN: {
    MY: '/children/my',
    LIST: '/children',
    CREATE: '/children',
    BY_ID: (id: string) => `/children/${id}`,
    UPDATE: (id: string) => `/children/${id}`,
    DELETE: (id: string) => `/children/${id}`,
    EMERGENCY_CONTACTS: (childId: string) => `/children/${childId}/emergency-contacts`,
    EMERGENCY_CONTACT: (childId: string, contactId: string) =>
      `/children/${childId}/emergency-contacts/${contactId}`,
  },

  // ============================================================================
  // Programs
  // ============================================================================
  PROGRAMS: {
    LIST: '/programs',
    BY_ID: (id: string) => `/programs/${id}`,
    CREATE: '/programs',
    UPDATE: (id: string) => `/programs/${id}`,
    DELETE: (id: string) => `/programs/${id}`,
  },

  // ============================================================================
  // Areas
  // ============================================================================
  AREAS: {
    LIST: '/areas',
    BY_ID: (id: string) => `/areas/${id}`,
    CREATE: '/areas',
    UPDATE: (id: string) => `/areas/${id}`,
    DELETE: (id: string) => `/areas/${id}`,
  },

  // ============================================================================
  // Classes
  // ============================================================================
  CLASSES: {
    LIST: '/classes',
    BY_ID: (id: string) => `/classes/${id}`,
    CREATE: '/classes',
    UPDATE: (id: string) => `/classes/${id}`,
    DELETE: (id: string) => `/classes/${id}`,
    CAPACITY: (id: string) => `/classes/${id}/capacity`,
    SCHEDULE: (id: string) => `/classes/${id}/schedule`,
    ENROLLMENTS: (id: string) => `/classes/${id}/enrollments`,
  },

  // ============================================================================
  // Enrollments
  // ============================================================================
  ENROLLMENTS: {
    MY: '/enrollments/my',
    LIST: '/enrollments',
    CREATE: '/enrollments',
    BY_ID: (id: string) => `/enrollments/${id}`,
    UPDATE: (id: string) => `/enrollments/${id}`,
    DELETE: (id: string) => `/enrollments/${id}`,
    CANCEL: (id: string) => `/enrollments/${id}/cancel`,
    TRANSFER: (id: string) => `/enrollments/${id}/transfer`,
    ACTIVATE: (id: string) => `/enrollments/${id}/activate`,
    PAUSE: (id: string) => `/enrollments/${id}/pause`,
    RESUME: (id: string) => `/enrollments/${id}/resume`,
    CANCELLATION_PREVIEW: (id: string) => `/enrollments/${id}/cancellation-preview`,
    // Waitlist
    WAITLIST_JOIN: '/enrollments/waitlist/join',
    WAITLIST_CLAIM: (id: string) => `/enrollments/${id}/waitlist/claim`,
    WAITLIST_CLASS: (classId: string) => `/enrollments/waitlist/class/${classId}`,
    WAITLIST_PROMOTE: (id: string) => `/enrollments/${id}/waitlist/promote`,
  },

  // ============================================================================
  // Orders
  // ============================================================================
  ORDERS: {
    MY: '/orders/my',
    LIST: '/orders',
    CALCULATE: '/orders/calculate',
    CREATE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    CHECKOUT: (id: string) => `/orders/${id}/checkout`,
    CONFIRM: (id: string) => `/orders/${id}/confirm`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },

  // ============================================================================
  // Payments
  // ============================================================================
  PAYMENTS: {
    MY: '/payments/my',
    LIST: '/payments',
    BY_ID: (id: string) => `/payments/${id}`,
    SETUP_INTENT: '/payments/setup-intent',
    METHODS: '/payments/methods',
    ATTACH_METHOD: '/payments/methods/attach',
    SET_DEFAULT_METHOD: (methodId: string) => `/payments/methods/${methodId}/default`,
    DELETE_METHOD: (methodId: string) => `/payments/methods/${methodId}`,
    REFUND: '/payments/refund',
    INVOICE_DOWNLOAD: (paymentId: string) => `/payments/${paymentId}/invoice/download`,
  },

  // ============================================================================
  // Installments
  // ============================================================================
  INSTALLMENTS: {
    MY: '/installments/my',
    LIST: '/installments',
    PREVIEW: '/installments/preview',
    CREATE: '/installments',
    BY_ID: (id: string) => `/installments/${id}`,
    DELETE: (id: string) => `/installments/${id}`,
    SUMMARY: '/installments/my/summary',
    PAYMENTS: (planId: string) => `/installments/${planId}/payments`,
    ATTEMPT_PAYMENT: (planId: string, paymentId: string) =>
      `/installments/${planId}/payments/${paymentId}/attempt`,
  },

  // ============================================================================
  // Discounts
  // ============================================================================
  DISCOUNTS: {
    VALIDATE: '/discounts/validate',
    CODES_LIST: '/discounts/codes',
    CODES_CREATE: '/discounts/codes',
    CODES_BY_ID: (id: string) => `/discounts/codes/${id}`,
    CODES_UPDATE: (id: string) => `/discounts/codes/${id}`,
    CODES_DELETE: (id: string) => `/discounts/codes/${id}`,
    SCHOLARSHIPS_LIST: '/discounts/scholarships',
    SCHOLARSHIPS_CREATE: '/discounts/scholarships',
    SCHOLARSHIPS_BY_ID: (id: string) => `/discounts/scholarships/${id}`,
    SCHOLARSHIPS_UPDATE: (id: string) => `/discounts/scholarships/${id}`,
    SCHOLARSHIPS_DELETE: (id: string) => `/discounts/scholarships/${id}`,
  },

  // ============================================================================
  // Waivers
  // ============================================================================
  WAIVERS: {
    ACCEPT: '/waivers/accept',
    MY_ACCEPTANCES: '/waivers/my-acceptances',
    STATUS: '/waivers/status',
    TEMPLATES_LIST: '/waivers/templates',
    TEMPLATES_CREATE: '/waivers/templates',
    TEMPLATES_BY_ID: (id: string) => `/waivers/templates/${id}`,
    TEMPLATES_UPDATE: (id: string) => `/waivers/templates/${id}`,
    TEMPLATES_DELETE: (id: string) => `/waivers/templates/${id}`,
  },

  // ============================================================================
  // Attendance
  // ============================================================================
  ATTENDANCE: {
    LIST: '/attendance',
    CREATE: '/attendance',
    BY_ID: (id: string) => `/attendance/${id}`,
    MARK: '/attendance/mark',
    STATS: (childId: string) => `/attendance/child/${childId}/stats`,
    STREAK: (enrollmentId: string) => `/attendance/enrollment/${enrollmentId}/streak`,
    BULK_CREATE: '/attendance/bulk',
    SUMMARY: '/attendance/summary',
    ENROLLMENT_HISTORY: (enrollmentId: string) => `/attendance/enrollment/${enrollmentId}/history`,
    ENROLLMENT_STATS: (enrollmentId: string) => `/attendance/enrollment/${enrollmentId}/stats`,
    ENROLLMENT_STREAK: (enrollmentId: string) => `/attendance/enrollment/${enrollmentId}/streak`,
    CLASS: (classId: string) => `/attendance/class/${classId}`,
  },

  // ============================================================================
  // Badges
  // ============================================================================
  BADGES: {
    LIST: '/badges',
    BY_ID: (id: string) => `/badges/${id}`,
    ENROLLMENT: (enrollmentId: string) => `/badges/enrollment/${enrollmentId}`,
    AWARD: '/badges/award',
    PROGRESS: (enrollmentId: string) => `/badges/enrollment/${enrollmentId}/progress`,
  },

  // ============================================================================
  // Check-in
  // ============================================================================
  CHECKIN: {
    CREATE: '/check-in',
    BULK: '/check-in/bulk',
    CLASS: (classId: string) => `/check-in/class/${classId}`,
    STATUS: (classId: string) => `/check-in/class/${classId}/status`,
    TEXT: '/check-in/text',
  },

  // ============================================================================
  // Announcements
  // ============================================================================
  ANNOUNCEMENTS: {
    LIST: '/announcements',
    CREATE: '/announcements',
    BY_ID: (id: string) => `/announcements/${id}`,
    UPDATE: (id: string) => `/announcements/${id}`,
    DELETE: (id: string) => `/announcements/${id}`,
    ATTACHMENTS: (id: string) => `/announcements/${id}/attachments`,
    MARK_READ: (id: string) => `/announcements/${id}/mark-read`,
    MARK_ALL_READ: '/announcements/mark-all-read',
    UNREAD_COUNT: '/announcements/unread-count',
    PIN: (id: string) => `/announcements/${id}/pin`,
    UNPIN: (id: string) => `/announcements/${id}/unpin`,
    PINNED: '/announcements/pinned',
  },

  // ============================================================================
  // Events
  // ============================================================================
  EVENTS: {
    LIST: '/events',
    CREATE: '/events',
    CALENDAR: '/events/calendar',
    CLASS: (classId: string) => `/events/class/${classId}`,
    BY_ID: (id: string) => `/events/${id}`,
    UPDATE: (id: string) => `/events/${id}`,
    DELETE: (id: string) => `/events/${id}`,
  },

  // ============================================================================
  // Photos
  // ============================================================================
  PHOTOS: {
    UPLOAD: '/photos/upload',
    LIST: '/photos',
    BY_ID: (id: string) => `/photos/${id}`,
    DELETE: (id: string) => `/photos/${id}`,
    CATEGORIES: '/photos/categories',
  },

  // ============================================================================
  // Admin
  // ============================================================================
  ADMIN: {
    DASHBOARD_METRICS: '/admin/dashboard/metrics',
    REVENUE: '/admin/reports/revenue',
    CLIENTS: '/admin/clients',
    CLIENT: (userId: string) => `/admin/clients/${userId}`,
    ROSTER: (classId: string) => `/admin/class/${classId}/roster`,
    REFUNDS_PENDING: '/admin/refunds/pending',
    REFUNDS_APPROVE: (refundId: string) => `/admin/refunds/${refundId}/approve`,
    REFUNDS_REJECT: (refundId: string) => `/admin/refunds/${refundId}/reject`,
  },

  // ============================================================================
  // Webhooks
  // ============================================================================
  WEBHOOKS: {
    STRIPE: '/webhooks/stripe',
  },
} as const;

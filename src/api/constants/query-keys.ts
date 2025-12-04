/**
 * Query Key Factory
 * Centralized query keys for consistent cache management
 *
 * Pattern: [domain, action, ...params]
 * Example: ['children', 'list'] or ['enrollments', 'detail', '123']
 *
 * CRITICAL: This ensures proper cache invalidation across the app
 */

/**
 * Query keys for authentication
 */
export const queryKeys = {
  // ============================================================================
  // Auth
  // ============================================================================
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // ============================================================================
  // Users
  // ============================================================================
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
  },

  // ============================================================================
  // Children
  // ============================================================================
  children: {
    all: ['children'] as const,
    lists: () => [...queryKeys.children.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.children.lists(), filters] as const,
    details: () => [...queryKeys.children.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.children.details(), id] as const,
    emergencyContacts: (childId: string) =>
      [...queryKeys.children.detail(childId), 'emergencyContacts'] as const,
  },

  // ============================================================================
  // Programs
  // ============================================================================
  programs: {
    all: ['programs'] as const,
    lists: () => [...queryKeys.programs.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.programs.lists(), filters] as const,
    details: () => [...queryKeys.programs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.programs.details(), id] as const,
  },

  // ============================================================================
  // Areas
  // ============================================================================
  areas: {
    all: ['areas'] as const,
    lists: () => [...queryKeys.areas.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.areas.lists(), filters] as const,
    details: () => [...queryKeys.areas.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.areas.details(), id] as const,
  },

  // ============================================================================
  // Classes
  // ============================================================================
  classes: {
    all: ['classes'] as const,
    lists: () => [...queryKeys.classes.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.classes.lists(), filters] as const,
    details: () => [...queryKeys.classes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.classes.details(), id] as const,
    capacity: (id: string) =>
      [...queryKeys.classes.detail(id), 'capacity'] as const,
    schedule: (id: string) =>
      [...queryKeys.classes.detail(id), 'schedule'] as const,
  },

  // ============================================================================
  // Enrollments
  // ============================================================================
  enrollments: {
    all: ['enrollments'] as const,
    lists: () => [...queryKeys.enrollments.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.enrollments.lists(), filters] as const,
    details: () => [...queryKeys.enrollments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.enrollments.details(), id] as const,
    byChild: (childId: string) =>
      [...queryKeys.enrollments.lists(), { child_id: childId }] as const,
    byClass: (classId: string) =>
      [...queryKeys.enrollments.lists(), { class_id: classId }] as const,
    active: () =>
      [...queryKeys.enrollments.lists(), { status: 'ACTIVE' }] as const,
    waitlist: (classId: string) =>
      [...queryKeys.enrollments.all, 'waitlist', classId] as const,
  },

  // ============================================================================
  // Orders
  // ============================================================================
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // ============================================================================
  // Payments
  // ============================================================================
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.payments.lists(), filters] as const,
    details: () => [...queryKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
    methods: () => [...queryKeys.payments.all, 'methods'] as const,
  },

  // ============================================================================
  // Payment Methods
  // ============================================================================
  paymentMethods: {
    all: ['paymentMethods'] as const,
    lists: () => [...queryKeys.paymentMethods.all, 'list'] as const,
  },

  // ============================================================================
  // Installment Plans
  // ============================================================================
  installmentPlans: {
    all: ['installmentPlans'] as const,
    lists: () => [...queryKeys.installmentPlans.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.installmentPlans.lists(), filters] as const,
    details: () => [...queryKeys.installmentPlans.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.installmentPlans.details(), id] as const,
  },

  // ============================================================================
  // Installments (Payment Installments)
  // ============================================================================
  installments: {
    all: ['installments'] as const,
    lists: () => [...queryKeys.installments.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.installments.lists(), filters] as const,
    details: () => [...queryKeys.installments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.installments.details(), id] as const,
    summary: () => [...queryKeys.installments.all, 'summary'] as const,
  },

  // ============================================================================
  // Discounts
  // ============================================================================
  discounts: {
    all: ['discounts'] as const,
    codes: () => [...queryKeys.discounts.all, 'codes'] as const,
    scholarships: () => [...queryKeys.discounts.all, 'scholarships'] as const,
  },

  // ============================================================================
  // Waivers
  // ============================================================================
  waivers: {
    all: ['waivers'] as const,
    templates: () => [...queryKeys.waivers.all, 'templates'] as const,
    acceptances: () => [...queryKeys.waivers.all, 'acceptances'] as const,
    status: () => [...queryKeys.waivers.all, 'status'] as const,
  },

  // ============================================================================
  // Attendance
  // ============================================================================
  attendance: {
    all: ['attendance'] as const,
    lists: () => [...queryKeys.attendance.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.attendance.lists(), filters] as const,
    byEnrollment: (enrollmentId: string) =>
      [...queryKeys.attendance.all, 'enrollment', enrollmentId] as const,
    history: (enrollmentId: string) =>
      [...queryKeys.attendance.byEnrollment(enrollmentId), 'history'] as const,
    stats: (enrollmentId: string) =>
      [...queryKeys.attendance.byEnrollment(enrollmentId), 'stats'] as const,
    streak: (enrollmentId: string) =>
      [...queryKeys.attendance.byEnrollment(enrollmentId), 'streak'] as const,
  },

  // ============================================================================
  // Badges
  // ============================================================================
  badges: {
    all: ['badges'] as const,
    lists: () => [...queryKeys.badges.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.badges.lists(), filters] as const,
    details: () => [...queryKeys.badges.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.badges.details(), id] as const,
    byEnrollment: (enrollmentId: string) =>
      [...queryKeys.badges.all, 'enrollment', enrollmentId] as const,
    progress: (enrollmentId: string) =>
      [...queryKeys.badges.byEnrollment(enrollmentId), 'progress'] as const,
  },

  // ============================================================================
  // Check-in
  // ============================================================================
  checkIn: {
    all: ['checkIn'] as const,
    byClass: (classId: string) =>
      [...queryKeys.checkIn.all, 'class', classId] as const,
    status: (classId: string) =>
      [...queryKeys.checkIn.byClass(classId), 'status'] as const,
    history: (enrollmentId: string) =>
      [...queryKeys.checkIn.all, 'history', enrollmentId] as const,
  },

  // ============================================================================
  // Announcements
  // ============================================================================
  announcements: {
    all: ['announcements'] as const,
    lists: () => [...queryKeys.announcements.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.announcements.lists(), filters] as const,
    details: () => [...queryKeys.announcements.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.announcements.details(), id] as const,
  },

  // ============================================================================
  // Events
  // ============================================================================
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.events.lists(), filters] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
    calendar: (month: string, year: string) =>
      [...queryKeys.events.all, 'calendar', month, year] as const,
    byClass: (classId: string) =>
      [...queryKeys.events.lists(), { class_id: classId }] as const,
  },

  // ============================================================================
  // Photos
  // ============================================================================
  photos: {
    all: ['photos'] as const,
    lists: () => [...queryKeys.photos.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.photos.lists(), filters] as const,
    details: () => [...queryKeys.photos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.photos.details(), id] as const,
    byClass: (classId: string) =>
      [...queryKeys.photos.lists(), { class_id: classId }] as const,
    categories: () => [...queryKeys.photos.all, 'categories'] as const,
  },

  // ============================================================================
  // Admin Dashboard
  // ============================================================================
  admin: {
    all: ['admin'] as const,
    metrics: () => [...queryKeys.admin.all, 'metrics'] as const,
    revenue: (filters?: Record<string, any>) =>
      [...queryKeys.admin.all, 'revenue', filters] as const,
    clients: (filters?: Record<string, any>) =>
      [...queryKeys.admin.all, 'clients', filters] as const,
    client: (userId: string) =>
      [...queryKeys.admin.all, 'client', userId] as const,
    roster: (classId: string) =>
      [...queryKeys.admin.all, 'roster', classId] as const,
    refunds: (filters?: Record<string, any>) =>
      [...queryKeys.admin.all, 'refunds', filters] as const,
  },

  // ============================================================================
  // Coach Features
  // ============================================================================
  coach: {
    all: ['coach'] as const,
    classes: () => [...queryKeys.coach.all, 'classes'] as const,
    checkInStatus: (classId: string) =>
      [...queryKeys.coach.all, 'checkInStatus', classId] as const,
  },
} as const;

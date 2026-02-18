import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api/v1';

// Helper type for request body
type JsonBody = Record<string, unknown>;

// ==========================================
// MOCK DATA
// ==========================================

export const mockUsers = {
  parent: {
    id: 'user-parent-1',
    email: 'parent@test.com',
    first_name: 'Test',
    last_name: 'Parent',
    role: 'PARENT',
    phone: '+1234567890',
    created_at: '2024-01-01T00:00:00Z',
  },
  coach: {
    id: 'user-coach-1',
    email: 'coach@test.com',
    first_name: 'Test',
    last_name: 'Coach',
    role: 'COACH',
    phone: '+1234567891',
    created_at: '2024-01-01T00:00:00Z',
  },
  admin: {
    id: 'user-admin-1',
    email: 'admin@test.com',
    first_name: 'Test',
    last_name: 'Admin',
    role: 'ADMIN',
    phone: '+1234567892',
    created_at: '2024-01-01T00:00:00Z',
  },
  owner: {
    id: 'user-owner-1',
    email: 'owner@test.com',
    first_name: 'Test',
    last_name: 'Owner',
    role: 'OWNER',
    phone: '+1234567893',
    created_at: '2024-01-01T00:00:00Z',
  },
};

export const mockChildren = [
  {
    id: 'child-1',
    first_name: 'Johnny',
    last_name: 'Parent',
    date_of_birth: '2015-05-15',
    grade: 3,
    school: 'Test Elementary',
    parent_id: 'user-parent-1',
    created_at: '2024-01-01T00:00:00Z',
    enrollments: [
      { id: 'enroll-1', status: 'active', class_id: 'class-1' }
    ],
  },
  {
    id: 'child-2',
    first_name: 'Jenny',
    last_name: 'Parent',
    date_of_birth: '2017-03-20',
    grade: 1,
    school: 'Test Elementary',
    parent_id: 'user-parent-1',
    created_at: '2024-01-01T00:00:00Z',
    enrollments: [],
  },
];

export const mockPrograms = [
  {
    id: 'prog-1',
    name: 'Soccer',
    description: 'Learn soccer fundamentals',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prog-2',
    name: 'Basketball',
    description: 'Basketball skills program',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockClasses = [
  {
    id: 'class-1',
    name: 'Soccer Basics',
    description: 'Learn soccer fundamentals',
    program: mockPrograms[0],
    program_id: 'prog-1',
    school: { id: 'school-1', name: 'Test Elementary' },
    school_id: 'school-1',
    coach: mockUsers.coach,
    coach_id: 'user-coach-1',
    capacity: 20,
    enrolled_count: 15,
    available_spots: 5,
    has_capacity: true,
    price: 150,
    start_date: '2024-02-01',
    end_date: '2024-05-01',
    schedule: 'Mon/Wed 3:00 PM - 4:00 PM',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'class-2',
    name: 'Basketball 101',
    description: 'Introduction to basketball',
    program: mockPrograms[1],
    program_id: 'prog-2',
    school: { id: 'school-1', name: 'Test Elementary' },
    school_id: 'school-1',
    coach: mockUsers.coach,
    coach_id: 'user-coach-1',
    capacity: 15,
    enrolled_count: 10,
    available_spots: 5,
    has_capacity: true,
    price: 175,
    start_date: '2024-02-01',
    end_date: '2024-05-01',
    schedule: 'Tue/Thu 3:00 PM - 4:00 PM',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockEnrollments = [
  {
    id: 'enroll-1',
    child_id: 'child-1',
    child: mockChildren[0],
    class_id: 'class-1',
    class: mockClasses[0],
    status: 'active',
    enrolled_at: '2024-01-15T00:00:00Z',
    created_at: '2024-01-15T00:00:00Z',
  },
];

export const mockDashboardMetrics = {
  active_enrollments: 150,
  total_students: 200,
  total_parents: 120,
  total_coaches: 10,
  programs_with_counts: [
    { name: 'Soccer', count: 80 },
    { name: 'Basketball', count: 70 },
  ],
  registrations_24h: 5,
  registrations_7d: 25,
  registrations_30d: 100,
  cancellations_24h: 1,
  cancellations_7d: 5,
  cancellations_30d: 15,
  monthly_enrollments: [
    { month: 'Jan', count: 30 },
    { month: 'Feb', count: 45 },
    { month: 'Mar', count: 60 },
  ],
  todays_classes: mockClasses.slice(0, 2),
  checkins_today: 42,
};

export const mockRevenue = {
  total: 25000,
  this_month: 8500,
  last_month: 7200,
  by_program: [
    { program: 'Soccer', amount: 12000 },
    { program: 'Basketball', amount: 13000 },
  ],
  transactions: [],
};

export const mockWaivers = [
  {
    id: 'waiver-1',
    title: 'Liability Waiver',
    content: 'I agree to the terms and conditions...',
    required: true,
    version: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'waiver-2',
    title: 'Photo Release',
    content: 'I consent to photos being taken...',
    required: true,
    version: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockBadges = [
  {
    id: 'badge-1',
    name: 'Perfect Attendance',
    description: 'Attended all classes in a month',
    icon: 'star',
    program_id: 'prog-1',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'badge-2',
    name: 'Team Player',
    description: 'Showed great teamwork',
    icon: 'users',
    program_id: 'prog-1',
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockEvents = [
  {
    id: 'event-1',
    title: 'End of Season Party',
    description: 'Celebrate the end of the season',
    date: '2024-05-15',
    time: '3:00 PM',
    location: 'School Gym',
    class_id: 'class-1',
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockAnnouncements = [
  {
    id: 'announce-1',
    title: 'Practice Cancelled',
    content: 'Practice is cancelled due to weather',
    class_id: 'class-1',
    author: mockUsers.coach,
    is_pinned: false,
    created_at: '2024-03-01T00:00:00Z',
  },
];

// ==========================================
// HANDLERS
// ==========================================

export const handlers = [
  // ==========================================
  // AUTH ENDPOINTS
  // ==========================================
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    const { email } = body;

    // Determine role from email prefix
    const roleKey = email.split('@')[0] as keyof typeof mockUsers;
    const user = mockUsers[roleKey] || mockUsers.parent;

    return HttpResponse.json({
      access_token: `mock-access-token-${user.role.toLowerCase()}`,
      refresh_token: `mock-refresh-token-${user.role.toLowerCase()}`,
      user,
    });
  }),

  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = await request.json() as { email: string; first_name: string; last_name: string };
    const newUser = {
      ...mockUsers.parent,
      id: `user-new-${Date.now()}`,
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
    };

    return HttpResponse.json({
      access_token: 'mock-access-token-new',
      refresh_token: 'mock-refresh-token-new',
      user: newUser,
    });
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.post(`${API_BASE}/auth/refresh`, () => {
    return HttpResponse.json({
      access_token: 'mock-refreshed-access-token',
      refresh_token: 'mock-refreshed-refresh-token',
    });
  }),

  http.post(`${API_BASE}/auth/google`, () => {
    return HttpResponse.json({
      access_token: 'mock-google-access-token',
      refresh_token: 'mock-google-refresh-token',
      user: mockUsers.parent,
    });
  }),

  // ==========================================
  // USERS ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/users/me`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = auth.replace('Bearer ', '');
    // Extract role from token (mock-access-token-admin -> admin)
    const parts = token.split('-');
    const roleKey = parts[parts.length - 1] as keyof typeof mockUsers;

    return HttpResponse.json(mockUsers[roleKey] || mockUsers.parent);
  }),

  http.put(`${API_BASE}/users/me`, async ({ request }) => {
    const updates = await request.json() as JsonBody;
    return HttpResponse.json({ ...mockUsers.parent, ...updates });
  }),

  // ==========================================
  // CHILDREN ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/children/my`, () => {
    return HttpResponse.json(mockChildren);
  }),

  http.get(`${API_BASE}/children`, () => {
    return HttpResponse.json(mockChildren);
  }),

  http.get(`${API_BASE}/children/:id`, ({ params }) => {
    const child = mockChildren.find(c => c.id === params.id);
    if (!child) {
      return HttpResponse.json({ message: 'Child not found' }, { status: 404 });
    }
    return HttpResponse.json(child);
  }),

  http.post(`${API_BASE}/children`, async ({ request }) => {
    const data = await request.json() as JsonBody;
    const newChild = {
      id: `child-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      enrollments: [],
    };
    return HttpResponse.json(newChild, { status: 201 });
  }),

  http.put(`${API_BASE}/children/:id`, async ({ request, params }) => {
    const updates = await request.json() as JsonBody;
    const child = mockChildren.find(c => c.id === params.id);
    return HttpResponse.json({ ...child, ...updates });
  }),

  http.delete(`${API_BASE}/children/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/children/:childId/emergency-contacts`, () => {
    return HttpResponse.json([
      { id: 'ec-1', name: 'Emergency Contact', phone: '+1234567890', relationship: 'Aunt' }
    ]);
  }),

  // ==========================================
  // PROGRAMS ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/programs`, () => {
    return HttpResponse.json(mockPrograms);
  }),

  http.get(`${API_BASE}/programs/:id`, ({ params }) => {
    const program = mockPrograms.find(p => p.id === params.id);
    return HttpResponse.json(program || mockPrograms[0]);
  }),

  http.post(`${API_BASE}/programs`, async ({ request }) => {
    const data = await request.json() as JsonBody;
    return HttpResponse.json({ id: `prog-${Date.now()}`, ...data }, { status: 201 });
  }),

  http.put(`${API_BASE}/programs/:id`, async ({ request, params }) => {
    const updates = await request.json() as JsonBody;
    const program = mockPrograms.find(p => p.id === params.id);
    return HttpResponse.json({ ...program, ...updates });
  }),

  http.delete(`${API_BASE}/programs/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  // ==========================================
  // CLASSES ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/classes`, () => {
    return HttpResponse.json({ items: mockClasses, total: mockClasses.length });
  }),

  http.get(`${API_BASE}/classes/:id`, ({ params }) => {
    const cls = mockClasses.find(c => c.id === params.id);
    return HttpResponse.json(cls || mockClasses[0]);
  }),

  http.post(`${API_BASE}/classes`, async ({ request }) => {
    const data = await request.json() as JsonBody;
    return HttpResponse.json({ id: `class-${Date.now()}`, ...data }, { status: 201 });
  }),

  http.put(`${API_BASE}/classes/:id`, async ({ request, params }) => {
    const updates = await request.json() as JsonBody;
    const cls = mockClasses.find(c => c.id === params.id);
    return HttpResponse.json({ ...cls, ...updates });
  }),

  http.delete(`${API_BASE}/classes/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  // ==========================================
  // ENROLLMENTS ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/enrollments/my`, () => {
    return HttpResponse.json(mockEnrollments);
  }),

  http.get(`${API_BASE}/enrollments`, () => {
    return HttpResponse.json({ items: mockEnrollments, total: mockEnrollments.length });
  }),

  http.get(`${API_BASE}/enrollments/:id`, ({ params }) => {
    const enrollment = mockEnrollments.find(e => e.id === params.id);
    return HttpResponse.json(enrollment || mockEnrollments[0]);
  }),

  http.post(`${API_BASE}/enrollments/:id/cancel`, ({ params }) => {
    return HttpResponse.json({ ...mockEnrollments[0], id: params.id, status: 'cancelled' });
  }),

  http.post(`${API_BASE}/enrollments/:id/transfer`, async ({ request, params }) => {
    const data = await request.json() as { new_class_id: string };
    return HttpResponse.json({ ...mockEnrollments[0], id: params.id, class_id: data.new_class_id });
  }),

  http.post(`${API_BASE}/enrollments/:id/activate`, ({ params }) => {
    return HttpResponse.json({ ...mockEnrollments[0], id: params.id, status: 'active' });
  }),

  // ==========================================
  // ORDERS ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/orders/my`, () => {
    return HttpResponse.json([]);
  }),

  http.post(`${API_BASE}/orders`, async ({ request }) => {
    const data = await request.json() as JsonBody;
    return HttpResponse.json({
      id: `order-${Date.now()}`,
      ...data,
      status: 'pending',
      total: 150,
      created_at: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.post(`${API_BASE}/orders/:id/pay`, () => {
    return HttpResponse.json({
      client_secret: 'mock_pi_secret_12345',
      payment_intent_id: 'pi_mock_12345',
    });
  }),

  http.post(`${API_BASE}/orders/:id/confirm`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'completed',
    });
  }),

  // ==========================================
  // PAYMENTS ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/payments/my`, () => {
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE}/payments/methods`, () => {
    return HttpResponse.json([]);
  }),

  http.post(`${API_BASE}/payments/setup-intent`, () => {
    return HttpResponse.json({
      client_secret: 'mock_seti_secret_12345',
    });
  }),

  // ==========================================
  // WAIVERS ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/waivers/required`, () => {
    return HttpResponse.json(mockWaivers);
  }),

  http.post(`${API_BASE}/waivers/accept`, async ({ request }) => {
    const data = await request.json() as { waiver_id: string };
    return HttpResponse.json({
      id: `acceptance-${Date.now()}`,
      waiver_id: data.waiver_id,
      accepted_at: new Date().toISOString(),
    });
  }),

  http.get(`${API_BASE}/waivers/my-acceptances`, () => {
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE}/waivers/templates`, () => {
    return HttpResponse.json(mockWaivers);
  }),

  http.get(`${API_BASE}/waivers/pending`, () => {
    return HttpResponse.json({ items: [], pending_count: 0, total: 0 });
  }),

  http.post(`${API_BASE}/waivers/sign-multiple`, async () => {
    return HttpResponse.json({ success: true, failed_count: 0 });
  }),

  // ==========================================
  // ANNOUNCEMENTS ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/announcements`, () => {
    return HttpResponse.json(mockAnnouncements);
  }),

  http.post(`${API_BASE}/announcements`, async ({ request }) => {
    const data = await request.json() as JsonBody;
    return HttpResponse.json({
      id: `announce-${Date.now()}`,
      ...data,
      author: mockUsers.coach,
      created_at: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.get(`${API_BASE}/announcements/unread/count`, () => {
    return HttpResponse.json({ count: 2 });
  }),

  // ==========================================
  // ATTENDANCE ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/attendance`, () => {
    return HttpResponse.json([]);
  }),

  http.post(`${API_BASE}/attendance/mark`, async ({ request }) => {
    const data = await request.json() as JsonBody;
    return HttpResponse.json({ success: true, ...data });
  }),

  http.get(`${API_BASE}/attendance/enrollment/:enrollmentId/streak`, () => {
    return HttpResponse.json({ current_streak: 5, longest_streak: 10 });
  }),

  http.get(`${API_BASE}/attendance/child/:childId/stats`, () => {
    return HttpResponse.json({
      total_classes: 20,
      attended: 18,
      percentage: 90,
    });
  }),

  http.get(`${API_BASE}/check-in/class/:classId/status`, () => {
    return HttpResponse.json(
      mockChildren.map(child => ({
        child_id: child.id,
        child,
        checked_in: false,
      }))
    );
  }),

  http.post(`${API_BASE}/check-in`, async ({ request }) => {
    const data = await request.json() as JsonBody;
    return HttpResponse.json({ success: true, ...data });
  }),

  // ==========================================
  // EVENTS ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/events/calendar`, () => {
    return HttpResponse.json(mockEvents);
  }),

  http.get(`${API_BASE}/events/class/:classId`, () => {
    return HttpResponse.json(mockEvents);
  }),

  http.get(`${API_BASE}/events`, () => {
    return HttpResponse.json(mockEvents);
  }),

  http.get(`${API_BASE}/events/:id`, ({ params }) => {
    const event = mockEvents.find(e => e.id === params.id);
    return HttpResponse.json(event || mockEvents[0]);
  }),

  http.post(`${API_BASE}/events`, async ({ request }) => {
    const data = await request.json() as JsonBody;
    return HttpResponse.json({
      id: `event-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.post(`${API_BASE}/events/:id/rsvp`, () => {
    return HttpResponse.json({ success: true, status: 'attending' });
  }),

  // ==========================================
  // PHOTOS ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/photos/gallery`, () => {
    return HttpResponse.json({ items: [], total: 0 });
  }),

  http.get(`${API_BASE}/photos/class/:classId`, () => {
    return HttpResponse.json([]);
  }),

  http.post(`${API_BASE}/photos/upload`, () => {
    return HttpResponse.json({
      id: `photo-${Date.now()}`,
      url: 'https://example.com/photo.jpg',
    });
  }),

  // ==========================================
  // BADGES ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/badges`, () => {
    return HttpResponse.json(mockBadges);
  }),

  http.get(`${API_BASE}/badges/my-children`, () => {
    return HttpResponse.json([
      { child_id: 'child-1', badges: [mockBadges[0]] }
    ]);
  }),

  http.get(`${API_BASE}/badges/enrollment/:enrollmentId`, () => {
    return HttpResponse.json([mockBadges[0]]);
  }),

  http.get(`${API_BASE}/badges/child/:childId`, () => {
    return HttpResponse.json([mockBadges[0]]);
  }),

  http.post(`${API_BASE}/badges/award`, async ({ request }) => {
    const data = await request.json() as JsonBody;
    return HttpResponse.json({
      id: `award-${Date.now()}`,
      ...data,
      awarded_at: new Date().toISOString(),
    });
  }),

  http.get(`${API_BASE}/badges/leaderboard`, () => {
    return HttpResponse.json([
      { child: mockChildren[0], badge_count: 5 },
    ]);
  }),

  // ==========================================
  // ADMIN DASHBOARD ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
    return HttpResponse.json(mockDashboardMetrics);
  }),

  http.get(`${API_BASE}/admin/finance/revenue`, () => {
    return HttpResponse.json(mockRevenue);
  }),

  http.get(`${API_BASE}/admin/clients`, () => {
    return HttpResponse.json({
      items: [
        {
          ...mockUsers.parent,
          children: mockChildren,
          total_enrollments: 1,
          total_spent: 150,
        },
      ],
      total: 1,
    });
  }),

  http.get(`${API_BASE}/admin/clients/:id`, ({ params }) => {
    return HttpResponse.json({
      ...mockUsers.parent,
      id: params.id,
      children: mockChildren,
    });
  }),

  http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
    return HttpResponse.json(
      mockEnrollments.map(e => ({
        ...e,
        child: mockChildren.find(c => c.id === e.child_id),
      }))
    );
  }),

  http.get(`${API_BASE}/admin/refunds`, () => {
    return HttpResponse.json({ items: [], total: 0 });
  }),

  http.get(`${API_BASE}/admin/refunds/pending`, () => {
    return HttpResponse.json({
      items: [
        {
          payment_id: 'pay-001-abcdef123456',
          user_name: 'John Parent',
          user_email: 'john@test.com',
          original_amount: '150.00',
          refund_amount: '150.00',
          refund_requested_at: '2024-03-15T10:00:00Z',
          payment_type: 'enrollment',
        },
      ],
      total: 1,
    });
  }),

  http.post(`${API_BASE}/admin/refunds/:id/approve`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'approved',
      approved_at: new Date().toISOString(),
    });
  }),

  http.post(`${API_BASE}/admin/refunds/:paymentId/approve`, ({ params }) => {
    return HttpResponse.json({
      id: params.paymentId,
      message: 'Refund approved successfully',
      status: 'approved',
      approved_at: new Date().toISOString(),
    });
  }),

  http.post(`${API_BASE}/admin/refunds/:id/reject`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      status: 'rejected',
      rejected_at: new Date().toISOString(),
    });
  }),

  http.post(`${API_BASE}/admin/refunds/:paymentId/reject`, () => {
    return HttpResponse.json({
      message: 'Refund rejected',
      status: 'rejected',
    });
  }),

  // Cancellation Requests endpoints
  http.get(`${API_BASE}/admin/cancellation-requests/pending`, () => {
    return HttpResponse.json({
      items: [
        {
          id: 'cancel-001',
          user_name: 'John Parent',
          user_email: 'john@test.com',
          child_name: 'Johnny Parent',
          class_name: 'Soccer Basics',
          class_start_date: '2024-04-01',
          days_until_class: 10,
          enrollment_amount: '150.00',
          requested_refund_amount: '150.00',
          status: 'pending',
          reason: 'Schedule conflict',
          created_at: '2024-03-15T10:00:00Z',
        },
      ],
      total: 1,
    });
  }),

  http.get(`${API_BASE}/admin/cancellation-requests`, () => {
    return HttpResponse.json({
      items: [],
      total: 0,
    });
  }),

  http.get(`${API_BASE}/admin/cancellation-requests/stats`, () => {
    return HttpResponse.json({
      pending: 1,
      approved: 5,
      auto_approved: 10,
      rejected: 3,
      total_refunded: '1250.00',
    });
  }),

  http.post(`${API_BASE}/admin/cancellation-requests/:id/approve`, () => {
    return HttpResponse.json({
      message: 'Cancellation approved and refund processed',
      status: 'approved',
    });
  }),

  http.post(`${API_BASE}/admin/cancellation-requests/:id/reject`, () => {
    return HttpResponse.json({
      message: 'Cancellation request rejected',
      status: 'rejected',
    });
  }),

  // ==========================================
  // ADMIN BULK EMAIL
  // ==========================================
  http.post(`${API_BASE}/admin/bulk/email`, async ({ request }) => {
    const data = await request.json() as JsonBody;
    return HttpResponse.json({
      successful: 10,
      failed: 0,
      total_recipients: 10,
    });
  }),

  // ==========================================
  // ADMIN REFUNDS SEARCH
  // ==========================================
  http.get(`${API_BASE}/admin/refunds/search`, () => {
    return HttpResponse.json({ items: [], total: 0 });
  }),

  // ==========================================
  // AREAS ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/areas`, () => {
    return HttpResponse.json([
      { id: 'area-1', name: 'Downtown', is_active: true },
      { id: 'area-2', name: 'Suburbs', is_active: true },
    ]);
  }),

  // ==========================================
  // INSTALLMENTS ENDPOINTS
  // ==========================================
  http.get(`${API_BASE}/installments/my`, () => {
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE}/installments/summary`, () => {
    return HttpResponse.json({
      total_paid: 0,
      total_due: 0,
      next_payment_date: null,
      next_payment_amount: 0,
    });
  }),

  http.post(`${API_BASE}/installments/preview`, () => {
    return HttpResponse.json({
      total: 150,
      installments: [
        { amount: 50, due_date: '2024-02-01' },
        { amount: 50, due_date: '2024-03-01' },
        { amount: 50, due_date: '2024-04-01' },
      ],
    });
  }),
];

export default handlers;

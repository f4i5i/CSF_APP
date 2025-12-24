/**
 * Shared Mock Data for Tests
 * Centralized test fixtures for consistent testing
 */

// ==========================================
// USER MOCKS
// ==========================================

export const mockParentUser = {
  id: 'user-parent-1',
  email: 'parent@test.com',
  first_name: 'Test',
  last_name: 'Parent',
  role: 'PARENT',
  phone: '+1234567890',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockCoachUser = {
  id: 'user-coach-1',
  email: 'coach@test.com',
  first_name: 'Test',
  last_name: 'Coach',
  role: 'COACH',
  phone: '+1234567891',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockAdminUser = {
  id: 'user-admin-1',
  email: 'admin@test.com',
  first_name: 'Test',
  last_name: 'Admin',
  role: 'ADMIN',
  phone: '+1234567892',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockOwnerUser = {
  id: 'user-owner-1',
  email: 'owner@test.com',
  first_name: 'Test',
  last_name: 'Owner',
  role: 'OWNER',
  phone: '+1234567893',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// ==========================================
// CHILDREN MOCKS
// ==========================================

export const mockChild1 = {
  id: 'child-1',
  first_name: 'Johnny',
  last_name: 'Parent',
  date_of_birth: '2015-05-15',
  grade: 3,
  school: 'Test Elementary',
  parent_id: 'user-parent-1',
  created_at: '2024-01-01T00:00:00Z',
  enrollments: [],
};

export const mockChild2 = {
  id: 'child-2',
  first_name: 'Jenny',
  last_name: 'Parent',
  date_of_birth: '2017-03-20',
  grade: 1,
  school: 'Test Elementary',
  parent_id: 'user-parent-1',
  created_at: '2024-01-01T00:00:00Z',
  enrollments: [],
};

export const mockChildren = [mockChild1, mockChild2];

// ==========================================
// PROGRAM MOCKS
// ==========================================

export const mockSoccerProgram = {
  id: 'prog-1',
  name: 'Soccer',
  description: 'Learn soccer fundamentals',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockBasketballProgram = {
  id: 'prog-2',
  name: 'Basketball',
  description: 'Basketball skills program',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockPrograms = [mockSoccerProgram, mockBasketballProgram];

// ==========================================
// CLASS MOCKS
// ==========================================

export const mockSoccerClass = {
  id: 'class-1',
  name: 'Soccer Basics',
  description: 'Learn soccer fundamentals',
  program: mockSoccerProgram,
  program_id: 'prog-1',
  school: { id: 'school-1', name: 'Test Elementary' },
  school_id: 'school-1',
  coach: mockCoachUser,
  coach_id: 'user-coach-1',
  capacity: 20,
  enrolled_count: 15,
  price: 150,
  start_date: '2024-02-01',
  end_date: '2024-05-01',
  schedule: 'Mon/Wed 3:00 PM - 4:00 PM',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockBasketballClass = {
  id: 'class-2',
  name: 'Basketball 101',
  description: 'Introduction to basketball',
  program: mockBasketballProgram,
  program_id: 'prog-2',
  school: { id: 'school-1', name: 'Test Elementary' },
  school_id: 'school-1',
  coach: mockCoachUser,
  coach_id: 'user-coach-1',
  capacity: 15,
  enrolled_count: 10,
  price: 175,
  start_date: '2024-02-01',
  end_date: '2024-05-01',
  schedule: 'Tue/Thu 3:00 PM - 4:00 PM',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockClasses = [mockSoccerClass, mockBasketballClass];

// ==========================================
// ENROLLMENT MOCKS
// ==========================================

export const mockEnrollment1 = {
  id: 'enroll-1',
  child_id: 'child-1',
  child: mockChild1,
  class_id: 'class-1',
  class: mockSoccerClass,
  status: 'active',
  enrolled_at: '2024-01-15T00:00:00Z',
  created_at: '2024-01-15T00:00:00Z',
};

export const mockEnrollments = [mockEnrollment1];

// ==========================================
// WAIVER MOCKS
// ==========================================

export const mockLiabilityWaiver = {
  id: 'waiver-1',
  title: 'Liability Waiver',
  content: 'I agree to the terms and conditions and understand the risks involved in participating...',
  required: true,
  version: 1,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockPhotoReleaseWaiver = {
  id: 'waiver-2',
  title: 'Photo Release',
  content: 'I consent to photos being taken of my child during class activities...',
  required: true,
  version: 1,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockWaivers = [mockLiabilityWaiver, mockPhotoReleaseWaiver];

// ==========================================
// BADGE MOCKS
// ==========================================

export const mockPerfectAttendanceBadge = {
  id: 'badge-1',
  name: 'Perfect Attendance',
  description: 'Attended all classes in a month',
  icon: 'star',
  program_id: 'prog-1',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockTeamPlayerBadge = {
  id: 'badge-2',
  name: 'Team Player',
  description: 'Showed great teamwork',
  icon: 'users',
  program_id: 'prog-1',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockBadges = [mockPerfectAttendanceBadge, mockTeamPlayerBadge];

// ==========================================
// EVENT MOCKS
// ==========================================

export const mockEndOfSeasonEvent = {
  id: 'event-1',
  title: 'End of Season Party',
  description: 'Celebrate the end of the season',
  date: '2024-05-15',
  time: '3:00 PM',
  location: 'School Gym',
  class_id: 'class-1',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockEvents = [mockEndOfSeasonEvent];

// ==========================================
// ANNOUNCEMENT MOCKS
// ==========================================

export const mockAnnouncement1 = {
  id: 'announce-1',
  title: 'Practice Cancelled',
  content: 'Practice is cancelled due to weather',
  class_id: 'class-1',
  author: mockCoachUser,
  is_pinned: false,
  created_at: '2024-03-01T00:00:00Z',
};

export const mockAnnouncements = [mockAnnouncement1];

// ==========================================
// ADMIN DASHBOARD MOCKS
// ==========================================

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

// ==========================================
// ORDER & PAYMENT MOCKS
// ==========================================

export const mockOrder = {
  id: 'order-1',
  user_id: 'user-parent-1',
  items: [
    {
      class_id: 'class-1',
      child_id: 'child-1',
      price: 150,
    },
  ],
  total: 150,
  status: 'pending',
  created_at: '2024-01-15T00:00:00Z',
};

export const mockPaymentIntent = {
  client_secret: 'mock_pi_secret_12345',
  payment_intent_id: 'pi_mock_12345',
};

// ==========================================
// ATTENDANCE MOCKS
// ==========================================

export const mockAttendanceRecord = {
  id: 'attendance-1',
  enrollment_id: 'enroll-1',
  class_id: 'class-1',
  date: '2024-03-01',
  status: 'present',
  checked_in_at: '2024-03-01T15:00:00Z',
  created_at: '2024-03-01T15:00:00Z',
};

export const mockAttendanceStreak = {
  current_streak: 5,
  longest_streak: 10,
};

export const mockAttendanceStats = {
  total_classes: 20,
  attended: 18,
  percentage: 90,
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get user by role
 */
export const getUserByRole = (role: string) => {
  const roleMap: Record<string, typeof mockParentUser> = {
    parent: mockParentUser,
    coach: mockCoachUser,
    admin: mockAdminUser,
    owner: mockOwnerUser,
  };
  return roleMap[role.toLowerCase()] || mockParentUser;
};

/**
 * Create a mock API response with pagination
 */
export const createPaginatedResponse = <T>(
  items: T[],
  page = 1,
  limit = 10
) => ({
  items,
  total: items.length,
  page,
  limit,
  pages: Math.ceil(items.length / limit),
});

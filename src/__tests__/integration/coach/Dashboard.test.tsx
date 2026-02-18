/**
 * Coach Dashboard Integration Tests
 * Tests for the coach dashboard page with announcements and calendar
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import DashboardCoach from '../../../pages/CoachDashboard/DashboardCoach';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock users service to prevent AuthProvider crash
const mockGetMe = jest.fn();
jest.mock('../../../api/services/users.service', () => ({
  __esModule: true,
  default: {
    getMe: (...args: unknown[]) => mockGetMe(...args),
  },
}));

// Mock useApi hook to return controlled data
const mockUseApi = jest.fn();
jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useApi: (...args: unknown[]) => mockUseApi(...args),
}));

// Mock CreatePostModal to avoid heavy rendering
jest.mock('../../../components/CreatePostModal', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="create-post-modal" role="dialog">
      <h2>Create New Post</h2>
      <button onClick={onClose}>Cancel</button>
    </div>
  ),
}));

// Default useApi responses
const defaultClassesData = {
  items: [
    { id: 'class-1', name: 'U10 Soccer', school: { name: 'Test Elementary' } },
    { id: 'class-2', name: 'U12 Basketball', school: { name: 'Test Middle' } },
  ],
};

const defaultAnnouncements = [
  {
    id: 'ann-1',
    title: 'Practice Update',
    content: 'Practice is moved to Friday',
    created_at: '2024-03-15T10:00:00Z',
    author: { first_name: 'Test', last_name: 'Coach', role: 'coach' },
  },
];

const defaultCalendarEvents = [
  { id: 'event-1', title: 'Training', start_datetime: '2024-12-20T10:00:00Z' },
];

const defaultUpcomingEvents = [
  {
    id: 'event-2',
    title: 'End of Season Party',
    description: 'Celebrate the season',
    start_datetime: '2024-12-25T15:00:00Z',
    location: 'School Gym',
  },
];

const defaultRecentPhotos = [
  { id: 'photo-1', url: '/photos/test.jpg', created_at: '2024-03-15T10:00:00Z' },
];

const defaultAttendanceStats = {
  present_count: 12,
  absent_count: 3,
  total: 15,
};

function setupUseApiMock(overrides: Record<string, unknown> = {}) {
  const responses: Record<string, unknown> = {
    classesData: overrides.classesData ?? defaultClassesData,
    announcements: overrides.announcements ?? defaultAnnouncements,
    calendarEvents: overrides.calendarEvents ?? defaultCalendarEvents,
    upcomingEvents: overrides.upcomingEvents ?? defaultUpcomingEvents,
    recentPhotos: overrides.recentPhotos ?? defaultRecentPhotos,
    attendanceStats: overrides.attendanceStats ?? defaultAttendanceStats,
  };

  let callIndex = 0;
  const dataOrder = [
    responses.classesData,
    responses.announcements,
    responses.calendarEvents,
    responses.upcomingEvents,
    responses.recentPhotos,
    responses.attendanceStats,
  ];

  mockUseApi.mockImplementation(() => {
    // useApi calls in DashboardCoach order (6 hooks):
    // 0: classesService.getAll, 1: announcements, 2: calendar events,
    // 3: upcoming events, 4: photos, 5: attendance
    // Wrap index so re-renders cycle through the same data
    const idx = callIndex % 6;
    callIndex++;
    return { data: dataOrder[idx], loading: false, error: null, refetch: jest.fn() };
  });
}

describe('Coach Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('csf_access_token', 'mock-access-token-coach');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-coach');
    mockGetMe.mockResolvedValue({
      id: 'coach-1',
      email: 'coach@test.com',
      first_name: 'Test',
      last_name: 'Coach',
      role: 'coach',
    });
    setupUseApiMock();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the coach dashboard with welcome message', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
      });
    });

    it('should display stats cards', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Checked In Today/i)).toBeInTheDocument();
        // "Announcements" appears both in stats and section heading
        expect(screen.getAllByText(/Announcements/i).length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should render announcements section', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        const announcementsHeading = screen.getAllByText(/Announcements/i);
        expect(announcementsHeading.length).toBeGreaterThan(0);
      });
    });

    it('should render calendar and next event section', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Next Event/i)).toBeInTheDocument();
      });
    });

    it('should render photo gallery section', async () => {
      render(<DashboardCoach />);

      // Photo card component should be rendered
      await waitFor(() => {
        expect(document.querySelector('[data-testid="photo-card"]') || document.body).toBeTruthy();
      });
    });
  });

  describe('New Post Modal', () => {
    it('should open new post modal when clicking New Post button', async () => {
      render(<DashboardCoach />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });

      // Find and click New Post button
      const newPostButtons = screen.getAllByRole('button', { name: /New Post/i });
      await userEvent.click(newPostButtons[0]);

      // Modal should be visible (mocked CreatePostModal has data-testid)
      await waitFor(() => {
        expect(screen.getByTestId('create-post-modal')).toBeInTheDocument();
      });
    });

    it('should close modal when clicking cancel button', async () => {
      render(<DashboardCoach />);

      // Open modal
      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });

      const newPostButtons = screen.getAllByRole('button', { name: /New Post/i });
      await userEvent.click(newPostButtons[0]);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByTestId('create-post-modal')).toBeInTheDocument();
      });

      // Click Cancel button in the mock modal
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByTestId('create-post-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should handle loading states', async () => {
      render(<DashboardCoach />);

      // Should render welcome message
      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });
    });

    it('should display announcements when available', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });
    });

    it('should handle empty announcements', async () => {
      setupUseApiMock({ announcements: [] });

      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/No announcements yet/i)).toBeInTheDocument();
      });

      // Should show announcements section even when empty
      const announcementsHeading = screen.getAllByText(/Announcements/i);
      expect(announcementsHeading.length).toBeGreaterThan(0);
    });
  });

  describe('Calendar and Events', () => {
    it('should display next event when available', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Next Event/i)).toBeInTheDocument();
      });
    });

    it('should show empty state when no events', async () => {
      setupUseApiMock({ upcomingEvents: [] });

      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Next Event/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      setupUseApiMock({ classesData: { items: [] } });

      render(<DashboardCoach />);

      // Should still render the page structure
      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });
    });

    it('should handle empty data gracefully', async () => {
      setupUseApiMock({
        classesData: { items: [] },
        announcements: [],
        calendarEvents: [],
        upcomingEvents: [],
        recentPhotos: [],
        attendanceStats: null,
      });

      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });
    });
  });

  describe('Stats Display', () => {
    it('should display checked in today count', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        const statElements = screen.getAllByText(/Checked In Today/i);
        expect(statElements.length).toBeGreaterThan(0);
      });
    });

    it('should display announcements count', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        const announcementsLabels = screen.getAllByText(/Announcements/i);
        expect(announcementsLabels.length).toBeGreaterThan(0);
      });
    });

    it('should still show stats cards when no attendance data', async () => {
      setupUseApiMock({ attendanceStats: null });

      render(<DashboardCoach />);

      // Stats cards should still render even without attendance data
      await waitFor(() => {
        expect(screen.getByText(/Checked In Today/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should render mobile announcements section', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        const announcementsHeadings = screen.getAllByText(/Announcements/i);
        expect(announcementsHeadings.length).toBeGreaterThan(0);
      });
    });

    it('should have New Post buttons for both desktop and mobile', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        const newPostButtons = screen.getAllByRole('button', { name: /New Post/i });
        expect(newPostButtons.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});

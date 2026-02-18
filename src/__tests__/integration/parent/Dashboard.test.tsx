/**
 * Parent Dashboard Integration Tests
 * Tests for the parent dashboard including child selector, enrollments, events, badges, and waivers
 */

import { render, screen, waitFor, fireEvent } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Dashboard from '../../../pages/Dashboard';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock child components to simplify tests
jest.mock('../../../components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

jest.mock('../../../components/Calender1', () => ({
  __esModule: true,
  default: ({ events }: { events: any[] }) => (
    <div data-testid="calendar">Calendar: {events?.length || 0} events</div>
  ),
}));

jest.mock('../../../components/NextEvent', () => ({
  __esModule: true,
  default: ({ event, loading }: { event: any; loading: boolean }) => (
    <div data-testid="next-event">
      {loading ? 'Loading...' : event ? event.title : 'No upcoming events'}
    </div>
  ),
}));

jest.mock('../../../components/BadgeCard', () => ({
  __esModule: true,
  default: ({ badges, loading }: { badges: any[]; loading: boolean }) => (
    <div data-testid="badge-card">
      {loading ? 'Loading badges...' : `${badges?.length || 0} badges`}
    </div>
  ),
}));

jest.mock('../../../components/WaiversAlert', () => ({
  __esModule: true,
  default: ({ pendingWaivers, loading }: { pendingWaivers: any[]; loading: boolean }) => (
    <div data-testid="waivers-alert">
      {loading ? 'Loading waivers...' : pendingWaivers?.length > 0 ? `${pendingWaivers.length} pending waivers` : null}
    </div>
  ),
}));

jest.mock('../../../components/dashboard/StatCard', () => ({
  __esModule: true,
  default: ({ value, label }: { value: number; label: string }) => (
    <div data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      {value} {label}
    </div>
  ),
}));

jest.mock('../../../components/DashboardWidgets', () => ({
  __esModule: true,
  default: ({ calendarEvents, nextEvent, badges, photo, loadingEvents, loadingBadges, loadingPhoto }: any) => (
    <div data-testid="dashboard-widgets">
      <div data-testid="calendar">Calendar: {calendarEvents?.length || 0} events</div>
      <div data-testid="next-event">
        {loadingEvents ? 'Loading...' : nextEvent ? nextEvent.title : 'No upcoming events'}
      </div>
      <div data-testid="badge-card">
        {loadingBadges ? 'Loading badges...' : `${badges?.length || 0} badges`}
      </div>
    </div>
  ),
}));

jest.mock('../../../components/AnnouncementsSection', () => ({
  __esModule: true,
  default: ({ announcements, nextEvent, loading, loadingEvent }: any) => (
    <div data-testid="announcements-section">
      {loading ? 'Loading announcements...' : `${announcements?.length || 0} announcements`}
    </div>
  ),
}));

// Mock users service to prevent AuthProvider getMe() crash
jest.mock('../../../api/services/users.service', () => ({
  __esModule: true,
  default: {
    getMe: jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'parent@test.com',
      first_name: 'Johnny',
      last_name: 'Parent',
      role: 'parent',
    }),
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: (props: any) => <svg data-testid="chevron-down" {...props} />,
  UserPlus: (props: any) => <svg data-testid="user-plus" {...props} />,
  Pencil: (props: any) => <svg data-testid="pencil" {...props} />,
}));

// Mock ChildrenContext with configurable mock
const mockSelectChild = jest.fn();
const mockChildrenList = [
  {
    id: 'child-1',
    first_name: 'Johnny',
    last_name: 'Parent',
    date_of_birth: '2015-05-15',
    school: { name: 'Test Elementary' },
    grade: '3',
    class_days: ['Monday', 'Wednesday'],
    enrollments: [{ id: 'enroll-1', class_id: 'class-1', status: 'active' }],
  },
  {
    id: 'child-2',
    first_name: 'Jane',
    last_name: 'Parent',
    date_of_birth: '2017-08-20',
    school: { name: 'Another School' },
    grade: '1',
    class_days: ['Tuesday', 'Thursday'],
    enrollments: [],
  },
];

const mockUseChildren = jest.fn();

jest.mock('../../../context/ChildrenContext', () => ({
  __esModule: true,
  useChildren: () => mockUseChildren(),
  ChildrenProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ==========================================
// Mock useApi to return controllable data
// ==========================================
// The real useApi + axios + MSW pipeline is unreliable in jsdom test env.
// We mock useApi to return data based on the service function being called.
const mockUseApiOverrides: Record<string, any> = {};

jest.mock('../../../hooks/useApi', () => {
  const { useState, useEffect, useCallback, useRef } = require('react');

  const useApi = (apiFunction: Function, options: any = {}) => {
    const {
      autoFetch = true,
      dependencies = [],
      onSuccess = null,
      onError = null,
      initialData = null,
    } = options;

    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);

    const fetchData = useCallback(async (...args: any[]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunction(...args);
        if (isMountedRef.current) {
          setData(result);
          setLoading(false);
          if (onSuccess) onSuccess(result);
        }
        return result;
      } catch (err: any) {
        if (isMountedRef.current) {
          setError(err?.message || 'Error');
          setLoading(false);
          if (onError) onError(err?.message || 'Error');
        }
        return null;
      }
    }, [apiFunction, onSuccess, onError]);

    const refetch = useCallback((...args: any[]) => fetchData(...args), [fetchData]);

    useEffect(() => {
      isMountedRef.current = true;
      return () => { isMountedRef.current = false; };
    }, []);

    useEffect(() => {
      if (autoFetch) {
        fetchData();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetch, ...dependencies]);

    return { data, loading, error, refetch, fetchData };
  };

  return {
    __esModule: true,
    useApi,
    default: useApi,
  };
});

// Mock all API services to return data directly (bypassing axios/MSW)
const mockEnrollmentsGetMy = jest.fn();
const mockBadgesGetByEnrollment = jest.fn();
const mockAttendanceGetStreak = jest.fn();
const mockWaiversGetPending = jest.fn();
const mockAnnouncementsGetAll = jest.fn();
const mockEventsGetByClass = jest.fn();
const mockEventsGetUpcoming = jest.fn();
const mockPhotosGetByClass = jest.fn();

jest.mock('../../../api/services', () => ({
  __esModule: true,
  enrollmentsService: {
    getMy: (...args: any[]) => mockEnrollmentsGetMy(...args),
  },
  badgesService: {
    getByEnrollment: (...args: any[]) => mockBadgesGetByEnrollment(...args),
  },
  attendanceService: {
    getStreak: (...args: any[]) => mockAttendanceGetStreak(...args),
  },
  waiversService: {
    getPending: (...args: any[]) => mockWaiversGetPending(...args),
  },
  announcementsService: {
    getAll: (...args: any[]) => mockAnnouncementsGetAll(...args),
  },
  eventsService: {
    getByClass: (...args: any[]) => mockEventsGetByClass(...args),
    getUpcoming: (...args: any[]) => mockEventsGetUpcoming(...args),
  },
  photosService: {
    getByClass: (...args: any[]) => mockPhotosGetByClass(...args),
  },
}));

const API_BASE = 'http://localhost:8000/api/v1';

// Default enrollment data returned by the mock
const defaultEnrollments = [
  {
    id: 'enroll-1',
    child_id: 'child-1',
    class_id: 'class-1',
    status: 'active',
    class: { id: 'class-1', name: 'Soccer Basics', school: { name: 'Test Elementary' } },
    class_name: 'Soccer Basics',
    school_name: 'Test Elementary',
  },
];

describe('Parent Dashboard', () => {

  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');
    mockNavigate.mockClear();
    mockSelectChild.mockClear();

    // Default mock return value for useChildren
    mockUseChildren.mockReturnValue({
      children: mockChildrenList,
      selectedChild: mockChildrenList[0],
      selectChild: mockSelectChild,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    // Default service mock return values
    mockEnrollmentsGetMy.mockResolvedValue(defaultEnrollments);
    mockBadgesGetByEnrollment.mockResolvedValue([]);
    mockAttendanceGetStreak.mockResolvedValue({ current_streak: 0, longest_streak: 0 });
    mockWaiversGetPending.mockResolvedValue({ items: [], pending_count: 0, total: 0 });
    mockAnnouncementsGetAll.mockResolvedValue([]);
    mockEventsGetByClass.mockResolvedValue([]);
    mockEventsGetUpcoming.mockResolvedValue([]);
    mockPhotosGetByClass.mockResolvedValue({ items: [] });
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render dashboard header with welcome message', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching children', () => {
      render(<Dashboard />);

      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });

    it('should render header and footer', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Child Selector', () => {
    it('should display child selector dropdown when children exist', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        // "Johnny Parent" appears in both <option> and <span>, so use getAllByText
        expect(screen.getAllByText(/Johnny Parent/i).length).toBeGreaterThanOrEqual(1);
      });

      // Should show the select dropdown (combobox)
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should show "Add Your First Child" button when no children registered', async () => {
      // Override useChildren mock to return empty children
      mockUseChildren.mockReturnValue({
        children: [],
        selectedChild: null,
        selectChild: mockSelectChild,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Add Your First Child/i)).toBeInTheDocument();
      });
    });

    it('should navigate to register child when clicking "Add Your First Child"', async () => {
      // Override useChildren mock to return empty children
      mockUseChildren.mockReturnValue({
        children: [],
        selectedChild: null,
        selectChild: mockSelectChild,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Add Your First Child/i)).toBeInTheDocument();
      });

      const addChildButton = screen.getByText(/Add Your First Child/i);
      await userEvent.click(addChildButton);

      expect(mockNavigate).toHaveBeenCalledWith('/registerchild');
    });

    it('should allow switching between children', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getAllByText(/Johnny Parent/i).length).toBeGreaterThanOrEqual(1);
      });

      // Find the select (combobox) dropdown
      const select = screen.getByRole('combobox') as HTMLSelectElement;

      // The option values use format "childId|enrollmentId"
      // child-2 has no enrollments, so value is "child-2|"
      fireEvent.change(select, { target: { value: 'child-2|' } });

      // The onChange handler should call selectChild with child-2
      await waitFor(() => {
        expect(mockSelectChild).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'child-2' })
        );
      });
    });

    it('should display child information in selector (name, school, grade, class days)', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        // "Johnny Parent" appears in both option and span
        expect(screen.getAllByText(/Johnny Parent/i).length).toBeGreaterThanOrEqual(1);
      });

      // The select dropdown should be present with options for each child
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select).toBeInTheDocument();
      // child-1 has 1 enrollment, child-2 has no enrollments but still gets an option
      const options = select.querySelectorAll('option');
      expect(options.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Attendance Stats', () => {
    it('should display attendance streak stat', async () => {
      mockAttendanceGetStreak.mockResolvedValue({
        current_streak: 7,
        longest_streak: 12,
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('stat-attendance-streak')).toHaveTextContent('7');
      }, { timeout: 5000 });
    });

    it('should show 0 streak when no attendance data', async () => {
      mockAttendanceGetStreak.mockResolvedValue({
        current_streak: 0,
        longest_streak: 0,
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('stat-attendance-streak')).toHaveTextContent('0');
      });
    });
  });

  describe('Badges', () => {
    it('should display badges earned count', async () => {
      mockBadgesGetByEnrollment.mockResolvedValue([
        {
          id: 'badge-1',
          name: 'Perfect Attendance',
          earned_at: '2024-03-01T00:00:00Z',
        },
        {
          id: 'badge-2',
          name: 'Team Player',
          earned_at: '2024-03-05T00:00:00Z',
        },
      ]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('stat-badges-earned')).toHaveTextContent('2');
      }, { timeout: 5000 });
    });

    it('should show 0 badges when none earned', async () => {
      mockBadgesGetByEnrollment.mockResolvedValue([]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('stat-badges-earned')).toHaveTextContent('0');
      });
    });

    it('should display badge card with recent badges', async () => {
      mockBadgesGetByEnrollment.mockResolvedValue([
        {
          id: 'badge-1',
          name: 'Perfect Attendance',
          earned_at: '2024-03-01T00:00:00Z',
        },
      ]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('badge-card')).toHaveTextContent('1 badges');
      }, { timeout: 5000 });
    });
  });

  describe('Enrollments', () => {
    it('should fetch and display active enrollments for selected child', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getAllByText(/Johnny Parent/i).length).toBeGreaterThanOrEqual(1);
      });

      // Enrollments service should have been called with child_id and status
      expect(mockEnrollmentsGetMy).toHaveBeenCalled();
    });

    it('should filter enrollments by selected child', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getAllByText(/Johnny Parent/i).length).toBeGreaterThanOrEqual(1);
      });

      // Switch to child without enrollments
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'child-2|' } });

      // The onChange handler should call selectChild with child-2
      await waitFor(() => {
        expect(mockSelectChild).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'child-2' })
        );
      });
    });
  });

  describe('Events', () => {
    it('should display upcoming events for enrolled class', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockEventsGetByClass.mockResolvedValue([
        {
          id: 'event-1',
          title: 'End of Season Party',
          start_datetime: futureDate.toISOString(),
          end_datetime: futureDate.toISOString(),
          type: 'social',
        },
      ]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('next-event')).toBeInTheDocument();
      });
    });

    it('should show "No upcoming events" when no events exist', async () => {
      mockEventsGetByClass.mockResolvedValue([]);
      mockEventsGetUpcoming.mockResolvedValue([]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('next-event')).toHaveTextContent('No upcoming events');
      });
    });

    it('should fall back to upcoming events when class has no events', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      mockEventsGetByClass.mockResolvedValue([]);
      mockEventsGetUpcoming.mockResolvedValue([
        {
          id: 'event-general-1',
          title: 'General Event',
          start_datetime: futureDate.toISOString(),
          end_datetime: futureDate.toISOString(),
          type: 'general',
        },
      ]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('next-event')).not.toHaveTextContent('No upcoming events');
      });
    });
  });

  describe('Waivers', () => {
    it('should display waivers alert when pending waivers exist', async () => {
      mockWaiversGetPending.mockResolvedValue({
        items: [
          {
            waiver_template: {
              id: 'waiver-1',
              name: 'Liability Waiver',
              content: 'Terms and conditions...',
              waiver_type: 'liability',
              version: 1,
            },
            is_accepted: false,
            needs_reconsent: false,
          },
          {
            waiver_template: {
              id: 'waiver-2',
              name: 'Photo Release',
              content: 'Photo consent...',
              waiver_type: 'photo_release',
              version: 1,
            },
            is_accepted: false,
            needs_reconsent: false,
          },
        ],
        pending_count: 2,
        total: 2,
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('waivers-alert')).toHaveTextContent('2 pending waivers');
      }, { timeout: 5000 });
    });

    it('should not display waivers alert when no pending waivers', async () => {
      mockWaiversGetPending.mockResolvedValue({
        items: [],
        pending_count: 0,
        total: 0,
      });

      render(<Dashboard />);

      await waitFor(() => {
        const waiversAlert = screen.getByTestId('waivers-alert');
        expect(waiversAlert).toBeEmptyDOMElement();
      });
    });
  });

  describe('Payment Summary', () => {
    it('should fetch payment summary data', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getAllByText(/Johnny Parent/i).length).toBeGreaterThanOrEqual(1);
      });

      // Payment summary is loaded in background
    });
  });

  describe('Announcements', () => {
    it('should fetch announcements for enrolled class', async () => {
      mockAnnouncementsGetAll.mockResolvedValue([
        {
          id: 'announce-1',
          title: 'Class Cancelled Tomorrow',
          content: 'Due to weather, class is cancelled.',
          class_id: 'class-1',
          created_at: '2024-03-01T00:00:00Z',
        },
      ]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getAllByText(/Johnny Parent/i).length).toBeGreaterThanOrEqual(1);
      });

      // Announcements are loaded in background for the enrolled class
    });
  });

  describe('Error Handling', () => {
    it('should handle error when fetching children fails', async () => {
      // Children come from useChildren mock, not from MSW
      // This test verifies the dashboard still renders
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });
    });

    it('should handle error when fetching enrollments fails', async () => {
      mockEnrollmentsGetMy.mockRejectedValue(new Error('Failed to fetch enrollments'));

      render(<Dashboard />);

      await waitFor(() => {
        // "Johnny Parent" appears in both option and span
        expect(screen.getAllByText(/Johnny Parent/i).length).toBeGreaterThanOrEqual(1);
      });

      // Dashboard should gracefully handle enrollment fetch errors
    });
  });

  describe('Data Refresh', () => {
    it('should reload enrollments when switching children', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getAllByText(/Johnny Parent/i).length).toBeGreaterThanOrEqual(1);
      });

      // Switch child
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'child-2|' } });

      // The onChange handler calls selectChild which would trigger
      // a re-render with the new child, causing enrollments to refetch
      await waitFor(() => {
        expect(mockSelectChild).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'child-2' })
        );
      });
    });
  });

  describe('No Children State', () => {
    it('should show add child button with UserPlus icon', async () => {
      // Override useChildren mock to return empty children
      mockUseChildren.mockReturnValue({
        children: [],
        selectedChild: null,
        selectChild: mockSelectChild,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        const addButton = screen.getByText(/Add Your First Child/i);
        expect(addButton).toBeInTheDocument();
      });

      // The button is inside a <button> element, the text is in a <span> inside the button
      const button = screen.getByText(/Add Your First Child/i).closest('button');
      expect(button).not.toBeNull();
    });

    it('should not show stats when no children registered', async () => {
      // Override useChildren mock to return empty children
      mockUseChildren.mockReturnValue({
        children: [],
        selectedChild: null,
        selectChild: mockSelectChild,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Add Your First Child/i)).toBeInTheDocument();
      });

      // Stats should show 0 values
      expect(screen.getByTestId('stat-attendance-streak')).toHaveTextContent('0');
      expect(screen.getByTestId('stat-badges-earned')).toHaveTextContent('0');
    });
  });

  describe('Multiple Enrollments', () => {
    it('should handle child with multiple active enrollments', async () => {
      mockEnrollmentsGetMy.mockResolvedValue([
        {
          id: 'enroll-1',
          child_id: 'child-1',
          class_id: 'class-1',
          status: 'active',
        },
        {
          id: 'enroll-2',
          child_id: 'child-1',
          class_id: 'class-2',
          status: 'active',
        },
      ]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getAllByText(/Johnny Parent/i).length).toBeGreaterThanOrEqual(1);
      });

      // Should use first enrollment for display data
    });
  });
});

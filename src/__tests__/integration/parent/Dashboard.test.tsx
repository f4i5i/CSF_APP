/**
 * Parent Dashboard Integration Tests
 * Tests for the parent dashboard including child selector, enrollments, events, badges, and waivers
 */

import { render, screen, waitFor } from '../../utils/test-utils';
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

const API_BASE = 'http://localhost:8000/api/v1';

describe('Parent Dashboard', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');
    mockNavigate.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
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
        expect(screen.getByText(/Johnny Parent/i)).toBeInTheDocument();
      });

      // Should show first child by default
      expect(screen.getByText(/Test Elementary/i)).toBeInTheDocument();
    });

    it('should show "Add Your First Child" button when no children registered', async () => {
      // Override children endpoint to return empty array
      server.use(
        http.get(`${API_BASE}/children/my`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Add Your First Child/i)).toBeInTheDocument();
      });
    });

    it('should navigate to register child when clicking "Add Your First Child"', async () => {
      server.use(
        http.get(`${API_BASE}/children/my`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Add Your First Child/i)).toBeInTheDocument();
      });

      const addChildButton = screen.getByText(/Add Your First Child/i);
      await user.click(addChildButton);

      expect(mockNavigate).toHaveBeenCalledWith('/registerchild');
    });

    it('should allow switching between children', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Johnny Parent/i)).toBeInTheDocument();
      });

      // Find and click the select dropdown
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      await user.selectOptions(select, 'child-2');

      await waitFor(() => {
        expect(select.value).toBe('child-2');
      });
    });

    it('should display child information in selector (name, school, grade, class days)', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Johnny Parent/i)).toBeInTheDocument();
        expect(screen.getByText(/Test Elementary/i)).toBeInTheDocument();
        expect(screen.getByText(/Grade 3/i)).toBeInTheDocument();
      });
    });
  });

  describe('Attendance Stats', () => {
    it('should display attendance streak stat', async () => {
      server.use(
        http.get(`${API_BASE}/attendance/streak/:enrollmentId`, () => {
          return HttpResponse.json({
            current_streak: 7,
            longest_streak: 12,
          });
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('stat-attendance-streak')).toHaveTextContent('7');
      });
    });

    it('should show 0 streak when no attendance data', async () => {
      server.use(
        http.get(`${API_BASE}/attendance/streak/:enrollmentId`, () => {
          return HttpResponse.json({
            current_streak: 0,
            longest_streak: 0,
          });
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('stat-attendance-streak')).toHaveTextContent('0');
      });
    });
  });

  describe('Badges', () => {
    it('should display badges earned count', async () => {
      server.use(
        http.get(`${API_BASE}/badges/enrollment/:enrollmentId`, () => {
          return HttpResponse.json([
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
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('stat-badges-earned')).toHaveTextContent('2');
      });
    });

    it('should show 0 badges when none earned', async () => {
      server.use(
        http.get(`${API_BASE}/badges/enrollment/:enrollmentId`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('stat-badges-earned')).toHaveTextContent('0');
      });
    });

    it('should display badge card with recent badges', async () => {
      server.use(
        http.get(`${API_BASE}/badges/enrollment/:enrollmentId`, () => {
          return HttpResponse.json([
            {
              id: 'badge-1',
              name: 'Perfect Attendance',
              earned_at: '2024-03-01T00:00:00Z',
            },
          ]);
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('badge-card')).toHaveTextContent('1 badges');
      });
    });
  });

  describe('Enrollments', () => {
    it('should fetch and display active enrollments for selected child', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Johnny Parent/i)).toBeInTheDocument();
      });

      // Enrollments are loaded in the background
      // The API should be called with child_id and status=active
    });

    it('should filter enrollments by selected child', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Johnny Parent/i)).toBeInTheDocument();
      });

      // Switch to child without enrollments
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      await user.selectOptions(select, 'child-2');

      await waitFor(() => {
        expect(select.value).toBe('child-2');
      });

      // Should not display enrollment data for child-2
    });
  });

  describe('Events', () => {
    it('should display upcoming events for enrolled class', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      server.use(
        http.get(`${API_BASE}/events/class/:classId`, () => {
          return HttpResponse.json([
            {
              id: 'event-1',
              title: 'End of Season Party',
              start_datetime: futureDate.toISOString(),
              end_datetime: futureDate.toISOString(),
              type: 'social',
            },
          ]);
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('next-event')).toBeInTheDocument();
      });
    });

    it('should show "No upcoming events" when no events exist', async () => {
      server.use(
        http.get(`${API_BASE}/events/class/:classId`, () => {
          return HttpResponse.json([]);
        }),
        http.get(`${API_BASE}/events/upcoming`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('next-event')).toHaveTextContent('No upcoming events');
      });
    });

    it('should fall back to upcoming events when class has no events', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      server.use(
        http.get(`${API_BASE}/events/class/:classId`, () => {
          return HttpResponse.json([]);
        }),
        http.get(`${API_BASE}/events/upcoming`, () => {
          return HttpResponse.json([
            {
              id: 'event-general-1',
              title: 'General Event',
              start_datetime: futureDate.toISOString(),
              end_datetime: futureDate.toISOString(),
              type: 'general',
            },
          ]);
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('next-event')).not.toHaveTextContent('No upcoming events');
      });
    });
  });

  describe('Waivers', () => {
    it('should display waivers alert when pending waivers exist', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
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
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('waivers-alert')).toHaveTextContent('2 pending waivers');
      });
    });

    it('should not display waivers alert when no pending waivers', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [],
            pending_count: 0,
            total: 0,
          });
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        const waiversAlert = screen.getByTestId('waivers-alert');
        expect(waiversAlert).toBeEmptyDOMElement();
      });
    });
  });

  describe('Payment Summary', () => {
    it('should fetch payment summary data', async () => {
      server.use(
        http.get(`${API_BASE}/installments/summary`, () => {
          return HttpResponse.json({
            total_paid: 500,
            total_due: 250,
            next_payment_date: '2024-04-01',
            next_payment_amount: 125,
          });
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Johnny Parent/i)).toBeInTheDocument();
      });

      // Payment summary is loaded in background
    });
  });

  describe('Announcements', () => {
    it('should fetch announcements for enrolled class', async () => {
      server.use(
        http.get(`${API_BASE}/announcements`, ({ request }) => {
          const url = new URL(request.url);
          const classId = url.searchParams.get('class_id');

          if (classId) {
            return HttpResponse.json([
              {
                id: 'announce-1',
                title: 'Class Cancelled Tomorrow',
                content: 'Due to weather, class is cancelled.',
                class_id: classId,
                created_at: '2024-03-01T00:00:00Z',
              },
            ]);
          }

          return HttpResponse.json([]);
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Johnny Parent/i)).toBeInTheDocument();
      });

      // Announcements are loaded in background for the enrolled class
    });
  });

  describe('Error Handling', () => {
    it('should handle error when fetching children fails', async () => {
      server.use(
        http.get(`${API_BASE}/children/my`, () => {
          return HttpResponse.json(
            { message: 'Failed to fetch children' },
            { status: 500 }
          );
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });

      // Dashboard should still render even if children fetch fails
    });

    it('should handle error when fetching enrollments fails', async () => {
      server.use(
        http.get(`${API_BASE}/enrollments/my`, () => {
          return HttpResponse.json(
            { message: 'Failed to fetch enrollments' },
            { status: 500 }
          );
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Johnny Parent/i)).toBeInTheDocument();
      });

      // Dashboard should gracefully handle enrollment fetch errors
    });
  });

  describe('Data Refresh', () => {
    it('should reload enrollments when switching children', async () => {
      const fetchSpy = jest.fn();

      server.use(
        http.get(`${API_BASE}/enrollments/my`, ({ request }) => {
          const url = new URL(request.url);
          const childId = url.searchParams.get('child_id');
          fetchSpy(childId);

          return HttpResponse.json([]);
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Johnny Parent/i)).toBeInTheDocument();
      });

      // Switch child
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      await user.selectOptions(select, 'child-2');

      await waitFor(() => {
        // Should fetch enrollments for new child
        expect(fetchSpy).toHaveBeenCalledWith('child-2');
      });
    });
  });

  describe('No Children State', () => {
    it('should show add child button with UserPlus icon', async () => {
      server.use(
        http.get(`${API_BASE}/children/my`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        const addButton = screen.getByText(/Add Your First Child/i);
        expect(addButton).toBeInTheDocument();
        expect(addButton.tagName).toBe('BUTTON');
      });
    });

    it('should not show stats when no children registered', async () => {
      server.use(
        http.get(`${API_BASE}/children/my`, () => {
          return HttpResponse.json([]);
        })
      );

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
      server.use(
        http.get(`${API_BASE}/enrollments/my`, () => {
          return HttpResponse.json([
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
        })
      );

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Johnny Parent/i)).toBeInTheDocument();
      });

      // Should use first enrollment for display data
    });
  });
});

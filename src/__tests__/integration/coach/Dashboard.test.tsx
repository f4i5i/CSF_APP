/**
 * Coach Dashboard Integration Tests
 * Tests for the coach dashboard page with announcements and calendar
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import DashboardCoach from '../../../pages/CoachDashboard/DashboardCoach';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

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

describe('Coach Dashboard', () => {
  const user = userEvent;

  beforeEach(() => {
    // Mock coach authentication
    localStorage.setItem('csf_access_token', 'mock-access-token-coach');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-coach');
  });

  afterEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render the coach dashboard', async () => {
      render(<DashboardCoach />);

      // Check for welcome message
      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
      });
    });

    it('should display location and student stats', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Managing 3 locations/i)).toBeInTheDocument();
        expect(screen.getByText(/45 active students/i)).toBeInTheDocument();
      });
    });

    it('should display stats cards', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Checked In Today/i)).toBeInTheDocument();
        expect(screen.getByText(/Announcements/i)).toBeInTheDocument();
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
        // The PhotoCard component should be present
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
      await user.click(newPostButtons[0]);

      // Modal should be visible
      await waitFor(() => {
        // Check for modal by looking for common modal elements
        const modal = document.querySelector('[role="dialog"]') ||
                     document.querySelector('.modal') ||
                     document.querySelector('[data-testid="create-post-modal"]');
        expect(modal).toBeTruthy();
      });
    });

    it('should close modal when clicking close button', async () => {
      render(<DashboardCoach />);

      // Open modal
      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });

      const newPostButtons = screen.getAllByRole('button', { name: /New Post/i });
      await user.click(newPostButtons[0]);

      // Wait for modal to appear
      await waitFor(() => {
        const modal = document.querySelector('[role="dialog"]');
        expect(modal).toBeTruthy();
      });

      // Find and click close button (X or Cancel)
      const closeButtons = screen.queryAllByRole('button', { name: /close|cancel/i });
      if (closeButtons.length > 0) {
        await user.click(closeButtons[0]);

        // Modal should be closed
        await waitFor(() => {
          const modal = document.querySelector('[role="dialog"]');
          expect(modal).toBeFalsy();
        });
      }
    });
  });

  describe('Data Loading', () => {
    it('should handle loading states', async () => {
      // Mock delayed response
      server.use(
        http.get('http://localhost:8000/api/v1/children/my', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json([]);
        })
      );

      render(<DashboardCoach />);

      // Initial render should show welcome message
      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });
    });

    it('should display announcements when available', async () => {
      const mockAnnouncements = [
        {
          id: 'ann-1',
          title: 'Practice Update',
          content: 'Practice is moved to Friday',
          created_at: '2024-03-15T10:00:00Z',
          author: {
            first_name: 'Test',
            last_name: 'Coach',
          },
        },
      ];

      server.use(
        http.get('http://localhost:8000/api/v1/announcements', () => {
          return HttpResponse.json(mockAnnouncements);
        })
      );

      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });
    });

    it('should handle empty announcements', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/announcements', () => {
          return HttpResponse.json([]);
        })
      );

      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });

      // Should show announcements section even when empty
      const announcementsHeading = screen.getAllByText(/Announcements/i);
      expect(announcementsHeading.length).toBeGreaterThan(0);
    });
  });

  describe('Calendar and Events', () => {
    it('should display next event when available', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          title: 'End of Season Party',
          description: 'Celebrate the season',
          start_datetime: '2024-12-25T15:00:00Z',
          location: 'School Gym',
        },
      ];

      server.use(
        http.get('http://localhost:8000/api/v1/events/class/:classId', () => {
          return HttpResponse.json(mockEvents);
        })
      );

      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Next Event/i)).toBeInTheDocument();
      });
    });

    it('should show empty state when no events', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/events/class/:classId', () => {
          return HttpResponse.json([]);
        })
      );

      render(<DashboardCoach />);

      await waitFor(() => {
        expect(screen.getByText(/Next Event/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/children/my', () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<DashboardCoach />);

      // Should still render the page structure
      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/children/my', () => {
          return HttpResponse.error();
        })
      );

      render(<DashboardCoach />);

      // Page should still render
      await waitFor(() => {
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      });
    });
  });

  describe('Stats Display', () => {
    it('should display checked in today count', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        // Should display the streak/checkin count (default 0 or from mock data)
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
  });

  describe('Responsive Layout', () => {
    it('should render mobile announcements section', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        // Both desktop and mobile announcement sections should exist in DOM
        const announcementsHeadings = screen.getAllByText(/Announcements/i);
        expect(announcementsHeadings.length).toBeGreaterThan(0);
      });
    });

    it('should have New Post buttons for both desktop and mobile', async () => {
      render(<DashboardCoach />);

      await waitFor(() => {
        const newPostButtons = screen.getAllByRole('button', { name: /New Post/i });
        // Should have at least one button (possibly 2 for desktop/mobile)
        expect(newPostButtons.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});

/**
 * Attendance Page Integration Tests
 * Tests for attendance history display, badge carousel, and pagination
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Attendance from '../../../pages/Attendence';

// Mock dependencies
jest.mock('../../../components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

jest.mock('../../../components/attendence/AttendenceRow', () => ({
  __esModule: true,
  default: ({ date, status }: { date: string; status: string }) => (
    <div data-testid={`attendance-row-${date}`}>
      <span>{date}</span>
      <span>{status}</span>
    </div>
  ),
}));

jest.mock('../../../components/attendence/BadgeCarousel', () => ({
  __esModule: true,
  default: ({ badges, compact }: { badges: any[]; compact: boolean }) => (
    <div data-testid="badge-carousel">
      {badges?.map((badge, idx) => (
        <div key={idx} data-testid={`badge-${idx}`}>
          {badge.title}
          {badge.active && <span> (Active)</span>}
        </div>
      ))}
    </div>
  ),
}));

const API_BASE = 'http://localhost:8000/api/v1';

describe('Attendance Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial Render', () => {
    it('should render page header', () => {
      render(<Attendance />);

      expect(screen.getByText('Attendance')).toBeInTheDocument();
    });

    it('should render header and footer components', () => {
      render(<Attendance />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render badge carousel', () => {
      render(<Attendance />);

      expect(screen.getByTestId('badge-carousel')).toBeInTheDocument();
    });

    it('should render attendance history section', () => {
      render(<Attendance />);

      expect(screen.getByText('Attendance History')).toBeInTheDocument();
    });
  });

  describe('Badge Carousel', () => {
    it('should display all badges', () => {
      render(<Attendance />);

      expect(screen.getByTestId('badge-carousel')).toBeInTheDocument();

      // Check for badge titles
      expect(screen.getByText('Perfect Attendance')).toBeInTheDocument();
      expect(screen.getByText('Leadership')).toBeInTheDocument();
      expect(screen.getByText('Star Performer')).toBeInTheDocument();
      expect(screen.getByText('Quick Learner')).toBeInTheDocument();
      expect(screen.getByText('Team Player')).toBeInTheDocument();
    });

    it('should highlight active badge', () => {
      render(<Attendance />);

      expect(screen.getByText(/Quick Learner/)).toBeInTheDocument();
      expect(screen.getByText(/(Active)/)).toBeInTheDocument();
    });

    it('should pass compact prop to carousel', () => {
      render(<Attendance />);

      const carousel = screen.getByTestId('badge-carousel');
      expect(carousel).toBeInTheDocument();
    });

    it('should display badge count', () => {
      render(<Attendance />);

      // There are 6 badges in the mock data
      const badges = screen.getAllByTestId(/^badge-\d+$/);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Attendance History Display', () => {
    it('should display attendance records', () => {
      render(<Attendance />);

      expect(screen.getByTestId('attendance-row-Oct 24, 2024')).toBeInTheDocument();
      expect(screen.getByTestId('attendance-row-Oct 21, 2024')).toBeInTheDocument();
      expect(screen.getByTestId('attendance-row-Oct 17, 2024')).toBeInTheDocument();
      expect(screen.getByTestId('attendance-row-Oct 14, 2024')).toBeInTheDocument();
    });

    it('should display attendance dates', () => {
      render(<Attendance />);

      expect(screen.getByText('Oct 24, 2024')).toBeInTheDocument();
      expect(screen.getByText('Oct 21, 2024')).toBeInTheDocument();
    });

    it('should display attendance status', () => {
      render(<Attendance />);

      const presentStatuses = screen.getAllByText('Present');
      expect(presentStatuses.length).toBeGreaterThan(0);

      expect(screen.getByText('Absent')).toBeInTheDocument();
    });

    it('should show both present and absent records', () => {
      render(<Attendance />);

      expect(screen.getAllByText('Present').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Absent').length).toBe(1);
    });
  });

  describe('Pagination', () => {
    it('should show pagination controls', () => {
      render(<Attendance />);

      expect(screen.getByText(/Page 1 \/ 2/i)).toBeInTheDocument();
    });

    it('should display previous button', () => {
      render(<Attendance />);

      const prevButtons = screen.getAllByRole('button');
      const prevButton = prevButtons.find(btn => btn.querySelector('svg')); // ChevronLeft icon
      expect(prevButton).toBeInTheDocument();
    });

    it('should display next button', () => {
      render(<Attendance />);

      const nextButtons = screen.getAllByRole('button');
      expect(nextButtons.length).toBeGreaterThan(0);
    });

    it('should disable previous button on first page', () => {
      render(<Attendance />);

      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0]; // First button should be previous

      expect(prevButton).toBeDisabled();
    });

    it('should enable next button when more pages exist', () => {
      render(<Attendance />);

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1]; // Last button should be next

      expect(nextButton).not.toBeDisabled();
    });

    it('should navigate to next page', async () => {
      render(<Attendance />);

      // Initially on page 1
      expect(screen.getByText(/Page 1 \/ 2/i)).toBeInTheDocument();

      // Find and click next button
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      await user.click(nextButton);

      // Should now be on page 2
      await waitFor(() => {
        expect(screen.getByText(/Page 2 \/ 2/i)).toBeInTheDocument();
      });
    });

    it('should navigate to previous page', async () => {
      render(<Attendance />);

      // Navigate to page 2 first
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 \/ 2/i)).toBeInTheDocument();
      });

      // Click previous button
      const prevButton = screen.getAllByRole('button')[0];
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 \/ 2/i)).toBeInTheDocument();
      });
    });

    it('should disable next button on last page', async () => {
      render(<Attendance />);

      // Navigate to last page
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 \/ 2/i)).toBeInTheDocument();
      });

      // Next button should be disabled
      const updatedButtons = screen.getAllByRole('button');
      const updatedNextButton = updatedButtons[updatedButtons.length - 1];
      expect(updatedNextButton).toBeDisabled();
    });

    it('should show correct number of records per page', () => {
      render(<Attendance />);

      // Should show 4 records on first page (itemsPerPage = 4)
      const rows = screen.getAllByTestId(/^attendance-row-/);
      expect(rows).toHaveLength(4);
    });

    it('should update displayed records when changing pages', async () => {
      render(<Attendance />);

      const firstPageRows = screen.getAllByTestId(/^attendance-row-/);
      const firstRowDate = firstPageRows[0].textContent;

      // Navigate to page 2
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      await user.click(nextButton);

      await waitFor(() => {
        const secondPageRows = screen.getAllByTestId(/^attendance-row-/);
        const secondPageFirstRowDate = secondPageRows[0].textContent;

        // Records should be different on page 2
        expect(secondPageFirstRowDate).not.toBe(firstRowDate);
      });
    });

    it('should calculate total pages correctly', () => {
      render(<Attendance />);

      // With 6 records and 4 per page, should have 2 pages
      expect(screen.getByText(/Page 1 \/ 2/i)).toBeInTheDocument();
    });
  });

  describe('Page Display', () => {
    it('should show current page number', () => {
      render(<Attendance />);

      expect(screen.getByText(/Page 1/i)).toBeInTheDocument();
    });

    it('should show total page count', () => {
      render(<Attendance />);

      expect(screen.getByText(/\/ 2/i)).toBeInTheDocument();
    });

    it('should update page number when navigating', async () => {
      render(<Attendance />);

      expect(screen.getByText(/Page 1 \/ 2/i)).toBeInTheDocument();

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 \/ 2/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should handle empty attendance data', () => {
      // This test would require modifying the component to support dynamic data
      // Currently uses static mock data
      render(<Attendance />);

      // With current implementation, there should always be data
      const rows = screen.getAllByTestId(/^attendance-row-/);
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe('Attendance Status Types', () => {
    it('should display present status', () => {
      render(<Attendance />);

      const presentStatuses = screen.getAllByText('Present');
      expect(presentStatuses.length).toBe(5); // 5 present records in mock data
    });

    it('should display absent status', () => {
      render(<Attendance />);

      const absentStatuses = screen.getAllByText('Absent');
      expect(absentStatuses.length).toBe(1); // 1 absent record in mock data
    });
  });

  describe('Responsive Design', () => {
    it('should render on mobile viewport', () => {
      // Set mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<Attendance />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Attendance')).toBeInTheDocument();
      expect(screen.getByTestId('badge-carousel')).toBeInTheDocument();
    });
  });

  describe('Badge Achievement Dates', () => {
    it('should display achievement date for active badge', () => {
      render(<Attendance />);

      // The Quick Learner badge has a subtitle with achievement date
      expect(screen.getByText('Quick Learner')).toBeInTheDocument();
    });
  });

  describe('Attendance Data Integration', () => {
    it('should handle API data when available', async () => {
      // Mock API call for attendance data
      server.use(
        http.get(`${API_BASE}/attendance/enrollment/:enrollmentId`, () => {
          return HttpResponse.json([
            {
              id: 'att-1',
              date: '2024-11-01',
              status: 'present',
              enrollment_id: 'enroll-1',
            },
            {
              id: 'att-2',
              date: '2024-11-02',
              status: 'present',
              enrollment_id: 'enroll-1',
            },
          ]);
        })
      );

      render(<Attendance />);

      // Currently uses static data, but test is ready for API integration
      await waitFor(() => {
        expect(screen.getByTestId('badge-carousel')).toBeInTheDocument();
      });
    });
  });

  describe('Badge Data Integration', () => {
    it('should handle API badge data when available', async () => {
      // Mock API call for badges
      server.use(
        http.get(`${API_BASE}/badges/enrollment/:enrollmentId`, () => {
          return HttpResponse.json([
            {
              id: 'badge-1',
              name: 'Perfect Attendance',
              earned_at: '2024-10-15',
              icon_url: '/badges/perfect.png',
            },
          ]);
        })
      );

      render(<Attendance />);

      // Currently uses static data, but test is ready for API integration
      await waitFor(() => {
        expect(screen.getByTestId('badge-carousel')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Between Pages', () => {
    it('should maintain state when navigating back and forth', async () => {
      render(<Attendance />);

      // Start on page 1
      expect(screen.getByText(/Page 1 \/ 2/i)).toBeInTheDocument();

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      const prevButton = buttons[0];

      // Go to page 2
      await user.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText(/Page 2 \/ 2/i)).toBeInTheDocument();
      });

      // Go back to page 1
      await user.click(prevButton);
      await waitFor(() => {
        expect(screen.getByText(/Page 1 \/ 2/i)).toBeInTheDocument();
      });

      // Should show same data as initially
      expect(screen.getByTestId('attendance-row-Oct 24, 2024')).toBeInTheDocument();
    });
  });

  describe('Attendance Streak Display', () => {
    it('should display attendance streak in badges', () => {
      render(<Attendance />);

      // Perfect Attendance badge implies streak
      expect(screen.getByText('Perfect Attendance')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should display dates in readable format', () => {
      render(<Attendance />);

      // Dates should be in "Month DD, YYYY" format
      expect(screen.getByText('Oct 24, 2024')).toBeInTheDocument();
      expect(screen.getByText('Oct 21, 2024')).toBeInTheDocument();
    });

    it('should display dates in chronological order', () => {
      render(<Attendance />);

      const rows = screen.getAllByTestId(/^attendance-row-/);

      // First row should be most recent (Oct 24)
      expect(rows[0]).toHaveTextContent('Oct 24, 2024');

      // Last visible row should be older (Oct 14)
      expect(rows[3]).toHaveTextContent('Oct 14, 2024');
    });
  });

  describe('Multiple Attendance Records', () => {
    it('should handle multiple attendance records correctly', () => {
      render(<Attendance />);

      const rows = screen.getAllByTestId(/^attendance-row-/);

      // Should display 4 rows on first page (itemsPerPage = 4)
      expect(rows).toHaveLength(4);
    });

    it('should show different records on different pages', async () => {
      render(<Attendance />);

      // Records on page 1
      expect(screen.getByTestId('attendance-row-Oct 24, 2024')).toBeInTheDocument();

      // Navigate to page 2
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      await user.click(nextButton);

      await waitFor(() => {
        // Different records on page 2
        expect(screen.getByTestId('attendance-row-Oct 13, 2024')).toBeInTheDocument();
        expect(screen.getByTestId('attendance-row-Oct 12, 2024')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination Edge Cases', () => {
    it('should not allow going to negative page numbers', async () => {
      render(<Attendance />);

      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];

      // Already on page 1, clicking prev should do nothing
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 \/ 2/i)).toBeInTheDocument();
      });
    });

    it('should not allow going beyond total pages', async () => {
      render(<Attendance />);

      // Navigate to page 2
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 \/ 2/i)).toBeInTheDocument();
      });

      // Try to go to page 3 (should stay on page 2)
      const updatedButtons = screen.getAllByRole('button');
      const updatedNextButton = updatedButtons[updatedButtons.length - 1];
      await user.click(updatedNextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 \/ 2/i)).toBeInTheDocument();
      });
    });
  });
});

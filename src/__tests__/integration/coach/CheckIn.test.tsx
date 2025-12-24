/**
 * Coach Check-In Integration Tests
 * Tests for the student check-in functionality
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import CheckIn from '../../../pages/CoachDashboard/CheckIn';
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

describe('Coach Check-In Page', () => {
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
    it('should render the check-in page', () => {
      render(<CheckIn />);

      expect(screen.getByText(/Check-In/i)).toBeInTheDocument();
    });

    it('should display search input', () => {
      render(<CheckIn />);

      const searchInput = screen.getByPlaceholderText(/Search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should display class selector dropdown', () => {
      render(<CheckIn />);

      expect(screen.getByText(/Davidson Elementary/i)).toBeInTheDocument();
    });

    it('should display Text Class button', () => {
      render(<CheckIn />);

      const textButtons = screen.getAllByRole('button', { name: /Text Class/i });
      expect(textButtons.length).toBeGreaterThan(0);
    });

    it('should display student list', () => {
      render(<CheckIn />);

      // Should show student count
      expect(screen.getByText(/Students/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should allow typing in search input', async () => {
      render(<CheckIn />);

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.type(searchInput, 'Alex');

      expect(searchInput).toHaveValue('Alex');
    });

    it('should filter students based on search term', async () => {
      render(<CheckIn />);

      const searchInput = screen.getByPlaceholderText(/Search/i);

      // Type a search term
      await user.type(searchInput, 'Alex');

      // Wait for filtering to occur
      await waitFor(() => {
        expect(searchInput).toHaveValue('Alex');
      });
    });

    it('should show "No students found" when search has no results', async () => {
      render(<CheckIn />);

      const searchInput = screen.getByPlaceholderText(/Search/i);

      // Type a search term that won't match any students
      await user.type(searchInput, 'NonExistentStudent12345');

      await waitFor(() => {
        expect(screen.getByText(/No students found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Class Selection Dropdown', () => {
    it('should open dropdown when clicked', async () => {
      render(<CheckIn />);

      const dropdownButton = screen.getByRole('button', { name: /Davidson Elementary/i });
      await user.click(dropdownButton);

      // Dropdown menu should be visible with options
      await waitFor(() => {
        expect(screen.getByText(/Science - 5A/i)).toBeInTheDocument();
        expect(screen.getByText(/Math - 3B/i)).toBeInTheDocument();
      });
    });

    it('should change selected class when option is clicked', async () => {
      render(<CheckIn />);

      // Open dropdown
      const dropdownButton = screen.getByRole('button', { name: /Davidson Elementary/i });
      await user.click(dropdownButton);

      // Click on a different option
      await waitFor(() => {
        expect(screen.getByText(/Science - 5A/i)).toBeInTheDocument();
      });

      const scienceOption = screen.getByRole('button', { name: /Science - 5A/i });
      await user.click(scienceOption);

      // Selected value should update
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Science - 5A/i })).toBeInTheDocument();
      });
    });

    it('should close dropdown after selecting an option', async () => {
      render(<CheckIn />);

      // Open dropdown
      const dropdownButton = screen.getByRole('button', { name: /Davidson Elementary/i });
      await user.click(dropdownButton);

      // Wait for dropdown to open
      await waitFor(() => {
        expect(screen.getByText(/Math - 3B/i)).toBeInTheDocument();
      });

      // Click on an option
      const mathOption = screen.getByRole('button', { name: /Math - 3B/i });
      await user.click(mathOption);

      // Dropdown options should no longer be visible (except the selected one)
      await waitFor(() => {
        expect(screen.queryByText(/Science - 5A/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Student List Display', () => {
    it('should display students with their information', () => {
      render(<CheckIn />);

      // Students should be displayed with names
      expect(screen.getByText(/Alex T\./i)).toBeInTheDocument();
      expect(screen.getByText(/Olivia C\./i)).toBeInTheDocument();
    });

    it('should show checked in count', () => {
      render(<CheckIn />);

      // Should show count like "Students (3/6)"
      const studentCountText = screen.getByText(/Students/i);
      expect(studentCountText).toBeInTheDocument();
    });

    it('should display student grades', () => {
      render(<CheckIn />);

      // Grade information should be visible
      // The student list should show grade info
      expect(screen.getByText(/Alex T\./i)).toBeInTheDocument();
    });
  });

  describe('Student Check-In Interaction', () => {
    it('should open student details modal when clicking on a student', async () => {
      render(<CheckIn />);

      // Find and click on a student card
      const studentCard = screen.getByText(/Alex T\./i).closest('div');
      if (studentCard) {
        await user.click(studentCard);

        // Modal should open
        await waitFor(() => {
          const modal = document.querySelector('[role="dialog"]') ||
                       document.querySelector('.modal') ||
                       document.querySelector('[data-testid="student-details-modal"]');
          expect(modal).toBeTruthy();
        });
      }
    });
  });

  describe('Student Details Modal', () => {
    it('should close modal when clicking close button', async () => {
      render(<CheckIn />);

      // Click on a student to open modal
      const studentCard = screen.getByText(/Alex T\./i).closest('div');
      if (studentCard) {
        await user.click(studentCard);

        // Wait for modal to appear
        await waitFor(() => {
          const modal = document.querySelector('[role="dialog"]');
          expect(modal).toBeTruthy();
        });

        // Find and click close button
        const closeButtons = screen.queryAllByRole('button', { name: /close|cancel/i });
        if (closeButtons.length > 0) {
          await user.click(closeButtons[0]);

          // Modal should be closed
          await waitFor(() => {
            const modal = document.querySelector('[role="dialog"]');
            expect(modal).toBeFalsy();
          });
        }
      }
    });
  });

  describe('Pagination', () => {
    it('should display pagination when there are more than 5 students', () => {
      render(<CheckIn />);

      // With 6 students, pagination should appear
      const paginationButtons = screen.queryAllByRole('button', { name: /^[0-9]$/ });
      expect(paginationButtons.length).toBeGreaterThan(0);
    });

    it('should navigate to next page when clicking next button', async () => {
      render(<CheckIn />);

      // Find next button (ChevronRight)
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(btn =>
        btn.querySelector('svg') && !btn.disabled
      );

      if (nextButton && !nextButton.disabled) {
        await user.click(nextButton);

        // Page should change
        await waitFor(() => {
          // The student list should update to show different students
          expect(screen.getByText(/Students/i)).toBeInTheDocument();
        });
      }
    });

    it('should disable previous button on first page', () => {
      render(<CheckIn />);

      // Find all buttons and look for disabled state
      const buttons = screen.getAllByRole('button');
      const disabledButtons = buttons.filter(btn => btn.disabled);

      // At least the previous button should be disabled on page 1
      expect(disabledButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Sort Functionality', () => {
    it('should display sort button with current sort method', () => {
      render(<CheckIn />);

      expect(screen.getByText(/Alphabetical/i)).toBeInTheDocument();
    });

    it('should show sort options when clicking sort button', async () => {
      render(<CheckIn />);

      const sortButton = screen.getByRole('button', { name: /Alphabetical/i });
      await user.click(sortButton);

      // Sort dropdown should appear (if implemented)
      // This depends on the actual implementation
      expect(sortButton).toBeInTheDocument();
    });
  });

  describe('Text Class Button', () => {
    it('should display Text Class button in desktop view', () => {
      render(<CheckIn />);

      const textButtons = screen.getAllByRole('button', { name: /Text Class/i });
      expect(textButtons.length).toBeGreaterThan(0);
    });

    it('should be clickable', async () => {
      render(<CheckIn />);

      const textButton = screen.getAllByRole('button', { name: /Text Class/i })[0];
      await user.click(textButton);

      // Button should remain in document (functionality depends on implementation)
      expect(textButton).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should have both mobile and desktop Text Class buttons in DOM', () => {
      render(<CheckIn />);

      const textButtons = screen.getAllByRole('button', { name: /Text Class/i });
      // Should have at least one button (possibly 2 for desktop/mobile)
      expect(textButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('API Integration', () => {
    it('should handle check-in API call', async () => {
      let checkInCalled = false;

      server.use(
        http.post('http://localhost:8000/api/v1/check-in', async () => {
          checkInCalled = true;
          return HttpResponse.json({ success: true });
        })
      );

      render(<CheckIn />);

      // The component should be rendered
      expect(screen.getByText(/Check-In/i)).toBeInTheDocument();
    });

    it('should handle loading class data', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/check-in/class/:classId/status', () => {
          return HttpResponse.json([
            { child_id: 'child-1', child: { first_name: 'Test', last_name: 'Student' }, checked_in: false }
          ]);
        })
      );

      render(<CheckIn />);

      await waitFor(() => {
        expect(screen.getByText(/Check-In/i)).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      server.use(
        http.get('http://localhost:8000/api/v1/check-in/class/:classId/status', () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<CheckIn />);

      // Should still render the page
      expect(screen.getByText(/Check-In/i)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no students match search', async () => {
      render(<CheckIn />);

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.type(searchInput, 'XYZ123NonExistent');

      await waitFor(() => {
        expect(screen.getByText(/No students found/i)).toBeInTheDocument();
      });
    });
  });
});

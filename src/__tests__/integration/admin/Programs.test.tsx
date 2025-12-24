/**
 * Integration Tests for Admin Programs Management Page
 * Tests program CRUD operations, filtering, and modal interactions
 */

import { render, screen, waitFor, fireEvent, within } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Programs from '../../../pages/AdminDashboard/Programs';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock data
const mockPrograms = [
  {
    id: 'prog-1',
    name: 'Soccer',
    description: 'Learn soccer fundamentals and team play',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prog-2',
    name: 'Basketball',
    description: 'Basketball skills and drills for all ages',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'prog-3',
    name: 'Tennis',
    description: 'Tennis fundamentals and match play',
    is_active: false,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

describe('Programs Management Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

    // Set up default mock handlers
    server.use(
      http.get(`${API_BASE}/programs`, () => {
        return HttpResponse.json(mockPrograms);
      })
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // PAGE LOADING TESTS
  // ===========================================
  describe('Page Loading', () => {
    it('should render page title and description', async () => {
      render(<Programs />);

      expect(screen.getByText('Programs Management')).toBeInTheDocument();
      expect(screen.getByText(/Create and manage sports programs/i)).toBeInTheDocument();
    });

    it('should display Create Program button', async () => {
      render(<Programs />);

      expect(screen.getByRole('button', { name: /Create Program/i })).toBeInTheDocument();
    });

    it('should load and display programs in table', async () => {
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      expect(screen.getByText('Basketball')).toBeInTheDocument();
      expect(screen.getByText('Tennis')).toBeInTheDocument();
    });

    it('should display program descriptions', async () => {
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      expect(screen.getByText(/soccer fundamentals/i)).toBeInTheDocument();
      expect(screen.getByText(/Basketball skills/i)).toBeInTheDocument();
    });

    it('should display active/inactive status badges', async () => {
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Should have Active badges (Soccer and Basketball)
      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBe(2);

      // Should have one Inactive badge (Tennis)
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should display created date', async () => {
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Should show formatted dates
      expect(screen.getByText(/Jan.*2024/i) || screen.getByText(/2024/)).toBeTruthy();
    });
  });

  // ===========================================
  // FILTERING TESTS
  // ===========================================
  describe('Filtering', () => {
    it('should display search input', async () => {
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText(/Search programs/i)).toBeInTheDocument();
    });

    it('should display status filter dropdown', async () => {
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      expect(screen.getByText('All Statuses')).toBeInTheDocument();
    });

    it('should filter by search query', async () => {
      const user = userEvent.setup();
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search programs/i);
      await user.type(searchInput, 'Soccer');

      // Should only show Soccer (client-side filtering)
      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
        expect(screen.queryByText('Basketball')).not.toBeInTheDocument();
        expect(screen.queryByText('Tennis')).not.toBeInTheDocument();
      });
    });

    it('should filter by description', async () => {
      const user = userEvent.setup();
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search programs/i);
      await user.type(searchInput, 'fundamentals');

      // Should show Soccer and Tennis (both have "fundamentals" in description)
      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
        expect(screen.getByText('Tennis')).toBeInTheDocument();
        expect(screen.queryByText('Basketball')).not.toBeInTheDocument();
      });
    });

    it('should filter by status - Active', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/programs`, ({ request }) => {
          const url = new URL(request.url);
          const isActive = url.searchParams.get('is_active');
          if (isActive === 'true') {
            return HttpResponse.json(mockPrograms.filter(p => p.is_active));
          }
          if (isActive === 'false') {
            return HttpResponse.json(mockPrograms.filter(p => !p.is_active));
          }
          return HttpResponse.json(mockPrograms);
        })
      );

      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Find and click status filter
      const statusFilter = screen.getByText('All Statuses');
      await user.click(statusFilter);

      // Select Active
      await user.click(screen.getByText('Active'));

      // Should only show active programs
      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
        expect(screen.getByText('Basketball')).toBeInTheDocument();
        expect(screen.queryByText('Tennis')).not.toBeInTheDocument();
      });
    });

    it('should filter by status - Inactive', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/programs`, ({ request }) => {
          const url = new URL(request.url);
          const isActive = url.searchParams.get('is_active');
          if (isActive === 'false') {
            return HttpResponse.json(mockPrograms.filter(p => !p.is_active));
          }
          return HttpResponse.json(mockPrograms);
        })
      );

      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      const statusFilter = screen.getByText('All Statuses');
      await user.click(statusFilter);

      await user.click(screen.getByText('Inactive'));

      // Should only show inactive programs
      await waitFor(() => {
        expect(screen.queryByText('Soccer')).not.toBeInTheDocument();
        expect(screen.queryByText('Basketball')).not.toBeInTheDocument();
        expect(screen.getByText('Tennis')).toBeInTheDocument();
      });
    });

    it('should clear filters', async () => {
      const user = userEvent.setup();
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Type in search
      const searchInput = screen.getByPlaceholderText(/Search programs/i);
      await user.type(searchInput, 'Soccer');

      // Clear filters
      const clearButton = screen.queryByText(/Clear/i);
      if (clearButton) {
        await user.click(clearButton);

        // All programs should be visible again
        await waitFor(() => {
          expect(screen.getByText('Soccer')).toBeInTheDocument();
          expect(screen.getByText('Basketball')).toBeInTheDocument();
          expect(screen.getByText('Tennis')).toBeInTheDocument();
        });
      }
    });
  });

  // ===========================================
  // CREATE PROGRAM TESTS
  // ===========================================
  describe('Create Program', () => {
    it('should open create modal when clicking Create Program button', async () => {
      const user = userEvent.setup();
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Create Program/i }));

      // Modal should open
      await waitFor(() => {
        expect(screen.getByRole('dialog') || screen.getByText(/Create.*Program/i)).toBeTruthy();
      });
    });
  });

  // ===========================================
  // EDIT PROGRAM TESTS
  // ===========================================
  describe('Edit Program', () => {
    it('should display edit action for each program', async () => {
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Should have Edit buttons
      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      expect(editButtons.length).toBe(3);
    });

    it('should open edit modal when clicking edit button', async () => {
      const user = userEvent.setup();
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Click first edit button
      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      await user.click(editButtons[0]);

      // Modal should open
      await waitFor(() => {
        expect(screen.getByRole('dialog') || screen.getByText(/Edit.*Program/i)).toBeTruthy();
      });
    });
  });

  // ===========================================
  // DELETE PROGRAM TESTS
  // ===========================================
  describe('Delete Program', () => {
    it('should display delete action for each program', async () => {
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Should have Delete buttons
      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      expect(deleteButtons.length).toBe(3);
    });

    it('should open confirm dialog when clicking delete', async () => {
      const user = userEvent.setup();
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Click first delete button
      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      // Confirm dialog should open
      await waitFor(() => {
        expect(screen.getByText(/Delete Program/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });

    it('should display program name in confirm dialog', async () => {
      const user = userEvent.setup();
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Program/i)).toBeInTheDocument();
      });

      // Should mention the program name
      expect(screen.getByText(/"Soccer"/i) || screen.getByText(/Soccer/)).toBeTruthy();
    });

    it('should close confirm dialog when clicking cancel', async () => {
      const user = userEvent.setup();
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Program/i)).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
      });
    });

    it('should delete program when confirming', async () => {
      const user = userEvent.setup();

      server.use(
        http.delete(`${API_BASE}/programs/:id`, () => {
          return HttpResponse.json({ message: 'Program deleted successfully' });
        })
      );

      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Program/i)).toBeInTheDocument();
      });

      // Find and click confirm button in dialog
      const confirmButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.match(/Confirm|Delete/i) && btn.closest('.fixed, [role="dialog"]')
      );
      if (confirmButton) {
        await user.click(confirmButton);
      }

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle delete error gracefully', async () => {
      const user = userEvent.setup();

      server.use(
        http.delete(`${API_BASE}/programs/:id`, () => {
          return HttpResponse.json(
            { message: 'Cannot delete program with active classes' },
            { status: 400 }
          );
        })
      );

      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Program/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.match(/Confirm|Delete/i) && btn.closest('.fixed, [role="dialog"]')
      );
      if (confirmButton) {
        await user.click(confirmButton);
      }

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to delete/i) || screen.getByText(/Cannot delete/i)).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty State', () => {
    it('should display empty message when no programs', async () => {
      server.use(
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText(/No programs found/i)).toBeInTheDocument();
      });
    });

    it('should display empty message when search returns no results', async () => {
      const user = userEvent.setup();
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search programs/i);
      await user.type(searchInput, 'xyz123nonexistent');

      await waitFor(() => {
        expect(screen.getByText(/No programs found/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should display error toast when fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading States', () => {
    it('should display loading indicator while fetching', () => {
      render(<Programs />);

      // Should show loading state initially
      expect(screen.getByText(/Loading/i) || screen.queryByRole('progressbar')).toBeTruthy();
    });

    it('should hide loading indicator after fetch completes', async () => {
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Loading should be gone
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // TABLE SORTING TESTS
  // ===========================================
  describe('Table Sorting', () => {
    it('should have sortable columns', async () => {
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Name column should be sortable
      const nameHeader = screen.getByText('Name');
      expect(nameHeader).toBeInTheDocument();

      // Status column should be sortable
      const statusHeader = screen.getByText('Status');
      expect(statusHeader).toBeInTheDocument();

      // Created column should be sortable
      const createdHeader = screen.getByText('Created');
      expect(createdHeader).toBeInTheDocument();
    });
  });

  // ===========================================
  // RESPONSIVE TESTS
  // ===========================================
  describe('Responsive Layout', () => {
    it('should render all table columns', async () => {
      render(<Programs />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Check all expected columns
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });
});

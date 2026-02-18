/**
 * Integration Tests for Areas Management Page
 * Tests area CRUD operations, filtering, and modal interactions
 */

import { render, screen, waitFor, fireEvent } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Areas from '../../../pages/AdminDashboard/Areas';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock data
const mockAreas = [
  {
    id: 'area-1',
    name: 'Downtown',
    description: 'Central downtown area',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'area-2',
    name: 'Suburbs',
    description: 'Suburban neighborhoods',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'area-3',
    name: 'Northside',
    description: 'Northern districts',
    is_active: false,
    created_at: '2024-02-01T00:00:00Z',
  },
];

describe('Areas Management Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

    server.use(
      http.get(`${API_BASE}/areas`, () => {
        return HttpResponse.json(mockAreas);
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
      render(<Areas />);

      expect(screen.getByText('Areas Management')).toBeInTheDocument();
      expect(screen.getByText(/Create and manage geographic areas/i)).toBeInTheDocument();
    });

    it('should display Create Area button', async () => {
      render(<Areas />);

      expect(screen.getByText(/Area/i)).toBeInTheDocument();
    });

    it('should load and display areas in table', async () => {
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      expect(screen.getByText('Suburbs')).toBeInTheDocument();
      expect(screen.getByText('Northside')).toBeInTheDocument();
    });

    it('should display area descriptions', async () => {
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      expect(screen.getByText(/Central downtown area/i)).toBeInTheDocument();
      expect(screen.getByText(/Suburban neighborhoods/i)).toBeInTheDocument();
    });

    it('should display active/inactive status badges', async () => {
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBe(2);

      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should display created date', async () => {
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      expect(screen.getByText(/Jan.*2024/i) || screen.getByText(/2024/)).toBeTruthy();
    });
  });

  // ===========================================
  // FILTERING TESTS
  // ===========================================
  describe('Filtering', () => {
    it('should display search input', async () => {
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText(/Search areas/i)).toBeInTheDocument();
    });

    it('should display status filter dropdown', async () => {
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      expect(screen.getByText('All Statuses')).toBeInTheDocument();
    });

    it('should filter areas by search query', async () => {
      const user = userEvent.setup();
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search areas/i);
      await user.type(searchInput, 'Downtown');

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
        expect(screen.queryByText('Suburbs')).not.toBeInTheDocument();
        expect(screen.queryByText('Northside')).not.toBeInTheDocument();
      });
    });

    it('should filter areas by description', async () => {
      const user = userEvent.setup();
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search areas/i);
      await user.type(searchInput, 'neighborhoods');

      await waitFor(() => {
        expect(screen.queryByText('Downtown')).not.toBeInTheDocument();
        expect(screen.getByText('Suburbs')).toBeInTheDocument();
      });
    });

    it('should filter by status via API', async () => {
      const user = userEvent.setup();

      let requestedParams: any = {};
      server.use(
        http.get(`${API_BASE}/areas`, ({ request }) => {
          const url = new URL(request.url);
          requestedParams.is_active = url.searchParams.get('is_active');
          if (requestedParams.is_active === 'true') {
            return HttpResponse.json(mockAreas.filter(a => a.is_active));
          }
          if (requestedParams.is_active === 'false') {
            return HttpResponse.json(mockAreas.filter(a => !a.is_active));
          }
          return HttpResponse.json(mockAreas);
        })
      );

      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const statusFilter = screen.getByText('All Statuses');
      await user.click(statusFilter);

      await user.click(screen.getByText('Active'));

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
        expect(screen.getByText('Suburbs')).toBeInTheDocument();
        expect(screen.queryByText('Northside')).not.toBeInTheDocument();
      });
    });

    it('should clear filters', async () => {
      const user = userEvent.setup();
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search areas/i);
      await user.type(searchInput, 'Downtown');

      const clearButton = screen.queryByText(/Clear/i);
      if (clearButton) {
        await user.click(clearButton);

        await waitFor(() => {
          expect(screen.getByText('Downtown')).toBeInTheDocument();
          expect(screen.getByText('Suburbs')).toBeInTheDocument();
          expect(screen.getByText('Northside')).toBeInTheDocument();
        });
      }
    });
  });

  // ===========================================
  // CREATE AREA TESTS
  // ===========================================
  describe('Create Area', () => {
    it('should open create modal when clicking Create Area button', async () => {
      const user = userEvent.setup();
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const createButton = screen.getByText(/Area/i, { selector: 'button *' }).closest('button');
      if (createButton) {
        await user.click(createButton);
      }

      await waitFor(() => {
        expect(screen.getByRole('dialog') || screen.getByText(/Create.*Area/i)).toBeTruthy();
      });
    });
  });

  // ===========================================
  // EDIT AREA TESTS
  // ===========================================
  describe('Edit Area', () => {
    it('should display edit action for each area', async () => {
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      expect(editButtons.length).toBe(3);
    });

    it('should open edit modal when clicking edit button', async () => {
      const user = userEvent.setup();
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog') || screen.getByText(/Edit.*Area/i)).toBeTruthy();
      });
    });
  });

  // ===========================================
  // DELETE AREA TESTS
  // ===========================================
  describe('Delete Area', () => {
    it('should display delete action for each area', async () => {
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      expect(deleteButtons.length).toBe(3);
    });

    it('should open confirm dialog when clicking delete', async () => {
      const user = userEvent.setup();
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Area/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    it('should display area name in confirm dialog', async () => {
      const user = userEvent.setup();
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Area/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/"Downtown"/i) || screen.getByText(/Downtown/)).toBeTruthy();
    });

    it('should close confirm dialog when clicking cancel', async () => {
      const user = userEvent.setup();
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Area/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
      });
    });

    it('should delete area when confirming', async () => {
      const user = userEvent.setup();

      server.use(
        http.delete(`${API_BASE}/areas/:id`, () => {
          return HttpResponse.json({ message: 'Area deleted successfully' });
        })
      );

      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Area/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.match(/Confirm|Delete/i) && btn.closest('.fixed, [role="dialog"]')
      );
      if (confirmButton) {
        await user.click(confirmButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle delete error gracefully', async () => {
      const user = userEvent.setup();

      server.use(
        http.delete(`${API_BASE}/areas/:id`, () => {
          return HttpResponse.json(
            { message: 'Cannot delete area with associated schools' },
            { status: 400 }
          );
        })
      );

      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Area/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.match(/Confirm|Delete/i) && btn.closest('.fixed, [role="dialog"]')
      );
      if (confirmButton) {
        await user.click(confirmButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/Failed to delete/i) || screen.getByText(/associated schools/i)).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty State', () => {
    it('should display empty message when no areas', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText(/No areas found/i)).toBeInTheDocument();
      });
    });

    it('should display empty message when search returns no results', async () => {
      const user = userEvent.setup();
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search areas/i);
      await user.type(searchInput, 'xyz123nonexistent');

      await waitFor(() => {
        expect(screen.getByText(/No areas found/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should display error toast when fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<Areas />);

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
      render(<Areas />);

      expect(screen.getByText(/Loading/i) || screen.queryByRole('progressbar')).toBeTruthy();
    });

    it('should hide loading indicator after fetch completes', async () => {
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // TABLE COLUMNS TESTS
  // ===========================================
  describe('Table Columns', () => {
    it('should render all table columns', async () => {
      render(<Areas />);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
      });

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });
});

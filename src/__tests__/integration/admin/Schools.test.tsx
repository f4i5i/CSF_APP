/**
 * Integration Tests for Schools Management Page
 * Tests school CRUD operations, filtering by area, and modal interactions
 */

import { render, screen, waitFor, fireEvent } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Schools from '../../../pages/AdminDashboard/Schools';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock data
const mockAreas = [
  { id: 'area-1', name: 'Downtown', is_active: true },
  { id: 'area-2', name: 'Suburbs', is_active: true },
];

const mockSchools = [
  {
    id: 'school-1',
    name: 'Lincoln Elementary',
    address: '123 Main St',
    area_id: 'area-1',
    area_name: 'Downtown',
    is_active: true,
    principal_name: 'Dr. Smith',
    phone: '555-0101',
    email: 'info@lincoln.edu',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'school-2',
    name: 'Oak Ridge Academy',
    address: '456 Oak Ave',
    area_id: 'area-2',
    area_name: 'Suburbs',
    is_active: true,
    principal_name: 'Ms. Johnson',
    phone: '555-0202',
    email: 'info@oakridge.edu',
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'school-3',
    name: 'Riverside School',
    address: '789 River Rd',
    area_id: 'area-1',
    area_name: 'Downtown',
    is_active: false,
    principal_name: 'Mr. Williams',
    phone: '555-0303',
    email: 'info@riverside.edu',
    created_at: '2024-03-01T00:00:00Z',
  },
];

describe('Schools Management Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

    server.use(
      http.get(`${API_BASE}/schools`, () => {
        return HttpResponse.json({ items: mockSchools, total: mockSchools.length });
      }),
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
      render(<Schools />);

      expect(screen.getByText('Schools Management')).toBeInTheDocument();
      expect(screen.getByText(/Manage schools/i)).toBeInTheDocument();
    });

    it('should display Create School button', async () => {
      render(<Schools />);

      expect(screen.getByText(/School/i)).toBeInTheDocument();
    });

    it('should load and display schools in table', async () => {
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      expect(screen.getByText('Oak Ridge Academy')).toBeInTheDocument();
      expect(screen.getByText('Riverside School')).toBeInTheDocument();
    });

    it('should display school addresses', async () => {
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
      expect(screen.getByText(/456 Oak Ave/)).toBeInTheDocument();
    });

    it('should display area names for each school', async () => {
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const downtownBadges = screen.getAllByText('Downtown');
      expect(downtownBadges.length).toBeGreaterThanOrEqual(2);

      expect(screen.getByText('Suburbs')).toBeInTheDocument();
    });

    it('should display active/inactive status', async () => {
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBe(2);

      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  // ===========================================
  // FILTERING TESTS
  // ===========================================
  describe('Filtering', () => {
    it('should display search input', async () => {
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    it('should filter schools by search query', async () => {
      const user = userEvent.setup();
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.type(searchInput, 'Lincoln');

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
        expect(screen.queryByText('Oak Ridge Academy')).not.toBeInTheDocument();
      });
    });

    it('should display area filter dropdown', async () => {
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      expect(screen.getByText('All Areas')).toBeInTheDocument();
    });

    it('should filter schools by area', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/schools`, ({ request }) => {
          const url = new URL(request.url);
          const areaId = url.searchParams.get('area_id');
          if (areaId) {
            const filtered = mockSchools.filter(s => s.area_id === areaId);
            return HttpResponse.json({ items: filtered, total: filtered.length });
          }
          return HttpResponse.json({ items: mockSchools, total: mockSchools.length });
        })
      );

      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const areaFilter = screen.getByText('All Areas');
      await user.click(areaFilter);
      await user.click(screen.getByText('Downtown'));

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
        expect(screen.queryByText('Oak Ridge Academy')).not.toBeInTheDocument();
      });
    });

    it('should display status filter', async () => {
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      expect(screen.getByText('All Statuses')).toBeInTheDocument();
    });

    it('should clear all filters', async () => {
      const user = userEvent.setup();
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.type(searchInput, 'Lincoln');

      const clearButton = screen.queryByText(/Clear/i);
      if (clearButton) {
        await user.click(clearButton);

        await waitFor(() => {
          expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
          expect(screen.getByText('Oak Ridge Academy')).toBeInTheDocument();
          expect(screen.getByText('Riverside School')).toBeInTheDocument();
        });
      }
    });
  });

  // ===========================================
  // CREATE SCHOOL TESTS
  // ===========================================
  describe('Create School', () => {
    it('should open create modal when clicking button', async () => {
      const user = userEvent.setup();
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/School/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*School/i) || screen.getByRole('dialog')).toBeTruthy();
      });
    });

    it('should have area dropdown in the form', async () => {
      const user = userEvent.setup();
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/School/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*School/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      expect(screen.getByText(/Area/i)).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDIT SCHOOL TESTS
  // ===========================================
  describe('Edit School', () => {
    it('should display edit action for each school', async () => {
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      expect(editButtons.length).toBe(3);
    });

    it('should open edit modal with pre-filled data', async () => {
      const user = userEvent.setup();
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Edit.*School/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      expect(screen.getByDisplayValue('Lincoln Elementary')).toBeInTheDocument();
    });

    it('should submit updated school data', async () => {
      const user = userEvent.setup();

      let updatedData: any = null;
      server.use(
        http.put(`${API_BASE}/schools/:id`, async ({ request }) => {
          updatedData = await request.json();
          return HttpResponse.json({ ...mockSchools[0], ...updatedData });
        })
      );

      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Lincoln Elementary')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Lincoln Elementary');
      await user.clear(nameInput);
      await user.type(nameInput, 'Lincoln Elementary Updated');

      const saveButton = screen.getByText(/Update|Save/i);
      await user.click(saveButton);

      await waitFor(() => {
        expect(updatedData).toBeTruthy();
        expect(updatedData.name).toBe('Lincoln Elementary Updated');
      });
    });
  });

  // ===========================================
  // DELETE SCHOOL TESTS
  // ===========================================
  describe('Delete School', () => {
    it('should open confirm dialog when clicking delete', async () => {
      const user = userEvent.setup();
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
    });

    it('should delete school on confirm', async () => {
      const user = userEvent.setup();
      let deletedId: string | null = null;

      server.use(
        http.delete(`${API_BASE}/schools/:id`, ({ params }) => {
          deletedId = params.id as string;
          return HttpResponse.json({ message: 'Deleted' });
        })
      );

      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.match(/Confirm|Delete/i) && btn.closest('.fixed, [role="dialog"]')
      );
      if (confirmButton) {
        await user.click(confirmButton);
      }

      await waitFor(() => {
        expect(deletedId).toBeTruthy();
      });
    });

    it('should handle delete error', async () => {
      const user = userEvent.setup();

      server.use(
        http.delete(`${API_BASE}/schools/:id`, () => {
          return HttpResponse.json(
            { message: 'Cannot delete: active classes exist' },
            { status: 400 }
          );
        })
      );

      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.match(/Confirm|Delete/i) && btn.closest('.fixed, [role="dialog"]')
      );
      if (confirmButton) {
        await user.click(confirmButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/Failed/i) || screen.getByText(/error/i)).toBeTruthy();
      });
    });

    it('should close confirm dialog on cancel', async () => {
      const user = userEvent.setup();
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty State', () => {
    it('should display empty state when no schools', async () => {
      server.use(
        http.get(`${API_BASE}/schools`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText(/No schools found/i)).toBeInTheDocument();
      });
    });

    it('should display empty state when filter returns no results', async () => {
      const user = userEvent.setup();
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.type(searchInput, 'nonexistent school xyz');

      await waitFor(() => {
        expect(screen.getByText(/No schools found/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should display error when schools fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/schools`, () => {
          return HttpResponse.json(
            { message: 'Server error' },
            { status: 500 }
          );
        })
      );

      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
      });
    });

    it('should handle area fetch failure gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json(
            { message: 'Server error' },
            { status: 500 }
          );
        })
      );

      render(<Schools />);

      // Page should still render even if areas fail to load
      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading States', () => {
    it('should display loading indicator while fetching', () => {
      render(<Schools />);

      expect(screen.getByText(/Loading/i) || screen.queryByRole('progressbar')).toBeTruthy();
    });

    it('should hide loading after data loads', async () => {
      render(<Schools />);

      await waitFor(() => {
        expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });
});

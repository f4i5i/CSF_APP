/**
 * Integration Tests for Badges Management Page
 * Tests badge CRUD operations, filtering, and modal interactions
 */

import { render, screen, waitFor, fireEvent } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import BadgesManagement from '../../../pages/AdminDashboard/BadgesManagement';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock data
const mockBadges = [
  {
    id: 'badge-1',
    name: 'Star Player',
    description: 'Awarded for exceptional play',
    icon_url: '/uploads/badges/star.png',
    category: 'achievement',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'badge-2',
    name: 'Perfect Attendance',
    description: 'Attended all sessions',
    icon_url: '/uploads/badges/attendance.png',
    category: 'attendance',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'badge-3',
    name: 'Team Leader',
    description: 'Shows leadership skills',
    icon_url: '/uploads/badges/leader.png',
    category: 'behavior',
    is_active: false,
    created_at: '2024-02-01T00:00:00Z',
  },
];

describe('Badges Management Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

    server.use(
      http.get(`${API_BASE}/badges`, () => {
        return HttpResponse.json({ items: mockBadges, total: mockBadges.length });
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
    it('should render page title', async () => {
      render(<BadgesManagement />);

      expect(screen.getByText(/Badges/i)).toBeInTheDocument();
    });

    it('should display Create Badge button', async () => {
      render(<BadgesManagement />);

      expect(screen.getByText(/Badge/i)).toBeInTheDocument();
    });

    it('should load and display badges', async () => {
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      expect(screen.getByText('Perfect Attendance')).toBeInTheDocument();
      expect(screen.getByText('Team Leader')).toBeInTheDocument();
    });

    it('should display badge descriptions', async () => {
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      expect(screen.getByText(/Awarded for exceptional play/i)).toBeInTheDocument();
      expect(screen.getByText(/Attended all sessions/i)).toBeInTheDocument();
    });

    it('should display badge categories', async () => {
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      expect(screen.getByText(/achievement/i)).toBeInTheDocument();
      expect(screen.getByText(/attendance/i)).toBeInTheDocument();
    });

    it('should display active/inactive status', async () => {
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBeGreaterThanOrEqual(2);

      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  // ===========================================
  // FILTERING TESTS
  // ===========================================
  describe('Filtering', () => {
    it('should display search input', async () => {
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    it('should filter badges by name', async () => {
      const user = userEvent.setup();
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.type(searchInput, 'Star');

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
        expect(screen.queryByText('Perfect Attendance')).not.toBeInTheDocument();
      });
    });

    it('should filter badges by description', async () => {
      const user = userEvent.setup();
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.type(searchInput, 'leadership');

      await waitFor(() => {
        expect(screen.queryByText('Star Player')).not.toBeInTheDocument();
        expect(screen.getByText('Team Leader')).toBeInTheDocument();
      });
    });

    it('should clear filters', async () => {
      const user = userEvent.setup();
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.type(searchInput, 'Star');

      const clearButton = screen.queryByText(/Clear/i);
      if (clearButton) {
        await user.click(clearButton);

        await waitFor(() => {
          expect(screen.getByText('Star Player')).toBeInTheDocument();
          expect(screen.getByText('Perfect Attendance')).toBeInTheDocument();
          expect(screen.getByText('Team Leader')).toBeInTheDocument();
        });
      }
    });
  });

  // ===========================================
  // CREATE BADGE TESTS
  // ===========================================
  describe('Create Badge', () => {
    it('should open create modal', async () => {
      const user = userEvent.setup();
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Badge/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Badge/i) || screen.getByRole('dialog')).toBeTruthy();
      });
    });

    it('should have required fields in the form', async () => {
      const user = userEvent.setup();
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Badge/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Badge/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      expect(screen.getByText(/Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Description/i)).toBeInTheDocument();
    });

    it('should validate required fields on submit', async () => {
      const user = userEvent.setup();
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Badge/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Badge/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      const submitButton = screen.getByRole('button', { name: /Create|Save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/required/i) || screen.getByText(/fill in/i)).toBeTruthy();
      });
    });

    it('should successfully create a badge', async () => {
      const user = userEvent.setup();

      let createdData: any = null;
      server.use(
        http.post(`${API_BASE}/badges`, async ({ request }) => {
          createdData = await request.json();
          return HttpResponse.json({
            id: 'new-badge',
            ...createdData,
            created_at: new Date().toISOString(),
          });
        })
      );

      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Badge/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Badge/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      const nameInput = screen.getByPlaceholderText(/name/i) || screen.getByLabelText(/Name/i);
      await user.type(nameInput, 'New Badge');

      const descInput = screen.getByPlaceholderText(/description/i) || screen.getByLabelText(/Description/i);
      await user.type(descInput, 'New description');

      const submitButton = screen.getByRole('button', { name: /Create|Save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createdData).toBeTruthy();
      });
    });

    it('should close create modal on cancel', async () => {
      const user = userEvent.setup();
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Badge/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Badge/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Create New Badge/i)).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // EDIT BADGE TESTS
  // ===========================================
  describe('Edit Badge', () => {
    it('should display edit action for each badge', async () => {
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      expect(editButtons.length).toBe(3);
    });

    it('should open edit modal with pre-filled data', async () => {
      const user = userEvent.setup();
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Star Player')).toBeInTheDocument();
      });
    });

    it('should submit updated badge data', async () => {
      const user = userEvent.setup();

      let updatedData: any = null;
      server.use(
        http.put(`${API_BASE}/badges/:id`, async ({ request }) => {
          updatedData = await request.json();
          return HttpResponse.json({ ...mockBadges[0], ...updatedData });
        })
      );

      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Star Player')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Star Player');
      await user.clear(nameInput);
      await user.type(nameInput, 'Super Star Player');

      const saveButton = screen.getByRole('button', { name: /Update|Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(updatedData).toBeTruthy();
        expect(updatedData.name).toBe('Super Star Player');
      });
    });
  });

  // ===========================================
  // DELETE BADGE TESTS
  // ===========================================
  describe('Delete Badge', () => {
    it('should open confirm dialog on delete click', async () => {
      const user = userEvent.setup();
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
    });

    it('should delete badge on confirm', async () => {
      const user = userEvent.setup();
      let deletedId: string | null = null;

      server.use(
        http.delete(`${API_BASE}/badges/:id`, ({ params }) => {
          deletedId = params.id as string;
          return HttpResponse.json({ message: 'Deleted' });
        })
      );

      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
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

    it('should handle delete error gracefully', async () => {
      const user = userEvent.setup();

      server.use(
        http.delete(`${API_BASE}/badges/:id`, () => {
          return HttpResponse.json(
            { message: 'Cannot delete badge that is currently assigned' },
            { status: 400 }
          );
        })
      );

      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
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
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty State', () => {
    it('should display empty message when no badges', async () => {
      server.use(
        http.get(`${API_BASE}/badges`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText(/No badges found/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should display error when fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/badges`, () => {
          return HttpResponse.json({ message: 'Server error' }, { status: 500 });
        })
      );

      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
      });
    });

    it('should handle create error gracefully', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE}/badges`, () => {
          return HttpResponse.json(
            { message: 'Validation error' },
            { status: 422 }
          );
        })
      );

      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Badge/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Badge/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      const nameInput = screen.getByPlaceholderText(/name/i) || screen.getByLabelText(/Name/i);
      await user.type(nameInput, 'Test Badge');

      const descInput = screen.getByPlaceholderText(/description/i) || screen.getByLabelText(/Description/i);
      await user.type(descInput, 'Test description');

      const submitButton = screen.getByRole('button', { name: /Create|Save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed/i) || screen.getByText(/error/i)).toBeTruthy();
      });
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading States', () => {
    it('should display loading state initially', () => {
      render(<BadgesManagement />);

      expect(screen.getByText(/Loading/i) || screen.queryByRole('progressbar')).toBeTruthy();
    });

    it('should hide loading after data loads', async () => {
      render(<BadgesManagement />);

      await waitFor(() => {
        expect(screen.getByText('Star Player')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });
});

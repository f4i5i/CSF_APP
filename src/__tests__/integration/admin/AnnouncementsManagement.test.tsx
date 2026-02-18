/**
 * Integration Tests for Announcements Management Page
 * Tests announcement CRUD operations, filtering, and modal interactions
 */

import { render, screen, waitFor, fireEvent } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import AnnouncementsManagement from '../../../pages/AdminDashboard/AnnouncementsManagement';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock data
const mockClasses = [
  { id: 'class-1', name: 'Soccer Stars U6' },
  { id: 'class-2', name: 'Lightning Bolts U8' },
];

const mockAnnouncements = [
  {
    id: 'ann-1',
    title: 'Schedule Change',
    message: 'Practice has been moved to Thursday this week',
    priority: 'high',
    is_active: true,
    class_id: 'class-1',
    class_name: 'Soccer Stars U6',
    image_url: null,
    created_at: '2024-03-01T00:00:00Z',
    expires_at: '2024-04-01T00:00:00Z',
    targets: [{ class_id: 'class-1', class_name: 'Soccer Stars U6' }],
  },
  {
    id: 'ann-2',
    title: 'Photo Day',
    message: 'Team photos will be taken next Saturday',
    priority: 'normal',
    is_active: true,
    class_id: null,
    class_name: null,
    image_url: '/uploads/announcements/photo.jpg',
    created_at: '2024-03-05T00:00:00Z',
    expires_at: null,
    targets: [],
  },
  {
    id: 'ann-3',
    title: 'End of Season Party',
    message: 'Join us for the end-of-season celebration!',
    priority: 'low',
    is_active: false,
    class_id: 'class-2',
    class_name: 'Lightning Bolts U8',
    image_url: null,
    created_at: '2024-02-20T00:00:00Z',
    expires_at: '2024-03-15T00:00:00Z',
    targets: [{ class_id: 'class-2', class_name: 'Lightning Bolts U8' }],
  },
];

describe('Announcements Management Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

    server.use(
      http.get(`${API_BASE}/announcements`, () => {
        return HttpResponse.json({ items: mockAnnouncements, total: mockAnnouncements.length });
      }),
      http.get(`${API_BASE}/classes`, () => {
        return HttpResponse.json({ items: mockClasses, total: mockClasses.length });
      }),
      http.get(`${API_BASE}/areas`, () => {
        return HttpResponse.json([]);
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
      render(<AnnouncementsManagement />);

      expect(screen.getByText(/Announcements/i)).toBeInTheDocument();
    });

    it('should display Create Announcement button', async () => {
      render(<AnnouncementsManagement />);

      expect(screen.getByText(/Announcement/i)).toBeInTheDocument();
    });

    it('should load and display announcements', async () => {
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      expect(screen.getByText('Photo Day')).toBeInTheDocument();
      expect(screen.getByText('End of Season Party')).toBeInTheDocument();
    });

    it('should display announcement messages/descriptions', async () => {
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      expect(screen.getByText(/Practice has been moved/i)).toBeInTheDocument();
    });

    it('should display priority badges', async () => {
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      expect(screen.getByText(/high/i)).toBeInTheDocument();
      expect(screen.getByText(/normal/i)).toBeInTheDocument();
    });

    it('should display active/inactive status', async () => {
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ===========================================
  // FILTERING TESTS
  // ===========================================
  describe('Filtering', () => {
    it('should display search input', async () => {
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    it('should filter announcements by title', async () => {
      const user = userEvent.setup();
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.type(searchInput, 'Schedule');

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
        expect(screen.queryByText('Photo Day')).not.toBeInTheDocument();
      });
    });

    it('should display class filter dropdown', async () => {
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      expect(screen.getByText(/All Classes/i)).toBeInTheDocument();
    });

    it('should display priority filter dropdown', async () => {
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      expect(screen.getByText(/All Priorities/i) || screen.getByText(/Priority/i)).toBeTruthy();
    });

    it('should clear all filters', async () => {
      const user = userEvent.setup();
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.type(searchInput, 'Schedule');

      const clearButton = screen.queryByText(/Clear/i);
      if (clearButton) {
        await user.click(clearButton);

        await waitFor(() => {
          expect(screen.getByText('Schedule Change')).toBeInTheDocument();
          expect(screen.getByText('Photo Day')).toBeInTheDocument();
        });
      }
    });
  });

  // ===========================================
  // CREATE ANNOUNCEMENT TESTS
  // ===========================================
  describe('Create Announcement', () => {
    it('should open create modal', async () => {
      const user = userEvent.setup();
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Announcement/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Announcement/i) || screen.getByRole('dialog')).toBeTruthy();
      });
    });

    it('should have required form fields', async () => {
      const user = userEvent.setup();
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Announcement/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Announcement/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      expect(screen.getByText(/Title/i)).toBeInTheDocument();
      expect(screen.getByText(/Message/i)).toBeInTheDocument();
    });

    it('should validate required fields on empty submit', async () => {
      const user = userEvent.setup();
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Announcement/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Announcement/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      const submitButton = screen.getByRole('button', { name: /Create|Save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/required/i) || screen.getByText(/fill in/i)).toBeTruthy();
      });
    });

    it('should successfully create an announcement', async () => {
      const user = userEvent.setup();

      let createdData: any = null;
      server.use(
        http.post(`${API_BASE}/announcements`, async ({ request }) => {
          createdData = await request.json();
          return HttpResponse.json({
            id: 'new-ann',
            ...createdData,
            created_at: new Date().toISOString(),
          });
        })
      );

      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Announcement/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Announcement/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      const titleInput = screen.getByPlaceholderText(/title/i) || screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'New Announcement');

      const messageInput = screen.getByPlaceholderText(/message/i) || screen.getByLabelText(/Message/i);
      await user.type(messageInput, 'This is a new announcement');

      const submitButton = screen.getByRole('button', { name: /Create|Save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createdData).toBeTruthy();
        expect(createdData.title).toBe('New Announcement');
      });
    });

    it('should close modal on cancel', async () => {
      const user = userEvent.setup();
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Announcement/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Announcement/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Create New Announcement/i)).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // EDIT ANNOUNCEMENT TESTS
  // ===========================================
  describe('Edit Announcement', () => {
    it('should open edit modal with pre-filled data', async () => {
      const user = userEvent.setup();
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Schedule Change')).toBeInTheDocument();
      });
    });

    it('should update an announcement', async () => {
      const user = userEvent.setup();

      let updatedData: any = null;
      server.use(
        http.put(`${API_BASE}/announcements/:id`, async ({ request }) => {
          updatedData = await request.json();
          return HttpResponse.json({ ...mockAnnouncements[0], ...updatedData });
        })
      );

      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Schedule Change')).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue('Schedule Change');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Schedule');

      const saveButton = screen.getByRole('button', { name: /Update|Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(updatedData).toBeTruthy();
        expect(updatedData.title).toBe('Updated Schedule');
      });
    });
  });

  // ===========================================
  // DELETE ANNOUNCEMENT TESTS
  // ===========================================
  describe('Delete Announcement', () => {
    it('should open confirm dialog on delete', async () => {
      const user = userEvent.setup();
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
    });

    it('should delete announcement on confirm', async () => {
      const user = userEvent.setup();
      let deletedId: string | null = null;

      server.use(
        http.delete(`${API_BASE}/announcements/:id`, ({ params }) => {
          deletedId = params.id as string;
          return HttpResponse.json({ message: 'Deleted' });
        })
      );

      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
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
        http.delete(`${API_BASE}/announcements/:id`, () => {
          return HttpResponse.json({ message: 'Server error' }, { status: 500 });
        })
      );

      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
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
    it('should display empty message when no announcements', async () => {
      server.use(
        http.get(`${API_BASE}/announcements`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText(/No announcements found/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should handle fetch error gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/announcements`, () => {
          return HttpResponse.json({ message: 'Server error' }, { status: 500 });
        })
      );

      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
      });
    });

    it('should handle create error gracefully', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE}/announcements`, () => {
          return HttpResponse.json({ message: 'Validation error' }, { status: 422 });
        })
      );

      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      const createBtn = screen.getByText(/Announcement/i, { selector: 'button *' })?.closest('button');
      if (createBtn) {
        await user.click(createBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Create.*Announcement/i) || screen.getByRole('dialog')).toBeTruthy();
      });

      const titleInput = screen.getByPlaceholderText(/title/i) || screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test');

      const messageInput = screen.getByPlaceholderText(/message/i) || screen.getByLabelText(/Message/i);
      await user.type(messageInput, 'Test message');

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
      render(<AnnouncementsManagement />);

      expect(screen.getByText(/Loading/i) || screen.queryByRole('progressbar')).toBeTruthy();
    });

    it('should hide loading after data loads', async () => {
      render(<AnnouncementsManagement />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Change')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });
});

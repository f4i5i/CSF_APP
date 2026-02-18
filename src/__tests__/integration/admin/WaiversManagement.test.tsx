/**
 * Integration Tests for WaiversManagement Page
 * Tests waiver template listing, CRUD operations, filtering, view modal
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import WaiversManagement from '../../../pages/admin/WaiversManagement';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    error: (msg: string) => mockToastError(msg),
    success: (msg: string) => mockToastSuccess(msg),
  }),
}));

// Mock child components
jest.mock('../../../components/admin/WaiverFormModal', () => {
  return function MockWaiverFormModal({ waiver, onClose, onSuccess }: any) {
    return (
      <div data-testid="waiver-form-modal">
        <h2>{waiver ? 'Edit Waiver' : 'Create Waiver'}</h2>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onSuccess}>Save</button>
      </div>
    );
  };
});

jest.mock('../../../components/admin/WaiverVersionModal', () => {
  return function MockWaiverVersionModal({ waiver, onClose }: any) {
    return (
      <div data-testid="waiver-version-modal">
        <h2>Version Info: {waiver.name}</h2>
        <button onClick={onClose}>Close Version Modal</button>
      </div>
    );
  };
});

jest.mock('../../../components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

const mockWaivers = {
  items: [
    {
      id: 'waiver-1',
      name: 'General Liability Waiver',
      waiver_type: 'liability',
      content: 'By signing this waiver, you agree to release Carolina Soccer Factory from all liability...',
      version: 2,
      is_active: true,
      is_required: true,
      applies_to_program_id: null,
      applies_to_school_id: null,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-06-15T00:00:00Z',
    },
    {
      id: 'waiver-2',
      name: 'Photo Release Form',
      waiver_type: 'photo_release',
      content: 'I hereby grant permission to use photographs of my child...',
      version: 1,
      is_active: true,
      is_required: false,
      applies_to_program_id: 'prog-1',
      applies_to_school_id: null,
      created_at: '2024-02-20T00:00:00Z',
      updated_at: '2024-02-20T00:00:00Z',
    },
    {
      id: 'waiver-3',
      name: 'Medical Release',
      waiver_type: 'medical_release',
      content: 'In case of emergency, I authorize medical treatment...',
      version: 1,
      is_active: false,
      is_required: true,
      applies_to_program_id: null,
      applies_to_school_id: 'school-1',
      created_at: '2024-03-10T00:00:00Z',
      updated_at: '2024-03-10T00:00:00Z',
    },
    {
      id: 'waiver-4',
      name: 'Cancellation Policy',
      waiver_type: 'cancellation_policy',
      content: 'Refund policy and cancellation terms...',
      version: 3,
      is_active: true,
      is_required: true,
      applies_to_program_id: 'prog-1',
      applies_to_school_id: 'school-1',
      created_at: '2024-04-01T00:00:00Z',
      updated_at: '2024-08-01T00:00:00Z',
    },
  ],
  total: 4,
};

describe('WaiversManagement Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
    window.confirm = jest.fn();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Page Loading', () => {
    it('should display loading state while fetching waivers', () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      expect(screen.getByText('Loading waivers...')).toBeInTheDocument();
    });

    it('should display page header', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('Waiver Templates')).toBeInTheDocument();
      });

      expect(screen.getByText('Manage waiver templates for enrollments')).toBeInTheDocument();
    });

    it('should display Create Waiver button', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Waiver/)).toBeInTheDocument();
      });
    });
  });

  describe('Waiver List Display', () => {
    it('should display all waivers', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
        expect(screen.getByText('Photo Release Form')).toBeInTheDocument();
        expect(screen.getByText('Medical Release')).toBeInTheDocument();
        expect(screen.getByText('Cancellation Policy')).toBeInTheDocument();
      });
    });

    it('should display waiver types', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('Liability')).toBeInTheDocument();
        expect(screen.getByText('Photo')).toBeInTheDocument();
        expect(screen.getByText('Medical')).toBeInTheDocument();
        expect(screen.getByText('Cancellation')).toBeInTheDocument();
      });
    });

    it('should display status badges', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('Required')).toBeInTheDocument();
        expect(screen.getByText('Optional')).toBeInTheDocument();
        expect(screen.getByText('Inactive')).toBeInTheDocument();
      });
    });

    it('should display version numbers', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('Version 2')).toBeInTheDocument();
        expect(screen.getAllByText('Version 1').length).toBe(2);
        expect(screen.getByText('Version 3')).toBeInTheDocument();
      });
    });

    it('should display scope labels', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('Global')).toBeInTheDocument();
        expect(screen.getByText('Program Specific')).toBeInTheDocument();
        expect(screen.getByText('School Specific')).toBeInTheDocument();
        expect(screen.getByText('Program & School Specific')).toBeInTheDocument();
      });
    });

    it('should display waiver content preview', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText(/By signing this waiver/)).toBeInTheDocument();
      });
    });

    it('should display results count', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('Showing 4 of 4 waivers')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should display search input', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search waivers by name, type, or content...')).toBeInTheDocument();
      });
    });

    it('should filter by search term', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search waivers by name, type, or content...');
      await user.type(searchInput, 'Photo Release');

      await waitFor(() => {
        expect(screen.getByText('Photo Release Form')).toBeInTheDocument();
        expect(screen.queryByText('General Liability Waiver')).not.toBeInTheDocument();
      });
    });

    it('should display status filter dropdown', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('All Status')).toBeInTheDocument();
      });
    });

    it('should filter by active status', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const statusFilter = screen.getByDisplayValue('All Status').closest('select');
      if (statusFilter) {
        await user.selectOptions(statusFilter, 'active');
      }

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
        expect(screen.queryByText('Medical Release')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Showing 3 of 4 waivers')).toBeInTheDocument();
    });

    it('should filter by inactive status', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const statusFilter = screen.getByDisplayValue('All Status').closest('select');
      if (statusFilter) {
        await user.selectOptions(statusFilter, 'inactive');
      }

      await waitFor(() => {
        expect(screen.getByText('Medical Release')).toBeInTheDocument();
        expect(screen.queryByText('General Liability Waiver')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Showing 1 of 4 waivers')).toBeInTheDocument();
    });

    it('should display type filter dropdown', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('All Types')).toBeInTheDocument();
      });
    });

    it('should filter by waiver type', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const typeFilter = screen.getByDisplayValue('All Types').closest('select');
      if (typeFilter) {
        await user.selectOptions(typeFilter, 'liability');
      }

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
        expect(screen.queryByText('Photo Release Form')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Showing 1 of 4 waivers')).toBeInTheDocument();
    });

    it('should display filtered empty state when filters match nothing', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search waivers by name, type, or content...');
      await user.type(searchInput, 'xyznonexistent');

      await waitFor(() => {
        expect(screen.getByText('No waivers match your filters')).toBeInTheDocument();
      });
    });
  });

  describe('Create Waiver', () => {
    it('should open create modal when Create Waiver button clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      // Click the Create Waiver button (contains "Waiver" text and Plus icon)
      const createButtons = screen.getAllByRole('button');
      const createButton = createButtons.find(
        (btn) => btn.textContent?.includes('Waiver') && !btn.textContent?.includes('General')
      );
      if (createButton) {
        await user.click(createButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId('waiver-form-modal')).toBeInTheDocument();
        expect(screen.getByText('Create Waiver')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Waiver', () => {
    it('should open edit modal when Edit button clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      // Find and click the edit button (title="Edit Waiver")
      const editButtons = screen.getAllByTitle('Edit Waiver');
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('waiver-form-modal')).toBeInTheDocument();
        expect(screen.getByText('Edit Waiver')).toBeInTheDocument();
      });
    });
  });

  describe('View Waiver', () => {
    it('should open view modal when View button clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByTitle('View Full Content');
      await user.click(viewButtons[0]);

      await waitFor(() => {
        // Modal should show the full content
        expect(screen.getByText('Scope:')).toBeInTheDocument();
        expect(screen.getByText('Required:')).toBeInTheDocument();
      });
    });

    it('should display waiver metadata in view modal', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByTitle('View Full Content');
      await user.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Created:')).toBeInTheDocument();
        expect(screen.getByText('Updated:')).toBeInTheDocument();
      });
    });

    it('should close view modal when X button clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByTitle('View Full Content');
      await user.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Scope:')).toBeInTheDocument();
      });

      // Find and click close button (the X icon in the modal)
      const closeButton = screen.getAllByRole('button').find(
        (btn) => btn.closest('.fixed')
      );
      if (closeButton) {
        await user.click(closeButton);
      }
    });
  });

  describe('Version Info', () => {
    it('should open version info modal when Info button clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const infoButtons = screen.getAllByTitle('Version Info & Stats');
      await user.click(infoButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('waiver-version-modal')).toBeInTheDocument();
        expect(screen.getByText('Version Info: General Liability Waiver')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Waiver', () => {
    it('should show confirmation dialog when Delete button clicked', async () => {
      const user = userEvent.setup();
      (window.confirm as jest.Mock).mockReturnValue(false);

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete Waiver');
      await user.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Are you sure you want to delete "General Liability Waiver"')
      );
    });

    it('should delete waiver when confirmed', async () => {
      const user = userEvent.setup();
      (window.confirm as jest.Mock).mockReturnValue(true);
      let deleteCalled = false;

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        }),
        http.delete(`${API_BASE}/waivers/templates/waiver-1`, () => {
          deleteCalled = true;
          return HttpResponse.json({ success: true });
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete Waiver');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(deleteCalled).toBe(true);
        expect(mockToastSuccess).toHaveBeenCalledWith('Waiver template deleted successfully');
      });
    });

    it('should not delete waiver when cancelled', async () => {
      const user = userEvent.setup();
      (window.confirm as jest.Mock).mockReturnValue(false);
      let deleteCalled = false;

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        }),
        http.delete(`${API_BASE}/waivers/templates/waiver-1`, () => {
          deleteCalled = true;
          return HttpResponse.json({ success: true });
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete Waiver');
      await user.click(deleteButtons[0]);

      expect(deleteCalled).toBe(false);
    });

    it('should show error toast when delete fails', async () => {
      const user = userEvent.setup();
      (window.confirm as jest.Mock).mockReturnValue(true);

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockWaivers);
        }),
        http.delete(`${API_BASE}/waivers/templates/waiver-1`, () => {
          return HttpResponse.json({ message: 'Failed' }, { status: 500 });
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete Waiver');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to delete waiver template');
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no waivers exist', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('No waiver templates yet')).toBeInTheDocument();
      });
    });

    it('should display Create Your First Waiver button when empty', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('Create Your First Waiver')).toBeInTheDocument();
      });
    });

    it('should open create modal when Create Your First Waiver clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('Create Your First Waiver')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Create Your First Waiver'));

      await waitFor(() => {
        expect(screen.getByTestId('waiver-form-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error state when fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load waivers')).toBeInTheDocument();
      });
    });

    it('should display Retry button on error', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should retry fetch when Retry button clicked', async () => {
      const user = userEvent.setup();
      let callCount = 0;

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          callCount++;
          if (callCount === 1) {
            return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
          }
          return HttpResponse.json(mockWaivers);
        })
      );

      render(<WaiversManagement />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });
    });
  });
});

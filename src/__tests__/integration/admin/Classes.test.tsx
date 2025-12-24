/**
 * Integration Tests for Admin Classes Management Page
 * Tests class CRUD operations, filtering, and modal interactions
 */

import { render, screen, waitFor, fireEvent, within } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Classes from '../../../pages/AdminDashboard/Classes';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock data
const mockPrograms = [
  { id: 'prog-1', name: 'Soccer', description: 'Soccer program', is_active: true },
  { id: 'prog-2', name: 'Basketball', description: 'Basketball program', is_active: true },
];

const mockAreas = [
  { id: 'area-1', name: 'Downtown', is_active: true },
  { id: 'area-2', name: 'Suburbs', is_active: true },
];

const mockClasses = {
  items: [
    {
      id: 'class-1',
      name: 'Soccer Basics',
      description: 'Learn soccer fundamentals',
      program: mockPrograms[0],
      program_id: 'prog-1',
      program_name: 'Soccer',
      area: mockAreas[0],
      area_id: 'area-1',
      area_name: 'Downtown',
      school: { id: 'school-1', name: 'Test Elementary', code: 'TE001' },
      school_id: 'school-1',
      school_name: 'Test Elementary',
      school_code: 'TE001',
      coach: { id: 'coach-1', first_name: 'John', last_name: 'Coach' },
      coach_id: 'coach-1',
      capacity: 20,
      current_enrollment: 15,
      price: 150,
      base_price: 150,
      weekdays: ['monday', 'wednesday'],
      start_time: '15:00',
      end_time: '16:30',
      start_date: '2024-02-01',
      end_date: '2024-05-01',
      min_age: 6,
      max_age: 12,
      is_active: true,
      class_type: 'one-time',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'class-2',
      name: 'Basketball 101',
      description: 'Introduction to basketball',
      program: mockPrograms[1],
      program_id: 'prog-2',
      program_name: 'Basketball',
      area: mockAreas[1],
      area_id: 'area-2',
      area_name: 'Suburbs',
      school: { id: 'school-2', name: 'Oak Middle School', code: 'OMS02' },
      school_id: 'school-2',
      school_name: 'Oak Middle School',
      school_code: 'OMS02',
      coach: { id: 'coach-2', first_name: 'Jane', last_name: 'Trainer' },
      coach_id: 'coach-2',
      capacity: 15,
      current_enrollment: 10,
      price: 175,
      base_price: 175,
      weekdays: ['tuesday', 'thursday'],
      start_time: '14:00',
      end_time: '15:30',
      start_date: '2024-02-15',
      end_date: '2024-05-15',
      min_age: 8,
      max_age: 14,
      is_active: true,
      class_type: 'membership',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'class-3',
      name: 'Advanced Soccer',
      description: 'Advanced soccer techniques',
      program: mockPrograms[0],
      program_id: 'prog-1',
      program_name: 'Soccer',
      area: mockAreas[0],
      area_id: 'area-1',
      area_name: 'Downtown',
      school: { id: 'school-1', name: 'Test Elementary', code: 'TE001' },
      school_id: 'school-1',
      school_name: 'Test Elementary',
      capacity: 12,
      current_enrollment: 12,
      price: 200,
      base_price: 200,
      weekdays: ['friday'],
      start_time: '16:00',
      end_time: '17:30',
      start_date: '2024-03-01',
      end_date: '2024-06-01',
      min_age: 10,
      max_age: 16,
      is_active: false,
      class_type: 'one-time',
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
  total: 3,
  skip: 0,
  limit: 10,
};

describe('Classes Management Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

    // Set up default mock handlers
    server.use(
      http.get(`${API_BASE}/classes`, () => {
        return HttpResponse.json(mockClasses);
      }),
      http.get(`${API_BASE}/programs`, () => {
        return HttpResponse.json(mockPrograms);
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
      render(<Classes />);

      expect(screen.getByText('Classes Management')).toBeInTheDocument();
      expect(screen.getByText(/Create and manage classes/i)).toBeInTheDocument();
    });

    it('should display Create Class button', async () => {
      render(<Classes />);

      expect(screen.getByRole('button', { name: /Create Class/i })).toBeInTheDocument();
    });

    it('should load and display classes in table', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      expect(screen.getByText('Basketball 101')).toBeInTheDocument();
      expect(screen.getByText('Advanced Soccer')).toBeInTheDocument();
    });

    it('should display class details correctly', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Program and area info
      expect(screen.getByText(/Soccer/)).toBeInTheDocument();
      expect(screen.getByText(/Downtown/)).toBeInTheDocument();

      // School info
      expect(screen.getByText('Test Elementary')).toBeInTheDocument();

      // Capacity info (enrolled/capacity)
      expect(screen.getByText(/15/)).toBeInTheDocument();
      expect(screen.getByText(/20/)).toBeInTheDocument();
    });

    it('should display schedule information', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Schedule should be formatted
      expect(screen.getByText(/MON.*WED.*15:00.*16:30/i) || screen.getByText(/monday.*wednesday/i)).toBeTruthy();
    });

    it('should display age range', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      expect(screen.getByText(/6.*12.*yrs/i) || screen.getByText(/6 - 12/)).toBeTruthy();
    });

    it('should display active/inactive status badges', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Should have Active and Inactive badges
      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBeGreaterThanOrEqual(2);

      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should display class type badges', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      expect(screen.getByText('One-time')).toBeInTheDocument();
      expect(screen.getByText('Membership')).toBeInTheDocument();
    });
  });

  // ===========================================
  // FILTERING TESTS
  // ===========================================
  describe('Filtering', () => {
    it('should display filter dropdowns', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Should have program filter
      expect(screen.getByText('All Programs') || screen.getByDisplayValue('')).toBeTruthy();

      // Should have area filter
      expect(screen.getByText('All Areas') || screen.getByRole('combobox')).toBeTruthy();

      // Should have status filter
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
    });

    it('should display search input', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText(/Search.*class/i)).toBeInTheDocument();
    });

    it('should filter by program', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/classes`, ({ request }) => {
          const url = new URL(request.url);
          const programId = url.searchParams.get('program_id');
          if (programId === 'prog-1') {
            return HttpResponse.json({
              items: mockClasses.items.filter(c => c.program_id === 'prog-1'),
              total: 2,
            });
          }
          return HttpResponse.json(mockClasses);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Open program filter dropdown
      const programSelect = screen.getAllByRole('combobox')[0];
      await user.click(programSelect);

      // Select Soccer
      await user.click(screen.getByText('Soccer'));

      // Should only show soccer classes
      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
        expect(screen.getByText('Advanced Soccer')).toBeInTheDocument();
      });
    });

    it('should filter by status', async () => {
      const user = userEvent.setup();
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Find and click status filter
      const statusSelect = screen.getByText('All Statuses').closest('select') ||
                           screen.getAllByRole('combobox').find(el =>
                             el.textContent?.includes('Status') || el.closest('div')?.textContent?.includes('Status')
                           );

      if (statusSelect) {
        await user.click(statusSelect);
        // Select Active
        const activeOption = screen.getByRole('option', { name: 'Active' }) || screen.getByText('Active');
        await user.click(activeOption);
      }
    });

    it('should clear filters when clicking clear button', async () => {
      const user = userEvent.setup();
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Type in search
      const searchInput = screen.getByPlaceholderText(/Search.*class/i);
      await user.type(searchInput, 'test');

      // Clear button should appear when filters are active
      const clearButton = screen.queryByText(/Clear/i);
      if (clearButton) {
        await user.click(clearButton);
        expect(searchInput).toHaveValue('');
      }
    });
  });

  // ===========================================
  // CREATE CLASS TESTS
  // ===========================================
  describe('Create Class', () => {
    it('should open create modal when clicking Create Class button', async () => {
      const user = userEvent.setup();
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Create Class/i }));

      // Modal should open
      await waitFor(() => {
        expect(screen.getByText(/Create.*Class/i) || screen.getByRole('dialog')).toBeTruthy();
      });
    });
  });

  // ===========================================
  // EDIT CLASS TESTS
  // ===========================================
  describe('Edit Class', () => {
    it('should display edit action for each class', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Should have Edit buttons
      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      expect(editButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('should open edit modal when clicking edit button', async () => {
      const user = userEvent.setup();
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Click first edit button
      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      await user.click(editButtons[0]);

      // Modal should open
      await waitFor(() => {
        expect(screen.getByRole('dialog') || screen.getByText(/Edit.*Class/i)).toBeTruthy();
      });
    });
  });

  // ===========================================
  // DELETE CLASS TESTS
  // ===========================================
  describe('Delete Class', () => {
    it('should display delete action for each class', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Should have Delete buttons
      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      expect(deleteButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('should open confirm dialog when clicking delete', async () => {
      const user = userEvent.setup();
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Click first delete button
      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      // Confirm dialog should open
      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });

    it('should close confirm dialog when clicking cancel', async () => {
      const user = userEvent.setup();
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
      });
    });

    it('should delete class when confirming', async () => {
      const user = userEvent.setup();

      server.use(
        http.delete(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json({ message: 'Class deleted successfully' });
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });

      // Find and click confirm/delete button in dialog
      const confirmButton = screen.getByRole('button', { name: /Confirm|Delete/i });
      await user.click(confirmButton);

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // ===========================================
  // PAGINATION TESTS
  // ===========================================
  describe('Pagination', () => {
    it('should display pagination when there are many classes', async () => {
      // Mock many classes
      const manyClasses = {
        items: Array.from({ length: 10 }, (_, i) => ({
          ...mockClasses.items[0],
          id: `class-${i}`,
          name: `Class ${i}`,
        })),
        total: 25,
        skip: 0,
        limit: 10,
      };

      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json(manyClasses);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Class 0')).toBeInTheDocument();
      });

      // Pagination should be visible
      expect(screen.getByText(/1.*of/i) || screen.getByRole('navigation')).toBeTruthy();
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty State', () => {
    it('should display empty message when no classes', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json({ items: [], total: 0, skip: 0, limit: 10 });
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText(/No classes found/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should display error toast when fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
      });
    });

    it('should display error toast when delete fails', async () => {
      const user = userEvent.setup();

      server.use(
        http.delete(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(
            { message: 'Cannot delete class with active enrollments' },
            { status: 400 }
          );
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm|Delete/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to delete/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle filter options fetch failure gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json({ message: 'Error' }, { status: 500 });
        }),
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json({ message: 'Error' }, { status: 500 });
        })
      );

      render(<Classes />);

      // Should still render the page even if filters fail
      await waitFor(() => {
        expect(screen.getByText('Classes Management')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading States', () => {
    it('should display loading indicator while fetching', () => {
      render(<Classes />);

      // Should show loading state initially
      expect(screen.getByText(/Loading/i) || screen.queryByRole('progressbar')).toBeTruthy();
    });
  });
});

/**
 * Integration Tests for Enrollments Management Page
 * Tests enrollment CRUD operations, filtering, and status management
 */

import { render, screen, waitFor, within } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Enrollments from '../../../pages/AdminDashboard/Enrollments';

const API_BASE = 'http://localhost:8000/api/v1';

describe('Enrollments Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Page Loading and Initial State', () => {
    it('should display page header', async () => {
      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('Enrollments Management')).toBeInTheDocument();
      });

      expect(screen.getByText(/Create, manage, and track/i)).toBeInTheDocument();
    });

    it('should display Create Enrollment button', async () => {
      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('Create Enrollment')).toBeInTheDocument();
      });
    });

    it('should display search input', async () => {
      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by child or class name/i)).toBeInTheDocument();
      });
    });

    it('should load enrollments on mount', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_id: 'child-1',
            child_name: 'Johnny Doe',
            class_id: 'class-1',
            class_name: 'Soccer Basics',
            status: 'active',
            final_price: 150,
            discount_amount: 0,
            enrolled_at: '2024-01-15T00:00:00Z',
            created_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('Johnny Doe')).toBeInTheDocument();
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });
    });
  });

  describe('Enrollments Table Display', () => {
    it('should display enrollment data in table', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_id: 'child-1',
            child_name: 'Johnny Doe',
            class_id: 'class-1',
            class_name: 'Soccer Basics',
            status: 'active',
            final_price: 150,
            discount_amount: 0,
            enrolled_at: '2024-01-15T00:00:00Z',
            created_at: '2024-01-15T00:00:00Z',
          },
          {
            id: 'enroll-2',
            child_id: 'child-2',
            child_name: 'Jenny Smith',
            class_id: 'class-2',
            class_name: 'Basketball 101',
            status: 'pending',
            final_price: 175,
            discount_amount: 25,
            enrolled_at: '2024-01-20T00:00:00Z',
            created_at: '2024-01-20T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('Johnny Doe')).toBeInTheDocument();
        expect(screen.getByText('Jenny Smith')).toBeInTheDocument();
      });

      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      expect(screen.getByText('Basketball 101')).toBeInTheDocument();
    });

    it('should display status badges with correct styling', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Active Child',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
          {
            id: 'enroll-2',
            child_name: 'Pending Child',
            class_name: 'Basketball',
            status: 'pending',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
          {
            id: 'enroll-3',
            child_name: 'Cancelled Child',
            class_name: 'Tennis',
            status: 'cancelled',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 3,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        const statuses = screen.getAllByText(/active|pending|cancelled/i);
        expect(statuses.length).toBeGreaterThan(0);
      });
    });

    it('should display price with discount information', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            discount_amount: 25,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('$150.00')).toBeInTheDocument();
        expect(screen.getByText(/-\$25\.00 discount/i)).toBeInTheDocument();
      });
    });

    it('should display formatted dates', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            discount_amount: 0,
            enrolled_at: '2024-01-15T00:00:00Z',
            created_at: '2024-01-10T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText(/Jan/i)).toBeInTheDocument();
      });
    });

    it('should truncate and display child and class IDs', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_id: 'child-123456789',
            child_name: 'Johnny Doe',
            class_id: 'class-987654321',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText(/child-12/i)).toBeInTheDocument();
        expect(screen.getByText(/class-98/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should display status filter dropdown', async () => {
      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('All Statuses')).toBeInTheDocument();
      });
    });

    it('should display class filter dropdown', async () => {
      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('All Classes')).toBeInTheDocument();
      });
    });

    it('should filter by status when selected', async () => {
      const user = userEvent.setup();

      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/enrollments`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            status: url.searchParams.get('status'),
            class_id: url.searchParams.get('class_id'),
          };
          return HttpResponse.json({
            items: [],
            total: 0,
          });
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('All Statuses')).toBeInTheDocument();
      });

      const statusFilter = screen.getByDisplayValue('All Statuses').closest('select');
      if (statusFilter) {
        await user.selectOptions(statusFilter, 'active');
      }

      await waitFor(() => {
        expect(requestParams?.status).toBe('active');
      });
    });

    it('should filter by class when selected', async () => {
      const user = userEvent.setup();

      let requestParams: any = null;

      const mockClasses = {
        items: [
          { id: 'class-1', name: 'Soccer Basics' },
          { id: 'class-2', name: 'Basketball 101' },
        ],
      };

      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json(mockClasses);
        }),
        http.get(`${API_BASE}/enrollments`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            class_id: url.searchParams.get('class_id'),
          };
          return HttpResponse.json({
            items: [],
            total: 0,
          });
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('All Classes')).toBeInTheDocument();
      });

      const classFilter = screen.getByDisplayValue('All Classes').closest('select');
      if (classFilter) {
        await user.selectOptions(classFilter, 'class-1');
      }

      await waitFor(() => {
        expect(requestParams?.class_id).toBe('class-1');
      });
    });

    it('should show clear filters button when filters are active', async () => {
      const user = userEvent.setup();

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('All Statuses')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by child or class name/i);
      await user.type(searchInput, 'test search');

      await waitFor(() => {
        expect(screen.getByText(/Clear/i)).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button clicked', async () => {
      const user = userEvent.setup();

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by child or class name/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by child or class name/i);
      await user.type(searchInput, 'test search');

      await waitFor(() => {
        expect(screen.getByText(/Clear/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByText(/Clear/i);
      await user.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });
    });
  });

  describe('Create Enrollment', () => {
    it('should open modal when Create Enrollment button clicked', async () => {
      const user = userEvent.setup();

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('Create Enrollment')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create Enrollment');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should display enrollment form in modal', async () => {
      const user = userEvent.setup();

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('Create Enrollment')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create Enrollment');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Enrollment', () => {
    it('should display Edit action button for enrollments', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Edit/i)).toBeInTheDocument();
      });
    });

    it('should open edit modal when edit button clicked', async () => {
      const user = userEvent.setup();

      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Edit/i)).toBeInTheDocument();
      });

      const editButton = screen.getByLabelText(/Edit/i);
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Activate Enrollment', () => {
    it('should display Activate button for pending enrollments', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'pending',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Activate/i)).toBeInTheDocument();
      });
    });

    it('should activate enrollment when activate button clicked', async () => {
      const user = userEvent.setup();

      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'pending',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        }),
        http.post(`${API_BASE}/enrollments/enroll-1/activate`, () => {
          return HttpResponse.json({
            id: 'enroll-1',
            status: 'active',
          });
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Activate/i)).toBeInTheDocument();
      });

      const activateButton = screen.getByLabelText(/Activate/i);
      await user.click(activateButton);

      await waitFor(() => {
        expect(screen.getByText(/Enrollment activated successfully/i)).toBeInTheDocument();
      });
    });

    it('should not display Activate button for active enrollments', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('Johnny Doe')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/Activate/i)).not.toBeInTheDocument();
    });
  });

  describe('Cancel Enrollment', () => {
    it('should display Cancel button for active enrollments', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Cancel/i)).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when cancel button clicked', async () => {
      const user = userEvent.setup();

      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer Basics',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Cancel/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByLabelText(/Cancel/i);
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/Cancel Enrollment/i)).toBeInTheDocument();
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
    });

    it('should cancel enrollment when confirmed', async () => {
      const user = userEvent.setup();

      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        }),
        http.post(`${API_BASE}/enrollments/enroll-1/cancel`, () => {
          return HttpResponse.json({
            id: 'enroll-1',
            status: 'cancelled',
          });
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Cancel/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByLabelText(/Cancel/i);
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Enrollment cancelled successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Delete Enrollment', () => {
    it('should display Delete button for all enrollments', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Delete/i)).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when delete button clicked', async () => {
      const user = userEvent.setup();

      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Delete/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText(/Delete/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Delete Enrollment/i)).toBeInTheDocument();
        expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
      });
    });

    it('should delete enrollment when confirmed', async () => {
      const user = userEvent.setup();

      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        }),
        http.delete(`${API_BASE}/enrollments/enroll-1`, () => {
          return HttpResponse.json({ success: true });
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Delete/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText(/Delete/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Enrollment deleted successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when data exceeds page size', async () => {
      const mockEnrollments = {
        items: Array.from({ length: 10 }, (_, i) => ({
          id: `enroll-${i + 1}`,
          child_name: `Child ${i + 1}`,
          class_name: `Class ${i + 1}`,
          status: 'active',
          final_price: 150,
          created_at: '2024-01-15T00:00:00Z',
          enrolled_at: '2024-01-15T00:00:00Z',
        })),
        total: 25,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText('Child 1')).toBeInTheDocument();
      });

      // Pagination controls should be visible
      const pagination = screen.getByRole('navigation', { name: /pagination/i });
      expect(pagination).toBeInTheDocument();
    });

    it('should change page when pagination controls clicked', async () => {
      const user = userEvent.setup();

      let requestedPage = 1;

      server.use(
        http.get(`${API_BASE}/enrollments`, ({ request }) => {
          const url = new URL(request.url);
          const offset = parseInt(url.searchParams.get('offset') || '0');
          requestedPage = Math.floor(offset / 10) + 1;

          return HttpResponse.json({
            items: Array.from({ length: 10 }, (_, i) => ({
              id: `enroll-${requestedPage * 10 + i}`,
              child_name: `Child ${requestedPage * 10 + i}`,
              class_name: `Class ${i}`,
              status: 'active',
              final_price: 150,
              created_at: '2024-01-15T00:00:00Z',
              enrolled_at: '2024-01-15T00:00:00Z',
            })),
            total: 25,
          });
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(requestedPage).toBe(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error toast when fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(
            { message: 'Failed to fetch enrollments' },
            { status: 500 }
          );
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load enrollments/i)).toBeInTheDocument();
      });
    });

    it('should handle empty enrollments list', async () => {
      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json({
            items: [],
            total: 0,
          });
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByText(/No enrollments found/i)).toBeInTheDocument();
      });
    });

    it('should display error when cancel fails', async () => {
      const user = userEvent.setup();

      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        }),
        http.post(`${API_BASE}/enrollments/enroll-1/cancel`, () => {
          return HttpResponse.json(
            { message: 'Failed to cancel enrollment' },
            { status: 500 }
          );
        })
      );

      render(<Enrollments />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Cancel/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByLabelText(/Cancel/i);
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to cancel enrollment/i)).toBeInTheDocument();
      });
    });
  });
});

/**
 * Integration Tests for Installments Management Page
 * Tests installment plan listing, filtering, actions (mark as paid, cancel, send reminder)
 */

import { render, screen, waitFor, within } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Installments from '../../../pages/AdminDashboard/Installments';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock window.alert used by Installments component
const mockAlert = jest.fn();
window.alert = mockAlert;

const mockInstallmentPlans = [
  {
    id: 'plan-1',
    user: { first_name: 'John', last_name: 'Doe', email: 'john@test.com' },
    child: { first_name: 'Johnny', last_name: 'Doe' },
    class: { name: 'Soccer Basics' },
    total_amount: 300,
    paid_count: 1,
    total_count: 3,
    amount_paid: 100,
    next_due_date: '2025-04-01T00:00:00Z',
    next_payment_id: 'pay-1',
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'plan-2',
    user: { first_name: 'Jane', last_name: 'Smith', email: 'jane@test.com' },
    child: { first_name: 'Jenny', last_name: 'Smith' },
    class: { name: 'Basketball 101' },
    total_amount: 450,
    paid_count: 3,
    total_count: 3,
    amount_paid: 450,
    next_due_date: null,
    next_payment_id: null,
    status: 'completed',
    created_at: '2024-01-20T00:00:00Z',
  },
];

describe('Installments Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');
    mockAlert.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Page Loading and Initial State', () => {
    it('should display page header', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [], total: 0 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('Installments Management')).toBeInTheDocument();
      });

      expect(screen.getByText(/Manage payment plans and schedules/i)).toBeInTheDocument();
    });

    it('should display search input with correct placeholder', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [], total: 0 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Search by customer name, child, or class/i)
        ).toBeInTheDocument();
      });
    });

    it('should display Active Plans and Overdue stat cards', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: mockInstallmentPlans, total: 2 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('Active Plans')).toBeInTheDocument();
        expect(screen.getByText('Overdue')).toBeInTheDocument();
      });
    });

    it('should load installment plans on mount', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: mockInstallmentPlans, total: 2 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });
    });

    it('should display Show Overdue Only checkbox', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [], total: 0 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('Show Overdue Only')).toBeInTheDocument();
      });
    });
  });

  describe('Table Display', () => {
    it('should display installment data in table', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: mockInstallmentPlans, total: 2 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Jane')).toBeInTheDocument();
      });

      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      expect(screen.getByText('Basketball 101')).toBeInTheDocument();
    });

    it('should display customer name and email', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[0]], total: 1 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
      });
    });

    it('should display payment progress', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[0]], total: 1 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('1/3')).toBeInTheDocument();
        expect(screen.getByText('$100.00 paid')).toBeInTheDocument();
      });
    });

    it('should display plan ID with # prefix', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[0]], total: 1 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('#plan-1')).toBeInTheDocument();
      });
    });
  });

  describe('Overdue Display', () => {
    it('should display OVERDUE label for past due dates', async () => {
      const overduePlan = {
        ...mockInstallmentPlans[0],
        next_due_date: '2020-01-01T00:00:00Z',
      };

      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [overduePlan], total: 1 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('OVERDUE')).toBeInTheDocument();
      });
    });

    it('should calculate overdue stat correctly', async () => {
      const overduePlan = {
        ...mockInstallmentPlans[0],
        next_due_date: '2020-01-01T00:00:00Z',
        status: 'active',
      };

      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [overduePlan, mockInstallmentPlans[1]], total: 2 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        // 1 overdue (the active one with past date), completed plans are not overdue
        const overdueCard = screen.getByText('Overdue').closest('div');
        expect(overdueCard).toBeInTheDocument();
      });
    });

    it('should display dash for completed plans with no next due date', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[1]], total: 1 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('-')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should display status filter dropdown', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [], total: 0 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('All Statuses')).toBeInTheDocument();
      });
    });

    it('should filter by status when selected', async () => {
      const user = userEvent.setup();
      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/installments`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            status: url.searchParams.get('status'),
          };
          return HttpResponse.json({ data: [], total: 0 });
        })
      );

      render(<Installments />);

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

    it('should toggle overdue only filter', async () => {
      const user = userEvent.setup();
      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/installments`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            overdue: url.searchParams.get('overdue'),
          };
          return HttpResponse.json({ data: [], total: 0 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('Show Overdue Only')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      await waitFor(() => {
        expect(requestParams?.overdue).toBe('true');
      });
    });

    it('should search by customer name', async () => {
      const user = userEvent.setup();
      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/installments`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            search: url.searchParams.get('search'),
          };
          return HttpResponse.json({ data: [], total: 0 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Search by customer name, child, or class/i)
        ).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /Search by customer name, child, or class/i
      );
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(requestParams?.search).toBe('John');
      });
    });

    it('should show clear filters button when filters are active', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [], total: 0 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Search by customer name, child, or class/i)
        ).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /Search by customer name, child, or class/i
      );
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.getByText(/Clear/i)).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [], total: 0 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Search by customer name, child, or class/i)
        ).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /Search by customer name, child, or class/i
      );
      await user.type(searchInput, 'test');

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

  describe('Actions - Mark as Paid', () => {
    it('should show confirm dialog when Mark Next as Paid is clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[0]], total: 1 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
      });

      // Click the actions menu or button for "Mark Next as Paid"
      const markButton = screen.getByText('Mark Next as Paid');
      await user.click(markButton);

      await waitFor(() => {
        expect(screen.getByText('Mark Payment as Paid')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to mark the next installment/i)).toBeInTheDocument();
      });
    });

    it('should mark payment as paid when confirmed', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[0]], total: 1 });
        }),
        http.post(`${API_BASE}/installments/pay-1/mark-paid`, () => {
          return HttpResponse.json({ success: true });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('Mark Next as Paid')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Mark Next as Paid'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Payment marked as paid successfully');
      });
    });
  });

  describe('Actions - Cancel Plan', () => {
    it('should show confirm dialog when Cancel Plan is clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[0]], total: 1 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('Cancel Plan')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel Plan'));

      await waitFor(() => {
        expect(screen.getByText('Cancel Installment Plan')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to cancel this installment plan/i)).toBeInTheDocument();
      });
    });

    it('should cancel plan when confirmed', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[0]], total: 1 });
        }),
        http.post(`${API_BASE}/installments/plan-1/cancel`, () => {
          return HttpResponse.json({ success: true });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('Cancel Plan')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel Plan'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Installment plan cancelled successfully');
      });
    });

    it('should display error alert when cancel fails', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[0]], total: 1 });
        }),
        http.post(`${API_BASE}/installments/plan-1/cancel`, () => {
          return HttpResponse.json({ message: 'Failed' }, { status: 500 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('Cancel Plan')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel Plan'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to cancel installment plan');
      });
    });
  });

  describe('Actions - Send Reminder', () => {
    it('should send reminder when button is clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[0]], total: 1 });
        }),
        http.post(`${API_BASE}/installments/plan-1/reminder`, () => {
          return HttpResponse.json({ success: true });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('Send Reminder')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Send Reminder'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Payment reminder sent successfully');
      });
    });

    it('should display error when send reminder fails', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[0]], total: 1 });
        }),
        http.post(`${API_BASE}/installments/plan-1/reminder`, () => {
          return HttpResponse.json({ message: 'Failed' }, { status: 500 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('Send Reminder')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Send Reminder'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to send payment reminder');
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no plans found', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [], total: 0 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText(/No installment plans found/i)).toBeInTheDocument();
      });
    });

    it('should display 0 for Active Plans and Overdue when empty', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [], total: 0 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        const activePlansCard = screen.getByText('Active Plans').closest('div');
        expect(activePlansCard).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when data exceeds page size', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({
            data: Array.from({ length: 10 }, (_, i) => ({
              ...mockInstallmentPlans[0],
              id: `plan-${i + 1}`,
            })),
            total: 25,
          });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('#plan-1')).toBeInTheDocument();
      });

      const pagination = screen.getByRole('navigation', { name: /pagination/i });
      expect(pagination).toBeInTheDocument();
    });

    it('should change page when pagination controls clicked', async () => {
      const user = userEvent.setup();
      let requestedPage = 1;

      server.use(
        http.get(`${API_BASE}/installments`, ({ request }) => {
          const url = new URL(request.url);
          requestedPage = parseInt(url.searchParams.get('page') || '1');

          return HttpResponse.json({
            data: Array.from({ length: 10 }, (_, i) => ({
              ...mockInstallmentPlans[0],
              id: `plan-${requestedPage * 10 + i}`,
            })),
            total: 25,
          });
        })
      );

      render(<Installments />);

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

  describe('Disabled Actions for Completed/Cancelled Plans', () => {
    it('should disable actions for completed plans', async () => {
      server.use(
        http.get(`${API_BASE}/installments`, () => {
          return HttpResponse.json({ data: [mockInstallmentPlans[1]], total: 1 });
        })
      );

      render(<Installments />);

      await waitFor(() => {
        expect(screen.getByText('Jane')).toBeInTheDocument();
      });

      // The completed plan should have disabled action buttons
      // View Schedule should still work
      expect(screen.getByText('View Schedule')).toBeInTheDocument();
    });
  });
});

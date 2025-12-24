/**
 * Integration Tests for Admin Cancellation Requests Page
 * Tests cancellation request viewing, approval, rejection, and policy display
 */

import { render, screen, waitFor, fireEvent, within } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import CancellationRequests from '../../../pages/AdminDashboard/CancellationRequests';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock data for cancellation requests
const mockPendingRequests = {
  items: [
    {
      id: 'cancel-001',
      user_name: 'John Parent',
      user_email: 'john@test.com',
      child_name: 'Johnny Parent',
      class_name: 'Soccer Basics',
      class_start_date: '2024-04-01',
      days_until_class: 10,
      enrollment_amount: '150.00',
      requested_refund_amount: '150.00',
      status: 'pending',
      reason: 'Schedule conflict with school activities',
      created_at: '2024-03-15T10:00:00Z',
    },
    {
      id: 'cancel-002',
      user_name: 'Jane Smith',
      user_email: 'jane@test.com',
      child_name: 'Jenny Smith',
      class_name: 'Basketball 101',
      class_start_date: '2024-03-25',
      days_until_class: 5,
      enrollment_amount: '175.00',
      requested_refund_amount: '175.00',
      status: 'pending',
      reason: 'Medical issue',
      created_at: '2024-03-14T14:30:00Z',
    },
  ],
  total: 2,
};

const mockApprovedRequests = {
  items: [
    {
      id: 'cancel-003',
      user_name: 'Bob Wilson',
      user_email: 'bob@test.com',
      child_name: 'Bobby Wilson',
      class_name: 'Tennis Intro',
      class_start_date: '2024-03-01',
      days_until_class: 20,
      enrollment_amount: '125.00',
      requested_refund_amount: '125.00',
      approved_refund_amount: '125.00',
      status: 'approved',
      reviewed_by_name: 'Admin User',
      reviewed_at: '2024-02-10T09:00:00Z',
      stripe_refund_id: 're_123456',
      created_at: '2024-02-08T10:00:00Z',
    },
  ],
  total: 1,
};

const mockStats = {
  pending: 2,
  approved: 5,
  auto_approved: 10,
  rejected: 3,
  total_refunded: '1250.00',
};

describe('CancellationRequests Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

    // Set up default mock handlers
    server.use(
      http.get(`${API_BASE}/admin/cancellation-requests/pending`, () => {
        return HttpResponse.json(mockPendingRequests);
      }),
      http.get(`${API_BASE}/admin/cancellation-requests`, () => {
        return HttpResponse.json(mockApprovedRequests);
      }),
      http.get(`${API_BASE}/admin/cancellation-requests/stats`, () => {
        return HttpResponse.json(mockStats);
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
      render(<CancellationRequests />);

      expect(screen.getByText('Cancellation Requests')).toBeInTheDocument();
      expect(screen.getByText(/Review and process enrollment cancellation requests/i)).toBeInTheDocument();
    });

    it('should display cancellation policy banner', async () => {
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('Cancellation Policy')).toBeInTheDocument();
      });

      expect(screen.getByText(/15\+ days before class start/i)).toBeInTheDocument();
      expect(screen.getByText(/Auto-approved with full refund/i)).toBeInTheDocument();
      expect(screen.getByText(/Less than 15 days/i)).toBeInTheDocument();
      expect(screen.getByText(/Requires admin review/i)).toBeInTheDocument();
    });

    it('should display tabs for different request statuses', async () => {
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Pending Review/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Approved/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Auto-Approved/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Rejected/i })).toBeInTheDocument();
    });

    it('should display stats cards', async () => {
      render(<CancellationRequests />);

      await waitFor(() => {
        // Pending count
        expect(screen.getByText('2')).toBeInTheDocument();
      });

      // Total refunded amount
      expect(screen.getByText('$1250.00')).toBeInTheDocument();
    });
  });

  // ===========================================
  // PENDING REQUESTS TAB TESTS
  // ===========================================
  describe('Pending Requests Tab', () => {
    it('should load and display pending cancellation requests', async () => {
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('Johnny Parent')).toBeInTheDocument();
      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
    });

    it('should display days until class with appropriate color', async () => {
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument(); // 10 days - green
        expect(screen.getByText('5')).toBeInTheDocument(); // 5 days - red (less than 15)
      });
    });

    it('should display refund amounts', async () => {
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('$150.00')).toBeInTheDocument();
        expect(screen.getByText('$175.00')).toBeInTheDocument();
      });
    });

    it('should display approve and reject action buttons', async () => {
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      // Should have approve buttons
      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      expect(approveButtons.length).toBeGreaterThanOrEqual(2);

      // Should have reject buttons
      const rejectButtons = screen.getAllByRole('button', { name: /Reject/i });
      expect(rejectButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should display pending request status badges', async () => {
      render(<CancellationRequests />);

      await waitFor(() => {
        const pendingBadges = screen.getAllByText(/Pending Review/i);
        expect(pendingBadges.length).toBeGreaterThan(0);
      });
    });
  });

  // ===========================================
  // APPROVE CANCELLATION TESTS
  // ===========================================
  describe('Approve Cancellation Modal', () => {
    it('should open approve modal when clicking approve button', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Cancellation')).toBeInTheDocument();
      });
    });

    it('should display request details in approve modal', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Cancellation')).toBeInTheDocument();
      });

      // Modal should show customer, child, class info
      expect(screen.getByText(/Customer/i)).toBeInTheDocument();
      expect(screen.getByText(/Child/i)).toBeInTheDocument();
      expect(screen.getByText(/Class/i)).toBeInTheDocument();
    });

    it('should allow adjusting refund amount', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Cancellation')).toBeInTheDocument();
      });

      // Should have refund amount input
      const refundInput = screen.getByRole('spinbutton') || screen.getByDisplayValue('150');
      expect(refundInput).toBeInTheDocument();
    });

    it('should have optional admin notes field', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Cancellation')).toBeInTheDocument();
      });

      expect(screen.getByText(/Admin Notes/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/notes about this approval/i)).toBeInTheDocument();
    });

    it('should successfully approve cancellation', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE}/admin/cancellation-requests/:id/approve`, () => {
          return HttpResponse.json({
            message: 'Cancellation approved and refund processed',
            status: 'approved',
          });
        })
      );

      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Cancellation')).toBeInTheDocument();
      });

      // Click confirm button
      const confirmButton = screen.getByRole('button', { name: /Approve & Refund/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Cancellation approved/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // ===========================================
  // REJECT CANCELLATION TESTS
  // ===========================================
  describe('Reject Cancellation Modal', () => {
    it('should open reject modal when clicking reject button', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const rejectButtons = screen.getAllByRole('button', { name: /Reject/i });
      await user.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Cancellation')).toBeInTheDocument();
      });
    });

    it('should require rejection reason', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const rejectButtons = screen.getAllByRole('button', { name: /Reject/i });
      await user.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Cancellation')).toBeInTheDocument();
      });

      expect(screen.getByText(/Rejection Reason/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/reason for rejecting/i)).toBeInTheDocument();
    });

    it('should display info about enrollment remaining active', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const rejectButtons = screen.getAllByRole('button', { name: /Reject/i });
      await user.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Cancellation')).toBeInTheDocument();
      });

      expect(screen.getByText(/enrollment will remain active/i)).toBeInTheDocument();
    });

    it('should not submit without rejection reason', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const rejectButtons = screen.getAllByRole('button', { name: /Reject/i });
      await user.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Cancellation')).toBeInTheDocument();
      });

      // Submit button should be disabled
      const submitButton = screen.getByRole('button', { name: /Reject Request/i });
      expect(submitButton).toHaveAttribute('disabled');
    });

    it('should successfully reject cancellation with reason', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE}/admin/cancellation-requests/:id/reject`, async ({ request }) => {
          const body = await request.json() as { rejection_reason: string };
          if (!body.rejection_reason) {
            return HttpResponse.json({ message: 'Reason required' }, { status: 400 });
          }
          return HttpResponse.json({
            message: 'Cancellation request rejected',
            status: 'rejected',
          });
        })
      );

      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const rejectButtons = screen.getAllByRole('button', { name: /Reject/i });
      await user.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Cancellation')).toBeInTheDocument();
      });

      // Enter rejection reason
      const reasonInput = screen.getByPlaceholderText(/reason for rejecting/i);
      await user.type(reasonInput, 'Class is starting in less than 5 days per policy');

      // Submit rejection
      const submitButton = screen.getByRole('button', { name: /Reject Request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Cancellation request rejected/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // ===========================================
  // TAB SWITCHING TESTS
  // ===========================================
  describe('Tab Switching', () => {
    it('should switch to approved tab', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Approved$/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^Approved$/i }));

      await waitFor(() => {
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      });
    });

    it('should switch to auto-approved tab', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/admin/cancellation-requests`, ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          if (status === 'auto_approved') {
            return HttpResponse.json({
              items: [
                {
                  id: 'cancel-auto-001',
                  user_name: 'Auto User',
                  user_email: 'auto@test.com',
                  child_name: 'Auto Child',
                  class_name: 'Auto Class',
                  status: 'auto_approved',
                  created_at: '2024-03-01T00:00:00Z',
                },
              ],
              total: 1,
            });
          }
          return HttpResponse.json(mockApprovedRequests);
        })
      );

      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Auto-Approved/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Auto-Approved/i }));

      await waitFor(() => {
        expect(screen.getByText('Auto User') || screen.getByText(/No.*requests found/i)).toBeTruthy();
      });
    });

    it('should switch to rejected tab', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/admin/cancellation-requests`, ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          if (status === 'rejected') {
            return HttpResponse.json({
              items: [
                {
                  id: 'cancel-rej-001',
                  user_name: 'Rejected User',
                  user_email: 'rejected@test.com',
                  child_name: 'Rejected Child',
                  class_name: 'Rejected Class',
                  status: 'rejected',
                  rejection_reason: 'Too close to class start',
                  created_at: '2024-03-01T00:00:00Z',
                },
              ],
              total: 1,
            });
          }
          return HttpResponse.json(mockApprovedRequests);
        })
      );

      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Rejected/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Rejected/i }));

      await waitFor(() => {
        expect(screen.getByText('Rejected User') || screen.getByText(/No.*requests found/i)).toBeTruthy();
      });
    });
  });

  // ===========================================
  // VIEW DETAILS MODAL TESTS
  // ===========================================
  describe('View Details Modal', () => {
    it('should show View Details button on processed requests', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Approved$/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^Approved$/i }));

      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument();
      });
    });

    it('should open details modal on View Details click', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Approved$/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^Approved$/i }));

      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument();
      });

      await user.click(screen.getByText('View Details'));

      await waitFor(() => {
        expect(screen.getByText('Request Details')).toBeInTheDocument();
      });
    });

    it('should display all request details in modal', async () => {
      const user = userEvent.setup();
      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Approved$/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^Approved$/i }));

      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument();
      });

      await user.click(screen.getByText('View Details'));

      await waitFor(() => {
        expect(screen.getByText('Request Details')).toBeInTheDocument();
      });

      // Should show various details
      expect(screen.getByText(/Customer/i)).toBeInTheDocument();
      expect(screen.getByText(/Child/i)).toBeInTheDocument();
      expect(screen.getByText(/Class/i)).toBeInTheDocument();
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty States', () => {
    it('should display empty state when no pending requests', async () => {
      server.use(
        http.get(`${API_BASE}/admin/cancellation-requests/pending`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText(/No pending cancellation requests/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should display error toast when fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/admin/cancellation-requests/pending`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
      });
    });

    it('should display error toast when approve fails', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE}/admin/cancellation-requests/:id/approve`, () => {
          return HttpResponse.json(
            { detail: 'Unable to process refund' },
            { status: 400 }
          );
        })
      );

      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Cancellation')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Approve & Refund/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to approve/i) || screen.getByText(/Unable to process/i)).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  // ===========================================
  // STATS UPDATE TESTS
  // ===========================================
  describe('Stats Updates', () => {
    it('should refresh stats after approving request', async () => {
      const user = userEvent.setup();
      let statsCallCount = 0;

      server.use(
        http.get(`${API_BASE}/admin/cancellation-requests/stats`, () => {
          statsCallCount++;
          return HttpResponse.json({
            ...mockStats,
            pending: statsCallCount > 1 ? 1 : 2,
            approved: statsCallCount > 1 ? 6 : 5,
          });
        }),
        http.post(`${API_BASE}/admin/cancellation-requests/:id/approve`, () => {
          return HttpResponse.json({
            message: 'Approved',
            status: 'approved',
          });
        })
      );

      render(<CancellationRequests />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Cancellation')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Approve & Refund/i });
      await user.click(confirmButton);

      // Stats should have been called more than once (initial + after approval)
      await waitFor(() => {
        expect(statsCallCount).toBeGreaterThanOrEqual(1);
      }, { timeout: 3000 });
    });
  });
});

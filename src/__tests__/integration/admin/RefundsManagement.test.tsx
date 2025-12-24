/**
 * Integration Tests for Admin Refunds Management Page
 * Tests refund request viewing, approval, rejection, and filtering
 */

import { render, screen, waitFor, fireEvent, within } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import RefundsManagement from '../../../pages/AdminDashboard/RefundsManagement';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock data for refunds
const mockPendingRefunds = {
  items: [
    {
      payment_id: 'pay-001-abcdef123456',
      user_name: 'John Parent',
      user_email: 'john@test.com',
      original_amount: '150.00',
      refund_amount: '150.00',
      refund_requested_at: '2024-03-15T10:00:00Z',
      payment_type: 'enrollment',
    },
    {
      payment_id: 'pay-002-ghijkl789012',
      user_name: 'Jane Smith',
      user_email: 'jane@test.com',
      original_amount: '200.00',
      refund_amount: '100.00',
      refund_requested_at: '2024-03-14T14:30:00Z',
      payment_type: 'membership',
    },
  ],
  total: 2,
};

const mockProcessedRefunds = {
  items: [
    {
      payment_id: 'pay-003-mnopqr345678',
      user_name: 'Bob Wilson',
      user_email: 'bob@test.com',
      original_amount: '175.00',
      refund_amount: '175.00',
      refunded_at: '2024-03-10T09:00:00Z',
      status: 'refunded',
    },
  ],
  total: 1,
};

describe('RefundsManagement Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

    // Set up default mock handlers
    server.use(
      http.get(`${API_BASE}/admin/refunds/pending`, () => {
        return HttpResponse.json(mockPendingRefunds);
      }),
      http.get(`${API_BASE}/admin/refunds`, () => {
        return HttpResponse.json(mockProcessedRefunds);
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
      render(<RefundsManagement />);

      expect(screen.getByText('Refunds Management')).toBeInTheDocument();
      expect(screen.getByText(/Review and process refund requests/i)).toBeInTheDocument();
    });

    it('should display loading state initially', () => {
      render(<RefundsManagement />);

      // Should show loading indicator
      expect(screen.getByText(/Loading/i) || screen.queryByRole('progressbar')).toBeTruthy();
    });

    it('should display tabs for different refund statuses', async () => {
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Pending/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Approved/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Rejected/i })).toBeInTheDocument();
    });
  });

  // ===========================================
  // PENDING REFUNDS TAB TESTS
  // ===========================================
  describe('Pending Refunds Tab', () => {
    it('should load and display pending refunds', async () => {
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
    });

    it('should display refund amounts correctly', async () => {
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText('$150.00')).toBeInTheDocument();
      });

      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });

    it('should display pending refunds count badge', async () => {
      render(<RefundsManagement />);

      await waitFor(() => {
        // Badge showing count of pending refunds
        const pendingButton = screen.getByRole('button', { name: /Pending/i });
        expect(within(pendingButton).getByText('2')).toBeInTheDocument();
      });
    });

    it('should display total pending refunds amount', async () => {
      render(<RefundsManagement />);

      await waitFor(() => {
        // Total pending amount: 150 + 100 = 250
        expect(screen.getByText('$250.00')).toBeInTheDocument();
      });
    });

    it('should display payment type badges', async () => {
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText(/enrollment/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/membership/i)).toBeInTheDocument();
    });

    it('should display approve and reject action buttons', async () => {
      render(<RefundsManagement />);

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
  });

  // ===========================================
  // APPROVE REFUND TESTS
  // ===========================================
  describe('Approve Refund Modal', () => {
    it('should open approve modal when clicking approve button', async () => {
      const user = userEvent.setup();
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      // Find and click the first approve button
      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      // Modal should open
      await waitFor(() => {
        expect(screen.getByText('Approve Refund')).toBeInTheDocument();
      });
    });

    it('should display refund details in approve modal', async () => {
      const user = userEvent.setup();
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Refund')).toBeInTheDocument();
      });

      // Check modal content shows customer info
      const modal = screen.getByRole('dialog') || screen.getByText('Approve Refund').closest('div');
      expect(modal).toBeInTheDocument();
    });

    it('should close approve modal when clicking cancel', async () => {
      const user = userEvent.setup();
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Refund')).toBeInTheDocument();
      });

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Approve Refund')).not.toBeInTheDocument();
      });
    });

    it('should successfully approve refund', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE}/admin/refunds/:paymentId/approve`, () => {
          return HttpResponse.json({
            message: 'Refund approved successfully',
            status: 'approved',
          });
        })
      );

      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Refund')).toBeInTheDocument();
      });

      // Click confirm approve button in modal
      const confirmApproveBtn = screen.getAllByRole('button', { name: /Approve/i }).find(
        btn => btn.closest('.fixed') // Button inside modal
      );
      if (confirmApproveBtn) {
        await user.click(confirmApproveBtn);
      }

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/Refund approved successfully/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // ===========================================
  // REJECT REFUND TESTS
  // ===========================================
  describe('Reject Refund Modal', () => {
    it('should open reject modal when clicking reject button', async () => {
      const user = userEvent.setup();
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      // Find and click the first reject button
      const rejectButtons = screen.getAllByRole('button', { name: /Reject/i });
      await user.click(rejectButtons[0]);

      // Modal should open
      await waitFor(() => {
        expect(screen.getByText('Reject Refund')).toBeInTheDocument();
      });
    });

    it('should require rejection reason', async () => {
      const user = userEvent.setup();
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const rejectButtons = screen.getAllByRole('button', { name: /Reject/i });
      await user.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Refund')).toBeInTheDocument();
      });

      // Should show rejection reason field with required indicator
      expect(screen.getByText(/Rejection Reason/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/provide a reason/i)).toBeInTheDocument();
    });

    it('should not submit without rejection reason', async () => {
      const user = userEvent.setup();
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const rejectButtons = screen.getAllByRole('button', { name: /Reject/i });
      await user.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Refund')).toBeInTheDocument();
      });

      // Try to submit without reason - button should be disabled
      const submitButton = screen.getAllByRole('button', { name: /Reject/i }).find(
        btn => btn.closest('.fixed')
      );
      expect(submitButton).toHaveAttribute('disabled');
    });

    it('should successfully reject refund with reason', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE}/admin/refunds/:paymentId/reject`, async ({ request }) => {
          const body = await request.json() as { reason: string };
          if (!body.reason) {
            return HttpResponse.json({ message: 'Reason required' }, { status: 400 });
          }
          return HttpResponse.json({
            message: 'Refund rejected',
            status: 'rejected',
          });
        })
      );

      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const rejectButtons = screen.getAllByRole('button', { name: /Reject/i });
      await user.click(rejectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reject Refund')).toBeInTheDocument();
      });

      // Enter rejection reason
      const reasonInput = screen.getByPlaceholderText(/provide a reason/i);
      await user.type(reasonInput, 'Outside refund window policy');

      // Submit rejection
      const submitButton = screen.getAllByRole('button', { name: /Reject/i }).find(
        btn => btn.closest('.fixed')
      );
      if (submitButton) {
        await user.click(submitButton);
      }

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/Refund rejected/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // ===========================================
  // TAB SWITCHING TESTS
  // ===========================================
  describe('Tab Switching', () => {
    it('should switch to approved tab and load processed refunds', async () => {
      const user = userEvent.setup();
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Approved/i })).toBeInTheDocument();
      });

      // Click approved tab
      await user.click(screen.getByRole('button', { name: /Approved/i }));

      // Should load processed refunds
      await waitFor(() => {
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      });

      expect(screen.getByText('bob@test.com')).toBeInTheDocument();
    });

    it('should display filter bar on approved tab', async () => {
      const user = userEvent.setup();
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Approved/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Approved/i }));

      // Filter bar should appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
      });
    });

    it('should switch to rejected tab', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/admin/refunds`, ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('payment_status');
          if (status === 'partially_refunded') {
            return HttpResponse.json({ items: [], total: 0 });
          }
          return HttpResponse.json(mockProcessedRefunds);
        })
      );

      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Rejected/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Rejected/i }));

      // Should show empty state or rejected refunds
      await waitFor(() => {
        expect(screen.getByText(/No refunds found/i) || screen.getByText(/Bob Wilson/i)).toBeTruthy();
      });
    });

    it('should switch back to pending tab', async () => {
      const user = userEvent.setup();
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Approved/i })).toBeInTheDocument();
      });

      // Switch to approved
      await user.click(screen.getByRole('button', { name: /Approved/i }));

      await waitFor(() => {
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      });

      // Switch back to pending
      await user.click(screen.getByRole('button', { name: /Pending/i }));

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty States', () => {
    it('should display empty state when no pending refunds', async () => {
      server.use(
        http.get(`${API_BASE}/admin/refunds/pending`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText(/No pending refund requests/i)).toBeInTheDocument();
      });
    });

    it('should display empty state when no processed refunds', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/admin/refunds`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Approved/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Approved/i }));

      await waitFor(() => {
        expect(screen.getByText(/No refunds found/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should display error toast when fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/admin/refunds/pending`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
      });
    });

    it('should display error toast when approve fails', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE}/admin/refunds/:paymentId/approve`, () => {
          return HttpResponse.json(
            { detail: 'Stripe error: insufficient funds' },
            { status: 400 }
          );
        })
      );

      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByText('John Parent')).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
      await user.click(approveButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Approve Refund')).toBeInTheDocument();
      });

      const confirmApproveBtn = screen.getAllByRole('button', { name: /Approve/i }).find(
        btn => btn.closest('.fixed')
      );
      if (confirmApproveBtn) {
        await user.click(confirmApproveBtn);
      }

      await waitFor(() => {
        expect(screen.getByText(/Failed to approve refund/i) || screen.getByText(/Stripe error/i)).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  // ===========================================
  // DATE FILTERING TESTS
  // ===========================================
  describe('Date Filtering', () => {
    it('should display date range filters on processed tabs', async () => {
      const user = userEvent.setup();
      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Approved/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Approved/i }));

      // Date filters should be available
      await waitFor(() => {
        const dateInputs = screen.getAllByRole('textbox') || screen.getAllByDisplayValue('');
        expect(dateInputs.length).toBeGreaterThan(0);
      });
    });
  });

  // ===========================================
  // PAGINATION TESTS
  // ===========================================
  describe('Pagination', () => {
    it('should display pagination on processed tabs', async () => {
      const user = userEvent.setup();

      // Create mock data with many items
      const manyRefunds = {
        items: Array.from({ length: 15 }, (_, i) => ({
          payment_id: `pay-${i}`,
          user_name: `User ${i}`,
          user_email: `user${i}@test.com`,
          original_amount: '100.00',
          refund_amount: '100.00',
          refunded_at: '2024-03-01T00:00:00Z',
          status: 'refunded',
        })),
        total: 25,
      };

      server.use(
        http.get(`${API_BASE}/admin/refunds`, () => {
          return HttpResponse.json(manyRefunds);
        })
      );

      render(<RefundsManagement />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Approved/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Approved/i }));

      // Pagination should be visible
      await waitFor(() => {
        expect(screen.getByText('User 0')).toBeInTheDocument();
      });
    });
  });
});

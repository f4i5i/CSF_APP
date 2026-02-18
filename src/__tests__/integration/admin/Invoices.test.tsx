/**
 * Integration Tests for Invoices Management Page
 * Tests invoice listing, filtering, Stripe sync, view modal, and download
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Invoices from '../../../pages/AdminDashboard/Invoices';

const API_BASE = 'http://localhost:8000/api/v1';

const mockInvoices = [
  {
    id: 'inv-1',
    invoice_number: 'INV-2024-001',
    invoice_date: '2024-01-15T00:00:00Z',
    due_date: '2024-02-15T00:00:00Z',
    user_name: 'John Doe',
    user_email: 'john@test.com',
    user: { full_name: 'John Doe', email: 'john@test.com' },
    description: 'Soccer Basics Registration',
    subtotal: 150,
    discount: 0,
    tax: 0,
    total: 150,
    amount_paid: 150,
    status: 'paid',
    stripe_invoice_id: 'in_1234567890abcdef',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-2024-002',
    invoice_date: '2024-02-01T00:00:00Z',
    due_date: '2024-03-01T00:00:00Z',
    user_name: 'Jane Smith',
    user_email: 'jane@test.com',
    user: { full_name: 'Jane Smith', email: 'jane@test.com' },
    description: 'Basketball 101 Registration',
    subtotal: 200,
    discount: 25,
    tax: 10,
    total: 185,
    amount_paid: 0,
    status: 'sent',
    stripe_invoice_id: null,
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'inv-3',
    invoice_number: 'INV-2024-003',
    invoice_date: '2024-01-10T00:00:00Z',
    due_date: '2024-01-25T00:00:00Z',
    user_name: 'Bob Wilson',
    user_email: 'bob@test.com',
    description: null,
    subtotal: 100,
    discount: 0,
    tax: 0,
    total: 100,
    amount_paid: 50,
    status: 'overdue',
    stripe_invoice_id: null,
    created_at: '2024-01-10T00:00:00Z',
  },
];

describe('Invoices Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Page Loading and Initial State', () => {
    it('should display page header', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('Invoices')).toBeInTheDocument();
      });

      expect(screen.getByText(/View and manage all invoices/i)).toBeInTheDocument();
    });

    it('should display Sync from Stripe button', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('Sync from Stripe')).toBeInTheDocument();
      });
    });

    it('should display search input with correct placeholder', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Search by invoice # or customer/i)
        ).toBeInTheDocument();
      });
    });

    it('should display Total Paid stat card', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: mockInvoices, total: 3 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('Total Paid')).toBeInTheDocument();
      });
    });

    it('should load invoices on mount', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: mockInvoices, total: 3 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
        expect(screen.getByText('INV-2024-002')).toBeInTheDocument();
      });
    });
  });

  describe('Table Display', () => {
    it('should display invoice number with icon', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [mockInvoices[0]], total: 1 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      });
    });

    it('should display customer information', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [mockInvoices[0]], total: 1 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
      });
    });

    it('should display status badges', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: mockInvoices, total: 3 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('Paid')).toBeInTheDocument();
        expect(screen.getByText('Sent')).toBeInTheDocument();
        expect(screen.getByText('Overdue')).toBeInTheDocument();
      });
    });

    it('should display truncated Stripe invoice ID', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [mockInvoices[0]], total: 1 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText(/in_12345678/)).toBeInTheDocument();
      });
    });

    it('should display dash for missing Stripe ID', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [mockInvoices[1]], total: 1 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Stripe column shows '-' for null stripe_invoice_id
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should show default description when null', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [mockInvoices[2]], total: 1 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('Class Registration')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should display status filter dropdown', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('All Statuses')).toBeInTheDocument();
      });
    });

    it('should filter by status when selected', async () => {
      const user = userEvent.setup();
      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/invoices`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            status: url.searchParams.get('status'),
          };
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('All Statuses')).toBeInTheDocument();
      });

      const statusFilter = screen.getByDisplayValue('All Statuses').closest('select');
      if (statusFilter) {
        await user.selectOptions(statusFilter, 'paid');
      }

      await waitFor(() => {
        expect(requestParams?.status).toBe('paid');
      });
    });

    it('should show clear filters button when filters are active', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by invoice # or customer/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by invoice # or customer/i);
      await user.type(searchInput, 'INV-2024');

      await waitFor(() => {
        expect(screen.getByText(/Clear/i)).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by invoice # or customer/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by invoice # or customer/i);
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.getByText(/Clear/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/Clear/i));

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });
    });
  });

  describe('Stripe Sync', () => {
    it('should show syncing state when sync button clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        }),
        http.post(`${API_BASE}/invoices/sync-all`, async () => {
          // Delay to show loading state
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            summary: { created: 5, updated: 2 },
          });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('Sync from Stripe')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Sync from Stripe'));

      await waitFor(() => {
        expect(screen.getByText('Syncing...')).toBeInTheDocument();
      });
    });

    it('should display success message after sync', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        }),
        http.post(`${API_BASE}/invoices/sync-all`, () => {
          return HttpResponse.json({
            summary: { created: 5, updated: 2 },
          });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('Sync from Stripe')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Sync from Stripe'));

      await waitFor(() => {
        expect(screen.getByText(/Synced 5 new, 2 updated invoices from Stripe/i)).toBeInTheDocument();
      });
    });

    it('should display error message when sync fails', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        }),
        http.post(`${API_BASE}/invoices/sync-all`, () => {
          return HttpResponse.json({ message: 'Sync failed' }, { status: 500 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('Sync from Stripe')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Sync from Stripe'));

      await waitFor(() => {
        expect(screen.getByText(/Failed to sync invoices from Stripe/i)).toBeInTheDocument();
      });
    });
  });

  describe('View Invoice Modal', () => {
    it('should open view modal when View action clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [mockInvoices[0]], total: 1 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      });

      const viewButton = screen.getByText('View');
      await user.click(viewButton);

      await waitFor(() => {
        expect(screen.getByText('Invoice Details')).toBeInTheDocument();
      });
    });

    it('should display invoice details in modal', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [mockInvoices[0]], total: 1 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      });

      await user.click(screen.getByText('View'));

      await waitFor(() => {
        expect(screen.getByText('Invoice Details')).toBeInTheDocument();
        expect(screen.getByText('Invoice Number')).toBeInTheDocument();
        expect(screen.getByText('Customer')).toBeInTheDocument();
        expect(screen.getByText('Stripe Invoice ID')).toBeInTheDocument();
      });
    });

    it('should close modal when Close button clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [mockInvoices[0]], total: 1 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      });

      await user.click(screen.getByText('View'));

      await waitFor(() => {
        expect(screen.getByText('Invoice Details')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Close'));

      await waitFor(() => {
        expect(screen.queryByText('Invoice Details')).not.toBeInTheDocument();
      });
    });

    it('should display Download PDF button in modal', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [mockInvoices[0]], total: 1 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      });

      await user.click(screen.getByText('View'));

      await waitFor(() => {
        expect(screen.getByText('Download PDF')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no invoices found', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText(/No invoices found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error toast when fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load invoices/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when data exceeds page size', async () => {
      server.use(
        http.get(`${API_BASE}/invoices`, () => {
          return HttpResponse.json({
            items: Array.from({ length: 10 }, (_, i) => ({
              ...mockInvoices[0],
              id: `inv-${i + 1}`,
              invoice_number: `INV-2024-${String(i + 1).padStart(3, '0')}`,
            })),
            total: 25,
          });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
      });

      const pagination = screen.getByRole('navigation', { name: /pagination/i });
      expect(pagination).toBeInTheDocument();
    });

    it('should change page when pagination controls clicked', async () => {
      const user = userEvent.setup();
      let requestedSkip = 0;

      server.use(
        http.get(`${API_BASE}/invoices`, ({ request }) => {
          const url = new URL(request.url);
          requestedSkip = parseInt(url.searchParams.get('skip') || '0');

          return HttpResponse.json({
            items: Array.from({ length: 10 }, (_, i) => ({
              ...mockInvoices[0],
              id: `inv-${requestedSkip + i + 1}`,
              invoice_number: `INV-${requestedSkip + i + 1}`,
            })),
            total: 25,
          });
        })
      );

      render(<Invoices />);

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(requestedSkip).toBe(10);
      });
    });
  });
});

import React from 'react';
import { render, screen, waitFor } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import InvoiceTable from '../payment/InvoiceTable';

jest.mock('../../api/services/invoices.service', () => ({
  __esModule: true,
  default: {
    getMyInvoices: jest.fn(),
    downloadPdf: jest.fn(),
    syncFromStripe: jest.fn(),
  },
}));

jest.mock('../../utils/format', () => ({
  formatCurrency: (val) => `$${Number(val || 0).toFixed(2)}`,
  formatDate: (val) => {
    if (!val) return '';
    return new Date(val).toLocaleDateString('en-US');
  },
}));

const invoicesService = require('../../api/services/invoices.service').default;

describe('InvoiceTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    invoicesService.getMyInvoices.mockReturnValue(new Promise(() => {}));
    render(<InvoiceTable />);
    expect(screen.getByText('Loading invoices...')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    invoicesService.getMyInvoices.mockRejectedValue(new Error('Network error'));
    render(<InvoiceTable />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load invoices. Please try again.')).toBeInTheDocument();
    });
  });

  it('renders Retry button on error', async () => {
    invoicesService.getMyInvoices.mockRejectedValue(new Error('Fail'));
    render(<InvoiceTable />);
    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('renders empty state', async () => {
    invoicesService.getMyInvoices.mockResolvedValue({ items: [] });
    render(<InvoiceTable />);
    await waitFor(() => {
      expect(screen.getByText('No invoices found')).toBeInTheDocument();
    });
  });

  it('renders invoice data', async () => {
    invoicesService.getMyInvoices.mockResolvedValue({
      items: [
        {
          id: 1,
          invoice_number: 'INV-001',
          invoice_date: '2026-01-15',
          description: 'Monthly fee',
          total: 150,
          status: 'paid',
        },
      ],
    });
    render(<InvoiceTable />);
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('Monthly fee')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
      expect(screen.getByText('Paid')).toBeInTheDocument();
    });
  });

  it('renders table headers', async () => {
    invoicesService.getMyInvoices.mockResolvedValue({ items: [] });
    render(<InvoiceTable />);
    await waitFor(() => {
      expect(screen.getByText('Invoice #')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('renders Filter button', async () => {
    invoicesService.getMyInvoices.mockResolvedValue({ items: [] });
    render(<InvoiceTable />);
    await waitFor(() => {
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });
  });

  it('renders Sync from Stripe button', async () => {
    invoicesService.getMyInvoices.mockResolvedValue({ items: [] });
    render(<InvoiceTable />);
    await waitFor(() => {
      expect(screen.getByText('Sync from Stripe')).toBeInTheDocument();
    });
  });

  it('renders Download button for each invoice', async () => {
    invoicesService.getMyInvoices.mockResolvedValue({
      items: [
        { id: 1, invoice_number: 'INV-001', invoice_date: '2026-01-15', total: 100, status: 'paid' },
      ],
    });
    render(<InvoiceTable />);
    await waitFor(() => {
      expect(screen.getByText('Download')).toBeInTheDocument();
    });
  });

  it('shows invoice count summary', async () => {
    invoicesService.getMyInvoices.mockResolvedValue({
      items: [
        { id: 1, invoice_number: 'INV-001', invoice_date: '2026-01-15', total: 100, status: 'paid' },
        { id: 2, invoice_number: 'INV-002', invoice_date: '2026-01-16', total: 200, status: 'sent' },
      ],
    });
    render(<InvoiceTable />);
    await waitFor(() => {
      expect(screen.getByText('Showing 2 invoices')).toBeInTheDocument();
    });
  });

  it('shows filter options when Filter clicked', async () => {
    const user = userEvent.setup();
    invoicesService.getMyInvoices.mockResolvedValue({ items: [] });
    render(<InvoiceTable />);
    await waitFor(() => {
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Filter'));
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });
});

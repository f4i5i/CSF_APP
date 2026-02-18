import React from 'react';
import { render, screen, waitFor } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import BillingInfo from '../payment/BillingInfo';

jest.mock('../../api/services/invoices.service', () => ({
  __esModule: true,
  default: {
    getBillingSummary: jest.fn(),
  },
}));

jest.mock('../../utils/format', () => ({
  formatCurrency: (val) => `$${Number(val || 0).toFixed(2)}`,
  formatDate: (val, opts) => {
    if (!val) return '';
    const d = new Date(val);
    if (opts?.month === 'short') return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`;
    return d.toLocaleDateString('en-US');
  },
}));

const invoicesService = require('../../api/services/invoices.service').default;

describe('BillingInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    invoicesService.getBillingSummary.mockReturnValue(new Promise(() => {}));
    const { container } = render(<BillingInfo />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    invoicesService.getBillingSummary.mockRejectedValue(new Error('Network error'));
    render(<BillingInfo />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load billing information')).toBeInTheDocument();
    });
  });

  it('renders Try Again button on error', async () => {
    invoicesService.getBillingSummary.mockRejectedValue(new Error('Fail'));
    render(<BillingInfo />);
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('renders billing period heading on success', async () => {
    invoicesService.getBillingSummary.mockResolvedValue({
      billing_period_start: '2026-01-01',
      billing_period_end: '2026-01-31',
      active_enrollments_count: 3,
    });
    render(<BillingInfo />);
    await waitFor(() => {
      expect(screen.getByText('Billing Period')).toBeInTheDocument();
    });
  });

  it('renders active enrollments count', async () => {
    invoicesService.getBillingSummary.mockResolvedValue({
      active_enrollments_count: 5,
    });
    render(<BillingInfo />);
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Active Enrollments')).toBeInTheDocument();
    });
  });

  it('renders next payment due when available', async () => {
    invoicesService.getBillingSummary.mockResolvedValue({
      next_due_date: '2026-02-15',
      next_payment_amount: 150,
      active_enrollments_count: 2,
    });
    render(<BillingInfo />);
    await waitFor(() => {
      expect(screen.getByText('Next Payment Due')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });
  });

  it('renders pending payments alert', async () => {
    invoicesService.getBillingSummary.mockResolvedValue({
      active_enrollments_count: 1,
      pending_payments_count: 2,
    });
    render(<BillingInfo />);
    await waitFor(() => {
      expect(screen.getByText('2 pending payments')).toBeInTheDocument();
    });
  });

  it('retries on Try Again click', async () => {
    const user = userEvent.setup();
    invoicesService.getBillingSummary
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValueOnce({ active_enrollments_count: 1 });

    render(<BillingInfo />);
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Try Again'));
    await waitFor(() => {
      expect(screen.getByText('Billing Period')).toBeInTheDocument();
    });
    expect(invoicesService.getBillingSummary).toHaveBeenCalledTimes(2);
  });
});

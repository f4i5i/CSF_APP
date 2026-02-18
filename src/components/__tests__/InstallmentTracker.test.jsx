import React from 'react';
import { render, screen, waitFor } from '../../__tests__/utils/test-utils';
import InstallmentTracker from '../InstallmentTracker';

// Mock service and utility
jest.mock('../api/services/installments.service', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
    getSchedule: jest.fn(),
  },
}));

jest.mock('../utils/format', () => ({
  formatDate: (d) => d || 'N/A',
  formatCurrency: (v) => `$${Number(v).toFixed(2)}`,
}));

const installmentsService = require('../api/services/installments.service').default;

describe('InstallmentTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    installmentsService.getAll.mockImplementation(() => new Promise(() => {}));
    render(<InstallmentTracker />);
    expect(screen.getByText('Loading installment plans...')).toBeInTheDocument();
  });

  it('shows empty state when no plans', async () => {
    installmentsService.getAll.mockResolvedValue([]);
    render(<InstallmentTracker />);
    await waitFor(() => {
      expect(screen.getByText('No active installment plans')).toBeInTheDocument();
    });
  });

  it('shows error state on failure', async () => {
    installmentsService.getAll.mockRejectedValue(new Error('Network error'));
    render(<InstallmentTracker />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load installment plans')).toBeInTheDocument();
    });
  });

  it('renders plans with schedule', async () => {
    installmentsService.getAll.mockResolvedValue([
      {
        id: 1,
        total_amount: '200.00',
        num_installments: 4,
        frequency: 'monthly',
        order_details: { class_name: 'Basketball' },
      },
    ]);
    installmentsService.getSchedule.mockResolvedValue({
      items: [
        { id: 1, amount: '50.00', status: 'paid', due_date: '2026-01-01' },
        { id: 2, amount: '50.00', status: 'pending', due_date: '2026-04-01' },
      ],
    });

    render(<InstallmentTracker />);
    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument();
      expect(screen.getByText('$200.00')).toBeInTheDocument();
      expect(screen.getByText('1 of 4 payments complete')).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import PaymentStatusCard from '../PaymentStatusCard';

describe('PaymentStatusCard', () => {
  it('shows loading skeleton', () => {
    render(<PaymentStatusCard loading={true} />);
    expect(screen.getByText('Payment Status')).toBeInTheDocument();
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows empty state when no summary', () => {
    render(<PaymentStatusCard summary={null} />);
    expect(screen.getByText('No payment information available')).toBeInTheDocument();
  });

  it('shows outstanding balance', () => {
    const summary = { active_plans: 2, total_remaining: 150.5, next_due: null };
    render(<PaymentStatusCard summary={summary} />);
    expect(screen.getByText('Outstanding Balance')).toBeInTheDocument();
    expect(screen.getByText('$150.50')).toBeInTheDocument();
    expect(screen.getByText('2 active payment plans')).toBeInTheDocument();
    expect(screen.getByText('Make Payment')).toBeInTheDocument();
  });

  it('shows all paid state when no remaining balance', () => {
    const summary = { active_plans: 0, total_remaining: 0, next_due: null };
    render(<PaymentStatusCard summary={summary} />);
    expect(screen.getByText('All Paid Up!')).toBeInTheDocument();
    expect(screen.getByText('No outstanding balance')).toBeInTheDocument();
    expect(screen.getByText('View Payment History')).toBeInTheDocument();
  });

  it('shows next payment due information', () => {
    const summary = {
      active_plans: 1,
      total_remaining: 100,
      next_due: { amount: 50, due_date: '2026-12-01' },
    };
    render(<PaymentStatusCard summary={summary} />);
    expect(screen.getByText('Next Payment Due')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('renders View All link', () => {
    const summary = { active_plans: 1, total_remaining: 100, next_due: null };
    render(<PaymentStatusCard summary={summary} />);
    expect(screen.getByRole('link', { name: 'View All' })).toHaveAttribute('href', '/paymentbilling');
  });
});

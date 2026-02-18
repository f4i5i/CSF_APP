import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import RevenueCards from '../Financial/RevenueCards';

describe('RevenueCards', () => {
  const totals = {
    '24h': 500,
    '7d': 3500,
    '30d': 15000,
    '90d': 45000,
    'YTD': 120000,
  };

  it('renders all time period labels', () => {
    render(<RevenueCards totals={totals} />);
    expect(screen.getByText('24 hours')).toBeInTheDocument();
    expect(screen.getByText('7 days')).toBeInTheDocument();
    expect(screen.getByText('30 days')).toBeInTheDocument();
    expect(screen.getByText('90 days')).toBeInTheDocument();
    expect(screen.getByText('Year to date')).toBeInTheDocument();
  });

  it('renders Revenue label for each card', () => {
    render(<RevenueCards totals={totals} />);
    const revenueLabels = screen.getAllByText('Revenue');
    expect(revenueLabels).toHaveLength(5);
  });

  it('renders formatted dollar values', () => {
    render(<RevenueCards totals={totals} />);
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('$3,500')).toBeInTheDocument();
    expect(screen.getByText('$15,000')).toBeInTheDocument();
  });

  it('handles missing totals keys with 0', () => {
    render(<RevenueCards totals={{}} />);
    const zeroValues = screen.getAllByText('$0');
    expect(zeroValues).toHaveLength(5);
  });
});

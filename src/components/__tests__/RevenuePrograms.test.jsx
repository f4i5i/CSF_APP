import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import RevenuePrograms from '../Financial/RevenuePrograms';

describe('RevenuePrograms', () => {
  it('renders heading', () => {
    render(<RevenuePrograms programs={[]} />);
    expect(screen.getByText('Revenue by Program')).toBeInTheDocument();
  });

  it('renders program names', () => {
    const programs = [
      { id: 1, name: 'Soccer', revenue: 5000 },
      { id: 2, name: 'Basketball', revenue: 3000 },
    ];
    render(<RevenuePrograms programs={programs} />);
    expect(screen.getByText('Soccer')).toBeInTheDocument();
    expect(screen.getByText('Basketball')).toBeInTheDocument();
  });

  it('renders revenue amounts', () => {
    const programs = [
      { id: 1, name: 'Tennis', revenue: 2500 },
    ];
    render(<RevenuePrograms programs={programs} />);
    expect(screen.getByText('$2,500')).toBeInTheDocument();
  });

  it('renders share percentages', () => {
    const programs = [
      { id: 1, name: 'Soccer', revenue: 5000 },
      { id: 2, name: 'Basketball', revenue: 5000 },
    ];
    render(<RevenuePrograms programs={programs} />);
    const shares = screen.getAllByText(/Share: 50\.0%/);
    expect(shares).toHaveLength(2);
  });

  it('renders Revenue label for each program', () => {
    const programs = [
      { id: 1, name: 'A', revenue: 100 },
      { id: 2, name: 'B', revenue: 200 },
    ];
    render(<RevenuePrograms programs={programs} />);
    const revenueLabels = screen.getAllByText('Revenue');
    expect(revenueLabels).toHaveLength(2);
  });

  it('uses default empty array', () => {
    render(<RevenuePrograms />);
    expect(screen.getByText('Revenue by Program')).toBeInTheDocument();
  });

  it('calculates correct share for single program', () => {
    const programs = [
      { id: 1, name: 'Only', revenue: 1000 },
    ];
    render(<RevenuePrograms programs={programs} />);
    expect(screen.getByText('Share: 100.0%')).toBeInTheDocument();
  });
});

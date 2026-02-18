import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import StatsCards from '../AdminDashboard/StatsCard';

describe('StatsCards', () => {
  const registrations = { '24h': 5, '7d': 25, '30d': 100 };
  const cancellations = { '24h': 1, '7d': 3, '30d': 10 };

  it('renders Registrations card', () => {
    render(<StatsCards registrations={registrations} cancellations={cancellations} />);
    expect(screen.getByText('Registrations')).toBeInTheDocument();
  });

  it('renders Cancellations card', () => {
    render(<StatsCards registrations={registrations} cancellations={cancellations} />);
    expect(screen.getByText('Cancellations')).toBeInTheDocument();
  });

  it('renders registration values', () => {
    render(<StatsCards registrations={registrations} cancellations={cancellations} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders time period labels', () => {
    render(<StatsCards registrations={registrations} cancellations={cancellations} />);
    const labels24h = screen.getAllByText('24h');
    expect(labels24h.length).toBeGreaterThanOrEqual(2);
    const labels7d = screen.getAllByText('7d');
    expect(labels7d.length).toBeGreaterThanOrEqual(2);
  });

  it('renders cancellation values', () => {
    render(<StatsCards registrations={registrations} cancellations={cancellations} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});

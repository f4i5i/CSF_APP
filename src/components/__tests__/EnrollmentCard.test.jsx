import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import EnrollmentCard from '../EnrollmentCard';

describe('EnrollmentCard', () => {
  it('shows loading state', () => {
    render(<EnrollmentCard loading={true} />);
    expect(screen.getByText('Active Classes')).toBeInTheDocument();
    const pulses = document.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('shows empty state with browse link', () => {
    render(<EnrollmentCard enrollments={[]} />);
    expect(screen.getByText('No active enrollments')).toBeInTheDocument();
    expect(screen.getByText('Browse Classes')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse Classes' })).toHaveAttribute('href', '/classes');
  });

  it('renders enrollment list', () => {
    const enrollments = [
      {
        id: 1,
        status: 'active',
        class: { name: 'Basketball 101', program: { sport_type: 'basketball' }, schedule: 'Mon 3pm', school: { name: 'Elm School' } },
      },
    ];
    render(<EnrollmentCard enrollments={enrollments} />);
    expect(screen.getByText('Basketball 101')).toBeInTheDocument();
    expect(screen.getByText('Mon 3pm')).toBeInTheDocument();
    expect(screen.getByText('Elm School')).toBeInTheDocument();
  });

  it('renders View All link when enrollments exist', () => {
    const enrollments = [{ id: 1, status: 'active', class: { name: 'Class A' } }];
    render(<EnrollmentCard enrollments={enrollments} />);
    expect(screen.getByText('View All')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View All' })).toHaveAttribute('href', '/enrollments');
  });

  it('only displays up to 3 enrollments', () => {
    const enrollments = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      status: 'active',
      class: { name: `Class ${i}` },
    }));
    render(<EnrollmentCard enrollments={enrollments} />);
    expect(screen.getByText('Class 0')).toBeInTheDocument();
    expect(screen.getByText('Class 2')).toBeInTheDocument();
    expect(screen.queryByText('Class 3')).not.toBeInTheDocument();
    expect(screen.getByText('+2 more classes')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    const enrollments = [{ id: 1, status: 'active', class: { name: 'Class A' } }];
    render(<EnrollmentCard enrollments={enrollments} />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });
});

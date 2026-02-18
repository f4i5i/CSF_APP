import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import StatCard from '../dashboard/StatCard';

describe('Dashboard StatCard', () => {
  it('renders the value', () => {
    render(<StatCard value={15} label="Badges Earned" />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<StatCard value={5} label="Attendance Streak" />);
    expect(screen.getByText('Attendance Streak')).toBeInTheDocument();
  });

  it('renders string values', () => {
    render(<StatCard value="100%" label="Completion" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders zero value', () => {
    render(<StatCard value={0} label="Points" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<StatCard value={10} label="Test" className="custom-class" />);
    expect(container.firstChild.className).toContain('custom-class');
  });
});

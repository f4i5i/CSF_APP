import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import CoachStatsCard from '../coach/CoachStatsCard';

describe('CoachStatsCard', () => {
  it('renders the value', () => {
    render(<CoachStatsCard value={42} label="Students" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<CoachStatsCard value={10} label="Classes" />);
    expect(screen.getByText('Classes')).toBeInTheDocument();
  });

  it('renders string values', () => {
    render(<CoachStatsCard value="N/A" label="Streak" />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('renders zero value', () => {
    render(<CoachStatsCard value={0} label="Events" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders large numbers', () => {
    render(<CoachStatsCard value={1500} label="Total" />);
    expect(screen.getByText('1500')).toBeInTheDocument();
  });
});

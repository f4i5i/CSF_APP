import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import TodayClasses from '../AdminDashboard/TodayClasses';

describe('TodayClasses', () => {
  const classes = [
    { id: 1, title: 'Morning Soccer', school: 'Lincoln Elementary', time: '9:00 AM' },
    { id: 2, title: 'Afternoon Basketball', school: 'Washington High', time: '3:00 PM' },
    { id: 3, title: 'Evening Tennis', school: 'Oak Park', time: '6:00 PM' },
  ];

  it('renders heading', () => {
    render(<TodayClasses dateLabel="Monday, Jan 15, 2026" classes={classes} />);
    expect(screen.getByText('Class Overview for today')).toBeInTheDocument();
  });

  it('renders date label', () => {
    render(<TodayClasses dateLabel="Monday, Jan 15, 2026" classes={classes} />);
    expect(screen.getByText('Monday, Jan 15, 2026')).toBeInTheDocument();
  });

  it('renders Export button', () => {
    render(<TodayClasses dateLabel="Today" classes={classes} />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders class titles', () => {
    render(<TodayClasses dateLabel="Today" classes={classes} />);
    expect(screen.getByText('Morning Soccer')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Basketball')).toBeInTheDocument();
    expect(screen.getByText('Evening Tennis')).toBeInTheDocument();
  });

  it('renders school names', () => {
    render(<TodayClasses dateLabel="Today" classes={classes} />);
    expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
    expect(screen.getByText('Washington High')).toBeInTheDocument();
    expect(screen.getByText('Oak Park')).toBeInTheDocument();
  });

  it('renders class times', () => {
    render(<TodayClasses dateLabel="Today" classes={classes} />);
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('3:00 PM')).toBeInTheDocument();
    expect(screen.getByText('6:00 PM')).toBeInTheDocument();
  });

  it('renders empty when no classes', () => {
    render(<TodayClasses dateLabel="Today" classes={[]} />);
    expect(screen.getByText('Class Overview for today')).toBeInTheDocument();
    expect(screen.queryByText('Morning Soccer')).not.toBeInTheDocument();
  });
});

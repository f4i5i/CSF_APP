import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import StatsSidebar from '../AdminDashboard/StatsSidebar';

describe('StatsSidebar', () => {
  const stats = {
    activeStudents: 150,
    totalStudents: 300,
    programs: [
      { name: 'Soccer', count: 80 },
      { name: 'Basketball', count: 50 },
      { name: 'Tennis', count: 20 },
    ],
  };

  it('renders Active students label', () => {
    render(<StatsSidebar stats={stats} />);
    expect(screen.getByText('Active students')).toBeInTheDocument();
  });

  it('renders active students count', () => {
    render(<StatsSidebar stats={stats} />);
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders Total students label', () => {
    render(<StatsSidebar stats={stats} />);
    expect(screen.getByText('Total students')).toBeInTheDocument();
  });

  it('renders total students count', () => {
    render(<StatsSidebar stats={stats} />);
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('renders Programs heading', () => {
    render(<StatsSidebar stats={stats} />);
    expect(screen.getByText('Programs')).toBeInTheDocument();
  });

  it('renders program names', () => {
    render(<StatsSidebar stats={stats} />);
    expect(screen.getByText('Soccer')).toBeInTheDocument();
    expect(screen.getByText('Basketball')).toBeInTheDocument();
    expect(screen.getByText('Tennis')).toBeInTheDocument();
  });

  it('renders program counts', () => {
    render(<StatsSidebar stats={stats} />);
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});

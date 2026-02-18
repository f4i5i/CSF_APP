import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import MembersBarChart from '../AdminDashboard/MembersBarChart';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, data }) => (
    <div data-testid="bar-chart" data-length={data?.length}>
      {children}
    </div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}));

describe('MembersBarChart', () => {
  const data = [
    { month: 'Jan', value: 10 },
    { month: 'Feb', value: 20 },
    { month: 'Mar', value: 30 },
  ];

  it('renders the chart container', () => {
    render(<MembersBarChart data={data} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders BarChart with data', () => {
    render(<MembersBarChart data={data} />);
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-length', '3');
  });

  it('renders chart components', () => {
    render(<MembersBarChart data={data} />);
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });

  it('renders with empty data', () => {
    render(<MembersBarChart data={[]} />);
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-length', '0');
  });
});

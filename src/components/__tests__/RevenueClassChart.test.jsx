import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import RevenueClassChart from '../Financial/RevenueClassChart';

// Mock recharts to avoid rendering issues in test environment
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

describe('RevenueClassChart', () => {
  it('renders the chart container', () => {
    render(<RevenueClassChart monthlyData={[]} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders BarChart with 12 data points', () => {
    const monthlyData = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200];
    render(<RevenueClassChart monthlyData={monthlyData} />);
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-length', '12');
  });

  it('renders chart components', () => {
    render(<RevenueClassChart monthlyData={[]} />);
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });

  it('uses default empty array', () => {
    render(<RevenueClassChart />);
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-length', '12');
  });
});

import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import RevenueAverage from '../Financial/RevenueAverage';

describe('RevenueAverage', () => {
  it('renders heading', () => {
    render(<RevenueAverage list={[]} />);
    expect(screen.getByText('Average Revenue per Student')).toBeInTheDocument();
  });

  it('renders program names', () => {
    const list = [
      { program: 'Soccer', avg: 150 },
      { program: 'Basketball', avg: 200 },
    ];
    render(<RevenueAverage list={list} />);
    expect(screen.getByText('Soccer')).toBeInTheDocument();
    expect(screen.getByText('Basketball')).toBeInTheDocument();
  });

  it('renders average values with dollar sign', () => {
    const list = [{ program: 'Tennis', avg: 300 }];
    render(<RevenueAverage list={list} />);
    expect(screen.getByText('$300')).toBeInTheDocument();
  });

  it('renders Average label for each card', () => {
    const list = [
      { program: 'Soccer', avg: 100 },
      { program: 'Tennis', avg: 200 },
    ];
    render(<RevenueAverage list={list} />);
    const averageLabels = screen.getAllByText('Average');
    expect(averageLabels).toHaveLength(2);
  });

  it('renders empty when list is empty', () => {
    render(<RevenueAverage list={[]} />);
    expect(screen.getByText('Average Revenue per Student')).toBeInTheDocument();
    expect(screen.queryByText('Average')).not.toBeInTheDocument();
  });

  it('uses default empty list', () => {
    render(<RevenueAverage />);
    expect(screen.getByText('Average Revenue per Student')).toBeInTheDocument();
  });
});

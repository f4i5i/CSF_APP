import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import MiddleSummary from '../AdminDashboard/MiddleSummary';

describe('MiddleSummary', () => {
  it('renders Active Classes card', () => {
    render(<MiddleSummary totalClasses={12} totalPrograms={5} />);
    expect(screen.getByText('Active Classes')).toBeInTheDocument();
    expect(screen.getByText('Currently running classes')).toBeInTheDocument();
  });

  it('renders Programs card', () => {
    render(<MiddleSummary totalClasses={12} totalPrograms={5} />);
    expect(screen.getByText('Programs')).toBeInTheDocument();
    expect(screen.getByText('Active sports programs')).toBeInTheDocument();
  });

  it('renders totalClasses value', () => {
    render(<MiddleSummary totalClasses={25} totalPrograms={8} />);
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders totalPrograms value', () => {
    render(<MiddleSummary totalClasses={10} totalPrograms={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('defaults to 0 when values not provided', () => {
    render(<MiddleSummary />);
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(2);
  });

  it('formats large numbers with locale string', () => {
    render(<MiddleSummary totalClasses={1500} totalPrograms={200} />);
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });
});

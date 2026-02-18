import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import CreateNewClass from '../CreateNewClass';

describe('CreateNewClass', () => {
  it('renders the page title', () => {
    render(<CreateNewClass />);
    expect(screen.getByText('Create New Class')).toBeInTheDocument();
  });

  it('renders all form labels', () => {
    render(<CreateNewClass />);
    expect(screen.getByText('Program')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Class Name')).toBeInTheDocument();
    expect(screen.getByText('Ledger Code')).toBeInTheDocument();
    expect(screen.getByText('Class Visibility')).toBeInTheDocument();
    expect(screen.getByText('Class Description')).toBeInTheDocument();
    expect(screen.getByText('Registration Start Date')).toBeInTheDocument();
    expect(screen.getByText('Registration End Date')).toBeInTheDocument();
  });

  it('renders visibility radio buttons', () => {
    render(<CreateNewClass />);
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });

  it('renders class type radio buttons', () => {
    render(<CreateNewClass />);
    expect(screen.getByText('One Time Session')).toBeInTheDocument();
    expect(screen.getByText('Membership')).toBeInTheDocument();
  });

  it('renders recurrence buttons', () => {
    render(<CreateNewClass />);
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('One Time')).toBeInTheDocument();
  });

  it('renders Create Class button', () => {
    render(<CreateNewClass />);
    expect(screen.getByText('Create Class')).toBeInTheDocument();
  });

  it('renders Copy button for class link', () => {
    render(<CreateNewClass />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('renders file input for Class Image', () => {
    render(<CreateNewClass />);
    expect(screen.getByText('Class Image / Logo')).toBeInTheDocument();
  });
});

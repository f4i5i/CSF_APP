import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import ClientsHeader from '../Clients/ClientsHeader';

describe('ClientsHeader', () => {
  const defaultProps = {
    title: 'Clients',
    description: 'Manage your clients here',
    query: '',
    setQuery: jest.fn(),
  };

  it('renders title', () => {
    render(<ClientsHeader {...defaultProps} />);
    expect(screen.getByText('Clients')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<ClientsHeader {...defaultProps} />);
    expect(screen.getByText('Manage your clients here')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<ClientsHeader {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search accounts, members or coach...')).toBeInTheDocument();
  });

  it('calls setQuery on search input', async () => {
    render(<ClientsHeader {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search accounts, members or coach...');
    await userEvent.type(input, 'a');
    expect(defaultProps.setQuery).toHaveBeenCalled();
  });

  // --- Positive edge cases ---
  it('renders with a long title', () => {
    render(<ClientsHeader {...defaultProps} title="A Very Long Title That Should Still Render" />);
    expect(screen.getByText('A Very Long Title That Should Still Render')).toBeInTheDocument();
  });

  it('renders with a long description', () => {
    render(<ClientsHeader {...defaultProps} description="Lorem ipsum dolor sit amet, consectetur adipiscing elit." />);
    expect(screen.getByText(/Lorem ipsum/)).toBeInTheDocument();
  });

  // --- Negative edge cases ---
  it('handles special characters in search query', async () => {
    render(<ClientsHeader {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search accounts, members or coach...');
    await userEvent.type(input, '<script>alert("xss")</script>');
    expect(defaultProps.setQuery).toHaveBeenCalled();
  });

  it('calls setQuery for each character typed', async () => {
    render(<ClientsHeader {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search accounts, members or coach...');
    await userEvent.type(input, 'abc');
    expect(defaultProps.setQuery).toHaveBeenCalledTimes(3);
  });

  it('shows current search query', () => {
    render(<ClientsHeader {...defaultProps} query="test" />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('renders ExportButton component', () => {
    render(<ClientsHeader {...defaultProps} />);
    // ExportButton renders a button with export-related text
    const exportBtn = screen.getByText(/export/i);
    expect(exportBtn).toBeInTheDocument();
  });
});

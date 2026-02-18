import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import ClassFilterDropdown from '../coach/ClassFilterDropdown';

describe('ClassFilterDropdown', () => {
  const classes = [
    { id: 1, name: 'Morning Session' },
    { id: 2, name: 'Afternoon Session' },
    { id: 3, name: 'Evening Session' },
  ];

  const defaultProps = {
    classes,
    selectedClass: null,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders All Classes when no selection', () => {
    render(<ClassFilterDropdown {...defaultProps} />);
    expect(screen.getByText('All Classes')).toBeInTheDocument();
  });

  it('renders selected class name', () => {
    render(<ClassFilterDropdown {...defaultProps} selectedClass={classes[0]} />);
    expect(screen.getByText('Morning Session')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(<ClassFilterDropdown {...defaultProps} />);
    await user.click(screen.getByText('All Classes'));
    expect(screen.getByText('Morning Session')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Session')).toBeInTheDocument();
    expect(screen.getByText('Evening Session')).toBeInTheDocument();
  });

  it('calls onSelect when option clicked', async () => {
    const user = userEvent.setup();
    render(<ClassFilterDropdown {...defaultProps} />);
    await user.click(screen.getByText('All Classes'));
    await user.click(screen.getByText('Morning Session'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith(classes[0]);
  });

  it('shows "All Classes" option in dropdown', async () => {
    const user = userEvent.setup();
    render(<ClassFilterDropdown {...defaultProps} selectedClass={classes[0]} />);
    await user.click(screen.getByText('Morning Session'));
    expect(screen.getAllByText('All Classes').length).toBeGreaterThan(0);
  });

  it('calls onSelect with null for All Classes', async () => {
    const user = userEvent.setup();
    render(<ClassFilterDropdown {...defaultProps} selectedClass={classes[0]} />);
    await user.click(screen.getByText('Morning Session'));
    const allClassBtn = screen.getAllByText('All Classes');
    await user.click(allClassBtn[allClassBtn.length - 1]);
    expect(defaultProps.onSelect).toHaveBeenCalledWith(null);
  });
});

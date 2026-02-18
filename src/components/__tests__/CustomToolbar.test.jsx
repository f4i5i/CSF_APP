import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import CustomToolbar from '../Calendar/CustomToolbar';

describe('CustomToolbar', () => {
  const defaultProps = {
    label: 'March 2026',
    onNavigate: jest.fn(),
    onView: jest.fn(),
    view: 'month',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the label', () => {
    render(<CustomToolbar {...defaultProps} />);
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('renders Month/Week/Day view buttons', () => {
    render(<CustomToolbar {...defaultProps} />);
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Day')).toBeInTheDocument();
  });

  it('highlights active view button', () => {
    render(<CustomToolbar {...defaultProps} view="month" />);
    const monthBtn = screen.getByText('Month');
    expect(monthBtn.className).toContain('bg-[#173963]');
    expect(monthBtn.className).toContain('text-white');
  });

  it('calls onView with "week" when Week clicked', async () => {
    const user = userEvent.setup();
    render(<CustomToolbar {...defaultProps} />);
    await user.click(screen.getByText('Week'));
    expect(defaultProps.onView).toHaveBeenCalledWith('week');
  });

  it('calls onView with "day" when Day clicked', async () => {
    const user = userEvent.setup();
    render(<CustomToolbar {...defaultProps} />);
    await user.click(screen.getByText('Day'));
    expect(defaultProps.onView).toHaveBeenCalledWith('day');
  });

  it('calls onNavigate with "PREV" on left arrow click', async () => {
    const user = userEvent.setup();
    render(<CustomToolbar {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    // Find the nav buttons (buttons with bg-[#173963] that are not view buttons)
    const navButtons = buttons.filter((b) => b.className.includes('w-9'));
    await user.click(navButtons[0]);
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('PREV');
  });

  it('calls onNavigate with "NEXT" on right arrow click', async () => {
    const user = userEvent.setup();
    render(<CustomToolbar {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const navButtons = buttons.filter((b) => b.className.includes('w-9'));
    await user.click(navButtons[1]);
    expect(defaultProps.onNavigate).toHaveBeenCalledWith('NEXT');
  });
});

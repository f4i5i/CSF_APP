import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import CustomCaption from '../Calendar/CustomCaption';

describe('CustomCaption', () => {
  const mockOnMonthChange = jest.fn();
  const displayMonth = new Date(2026, 2, 1); // March 2026

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders month and year', () => {
    render(<CustomCaption displayMonth={displayMonth} onMonthChange={mockOnMonthChange} />);
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('navigates to previous month', async () => {
    const user = userEvent.setup();
    render(<CustomCaption displayMonth={displayMonth} onMonthChange={mockOnMonthChange} />);
    // Left chevron character
    await user.click(screen.getByText('\u2039'));
    expect(mockOnMonthChange).toHaveBeenCalledTimes(1);
  });

  it('navigates to next month', async () => {
    const user = userEvent.setup();
    render(<CustomCaption displayMonth={displayMonth} onMonthChange={mockOnMonthChange} />);
    // Right chevron character
    await user.click(screen.getByText('\u203A'));
    expect(mockOnMonthChange).toHaveBeenCalledTimes(1);
  });

  it('centers content', () => {
    const { container } = render(
      <CustomCaption displayMonth={displayMonth} onMonthChange={mockOnMonthChange} />
    );
    expect(container.firstChild.className).toContain('justify-center');
  });
});

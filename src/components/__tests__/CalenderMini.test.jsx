import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import CalenderMini from '../Calendar/CalenderMini';

describe('CalenderMini', () => {
  it('renders Calendar heading', () => {
    render(<CalenderMini />);
    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });

  it('renders weekday headers', () => {
    render(<CalenderMini />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('renders current month and year', () => {
    render(<CalenderMini />);
    const now = new Date();
    const monthYear = now.toLocaleString('default', { month: 'short', year: 'numeric' });
    expect(screen.getByText(monthYear)).toBeInTheDocument();
  });

  it('shows "No date selected" initially', () => {
    render(<CalenderMini />);
    expect(screen.getByText('No date selected')).toBeInTheDocument();
  });

  it('navigates to previous month', async () => {
    const user = userEvent.setup();
    render(<CalenderMini />);
    const buttons = screen.getAllByRole('button');
    // First button is previous
    await user.click(buttons[0]);
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const expected = prevMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('navigates to next month', async () => {
    const user = userEvent.setup();
    render(<CalenderMini />);
    const buttons = screen.getAllByRole('button');
    // Second button is next
    await user.click(buttons[1]);
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);
    const expected = nextMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('selects a day and shows selected date', async () => {
    const user = userEvent.setup();
    render(<CalenderMini />);
    // Click on day 15
    const day15 = screen.getByText('15');
    await user.click(day15);
    // Should no longer say "No date selected"
    expect(screen.queryByText('No date selected')).not.toBeInTheDocument();
  });

  it('highlights event dates', () => {
    const now = new Date();
    const events = [
      { start_datetime: new Date(now.getFullYear(), now.getMonth(), 10).toISOString() },
    ];
    render(<CalenderMini events={events} />);
    const day10 = screen.getByText('10');
    expect(day10.className).toContain('bg-yellow-400');
  });

  it('shows loading opacity', () => {
    const { container } = render(<CalenderMini loading={true} />);
    expect(container.firstChild.className).toContain('opacity-60');
  });
});

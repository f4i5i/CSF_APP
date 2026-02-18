import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import CoachCalendarWidget from '../coach/CoachCalendarWidget';

describe('CoachCalendarWidget', () => {
  it('renders Calendar heading', () => {
    render(<CoachCalendarWidget />);
    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });

  it('renders weekday headers', () => {
    render(<CoachCalendarWidget />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('renders current month and year', () => {
    render(<CoachCalendarWidget />);
    const now = new Date();
    const monthYear = now.toLocaleString('default', { month: 'short', year: 'numeric' });
    expect(screen.getByText(monthYear)).toBeInTheDocument();
  });

  it('navigates months', async () => {
    const user = userEvent.setup();
    render(<CoachCalendarWidget />);
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]); // prev
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const expected = prevMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('highlights event dates', () => {
    const now = new Date();
    const events = [
      { start_datetime: new Date(now.getFullYear(), now.getMonth(), 10).toISOString() },
    ];
    render(<CoachCalendarWidget events={events} />);
    const day10 = screen.getByText('10');
    expect(day10.className).toContain('bg-yellow-400');
  });

  it('shows "No date selected" initially', () => {
    render(<CoachCalendarWidget />);
    expect(screen.getByText('No date selected')).toBeInTheDocument();
  });

  it('selects a date on click', async () => {
    const user = userEvent.setup();
    render(<CoachCalendarWidget />);
    await user.click(screen.getByText('15'));
    expect(screen.queryByText('No date selected')).not.toBeInTheDocument();
  });

  it('shows loading opacity', () => {
    const { container } = render(<CoachCalendarWidget loading={true} />);
    expect(container.firstChild.className).toContain('opacity-60');
  });
});

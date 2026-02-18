import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import EventCalendar from '../Calendar/FullCalender';

// Mock react-big-calendar
jest.mock('react-big-calendar', () => ({
  Calendar: ({ events, components, ...props }) => (
    <div data-testid="mock-calendar">
      <div data-testid="calendar-events">{events.length} events</div>
      {events.map((event, i) => (
        <div key={i} data-testid={`event-${i}`}>{event.title}</div>
      ))}
    </div>
  ),
  momentLocalizer: () => ({}),
}));

jest.mock('react-big-calendar/lib/css/react-big-calendar.css', () => ({}));
jest.mock('../../styles/calendar-styles.css', () => ({}));

describe('FullCalendar (EventCalendar)', () => {
  it('renders the calendar component', () => {
    render(<EventCalendar />);
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
  });

  it('uses demo events when no events provided', () => {
    render(<EventCalendar />);
    expect(screen.getByText('4 events')).toBeInTheDocument();
    expect(screen.getByText('Tournament')).toBeInTheDocument();
    expect(screen.getByText('Match Day')).toBeInTheDocument();
  });

  it('uses provided events when available', () => {
    const events = [
      { title: 'Custom Event', start: '2026-03-15T10:00:00Z', end: '2026-03-15T12:00:00Z' },
    ];
    render(<EventCalendar events={events} />);
    expect(screen.getByText('1 events')).toBeInTheDocument();
    expect(screen.getByText('Custom Event')).toBeInTheDocument();
  });

  it('applies loading opacity', () => {
    const { container } = render(<EventCalendar loading={true} />);
    expect(container.firstChild.className).toContain('opacity-60');
  });

  it('does not apply opacity when not loading', () => {
    const { container } = render(<EventCalendar loading={false} />);
    expect(container.firstChild.className).not.toContain('opacity-60');
  });

  it('transforms API events correctly', () => {
    const events = [
      { name: 'API Event', start_datetime: '2026-03-15T10:00:00Z', end_datetime: '2026-03-15T12:00:00Z', type: 'tournament' },
    ];
    render(<EventCalendar events={events} />);
    expect(screen.getByText('API Event')).toBeInTheDocument();
  });
});

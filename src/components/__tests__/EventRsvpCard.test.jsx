import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import EventRsvpCard from '../EventRsvpCard';

// Mock API hooks
jest.mock('../api/hooks/events/useRsvp', () => ({
  useMyRsvp: () => ({ data: null, isLoading: false, refetch: jest.fn() }),
  useRsvp: () => ({ mutate: jest.fn() }),
  useUpdateRsvp: () => ({ mutate: jest.fn() }),
}));

jest.mock('../hooks', () => ({
  useChildren: () => ({ children: [], loading: false }),
  useEnrollments: () => ({ enrollments: [], loading: false }),
}));

describe('EventRsvpCard', () => {
  const mockEvent = {
    id: 1,
    title: 'Basketball Tournament',
    start_datetime: '2026-03-15T10:00:00Z',
    end_datetime: '2026-03-15T12:00:00Z',
    location: 'Sports Arena',
    description: 'Annual basketball tournament',
    event_type: 'tournament',
    rsvp_count: 15,
    max_attendees: 50,
  };

  it('renders event title', () => {
    render(<EventRsvpCard event={mockEvent} />);
    expect(screen.getByText('Basketball Tournament')).toBeInTheDocument();
  });

  it('renders event location', () => {
    render(<EventRsvpCard event={mockEvent} />);
    expect(screen.getByText('Sports Arena')).toBeInTheDocument();
  });

  it('renders event description', () => {
    render(<EventRsvpCard event={mockEvent} />);
    expect(screen.getByText('Annual basketball tournament')).toBeInTheDocument();
  });

  it('renders RSVP buttons', () => {
    render(<EventRsvpCard event={mockEvent} />);
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Maybe')).toBeInTheDocument();
  });

  it('shows attendee count with capacity', () => {
    render(<EventRsvpCard event={mockEvent} />);
    expect(screen.getByText(/15\/50 attending/)).toBeInTheDocument();
    expect(screen.getByText(/35 spots left/)).toBeInTheDocument();
  });

  it('renders event type badge', () => {
    render(<EventRsvpCard event={mockEvent} />);
    expect(screen.getByText('tournament')).toBeInTheDocument();
  });

  it('renders View Full Details button', () => {
    render(<EventRsvpCard event={mockEvent} />);
    expect(screen.getByText('View Full Details')).toBeInTheDocument();
  });

  it('returns null when no event', () => {
    const { container } = render(<EventRsvpCard event={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('hides details when showFullDetails is false', () => {
    render(<EventRsvpCard event={mockEvent} showFullDetails={false} />);
    expect(screen.queryByText('Sports Arena')).not.toBeInTheDocument();
    expect(screen.queryByText('Annual basketball tournament')).not.toBeInTheDocument();
  });
});

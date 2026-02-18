import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import CoachNextEventCard from '../coach/CoachNextEventCard';

describe('CoachNextEventCard', () => {
  it('renders loading state', () => {
    const { container } = render(<CoachNextEventCard loading={true} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state when no event', () => {
    render(<CoachNextEventCard event={null} />);
    expect(screen.getByText('No upcoming events')).toBeInTheDocument();
  });

  it('renders event title', () => {
    const event = {
      title: 'Soccer Practice',
      start_datetime: '2026-03-15T14:00:00Z',
      description: 'Regular practice session',
    };
    render(<CoachNextEventCard event={event} />);
    expect(screen.getByText('Soccer Practice')).toBeInTheDocument();
  });

  it('renders event description', () => {
    const event = {
      title: 'Training',
      start_datetime: '2026-03-15T14:00:00Z',
      description: 'Advanced training drills',
    };
    render(<CoachNextEventCard event={event} />);
    expect(screen.getByText('Advanced training drills')).toBeInTheDocument();
  });

  it('renders default description when none provided', () => {
    const event = {
      title: 'Event',
      start_datetime: '2026-03-15T14:00:00Z',
    };
    render(<CoachNextEventCard event={event} />);
    expect(screen.getByText('No description available.')).toBeInTheDocument();
  });

  it('renders default title when none provided', () => {
    const event = {
      start_datetime: '2026-03-15T14:00:00Z',
      description: 'Some description',
    };
    render(<CoachNextEventCard event={event} />);
    expect(screen.getByText('Event')).toBeInTheDocument();
  });

  it('renders attachment when present', () => {
    const event = {
      title: 'Game Day',
      start_datetime: '2026-03-15T14:00:00Z',
      description: 'Championship game',
      attachment_url: 'http://example.com/file.pdf',
      attachment_name: 'Schedule.pdf',
    };
    render(<CoachNextEventCard event={event} />);
    expect(screen.getByText('Schedule.pdf')).toBeInTheDocument();
  });

  it('renders default attachment name', () => {
    const event = {
      title: 'Game Day',
      start_datetime: '2026-03-15T14:00:00Z',
      description: 'Game',
      attachment_url: 'http://example.com/file.pdf',
    };
    render(<CoachNextEventCard event={event} />);
    expect(screen.getByText('Attachment')).toBeInTheDocument();
  });

  it('does not render attachment when no URL', () => {
    const event = {
      title: 'Practice',
      start_datetime: '2026-03-15T14:00:00Z',
      description: 'Regular',
    };
    render(<CoachNextEventCard event={event} />);
    expect(screen.queryByText('Attachment')).not.toBeInTheDocument();
  });

  it('renders formatted date', () => {
    const event = {
      title: 'Test',
      start_datetime: '2026-01-15T14:00:00Z',
      description: 'Test',
    };
    render(<CoachNextEventCard event={event} />);
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
  });
});

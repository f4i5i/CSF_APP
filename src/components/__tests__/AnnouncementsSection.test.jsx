import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import AnnouncementsSection from '../AnnouncementsSection';

// Mock assets
jest.mock('../assets/teamlist.png', () => 'teamlist.png');
jest.mock('../assets/teamlist1.png', () => 'teamlist1.png');
jest.mock('../assets/pdf_link.png', () => 'pdf_link.png');
jest.mock('../assets/user_img.png', () => 'user_img.png');

describe('AnnouncementsSection', () => {
  it('renders "Announcements" heading', () => {
    render(<AnnouncementsSection />);
    expect(screen.getByText('Announcements')).toBeInTheDocument();
  });

  it('shows loading skeletons', () => {
    render(<AnnouncementsSection loading={true} />);
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows empty state when no announcements', () => {
    render(<AnnouncementsSection announcements={[]} />);
    expect(screen.getByText('No announcements yet')).toBeInTheDocument();
    expect(screen.getByText('Check back later for updates from your coach')).toBeInTheDocument();
  });

  it('renders announcements list', () => {
    const announcements = [
      {
        id: 1,
        title: 'Practice Cancelled',
        content: 'No practice today due to weather',
        created_at: '2026-01-15T10:00:00Z',
        author: { first_name: 'John' },
      },
    ];
    render(<AnnouncementsSection announcements={announcements} />);
    expect(screen.getByText('Practice Cancelled')).toBeInTheDocument();
    expect(screen.getByText('No practice today due to weather')).toBeInTheDocument();
    expect(screen.getByText('Coach John')).toBeInTheDocument();
  });

  it('shows mobile next event section', () => {
    render(<AnnouncementsSection />);
    expect(screen.getByText('Next Event')).toBeInTheDocument();
  });

  it('shows empty next event state', () => {
    render(<AnnouncementsSection nextEvent={null} />);
    expect(screen.getByText('No upcoming events')).toBeInTheDocument();
  });

  it('renders next event when provided', () => {
    const nextEvent = {
      title: 'Big Tournament',
      start_datetime: '2026-03-01T10:00:00Z',
      description: 'Details here',
    };
    render(<AnnouncementsSection nextEvent={nextEvent} />);
    expect(screen.getAllByText('Big Tournament').length).toBeGreaterThan(0);
  });

  it('shows "View More" for long content', () => {
    const longContent = 'A'.repeat(600);
    const announcements = [
      {
        id: 1,
        title: 'Long Post',
        content: longContent,
        created_at: '2026-01-15T10:00:00Z',
      },
    ];
    render(<AnnouncementsSection announcements={announcements} />);
    expect(screen.getByText('View More')).toBeInTheDocument();
  });
});

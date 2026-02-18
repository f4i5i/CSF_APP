import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import AnnouncementCard from '../announcements/AnnouncementCard';

jest.mock('../../api/config', () => ({
  getFileUrl: (url) => `http://test.com${url}`,
}));

describe('AnnouncementCard', () => {
  it('shows loading skeleton', () => {
    render(<AnnouncementCard loading={true} />);
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows empty state', () => {
    render(<AnnouncementCard announcements={[]} />);
    expect(screen.getByText('No announcements yet')).toBeInTheDocument();
    expect(screen.getByText('Check back later for updates')).toBeInTheDocument();
  });

  it('renders announcements list', () => {
    const announcements = [
      {
        id: 1,
        title: 'Test Announcement',
        content: 'Test description',
        author_name: 'Coach Bob',
        created_at: '2026-01-15T10:00:00Z',
      },
    ];
    render(<AnnouncementCard announcements={announcements} />);
    expect(screen.getByText('Test Announcement')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Coach Bob')).toBeInTheDocument();
  });

  it('renders priority badge for high priority', () => {
    const announcements = [
      {
        id: 1,
        title: 'Urgent Notice',
        content: 'Important update',
        author_name: 'Admin',
        created_at: '2026-01-15T10:00:00Z',
        priority: 'high',
      },
    ];
    render(<AnnouncementCard announcements={announcements} />);
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('generates initials for avatar', () => {
    const announcements = [
      {
        id: 1,
        title: 'Test',
        content: 'Desc',
        author_name: 'John Doe',
        created_at: '2026-01-15T10:00:00Z',
      },
    ];
    render(<AnnouncementCard announcements={announcements} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles undefined announcements', () => {
    render(<AnnouncementCard />);
    expect(screen.getByText('No announcements yet')).toBeInTheDocument();
  });

  it('renders attachments', () => {
    const announcements = [
      {
        id: 1,
        title: 'With Attachments',
        content: 'Has files',
        author_name: 'Coach',
        created_at: '2026-01-15T10:00:00Z',
        attachments: [{ file_name: 'doc.pdf', file_url: '/files/doc.pdf' }],
      },
    ];
    render(<AnnouncementCard announcements={announcements} />);
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    const announcements = [
      {
        id: 1,
        title: 'Dated Post',
        content: 'Content',
        author_name: 'Coach',
        created_at: '2026-01-15T10:30:00Z',
      },
    ];
    render(<AnnouncementCard announcements={announcements} />);
    // The date should contain "Jan" since it's formatted
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
  });
});

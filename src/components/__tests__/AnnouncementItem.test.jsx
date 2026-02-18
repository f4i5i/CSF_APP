import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import AnnouncementItem from '../announcements/AnnouncementItem';

jest.mock('../../api/config', () => ({
  getFileUrl: (url) => `http://test.com${url}`,
}));

describe('AnnouncementItem', () => {
  const baseItem = {
    name: 'Coach Smith',
    date: 'Jan 15, 2026',
    title: 'Practice Update',
    description: 'New schedule starting next week',
    avatar: { initials: 'CS', color: 'bg-blue-500', isPlaceholder: true },
    attachments: [],
  };

  it('renders item name', () => {
    render(<AnnouncementItem item={baseItem} />);
    expect(screen.getByText('Coach Smith')).toBeInTheDocument();
  });

  it('renders item date', () => {
    render(<AnnouncementItem item={baseItem} />);
    expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument();
  });

  it('renders item title', () => {
    render(<AnnouncementItem item={baseItem} />);
    expect(screen.getByText('Practice Update')).toBeInTheDocument();
  });

  it('renders item description', () => {
    render(<AnnouncementItem item={baseItem} />);
    expect(screen.getByText('New schedule starting next week')).toBeInTheDocument();
  });

  it('renders initials avatar', () => {
    render(<AnnouncementItem item={baseItem} />);
    expect(screen.getByText('CS')).toBeInTheDocument();
  });

  it('renders image avatar', () => {
    const item = { ...baseItem, avatar: 'https://example.com/avatar.jpg' };
    render(<AnnouncementItem item={item} />);
    const img = screen.getByAltText('Coach Smith');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders attachments when present', () => {
    const item = {
      ...baseItem,
      attachments: [{ file_name: 'schedule.pdf', file_url: '/files/schedule.pdf' }],
    };
    render(<AnnouncementItem item={item} />);
    expect(screen.getByText('schedule.pdf')).toBeInTheDocument();
  });

  it('does not render attachments section when empty', () => {
    render(<AnnouncementItem item={baseItem} />);
    expect(screen.queryByText('schedule.pdf')).not.toBeInTheDocument();
  });

  it('renders more-options icon', () => {
    const { container } = render(<AnnouncementItem item={baseItem} />);
    // The MoreVertical icon should be present
    const svg = container.querySelector('svg.rotate-90');
    expect(svg).toBeInTheDocument();
  });
});

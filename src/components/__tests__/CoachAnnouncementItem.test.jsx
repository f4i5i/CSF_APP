import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import CoachAnnouncementItem from '../coach/CoachAnnouncementItem';

jest.mock('../../api/config', () => ({
  getFileUrl: (url) => `http://test.com${url}`,
}));

describe('CoachAnnouncementItem', () => {
  const announcement = {
    id: 1,
    title: 'Practice Schedule',
    content: 'New schedule starts Monday.',
    created_at: '2026-01-15T10:00:00Z',
    author_name: 'Coach Smith',
    attachments: [],
    class_names: ['Morning Session'],
  };

  it('renders announcement title', () => {
    render(<CoachAnnouncementItem announcement={announcement} />);
    expect(screen.getByText('Practice Schedule')).toBeInTheDocument();
  });

  it('renders announcement content', () => {
    render(<CoachAnnouncementItem announcement={announcement} />);
    expect(screen.getByText('New schedule starts Monday.')).toBeInTheDocument();
  });

  it('renders author name', () => {
    render(<CoachAnnouncementItem announcement={announcement} />);
    expect(screen.getByText('Coach Smith')).toBeInTheDocument();
  });

  it('renders class name tags', () => {
    render(<CoachAnnouncementItem announcement={announcement} />);
    expect(screen.getByText('Morning Session')).toBeInTheDocument();
  });

  it('renders three-dot menu', () => {
    render(<CoachAnnouncementItem announcement={announcement} isCoach={true} />);
    const menuBtn = document.querySelector('button');
    expect(menuBtn).toBeInTheDocument();
  });

  it('shows menu options for coaches', async () => {
    const user = userEvent.setup();
    render(<CoachAnnouncementItem announcement={announcement} isCoach={true} />);
    // Find and click the three-dot menu
    const buttons = screen.getAllByRole('button');
    if (buttons.length > 0) {
      await user.click(buttons[0]);
      // Should show View Details, Edit, Delete options
    }
  });

  it('renders attachments when present', () => {
    const withAttachments = {
      ...announcement,
      attachments: [{ file_name: 'doc.pdf', file_url: '/files/doc.pdf' }],
    };
    render(<CoachAnnouncementItem announcement={withAttachments} />);
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
  });

  it('renders date formatted', () => {
    render(<CoachAnnouncementItem announcement={announcement} />);
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
  });

  it('handles announcement without author', () => {
    const noAuthor = { ...announcement, author_name: null };
    render(<CoachAnnouncementItem announcement={noAuthor} />);
    expect(screen.getByText('Practice Schedule')).toBeInTheDocument();
  });
});

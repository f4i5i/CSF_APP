import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import DashboardWidgets from '../DashboardWidgets';

// Mock assets (paths relative to test file in components/__tests__/)
jest.mock('../../assets/program.png', () => 'program.png');
jest.mock('../../assets/Earned_Badges.png', () => 'earned_badges.png');
jest.mock('../../assets/left_errow.png', () => 'left_arrow.png');
jest.mock('../../assets/right_errow.png', () => 'right_arrow.png');
jest.mock('../../assets/left.png', () => 'left.png');
jest.mock('../../assets/right.png', () => 'right.png');
jest.mock('../../assets/pdf_link.png', () => 'pdf_link.png');
jest.mock('../../assets/arrow-right-up-line.png', () => 'arrow_right.png');

jest.mock('../../api/config', () => ({
  getFileUrl: (url) => `http://test.com${url}`,
}));

describe('DashboardWidgets', () => {
  it('renders Calendar heading', () => {
    render(<DashboardWidgets />);
    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });

  it('renders Earned Badges heading', () => {
    render(<DashboardWidgets />);
    expect(screen.getByText('Earned Badges')).toBeInTheDocument();
  });

  it('shows loading state for events', () => {
    render(<DashboardWidgets loadingEvents={true} />);
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows empty state for next event', () => {
    render(<DashboardWidgets nextEvent={null} />);
    expect(screen.getByText('No upcoming events')).toBeInTheDocument();
  });

  it('renders next event details', () => {
    const event = {
      title: 'Tournament Day',
      start_datetime: '2026-03-15T14:00:00Z',
      description: 'Big game day',
    };
    render(<DashboardWidgets nextEvent={event} />);
    expect(screen.getByText('Tournament Day')).toBeInTheDocument();
  });

  it('shows empty badges state', () => {
    render(<DashboardWidgets badges={[]} />);
    expect(screen.getByText('No badges earned yet')).toBeInTheDocument();
  });

  it('renders badges when provided', () => {
    const badges = [
      { id: 1, name: 'Star Player', description: 'Top performer', icon_url: 'badge1.png' },
    ];
    render(<DashboardWidgets badges={badges} />);
    expect(screen.getByText('Star Player')).toBeInTheDocument();
    expect(screen.getByText('Top performer')).toBeInTheDocument();
  });

  it('shows empty photo state', () => {
    render(<DashboardWidgets photo={null} />);
    expect(screen.getByText('No photos available yet')).toBeInTheDocument();
  });

  it('renders calendar weekday headers', () => {
    render(<DashboardWidgets />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
  });

  it('renders navigation buttons for calendar', () => {
    render(<DashboardWidgets />);
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
  });

  // --- Edge cases ---
  it('renders with empty calendarEvents array', () => {
    render(<DashboardWidgets calendarEvents={[]} />);
    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });

  it('shows loading state for badges', () => {
    render(<DashboardWidgets loadingBadges={true} />);
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows loading state for photo', () => {
    render(<DashboardWidgets loadingPhoto={true} />);
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders event with missing description', () => {
    const event = {
      title: 'No Description Event',
      start_datetime: '2026-03-20T10:00:00Z',
    };
    render(<DashboardWidgets nextEvent={event} />);
    expect(screen.getByText('No Description Event')).toBeInTheDocument();
  });

  it('renders badge with fallback image when icon_url is null', () => {
    const badges = [
      { id: 1, name: 'Mystery Badge', description: 'No icon', icon_url: null },
    ];
    render(<DashboardWidgets badges={badges} />);
    expect(screen.getByText('Mystery Badge')).toBeInTheDocument();
  });

  it('renders multiple badges with navigation', () => {
    const badges = [
      { id: 1, name: 'Badge A', description: 'First', icon_url: 'a.png' },
      { id: 2, name: 'Badge B', description: 'Second', icon_url: 'b.png' },
    ];
    render(<DashboardWidgets badges={badges} />);
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('Badge A')).toBeInTheDocument();
  });

  it('renders photo with thumbnail_url', () => {
    const photo = {
      thumbnail_url: '/photos/thumb.jpg',
      created_at: '2026-02-01T00:00:00Z',
    };
    render(<DashboardWidgets photo={photo} />);
    expect(screen.getByText('Program Photos')).toBeInTheDocument();
  });
});

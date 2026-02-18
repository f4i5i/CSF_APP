import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import CoachPhotosCard from '../coach/CoachPhotosCard';

jest.mock('../../api/config', () => ({
  getFileUrl: (url) => `http://test.com${url}`,
}));

describe('CoachPhotosCard', () => {
  it('renders loading state', () => {
    const { container } = render(<CoachPhotosCard loading={true} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state when no photo', () => {
    render(<CoachPhotosCard photo={null} />);
    expect(screen.getByText('No photos yet')).toBeInTheDocument();
    expect(screen.getByText('Upload photos to share with parents')).toBeInTheDocument();
  });

  it('renders Upload Photos link in empty state', () => {
    render(<CoachPhotosCard photo={null} />);
    const link = screen.getByText('Upload Photos');
    expect(link.closest('a')).toHaveAttribute('href', '/Gallery');
  });

  it('renders photo with album title', () => {
    const photo = { url: '/photos/1.jpg' };
    render(<CoachPhotosCard photo={photo} albumTitle="Summer Camp" />);
    expect(screen.getByText('Summer Camp')).toBeInTheDocument();
  });

  it('renders default title when no albumTitle', () => {
    const photo = { url: '/photos/1.jpg' };
    render(<CoachPhotosCard photo={photo} />);
    expect(screen.getByText('Program Photos')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    const photo = { url: '/photos/1.jpg' };
    render(<CoachPhotosCard photo={photo} date="2026-01-15T10:00:00Z" />);
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
  });

  it('renders image with correct alt text', () => {
    const photo = { url: '/photos/1.jpg' };
    render(<CoachPhotosCard photo={photo} albumTitle="Test Album" />);
    const img = screen.getByAlt('Test Album');
    expect(img).toBeInTheDocument();
  });

  it('uses image_url fallback', () => {
    const photo = { image_url: '/photos/2.jpg' };
    render(<CoachPhotosCard photo={photo} albumTitle="Fallback" />);
    expect(screen.getByAlt('Fallback')).toBeInTheDocument();
  });

  it('renders gallery link on photo', () => {
    const photo = { url: '/photos/1.jpg' };
    render(<CoachPhotosCard photo={photo} />);
    const links = document.querySelectorAll('a[href="/Gallery"]');
    expect(links.length).toBeGreaterThan(0);
  });
});

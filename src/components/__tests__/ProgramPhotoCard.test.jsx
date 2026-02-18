import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import ProgramPhotoCard from '../dashboard/ProgramPhotoCard';

describe('ProgramPhotoCard', () => {
  it('renders loading state', () => {
    const { container } = render(<ProgramPhotoCard loading={true} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state when no photo', () => {
    render(<ProgramPhotoCard photo={null} />);
    expect(screen.getByText('No photos available')).toBeInTheDocument();
  });

  it('renders photo title', () => {
    const photo = { url: 'http://example.com/img.jpg', title: 'Summer Camp' };
    render(<ProgramPhotoCard photo={photo} />);
    expect(screen.getByText('Summer Camp')).toBeInTheDocument();
  });

  it('renders default title when not provided', () => {
    const photo = { url: 'http://example.com/img.jpg' };
    render(<ProgramPhotoCard photo={photo} />);
    expect(screen.getByText('Program Photos')).toBeInTheDocument();
  });

  it('renders image with alt text', () => {
    const photo = { url: 'http://example.com/img.jpg', title: 'Test Photo' };
    render(<ProgramPhotoCard photo={photo} />);
    expect(screen.getByAlt('Test Photo')).toBeInTheDocument();
  });

  it('links to /photos', () => {
    const photo = { url: 'http://example.com/img.jpg' };
    render(<ProgramPhotoCard photo={photo} />);
    const link = document.querySelector('a[href="/photos"]');
    expect(link).toBeInTheDocument();
  });

  it('renders photo date when provided', () => {
    const photo = { url: 'http://example.com/img.jpg', date: 'Jan 15, 2026' };
    render(<ProgramPhotoCard photo={photo} />);
    expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument();
  });

  it('uses photo_url fallback', () => {
    const photo = { photo_url: 'http://example.com/img2.jpg', title: 'Fallback' };
    render(<ProgramPhotoCard photo={photo} />);
    expect(screen.getByAlt('Fallback')).toBeInTheDocument();
  });
});

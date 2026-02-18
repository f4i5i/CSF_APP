import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import PhotoCard from '../PhotoCard';

jest.mock('../api/config', () => ({
  getFileUrl: (url) => `http://test.com${url}`,
}));

describe('PhotoCard', () => {
  it('shows loading state', () => {
    const { container } = render(<PhotoCard loading={true} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows empty state when no photos', () => {
    render(<PhotoCard photos={[]} />);
    expect(screen.getByText('No photos yet')).toBeInTheDocument();
    expect(screen.getByText('Check back later for photos')).toBeInTheDocument();
  });

  it('renders single photo as full card', () => {
    const photos = [{ id: 1, url: '/photo1.jpg', caption: 'Test photo', uploaded_at: '2026-01-15' }];
    render(<PhotoCard photos={photos} />);
    expect(screen.getByText('Program Photos')).toBeInTheDocument();
  });

  it('renders grid view for multiple photos', () => {
    const photos = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      url: `/photo${i}.jpg`,
      caption: `Photo ${i}`,
    }));
    render(<PhotoCard photos={photos} />);
    expect(screen.getByText('Program Photos')).toBeInTheDocument();
  });

  it('shows remaining count for more than 6 photos', () => {
    const photos = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      url: `/photo${i}.jpg`,
    }));
    render(<PhotoCard photos={photos} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('handles photos as object with items array', () => {
    const photos = {
      items: [{ id: 1, url: '/photo1.jpg' }],
    };
    render(<PhotoCard photos={photos} />);
    expect(screen.getByText('Program Photos')).toBeInTheDocument();
  });
});

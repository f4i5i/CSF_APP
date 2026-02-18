import React from 'react';
import { render } from '../../__tests__/utils/test-utils';
import Gallery from '../Gallery';

// Mock all image imports
jest.mock('../../assets/image (1).png', () => 'img1.png');
jest.mock('../../assets/image (2).png', () => 'img2.png');
jest.mock('../../assets/image (3).png', () => 'img3.png');
jest.mock('../../assets/image (4).png', () => 'img4.png');
jest.mock('../../assets/image (5).png', () => 'img5.png');
jest.mock('../../assets/image (6).png', () => 'img6.png');
jest.mock('../../assets/image7.jpg', () => 'img7.jpg');
jest.mock('../../assets/image8.jpg', () => 'img8.jpg');
jest.mock('../../assets/image9.jpg', () => 'img9.jpg');
jest.mock('../../assets/image10.jpg', () => 'img10.jpg');

describe('Gallery', () => {
  it('renders without crashing', () => {
    const { container } = render(<Gallery />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders gallery images in a 3-column grid', () => {
    const { container } = render(<Gallery />);
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(9);
  });

  it('applies rounded styling to images', () => {
    const { container } = render(<Gallery />);
    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      expect(img.className).toContain('rounded-xl');
    });
  });
});

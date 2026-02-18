import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import Logo from '../Logo';

// Mock assets
jest.mock('../../assets/logo.png', () => 'logo.png');

describe('Logo', () => {
  it('renders the logo image', () => {
    render(<Logo />);
    const img = screen.getByAltText(/logo/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'logo.png');
  });

  it('renders as a link to home', () => {
    render(<Logo />);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });
});

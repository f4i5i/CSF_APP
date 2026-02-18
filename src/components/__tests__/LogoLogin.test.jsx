import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import LogoLogin from '../LogoLogin';

// Mock assets
jest.mock('../../assets/logo_login.png', () => 'logo_login.png');

describe('LogoLogin', () => {
  it('renders the login logo image', () => {
    render(<LogoLogin />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'logo_login.png');
  });
});

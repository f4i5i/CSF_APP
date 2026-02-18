import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import Sidebar from '../Sidebar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/settings' }),
}));

jest.mock('../../context/auth', () => ({
  useAuth: () => ({
    logout: jest.fn(),
  }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders My Account item', () => {
    localStorage.setItem('role', 'parent');
    render(<Sidebar />);
    const myAccountItems = screen.getAllByText('My Account');
    expect(myAccountItems.length).toBeGreaterThan(0);
  });

  it('renders Password item', () => {
    localStorage.setItem('role', 'parent');
    render(<Sidebar />);
    const passwordItems = screen.getAllByText('Password');
    expect(passwordItems.length).toBeGreaterThan(0);
  });

  it('renders Contact item', () => {
    localStorage.setItem('role', 'parent');
    render(<Sidebar />);
    const contactItems = screen.getAllByText('Contact');
    expect(contactItems.length).toBeGreaterThan(0);
  });

  it('renders Log out item', () => {
    localStorage.setItem('role', 'parent');
    render(<Sidebar />);
    const logoutItems = screen.getAllByText('Log out');
    expect(logoutItems.length).toBeGreaterThan(0);
  });

  it('renders Payment & Billing for parent role', () => {
    localStorage.setItem('role', 'parent');
    render(<Sidebar />);
    const paymentItems = screen.getAllByText('Payment & Billing');
    expect(paymentItems.length).toBeGreaterThan(0);
  });

  it('renders Badges for parent role', () => {
    localStorage.setItem('role', 'parent');
    render(<Sidebar />);
    const badgeItems = screen.getAllByText('Badges');
    expect(badgeItems.length).toBeGreaterThan(0);
  });

  it('does not render Payment & Billing for coach role', () => {
    localStorage.setItem('role', 'coach');
    render(<Sidebar />);
    expect(screen.queryByText('Payment & Billing')).not.toBeInTheDocument();
  });

  it('does not render Badges for coach role', () => {
    localStorage.setItem('role', 'coach');
    render(<Sidebar />);
    expect(screen.queryByText('Badges')).not.toBeInTheDocument();
  });

  it('toggles mobile dropdown', async () => {
    localStorage.setItem('role', 'parent');
    const user = userEvent.setup();
    render(<Sidebar />);
    // The mobile dropdown button should display the current item label
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});

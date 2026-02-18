import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import Header from '../Header';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  NavLink: ({ children, to, className }) => {
    const classes = typeof className === 'function' ? className({ isActive: false }) : className;
    return (
      <a href={to} className={classes}>
        {typeof children === 'function' ? children({ isActive: false }) : children}
      </a>
    );
  },
}));

jest.mock('../../context/auth', () => ({
  useAuth: () => ({
    user: { first_name: 'John', last_name: 'Doe', role: 'parent' },
    logout: jest.fn(),
  }),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('../../api/services/admin.service', () => ({
  __esModule: true,
  default: {
    sendSupportLogs: jest.fn(),
  },
}));

jest.mock('../Logo', () => () => <div data-testid="logo">Logo</div>);
jest.mock('../AdminSidebar/AdminSidebar', () => () => <div data-testid="admin-sidebar">AdminSidebar</div>);
jest.mock('../../assets/person.png', () => 'person.png');
jest.mock('@mui/icons-material', () => ({
  Person: () => <div data-testid="person-icon" />,
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders Logo for parent role', () => {
    localStorage.setItem('role', 'parent');
    render(<Header />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders parent navigation items', () => {
    localStorage.setItem('role', 'parent');
    render(<Header />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
  });

  it('renders coach navigation items', () => {
    localStorage.setItem('role', 'coach');
    render(<Header />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Check-In')).toBeInTheDocument();
  });

  it('renders user name', () => {
    localStorage.setItem('role', 'parent');
    render(<Header />);
    expect(screen.getByText(/John D\./)).toBeInTheDocument();
  });

  it('renders user role', () => {
    localStorage.setItem('role', 'parent');
    render(<Header />);
    expect(screen.getByText('parent')).toBeInTheDocument();
  });

  it('renders profile image', () => {
    localStorage.setItem('role', 'parent');
    render(<Header />);
    const images = screen.getAllByAlt('profile');
    expect(images.length).toBeGreaterThan(0);
  });

  it('renders Support button for admin', () => {
    localStorage.setItem('role', 'admin');
    render(<Header />);
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('does not render Support button for parent', () => {
    localStorage.setItem('role', 'parent');
    render(<Header />);
    expect(screen.queryByText('Support')).not.toBeInTheDocument();
  });

  it('renders mobile bottom navigation', () => {
    localStorage.setItem('role', 'parent');
    render(<Header />);
    // Mobile nav should exist in the DOM
    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks.length).toBeGreaterThan(0);
  });
});

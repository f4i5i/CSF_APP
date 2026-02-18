import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import AdminSidebar from '../AdminSidebar/AdminSidebar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  NavLink: ({ children, to, className, onClick }) => {
    const classes = typeof className === 'function' ? className({ isActive: false }) : className;
    return (
      <a href={to} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  },
}));

jest.mock('../../context/auth', () => ({
  useAuth: () => ({
    logout: jest.fn(),
  }),
}));

jest.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    can: () => true,
    isAtLeast: () => true,
    roleLabel: 'Owner',
    isOwner: true,
  }),
}));

describe('AdminSidebar', () => {
  const defaultProps = {
    collapsed: false,
    setCollapsed: jest.fn(),
    onNavigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Home link', () => {
    render(<AdminSidebar {...defaultProps} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders role badge', () => {
    render(<AdminSidebar {...defaultProps} />);
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('renders Logout button', () => {
    render(<AdminSidebar {...defaultProps} />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders category headers', () => {
    render(<AdminSidebar {...defaultProps} />);
    expect(screen.getByText('Setup')).toBeInTheDocument();
    expect(screen.getByText('Classes')).toBeInTheDocument();
    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
  });

  it('renders sidebar toggle button', () => {
    render(<AdminSidebar {...defaultProps} />);
    const toggleBtn = screen.getByLabelText('Close sidebar');
    expect(toggleBtn).toBeInTheDocument();
  });

  it('calls setCollapsed on toggle click', async () => {
    const user = userEvent.setup();
    render(<AdminSidebar {...defaultProps} />);
    const toggleBtn = screen.getByLabelText('Close sidebar');
    await user.click(toggleBtn);
    expect(defaultProps.setCollapsed).toHaveBeenCalledWith(true);
  });

  it('renders Open sidebar label when collapsed', () => {
    render(<AdminSidebar {...defaultProps} collapsed={true} />);
    const toggleBtn = screen.getByLabelText('Open sidebar');
    expect(toggleBtn).toBeInTheDocument();
  });

  it('hides text labels when collapsed', () => {
    render(<AdminSidebar {...defaultProps} collapsed={true} />);
    // When collapsed, role badge should be hidden
    expect(screen.queryByText('Owner')).not.toBeInTheDocument();
    // Logout text should be hidden
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('expands category on click', async () => {
    const user = userEvent.setup();
    render(<AdminSidebar {...defaultProps} />);
    // Click on Setup category
    await user.click(screen.getByText('Setup'));
    // Sub-items should be visible
    expect(screen.getByText('Programs')).toBeInTheDocument();
    expect(screen.getByText('Areas')).toBeInTheDocument();
    expect(screen.getByText('Sites')).toBeInTheDocument();
  });

  it('renders System category for owner', () => {
    render(<AdminSidebar {...defaultProps} />);
    expect(screen.getByText('System')).toBeInTheDocument();
  });
});

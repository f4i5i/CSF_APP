/**
 * Integration Tests for ClassList Page
 * Tests class listing, program filtering, search, registration flow
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import ClassList from '../../../pages/AdminDashboard/ClassList';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock useAuth
const mockUseAuth = jest.fn();
jest.mock('../../../context/auth', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock toast
const mockToast = jest.fn();
const mockToastError = jest.fn();
mockToast.error = mockToastError;
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: Object.assign(
    (msg: string) => mockToast(msg),
    { error: (msg: string) => mockToastError(msg), success: jest.fn() }
  ),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockPrograms = [
  { id: 'prog-1', name: 'Youth Soccer' },
  { id: 'prog-2', name: 'Basketball League' },
];

const mockClasses = {
  items: [
    {
      id: 'class-1',
      name: 'Soccer Basics U10',
      description: 'A fun soccer program for young athletes.',
      image_url: '/images/soccer.jpg',
      price: 250,
      weekdays: ['Monday', 'Wednesday'],
      start_time: '4:00 PM',
      end_time: '5:30 PM',
      start_date: '2025-01-15',
      end_date: '2025-05-15',
      is_active: true,
      program_id: 'prog-1',
    },
    {
      id: 'class-2',
      name: 'Basketball 101',
      description: 'Intro to basketball skills.',
      image_url: '/images/basketball.jpg',
      price: 200,
      weekdays: ['Tuesday', 'Thursday'],
      start_time: '3:00 PM',
      end_time: '4:30 PM',
      start_date: '2025-02-01',
      end_date: '2025-06-01',
      is_active: true,
      program_id: 'prog-2',
    },
    {
      id: 'class-3',
      name: 'Advanced Soccer Training',
      description: 'Advanced techniques for experienced players.',
      image_url: null,
      price: 350,
      weekdays: [],
      start_time: null,
      end_time: null,
      start_date: null,
      end_date: null,
      is_active: true,
      program_id: 'prog-1',
    },
  ],
  total: 3,
};

describe('ClassList Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token');
    mockNavigate.mockClear();
    mockToast.mockClear();
    mockToastError.mockClear();
    mockUseAuth.mockReturnValue({ user: null });

    server.use(
      http.get(`${API_BASE}/programs`, () => {
        return HttpResponse.json(mockPrograms);
      }),
      http.get(`${API_BASE}/classes`, () => {
        return HttpResponse.json(mockClasses);
      })
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Page Loading', () => {
    it('should display loading state while fetching', () => {
      server.use(
        http.get(`${API_BASE}/classes`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return HttpResponse.json(mockClasses);
        })
      );

      render(<ClassList />);

      expect(screen.getByText('Loading classes...')).toBeInTheDocument();
    });

    it('should display page header', async () => {
      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('Available Classes')).toBeInTheDocument();
      });

      expect(screen.getByText('Select a class to continue registration')).toBeInTheDocument();
    });

    it('should load and display classes', async () => {
      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics U10')).toBeInTheDocument();
        expect(screen.getByText('Basketball 101')).toBeInTheDocument();
      });
    });
  });

  describe('Program Filters', () => {
    it('should display All Programs button', async () => {
      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('All Programs')).toBeInTheDocument();
      });
    });

    it('should display program filter buttons', async () => {
      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('Youth Soccer')).toBeInTheDocument();
        expect(screen.getByText('Basketball League')).toBeInTheDocument();
      });
    });

    it('should filter classes by program when program button clicked', async () => {
      const user = userEvent.setup();
      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/classes`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            program_id: url.searchParams.get('program_id'),
          };
          return HttpResponse.json(mockClasses);
        })
      );

      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('Youth Soccer')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Youth Soccer'));

      await waitFor(() => {
        expect(requestParams?.program_id).toBe('prog-1');
      });
    });

    it('should reset filter when All Programs button clicked', async () => {
      const user = userEvent.setup();
      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/classes`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            program_id: url.searchParams.get('program_id'),
          };
          return HttpResponse.json(mockClasses);
        })
      );

      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('Youth Soccer')).toBeInTheDocument();
      });

      // Click a program first
      await user.click(screen.getByText('Youth Soccer'));

      await waitFor(() => {
        expect(requestParams?.program_id).toBe('prog-1');
      });

      // Then click All Programs
      await user.click(screen.getByText('All Programs'));

      await waitFor(() => {
        expect(requestParams?.program_id).toBeNull();
      });
    });
  });

  describe('Search', () => {
    it('should display search input', async () => {
      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search classes...')).toBeInTheDocument();
      });
    });

    it('should filter classes by search query (client-side)', async () => {
      const user = userEvent.setup();

      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics U10')).toBeInTheDocument();
        expect(screen.getByText('Basketball 101')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search classes...');
      await user.type(searchInput, 'Soccer');

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics U10')).toBeInTheDocument();
        expect(screen.getByText('Advanced Soccer Training')).toBeInTheDocument();
        expect(screen.queryByText('Basketball 101')).not.toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      const user = userEvent.setup();

      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics U10')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search classes...');
      await user.type(searchInput, 'basketball');

      await waitFor(() => {
        expect(screen.getByText('Basketball 101')).toBeInTheDocument();
        expect(screen.queryByText('Soccer Basics U10')).not.toBeInTheDocument();
      });
    });
  });

  describe('Class Display', () => {
    it('should display class schedule', async () => {
      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText(/Monday, Wednesday @ 4:00 PM - 5:30 PM/)).toBeInTheDocument();
        expect(screen.getByText(/Tuesday, Thursday @ 3:00 PM - 4:30 PM/)).toBeInTheDocument();
      });
    });

    it('should display Schedule TBD when no weekdays', async () => {
      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('Schedule TBD')).toBeInTheDocument();
      });
    });

    it('should display date range', async () => {
      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
      });
    });

    it('should display Dates TBD when dates are missing', async () => {
      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('Dates TBD')).toBeInTheDocument();
      });
    });

    it('should display Register buttons for each class', async () => {
      render(<ClassList />);

      await waitFor(() => {
        const registerButtons = screen.getAllByText('Register');
        expect(registerButtons.length).toBe(3);
      });
    });
  });

  describe('Registration Flow', () => {
    it('should redirect to login when unauthenticated user clicks Register', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({ user: null });

      render(<ClassList />);

      await waitFor(() => {
        const registerButtons = screen.getAllByText('Register');
        expect(registerButtons.length).toBe(3);
      });

      await user.click(screen.getAllByText('Register')[0]);

      expect(mockToast).toHaveBeenCalledWith('Please log in to register for this class');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(sessionStorage.getItem('intendedClass')).toBe('class-1');
    });

    it('should show error when non-parent user clicks Register', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', role: 'coach' },
      });

      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getAllByText('Register').length).toBe(3);
      });

      await user.click(screen.getAllByText('Register')[0]);

      expect(mockToastError).toHaveBeenCalledWith('Only parents can register for classes');
    });

    it('should navigate to checkout for authenticated parent', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', role: 'parent' },
      });

      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getAllByText('Register').length).toBe(3);
      });

      await user.click(screen.getAllByText('Register')[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/checkout?classId=class-1');
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no classes found', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('No classes found.')).toBeInTheDocument();
      });
    });

    it('should display empty message when search has no results', async () => {
      const user = userEvent.setup();

      render(<ClassList />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics U10')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search classes...');
      await user.type(searchInput, 'xyznonexistentclass');

      await waitFor(() => {
        expect(screen.getByText('No classes found.')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error toast when classes API fails', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        })
      );

      render(<ClassList />);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to load classes');
      });
    });

    it('should display error toast when programs API fails', async () => {
      server.use(
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        })
      );

      render(<ClassList />);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to load programs');
      });
    });
  });

  describe('Navigation', () => {
    it('should display class detail links', async () => {
      render(<ClassList />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        const classDetailLinks = links.filter(
          (link) => link.getAttribute('href')?.includes('/class-detail')
        );
        expect(classDetailLinks.length).toBeGreaterThan(0);
      });
    });
  });
});

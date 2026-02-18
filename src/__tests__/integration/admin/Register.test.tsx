/**
 * Integration Tests for Register (Area Selection) Page
 * Tests area listing, area navigation, loading states, error handling
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Resgister from '../../../pages/AdminDashboard/Resgister';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock toast
const mockToastError = jest.fn();
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    error: (msg: string) => mockToastError(msg),
    success: jest.fn(),
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockAreas = [
  { id: '1', name: 'Charlotte' },
  { id: '2', name: 'Triangle' },
  { id: '3', name: 'Greensboro' },
];

describe('Register (Area Selection) Page Integration Tests', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockToastError.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Page Loading', () => {
    it('should display loading state while fetching areas', () => {
      server.use(
        http.get(`${API_BASE}/areas`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return HttpResponse.json(mockAreas);
        })
      );

      render(<Resgister />);

      expect(screen.getByText('Loading areas...')).toBeInTheDocument();
    });

    it('should display page title', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json(mockAreas);
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Carolina Soccer Factory')).toBeInTheDocument();
      });
    });

    it('should display Choose Area prompt', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json(mockAreas);
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Choose Area:')).toBeInTheDocument();
      });
    });
  });

  describe('Area Display', () => {
    it('should display all areas as buttons', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json(mockAreas);
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Charlotte')).toBeInTheDocument();
        expect(screen.getByText('Triangle')).toBeInTheDocument();
        expect(screen.getByText('Greensboro')).toBeInTheDocument();
      });
    });

    it('should handle array response directly', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json(mockAreas);
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Charlotte')).toBeInTheDocument();
      });
    });

    it('should handle items property response', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json({ items: mockAreas });
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Charlotte')).toBeInTheDocument();
      });
    });

    it('should handle data property response', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json({ data: mockAreas });
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Charlotte')).toBeInTheDocument();
      });
    });
  });

  describe('Area Navigation', () => {
    it('should navigate to class list with area filter when area clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json(mockAreas);
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Charlotte')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Charlotte'));

      expect(mockNavigate).toHaveBeenCalledWith('/class-list?area=1', { state: { from: '/' } });
    });

    it('should navigate with correct area ID for different areas', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json(mockAreas);
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Triangle')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Triangle'));

      expect(mockNavigate).toHaveBeenCalledWith('/class-list?area=2', { state: { from: '/' } });
    });
  });

  describe('Login Link', () => {
    it('should display login prompt', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json(mockAreas);
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      });
    });

    it('should display Login link', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json(mockAreas);
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        const loginLink = screen.getByText('Login');
        expect(loginLink).toBeInTheDocument();
        expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error toast when areas fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to load areas');
      });
    });

    it('should display fallback areas when API fails', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Charlotte')).toBeInTheDocument();
        expect(screen.getByText('Triangle')).toBeInTheDocument();
        expect(screen.getByText('Greensboro')).toBeInTheDocument();
      });
    });

    it('should allow navigation with fallback areas', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Charlotte')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Charlotte'));

      expect(mockNavigate).toHaveBeenCalledWith('/class-list?area=1', { state: { from: '/' } });
    });
  });

  describe('Empty State', () => {
    it('should handle empty areas array gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        expect(screen.getByText('Choose Area:')).toBeInTheDocument();
      });

      // No area buttons should be rendered
      expect(screen.queryByText('Charlotte')).not.toBeInTheDocument();
    });
  });

  describe('Logo Display', () => {
    it('should display the logo image', async () => {
      server.use(
        http.get(`${API_BASE}/areas`, () => {
          return HttpResponse.json(mockAreas);
        })
      );

      render(<Resgister />);

      await waitFor(() => {
        const logo = screen.getByAltText('location');
        expect(logo).toBeInTheDocument();
      });
    });
  });
});

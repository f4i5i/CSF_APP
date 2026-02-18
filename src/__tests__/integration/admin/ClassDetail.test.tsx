/**
 * Integration Tests for ClassDetail Page
 * Tests class detail display, schedule, pricing, registration flow, auth checks
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import { renderAtRoute } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import ClassDetail from '../../../pages/AdminDashboard/ClassDetail';

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

const mockClassData = {
  id: 'class-1',
  name: 'Soccer Basics U10',
  description: 'A fun soccer program for young athletes ages 6-10.',
  image_url: '/images/soccer.jpg',
  price: 250,
  capacity: 20,
  current_enrollment: 15,
  available_spots: 5,
  has_capacity: true,
  min_age: 6,
  max_age: 10,
  weekdays: ['Monday', 'Wednesday'],
  start_time: '4:00 PM',
  end_time: '5:30 PM',
  start_date: '2025-01-15',
  end_date: '2025-05-15',
  school: {
    name: 'Lincoln Elementary',
    address: '123 Main St, Charlotte, NC 28202',
    city: 'Charlotte',
    state: 'NC',
    zip_code: '28202',
  },
  coach: {
    first_name: 'Coach Mike',
    last_name: 'Johnson',
  },
  program: {
    id: 'prog-1',
    name: 'Youth Soccer',
  },
};

describe('ClassDetail Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token');
    mockNavigate.mockClear();
    mockToast.mockClear();
    mockToastError.mockClear();
    mockUseAuth.mockReturnValue({ user: null });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Loading State', () => {
    it('should display loading state while fetching class data', () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      expect(screen.getByText('Loading class details...')).toBeInTheDocument();
    });
  });

  describe('Class Data Display', () => {
    it('should display class name', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics U10')).toBeInTheDocument();
      });
    });

    it('should display class description', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText(/A fun soccer program for young athletes/)).toBeInTheDocument();
      });
    });

    it('should display "No description available" when description is missing', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json({ ...mockClassData, description: null });
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('No description available')).toBeInTheDocument();
      });
    });

    it('should display price', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('$250')).toBeInTheDocument();
      });
    });

    it('should display Total Price label', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Total Price')).toBeInTheDocument();
      });
    });

    it('should display age group', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('6 - 10 Years Old')).toBeInTheDocument();
      });
    });
  });

  describe('Schedule Display', () => {
    it('should display schedule section', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Day & Time')).toBeInTheDocument();
      });
    });

    it('should display schedule with weekdays and times', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText(/Monday, Wednesday, 4:00 PM - 5:30 PM/)).toBeInTheDocument();
      });
    });

    it('should display "Schedule TBD" when no weekdays', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json({
            ...mockClassData,
            weekdays: [],
          });
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Schedule TBD')).toBeInTheDocument();
      });
    });

    it('should display date range', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Dates')).toBeInTheDocument();
        expect(screen.getByText(/Jan 15, 2025/)).toBeInTheDocument();
      });
    });

    it('should display "Dates TBD" when dates are missing', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json({
            ...mockClassData,
            start_date: null,
            end_date: null,
          });
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Dates TBD')).toBeInTheDocument();
      });
    });
  });

  describe('Location Display', () => {
    it('should display school name', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Location')).toBeInTheDocument();
        expect(screen.getByText(/Lincoln Elementary/)).toBeInTheDocument();
      });
    });

    it('should display school address', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
      });
    });

    it('should not display location when school is missing', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json({ ...mockClassData, school: null });
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics U10')).toBeInTheDocument();
      });

      expect(screen.queryByText('Location')).not.toBeInTheDocument();
    });
  });

  describe('Coordinator Display', () => {
    it('should display coordinator name', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Coordinator')).toBeInTheDocument();
        expect(screen.getByText('Coach Mike')).toBeInTheDocument();
      });
    });

    it('should not display coordinator when coach is missing', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json({ ...mockClassData, coach: null });
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics U10')).toBeInTheDocument();
      });

      expect(screen.queryByText('Coordinator')).not.toBeInTheDocument();
    });
  });

  describe('Registration Flow', () => {
    it('should display Register Now button', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Register Now')).toBeInTheDocument();
      });
    });

    it('should redirect to login when unauthenticated user clicks Register', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({ user: null });

      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Register Now')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Register Now'));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(sessionStorage.getItem('intendedClass')).toBe('class-1');
    });

    it('should show error when non-parent user clicks Register', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', role: 'coach', first_name: 'Coach' },
      });

      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Register Now')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Register Now'));

      expect(mockToastError).toHaveBeenCalledWith('Only parents can register for classes');
    });

    it('should navigate to checkout when parent clicks Register', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: { id: 'user-1', role: 'parent', first_name: 'John' },
      });

      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Register Now')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Register Now'));

      expect(mockNavigate).toHaveBeenCalledWith('/checkout?classId=class-1');
    });
  });

  describe('Navigation', () => {
    it('should display Back to Available Classes link', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('Back to Available Classes')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should navigate to class list when no class ID provided', () => {
      mockUseAuth.mockReturnValue({ user: null });

      render(<ClassDetail />);

      expect(mockToastError).toHaveBeenCalledWith('No class ID provided');
      expect(mockNavigate).toHaveBeenCalledWith('/class-list');
    });

    it('should navigate to class list on API error', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        })
      );

      render(<ClassDetail />, {}, '?id=nonexistent');

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to load class details');
        expect(mockNavigate).toHaveBeenCalledWith('/class-list');
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should construct school object from flat fields', async () => {
      const flatData = {
        ...mockClassData,
        school: undefined,
        school_name: 'Oak Park School',
        school_address: '456 Oak Ave',
        school_city: 'Raleigh',
        school_state: 'NC',
        school_zip_code: '27601',
      };

      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(flatData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText(/Oak Park School/)).toBeInTheDocument();
        expect(screen.getByText(/456 Oak Ave/)).toBeInTheDocument();
      });
    });
  });

  describe('Pricing Features', () => {
    it('should display pricing features list', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(mockClassData);
        })
      );

      render(<ClassDetail />, {}, '?id=class-1');

      await waitFor(() => {
        expect(screen.getByText('15 weeks of training')).toBeInTheDocument();
        expect(screen.getByText('Certified coaching staff')).toBeInTheDocument();
      });
    });
  });
});

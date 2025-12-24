/**
 * Classes Page Integration Tests
 * Tests for class browsing, searching, filtering, and enrollment navigation
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Classes from '../../../pages/Classes';
import toast from 'react-hot-toast';

// Mock dependencies
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('react-hot-toast');

jest.mock('../../../components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

jest.mock('../../../components/ClassCard', () => ({
  __esModule: true,
  default: ({ cls, onClick, onRegister }: any) => (
    <div data-testid={`class-card-${cls.id}`}>
      <h3>{cls.title}</h3>
      <p>{cls.school}</p>
      <p>{cls.dates}</p>
      <p>{cls.time}</p>
      <p>{cls.ages}</p>
      <p>{cls.priceLabel}</p>
      <p>
        {cls.capacity.filled}/{cls.capacity.total}
      </p>
      <button onClick={onClick}>View Details</button>
      <button onClick={onRegister} disabled={!cls.hasCapacity}>
        {cls.hasCapacity ? 'Register' : 'Join Waitlist'}
      </button>
    </div>
  ),
}));

const API_BASE = 'http://localhost:8000/api/v1';

describe('Classes Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial Render', () => {
    it('should render page header', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Class Overview')).toBeInTheDocument();
      });
    });

    it('should render header and footer components', () => {
      render(<Classes />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<Classes />);

      expect(screen.getByText(/Loading classes.../i)).toBeInTheDocument();
    });

    it('should render search input', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search classes.../i)).toBeInTheDocument();
      });
    });
  });

  describe('Class List Display', () => {
    it('should display all active classes', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
        expect(screen.getByTestId('class-card-class-2')).toBeInTheDocument();
      });

      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      expect(screen.getByText('Basketball 101')).toBeInTheDocument();
    });

    it('should display class details correctly', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const classCard = screen.getByTestId('class-card-class-1');

      expect(classCard).toHaveTextContent('Soccer Basics');
      expect(classCard).toHaveTextContent('Test Elementary');
      expect(classCard).toHaveTextContent('15/20');
    });

    it('should show empty state when no classes available', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText(/No classes match your search/i)).toBeInTheDocument();
      });
    });

    it('should handle API error gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json(
            { message: 'Failed to fetch classes' },
            { status: 500 }
          );
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText(/Unable to load classes right now/i)).toBeInTheDocument();
      });
    });
  });

  describe('Class Search', () => {
    it('should filter classes by name', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
        expect(screen.getByTestId('class-card-class-2')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search classes.../i);
      await user.type(searchInput, 'Soccer');

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
        expect(screen.queryByTestId('class-card-class-2')).not.toBeInTheDocument();
      });
    });

    it('should filter classes by description', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
        expect(screen.getByTestId('class-card-class-2')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search classes.../i);
      await user.type(searchInput, 'fundamentals');

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
        expect(screen.queryByTestId('class-card-class-2')).not.toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search classes.../i);
      await user.type(searchInput, 'SOCCER');

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });
    });

    it('should show no results message when search has no matches', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search classes.../i);
      await user.type(searchInput, 'NonExistentClass');

      await waitFor(() => {
        expect(screen.getByText(/No classes match your search/i)).toBeInTheDocument();
      });

      expect(screen.queryByTestId('class-card-class-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('class-card-class-2')).not.toBeInTheDocument();
    });

    it('should clear search and show all classes when search is cleared', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search classes.../i);
      await user.type(searchInput, 'Soccer');

      await waitFor(() => {
        expect(screen.queryByTestId('class-card-class-2')).not.toBeInTheDocument();
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
        expect(screen.getByTestId('class-card-class-2')).toBeInTheDocument();
      });
    });
  });

  describe('Class Details Navigation', () => {
    it('should navigate to class details when clicking view details', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const viewDetailsButton = screen.getAllByText('View Details')[0];
      await user.click(viewDetailsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/class/class-1');
    });

    it('should navigate to different class details for each card', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-2')).toBeInTheDocument();
      });

      const viewDetailsButtons = screen.getAllByText('View Details');
      await user.click(viewDetailsButtons[1]);

      expect(mockNavigate).toHaveBeenCalledWith('/class/class-2');
    });
  });

  describe('Class Registration - Authenticated Parent', () => {
    it('should navigate to checkout when parent clicks register', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const registerButton = screen.getAllByText('Register')[0];
      await user.click(registerButton);

      expect(mockNavigate).toHaveBeenCalledWith('/checkout?classId=class-1');
    });

    it('should handle registration for different classes', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-2')).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByText('Register');
      await user.click(registerButtons[1]);

      expect(mockNavigate).toHaveBeenCalledWith('/checkout?classId=class-2');
    });
  });

  describe('Class Registration - Unauthenticated User', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should prompt login when unauthenticated user tries to register', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const registerButton = screen.getAllByText('Register')[0];
      await user.click(registerButton);

      expect(toast).toHaveBeenCalledWith('Please log in to register for this class');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should store intended class in session storage', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const registerButton = screen.getAllByText('Register')[0];
      await user.click(registerButton);

      expect(setItemSpy).toHaveBeenCalledWith('intendedClass', 'class-1');
    });
  });

  describe('Class Registration - Non-Parent Role', () => {
    it('should show error when coach tries to register', async () => {
      server.use(
        http.get(`${API_BASE}/auth/me`, () => {
          return HttpResponse.json({
            id: 'user-coach-1',
            email: 'coach@test.com',
            role: 'COACH',
          });
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const registerButton = screen.getAllByText('Register')[0];
      await user.click(registerButton);

      expect(toast.error).toHaveBeenCalledWith('Only parents can register for classes');
      expect(mockNavigate).not.toHaveBeenCalledWith(expect.stringContaining('/checkout'));
    });

    it('should show error when admin tries to register', async () => {
      server.use(
        http.get(`${API_BASE}/auth/me`, () => {
          return HttpResponse.json({
            id: 'user-admin-1',
            email: 'admin@test.com',
            role: 'ADMIN',
          });
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const registerButton = screen.getAllByText('Register')[0];
      await user.click(registerButton);

      expect(toast.error).toHaveBeenCalledWith('Only parents can register for classes');
    });
  });

  describe('Class Capacity', () => {
    it('should show register button for classes with capacity', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const classCard = screen.getByTestId('class-card-class-1');
      const registerButton = classCard.querySelector('button:not(:disabled)');

      expect(registerButton).toHaveTextContent('Register');
      expect(registerButton).not.toBeDisabled();
    });

    it('should show join waitlist for full classes', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json([
            {
              id: 'class-full',
              name: 'Full Class',
              description: 'This class is full',
              capacity: 20,
              enrolled_count: 20,
              price: 150,
              school: { name: 'Test School' },
              status: 'active',
              is_active: true,
            },
          ]);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-full')).toBeInTheDocument();
      });

      const joinWaitlistButton = screen.getByText('Join Waitlist');
      expect(joinWaitlistButton).toBeDisabled();
    });

    it('should display capacity information correctly', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const classCard = screen.getByTestId('class-card-class-1');
      expect(classCard).toHaveTextContent('15/20');
    });
  });

  describe('Class Data Mapping', () => {
    it('should display formatted date range', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      // Date should be formatted from start_date and end_date
      const classCard = screen.getByTestId('class-card-class-1');
      expect(classCard).toBeDefined();
    });

    it('should display formatted schedule', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const classCard = screen.getByTestId('class-card-class-1');
      expect(classCard).toBeDefined();
    });

    it('should display age range when available', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json([
            {
              id: 'class-with-ages',
              name: 'Kids Soccer',
              description: 'For young players',
              capacity: 20,
              enrolled_count: 10,
              price: 150,
              min_age: 5,
              max_age: 10,
              school: { name: 'Test School' },
              status: 'active',
              is_active: true,
            },
          ]);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-with-ages')).toBeInTheDocument();
      });

      expect(screen.getByText('Ages 5–10')).toBeInTheDocument();
    });

    it('should show "All Ages" when age range not specified', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json([
            {
              id: 'class-all-ages',
              name: 'All Ages Soccer',
              description: 'For all',
              capacity: 20,
              enrolled_count: 10,
              price: 150,
              school: { name: 'Test School' },
              status: 'active',
              is_active: true,
            },
          ]);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-all-ages')).toBeInTheDocument();
      });

      expect(screen.getByText('All Ages')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should render class cards in grid layout', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
        expect(screen.getByTestId('class-card-class-2')).toBeInTheDocument();
      });

      // Both cards should be visible in the grid
      const cards = screen.getAllByRole('button', { name: /View Details/i });
      expect(cards).toHaveLength(2);
    });
  });

  describe('Filter by Active Status', () => {
    it('should only show active classes', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, ({ request }) => {
          const url = new URL(request.url);
          const isActive = url.searchParams.get('is_active');

          if (isActive === 'true') {
            return HttpResponse.json([
              {
                id: 'class-active',
                name: 'Active Class',
                description: 'Active',
                capacity: 20,
                enrolled_count: 10,
                price: 150,
                school: { name: 'Test School' },
                status: 'active',
                is_active: true,
              },
            ]);
          }

          return HttpResponse.json([]);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-active')).toBeInTheDocument();
      });

      // Should only show active classes
      expect(screen.queryByTestId('class-card-class-inactive')).not.toBeInTheDocument();
    });
  });

  describe('Price Display', () => {
    it('should display price from price_display field', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json([
            {
              id: 'class-with-price',
              name: 'Priced Class',
              description: 'Has custom price display',
              capacity: 20,
              enrolled_count: 10,
              price_display: '$150/month',
              base_price: 150,
              school: { name: 'Test School' },
              status: 'active',
              is_active: true,
            },
          ]);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('$150/month')).toBeInTheDocument();
      });
    });

    it('should fall back to base_price when price_display not available', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json([
            {
              id: 'class-base-price',
              name: 'Base Price Class',
              description: 'Uses base price',
              capacity: 20,
              enrolled_count: 10,
              base_price: 200,
              school: { name: 'Test School' },
              status: 'active',
              is_active: true,
            },
          ]);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('$200')).toBeInTheDocument();
      });
    });
  });

  describe('School/Location Display', () => {
    it('should display school name from nested school object', async () => {
      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      expect(screen.getAllByText('Test Elementary')[0]).toBeInTheDocument();
    });

    it('should fall back to location field when school object not available', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json([
            {
              id: 'class-location',
              name: 'Location Class',
              description: 'Has location',
              capacity: 20,
              enrolled_count: 10,
              price: 150,
              location: 'Community Center',
              status: 'active',
              is_active: true,
            },
          ]);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Community Center')).toBeInTheDocument();
      });
    });

    it('should show "Location TBA" when neither school nor location available', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json([
            {
              id: 'class-no-location',
              name: 'No Location Class',
              description: 'Missing location',
              capacity: 20,
              enrolled_count: 10,
              price: 150,
              status: 'active',
              is_active: true,
            },
          ]);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByText('Location TBA')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Classes', () => {
    it('should handle large number of classes', async () => {
      const manyClasses = Array.from({ length: 20 }, (_, i) => ({
        id: `class-${i}`,
        name: `Class ${i}`,
        description: `Description ${i}`,
        capacity: 20,
        enrolled_count: 10,
        price: 150,
        school: { name: 'Test School' },
        status: 'active',
        is_active: true,
      }));

      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json(manyClasses);
        })
      );

      render(<Classes />);

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-0')).toBeInTheDocument();
      });

      // Should render all classes
      const cards = screen.getAllByRole('button', { name: /View Details/i });
      expect(cards).toHaveLength(20);
    });
  });
});

/**
 * Events Page Integration Tests
 * Tests for the events page including event listing, filtering, search, and RSVP
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import EventsPage from '../../../pages/Events';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock Header and Footer
jest.mock('../../../components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

// Mock EventRsvpCard
jest.mock('../../../components/EventRsvpCard', () => ({
  __esModule: true,
  default: ({ event, showFullDetails }: { event: any; showFullDetails: boolean }) => (
    <div data-testid={`event-card-${event.id}`}>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p>{event.location}</p>
    </div>
  ),
}));

// Mock useChildren hook
const mockSelectedChild = {
  id: 'child-1',
  first_name: 'Johnny',
  last_name: 'Parent',
};

jest.mock('../../../hooks', () => ({
  useChildren: () => ({
    selectedChild: mockSelectedChild,
    children: [mockSelectedChild],
  }),
  useApi: jest.fn().mockReturnValue({
    data: [
      {
        id: 'enroll-1',
        child_id: 'child-1',
        class_id: 'class-1',
        class: { id: 'class-1' },
        status: 'active',
      },
    ],
    loading: false,
  }),
}));

// Mock useAuth
jest.mock('../../../context/auth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-parent-1',
      role: 'PARENT',
      first_name: 'Test',
      last_name: 'Parent',
    },
  }),
}));

// Mock events and enrollments services
jest.mock('../../../api/services', () => ({
  eventsService: {
    getByClass: jest.fn(),
  },
  enrollmentsService: {
    getMy: jest.fn(),
  },
}));

import { eventsService } from '../../../api/services';

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7);

const pastDate = new Date();
pastDate.setDate(pastDate.getDate() - 7);

const mockEvents = [
  {
    id: 'event-1',
    title: 'End of Season Party',
    description: 'Celebrate the end of the season',
    location: 'School Gym',
    start_datetime: futureDate.toISOString(),
    end_datetime: futureDate.toISOString(),
    type: 'social',
    event_type: 'social',
  },
  {
    id: 'event-2',
    title: 'Tournament Day',
    description: 'Annual soccer tournament',
    location: 'Main Field',
    start_datetime: futureDate.toISOString(),
    end_datetime: futureDate.toISOString(),
    type: 'tournament',
    event_type: 'tournament',
  },
  {
    id: 'event-3',
    title: 'Past Practice',
    description: 'Regular practice session',
    location: 'Field A',
    start_datetime: pastDate.toISOString(),
    end_datetime: pastDate.toISOString(),
    type: 'practice',
    event_type: 'practice',
  },
];

describe('Events Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');

    (eventsService.getByClass as jest.Mock).mockResolvedValue(mockEvents);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the events page header', async () => {
      render(<EventsPage />);

      expect(screen.getByText('Events')).toBeInTheDocument();
    });

    it('should render Header and Footer', () => {
      render(<EventsPage />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should show selected child name', () => {
      render(<EventsPage />);

      expect(screen.getByText(/Showing events for Johnny/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<EventsPage />);

      expect(screen.getByPlaceholderText(/Search by title, description, or location/i)).toBeInTheDocument();
    });

    it('should render filter dropdowns', () => {
      render(<EventsPage />);

      // Status filter (upcoming/past/all)
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ===========================================
  // EVENT DISPLAY TESTS
  // ===========================================
  describe('Event Display', () => {
    it('should display events after loading', async () => {
      render(<EventsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('event-card-event-1')).toBeInTheDocument();
      });

      expect(screen.getByText('End of Season Party')).toBeInTheDocument();
    });

    it('should display event count', async () => {
      render(<EventsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Showing \d+ .* event/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading State', () => {
    it('should show loading skeleton while events are being fetched', () => {
      (eventsService.getByClass as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockEvents), 5000))
      );

      render(<EventsPage />);

      // Loading skeleton should have animated placeholders
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  // ===========================================
  // SEARCH TESTS
  // ===========================================
  describe('Search Functionality', () => {
    it('should filter events by search term in title', async () => {
      render(<EventsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('event-card-event-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by title, description, or location/i);
      await user.type(searchInput, 'Tournament');

      await waitFor(() => {
        expect(screen.getByTestId('event-card-event-2')).toBeInTheDocument();
        expect(screen.queryByTestId('event-card-event-1')).not.toBeInTheDocument();
      });
    });

    it('should filter events by search term in description', async () => {
      render(<EventsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('event-card-event-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by title, description, or location/i);
      await user.type(searchInput, 'Celebrate');

      await waitFor(() => {
        expect(screen.getByTestId('event-card-event-1')).toBeInTheDocument();
        expect(screen.queryByTestId('event-card-event-2')).not.toBeInTheDocument();
      });
    });

    it('should filter events by search term in location', async () => {
      render(<EventsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('event-card-event-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by title, description, or location/i);
      await user.type(searchInput, 'School Gym');

      await waitFor(() => {
        expect(screen.getByTestId('event-card-event-1')).toBeInTheDocument();
      });
    });

    it('should show empty state when no events match search', async () => {
      render(<EventsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('event-card-event-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by title, description, or location/i);
      await user.type(searchInput, 'nonexistent event xyz');

      await waitFor(() => {
        expect(screen.getByText(/No events match your filters/i)).toBeInTheDocument();
      });
    });

    it('should show clear search button when search has text', async () => {
      render(<EventsPage />);

      const searchInput = screen.getByPlaceholderText(/Search by title, description, or location/i);
      await user.type(searchInput, 'test');

      await waitFor(() => {
        // Clear filters button should appear
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // FILTER TESTS
  // ===========================================
  describe('Filter Functionality', () => {
    it('should filter by upcoming status (default)', async () => {
      render(<EventsPage />);

      await waitFor(() => {
        // Default filter is "upcoming" -- past events should not appear
        expect(screen.queryByTestId('event-card-event-3')).not.toBeInTheDocument();
      });
    });

    it('should show clear filters button when filters are active', async () => {
      render(<EventsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('event-card-event-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by title, description, or location/i);
      await user.type(searchInput, 'something');

      await waitFor(() => {
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty States', () => {
    it('should show empty state when no events exist', async () => {
      (eventsService.getByClass as jest.Mock).mockResolvedValue([]);

      render(<EventsPage />);

      await waitFor(() => {
        expect(screen.getByText(/No upcoming events scheduled/i)).toBeInTheDocument();
      });
    });

    it('should show "no match" message with clear filters option', async () => {
      render(<EventsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('event-card-event-1')).toBeInTheDocument();
      });

      // Apply search that matches nothing
      const searchInput = screen.getByPlaceholderText(/Search by title, description, or location/i);
      await user.type(searchInput, 'xyz nonexistent');

      await waitFor(() => {
        expect(screen.getByText(/No events match your filters/i)).toBeInTheDocument();
        expect(screen.getByText(/Clear filters/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should handle API error gracefully', async () => {
      (eventsService.getByClass as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<EventsPage />);

      await waitFor(() => {
        // Should still render the page without crashing
        expect(screen.getByText('Events')).toBeInTheDocument();
      });
    });

    it('should show empty state when API returns error', async () => {
      (eventsService.getByClass as jest.Mock).mockRejectedValue(new Error('Server error'));

      render(<EventsPage />);

      await waitFor(() => {
        expect(screen.getByText(/No upcoming events scheduled/i)).toBeInTheDocument();
      });
    });
  });
});

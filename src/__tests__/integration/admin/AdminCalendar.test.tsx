/**
 * Integration Tests for Admin Calendar Page
 * Tests calendar rendering, class filter, event loading, and error handling
 */

import { render, screen, waitFor, fireEvent } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import AdminCalendar from '../../../pages/AdminDashboard/AdminCalendar';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock calendar components to avoid complex rendering issues
jest.mock('../../../components/Calendar/CalenderMini', () => {
  return function MockCalenderMini({ events, loading }: any) {
    return (
      <div data-testid="mini-calendar">
        {loading ? 'Loading mini calendar...' : `Mini Calendar (${events?.length || 0} events)`}
      </div>
    );
  };
});

jest.mock('../../../components/Calendar/FullCalender', () => {
  return function MockFullCalender({ events, loading }: any) {
    return (
      <div data-testid="full-calendar">
        {loading ? 'Loading full calendar...' : `Full Calendar (${events?.length || 0} events)`}
        {events?.map((e: any) => (
          <div key={e.id} data-testid={`event-${e.id}`}>
            {e.title}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../../../components/NextEvent', () => {
  return function MockNextEvent({ event, loading }: any) {
    return (
      <div data-testid="next-event">
        {loading ? 'Loading next event...' : event ? `Next: ${event.title}` : 'No upcoming events'}
      </div>
    );
  };
});

// Mock data
const mockClasses = [
  { id: 'class-1', name: 'Soccer Stars U6' },
  { id: 'class-2', name: 'Lightning Bolts U8' },
  { id: 'class-3', name: 'Thunder U10' },
];

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7);
const futureDateStr = futureDate.toISOString();

const pastDate = new Date();
pastDate.setDate(pastDate.getDate() - 7);
const pastDateStr = pastDate.toISOString();

const mockEvents = [
  {
    id: 'event-1',
    title: 'Spring Tournament',
    type: 'tournament',
    start_datetime: futureDateStr,
    end_datetime: futureDateStr,
    location: 'Downtown Field',
  },
  {
    id: 'event-2',
    title: 'Practice Session',
    type: 'practice',
    start_datetime: futureDateStr,
    end_datetime: futureDateStr,
    location: 'Riverside Park',
  },
  {
    id: 'event-3',
    title: 'Past Event',
    type: 'social',
    start_datetime: pastDateStr,
    end_datetime: pastDateStr,
    location: 'Community Center',
  },
];

const mockClassEvents = [
  {
    id: 'event-1',
    title: 'Spring Tournament',
    type: 'tournament',
    start_datetime: futureDateStr,
    end_datetime: futureDateStr,
    location: 'Downtown Field',
  },
];

describe('Admin Calendar Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

    server.use(
      http.get(`${API_BASE}/classes`, () => {
        return HttpResponse.json({ items: mockClasses, total: mockClasses.length });
      }),
      http.get(`${API_BASE}/events/upcoming`, () => {
        return HttpResponse.json({ items: mockEvents });
      }),
      http.get(`${API_BASE}/events/class/:classId`, ({ params }) => {
        return HttpResponse.json(mockClassEvents);
      })
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // PAGE LOADING TESTS
  // ===========================================
  describe('Page Loading', () => {
    it('should render page title and description', async () => {
      render(<AdminCalendar />);

      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText(/View and manage events across all classes/i)).toBeInTheDocument();
    });

    it('should render mini calendar component', async () => {
      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByTestId('mini-calendar')).toBeInTheDocument();
      });
    });

    it('should render full calendar component', async () => {
      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByTestId('full-calendar')).toBeInTheDocument();
      });
    });

    it('should render next event component', async () => {
      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByTestId('next-event')).toBeInTheDocument();
      });
    });

    it('should load and display events in calendars', async () => {
      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText(/3 events/i)).toBeInTheDocument();
      });
    });

    it('should display next upcoming event', async () => {
      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText(/Next: Spring Tournament/i) || screen.getByText(/Next: Practice Session/i)).toBeTruthy();
      });
    });
  });

  // ===========================================
  // CLASS FILTER TESTS
  // ===========================================
  describe('Class Filter', () => {
    it('should display class filter dropdown', async () => {
      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText('All Classes')).toBeInTheDocument();
      });
    });

    it('should load class options in dropdown', async () => {
      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText('All Classes')).toBeInTheDocument();
      });

      // Classes should be available in the select
      const select = screen.getByDisplayValue('');
      expect(select).toBeInTheDocument();
    });

    it('should filter events by class', async () => {
      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText(/3 events/i)).toBeInTheDocument();
      });

      const select = screen.getByDisplayValue('');
      fireEvent.change(select, { target: { value: 'class-1' } });

      await waitFor(() => {
        expect(screen.getByText(/1 events/i)).toBeInTheDocument();
      });
    });

    it('should show all events when All Classes is selected', async () => {
      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText(/3 events/i)).toBeInTheDocument();
      });

      const select = screen.getByDisplayValue('');
      fireEvent.change(select, { target: { value: 'class-1' } });

      await waitFor(() => {
        expect(screen.getByText(/1 events/i)).toBeInTheDocument();
      });

      // Reset to all
      fireEvent.change(select, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText(/3 events/i)).toBeInTheDocument();
      });
    });

    it('should disable class filter while loading', () => {
      render(<AdminCalendar />);

      const select = screen.getByDisplayValue('');
      expect(select).toBeDisabled();
    });

    it('should enable class filter after loading', async () => {
      render(<AdminCalendar />);

      await waitFor(() => {
        const select = screen.getByDisplayValue('');
        expect(select).not.toBeDisabled();
      });
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading States', () => {
    it('should display loading state for mini calendar', () => {
      render(<AdminCalendar />);

      expect(screen.getByText(/Loading mini calendar/i)).toBeInTheDocument();
    });

    it('should display loading state for full calendar', () => {
      render(<AdminCalendar />);

      expect(screen.getByText(/Loading full calendar/i)).toBeInTheDocument();
    });

    it('should display loading state for next event', () => {
      render(<AdminCalendar />);

      expect(screen.getByText(/Loading next event/i)).toBeInTheDocument();
    });

    it('should hide loading states after data loads', async () => {
      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.queryByText(/Loading mini calendar/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Loading full calendar/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Loading next event/i)).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should display error message when events fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/events/upcoming`, () => {
          return HttpResponse.json({ message: 'Server error' }, { status: 500 });
        })
      );

      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText(/Unable to load calendar events/i)).toBeInTheDocument();
      });
    });

    it('should display error recovery message', async () => {
      server.use(
        http.get(`${API_BASE}/events/upcoming`, () => {
          return HttpResponse.json({ message: 'Server error' }, { status: 500 });
        })
      );

      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText(/try refreshing/i)).toBeInTheDocument();
      });
    });

    it('should handle classes fetch failure gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json({ message: 'Server error' }, { status: 500 });
        })
      );

      render(<AdminCalendar />);

      // Page should still render
      await waitFor(() => {
        expect(screen.getByText('Calendar')).toBeInTheDocument();
      });
    });

    it('should show empty events when class filter returns error', async () => {
      server.use(
        http.get(`${API_BASE}/events/class/:classId`, () => {
          return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        })
      );

      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText(/3 events/i)).toBeInTheDocument();
      });

      const select = screen.getByDisplayValue('');
      fireEvent.change(select, { target: { value: 'class-1' } });

      await waitFor(() => {
        expect(screen.getByText(/Unable to load/i) || screen.getByText(/0 events/i)).toBeTruthy();
      });
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty States', () => {
    it('should display no upcoming events when events list is empty', async () => {
      server.use(
        http.get(`${API_BASE}/events/upcoming`, () => {
          return HttpResponse.json({ items: [] });
        })
      );

      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText(/No upcoming events/i)).toBeInTheDocument();
      });
    });

    it('should display 0 events in calendars', async () => {
      server.use(
        http.get(`${API_BASE}/events/upcoming`, () => {
          return HttpResponse.json({ items: [] });
        })
      );

      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText(/0 events/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // EVENT NORMALIZATION TESTS
  // ===========================================
  describe('Event Normalization', () => {
    it('should normalize legacy event format with event_date', async () => {
      server.use(
        http.get(`${API_BASE}/events/upcoming`, () => {
          return HttpResponse.json({
            items: [
              {
                id: 'legacy-1',
                title: 'Legacy Event',
                event_type: 'practice',
                event_date: '2024-06-15',
                start_time: '10:00',
                end_time: '12:00',
                location: 'Old Field',
              },
            ],
          });
        })
      );

      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText(/1 events/i)).toBeInTheDocument();
      });

      expect(screen.getByText('Legacy Event')).toBeInTheDocument();
    });

    it('should handle events with start_datetime directly', async () => {
      server.use(
        http.get(`${API_BASE}/events/upcoming`, () => {
          return HttpResponse.json({
            items: [
              {
                id: 'new-1',
                title: 'New Format Event',
                type: 'tournament',
                start_datetime: futureDateStr,
                end_datetime: futureDateStr,
                location: 'New Field',
              },
            ],
          });
        })
      );

      render(<AdminCalendar />);

      await waitFor(() => {
        expect(screen.getByText(/1 events/i)).toBeInTheDocument();
      });

      expect(screen.getByText('New Format Event')).toBeInTheDocument();
    });
  });
});

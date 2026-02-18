/**
 * Integration Tests for Waitlist Management Page
 * Tests waitlist entry listing, filtering, enroll/remove/notify actions
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Waitlist from '../../../pages/AdminDashboard/Waitlist';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock window.alert used by Waitlist component
const mockAlert = jest.fn();
window.alert = mockAlert;

const mockWaitlistEntries = [
  {
    id: 1,
    child: { first_name: 'Tommy', last_name: 'Johnson', age: 8 },
    parent: { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@test.com' },
    class: { name: 'Soccer Basics', capacity: 20, current_enrollment: 20 },
    position: 1,
    joined_date: '2024-01-15T10:00:00Z',
    status: 'waiting',
  },
  {
    id: 2,
    child: { first_name: 'Emma', last_name: 'Williams', age: 10 },
    parent: { first_name: 'Mike', last_name: 'Williams', email: 'mike@test.com' },
    class: { name: 'Basketball 101', capacity: 15, current_enrollment: 14 },
    position: 2,
    joined_date: '2024-01-20T14:30:00Z',
    status: 'notified',
  },
  {
    id: 3,
    child: { first_name: 'Liam', last_name: 'Brown', age: 7 },
    parent: { first_name: 'Amy', last_name: 'Brown', email: 'amy@test.com' },
    class: { name: 'Soccer Basics', capacity: 20, current_enrollment: 20 },
    position: 3,
    joined_date: '2024-01-25T09:00:00Z',
    status: 'enrolled',
  },
];

describe('Waitlist Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');
    mockAlert.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Page Loading and Initial State', () => {
    it('should display page header', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Waitlist Management')).toBeInTheDocument();
      });

      expect(screen.getByText(/Manage students on class waitlists/i)).toBeInTheDocument();
    });

    it('should display search input with correct placeholder', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Search by child name, parent, or class...')
        ).toBeInTheDocument();
      });
    });

    it('should load waitlist entries on mount', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json(mockWaitlistEntries);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Tommy')).toBeInTheDocument();
        expect(screen.getByText('Emma')).toBeInTheDocument();
      });
    });
  });

  describe('Table Display', () => {
    it('should display child names', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json(mockWaitlistEntries);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Tommy')).toBeInTheDocument();
        expect(screen.getByText('Emma')).toBeInTheDocument();
        expect(screen.getByText('Liam')).toBeInTheDocument();
      });
    });

    it('should display parent information', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json(mockWaitlistEntries);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('sarah@test.com')).toBeInTheDocument();
        expect(screen.getByText('mike@test.com')).toBeInTheDocument();
      });
    });

    it('should display class names', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json(mockWaitlistEntries);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getAllByText('Soccer Basics').length).toBeGreaterThan(0);
        expect(screen.getByText('Basketball 101')).toBeInTheDocument();
      });
    });

    it('should display position numbers in circles', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json(mockWaitlistEntries);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should display child age', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json(mockWaitlistEntries);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Age: 8')).toBeInTheDocument();
        expect(screen.getByText('Age: 10')).toBeInTheDocument();
      });
    });

    it('should display capacity information', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json(mockWaitlistEntries);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getAllByText(/Capacity:/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Filtering', () => {
    it('should search by child name', async () => {
      const user = userEvent.setup();
      let searchParam: string | null = null;

      server.use(
        http.get(`${API_BASE}/waitlist`, ({ request }) => {
          const url = new URL(request.url);
          searchParam = url.searchParams.get('search');
          return HttpResponse.json(mockWaitlistEntries);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by child name, parent, or class...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by child name, parent, or class...');
      await user.type(searchInput, 'Tommy');

      await waitFor(() => {
        expect(searchParam).toBe('Tommy');
      });
    });

    it('should show clear filters button when search is active', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json(mockWaitlistEntries);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by child name, parent, or class...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by child name, parent, or class...');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.getByText(/Clear/i)).toBeInTheDocument();
      });
    });

    it('should clear search when clear button clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json(mockWaitlistEntries);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by child name, parent, or class...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by child name, parent, or class...');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.getByText(/Clear/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/Clear/i));

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });
    });
  });

  describe('Actions - Move to Enrolled', () => {
    it('should show Move to Enrolled action', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Move to Enrolled')).toBeInTheDocument();
      });
    });

    it('should show confirm dialog when Move to Enrolled clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Move to Enrolled')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Move to Enrolled'));

      await waitFor(() => {
        // ConfirmDialog should appear
        expect(screen.getByText(/Move Tommy from waitlist to enrolled/i)).toBeInTheDocument();
      });
    });

    it('should move student when confirmed', async () => {
      const user = userEvent.setup();
      let enrollCalled = false;

      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        }),
        http.post(`${API_BASE}/waitlist/1/enroll`, () => {
          enrollCalled = true;
          return HttpResponse.json({ success: true });
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Move to Enrolled')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Move to Enrolled'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(enrollCalled).toBe(true);
        expect(mockAlert).toHaveBeenCalledWith('Student moved to enrolled successfully');
      });
    });

    it('should show error alert when move fails', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        }),
        http.post(`${API_BASE}/waitlist/1/enroll`, () => {
          return HttpResponse.json({ message: 'Class is full' }, { status: 400 });
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Move to Enrolled')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Move to Enrolled'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Failed to move student to enrolled'));
      });
    });
  });

  describe('Actions - Notify Spot Available', () => {
    it('should show Notify Spot Available action', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Notify Spot Available')).toBeInTheDocument();
      });
    });

    it('should send notification when clicked', async () => {
      const user = userEvent.setup();
      let notifyCalled = false;

      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        }),
        http.post(`${API_BASE}/waitlist/1/notify`, () => {
          notifyCalled = true;
          return HttpResponse.json({ success: true });
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Notify Spot Available')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Notify Spot Available'));

      await waitFor(() => {
        expect(notifyCalled).toBe(true);
        expect(mockAlert).toHaveBeenCalledWith('Notification sent successfully');
      });
    });

    it('should show error alert when notify fails', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        }),
        http.post(`${API_BASE}/waitlist/1/notify`, () => {
          return HttpResponse.json({ message: 'Failed' }, { status: 500 });
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Notify Spot Available')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Notify Spot Available'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to send notification');
      });
    });
  });

  describe('Actions - Remove from Waitlist', () => {
    it('should show Remove from Waitlist action', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Remove from Waitlist')).toBeInTheDocument();
      });
    });

    it('should show confirm dialog when Remove from Waitlist clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Remove from Waitlist')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Remove from Waitlist'));

      await waitFor(() => {
        expect(screen.getByText(/Remove Tommy from the waitlist/i)).toBeInTheDocument();
      });
    });

    it('should remove entry when confirmed', async () => {
      const user = userEvent.setup();
      let deleteCalled = false;

      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        }),
        http.delete(`${API_BASE}/waitlist/1`, () => {
          deleteCalled = true;
          return HttpResponse.json({ success: true });
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Remove from Waitlist')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Remove from Waitlist'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(deleteCalled).toBe(true);
        expect(mockAlert).toHaveBeenCalledWith('Removed from waitlist successfully');
      });
    });

    it('should show error alert when remove fails', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        }),
        http.delete(`${API_BASE}/waitlist/1`, () => {
          return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Remove from Waitlist')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Remove from Waitlist'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to remove from waitlist');
      });
    });

    it('should not remove when dialog is cancelled', async () => {
      const user = userEvent.setup();
      let deleteCalled = false;

      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([mockWaitlistEntries[0]]);
        }),
        http.delete(`${API_BASE}/waitlist/1`, () => {
          deleteCalled = true;
          return HttpResponse.json({ success: true });
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Remove from Waitlist')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Remove from Waitlist'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      });

      // Click cancel in confirm dialog
      await user.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(deleteCalled).toBe(false);
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no entries found', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('No students on waitlist')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/waitlist`, () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        })
      );

      render(<Waitlist />);

      // Component catches error and sets empty list, so empty state should show
      await waitFor(() => {
        expect(screen.getByText('No students on waitlist')).toBeInTheDocument();
      });
    });
  });
});

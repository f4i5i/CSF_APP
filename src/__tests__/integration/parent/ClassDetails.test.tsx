/**
 * Integration Tests for Class Details Page
 * Tests class information display, registration flow, and link copying
 */

import { render, screen, waitFor, fireEvent } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import ClassDetail from '../../../pages/ClassDetails';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api/v1';

const mockClass = {
  id: 'class-1',
  name: 'Soccer Basics',
  description: 'Learn soccer fundamentals and team play skills. Perfect for beginners!',
  program: { id: 'prog-1', name: 'Soccer' },
  program_id: 'prog-1',
  school: { id: 'school-1', name: 'Test Elementary' },
  school_id: 'school-1',
  coach: { id: 'coach-1', first_name: 'John', last_name: 'Coach' },
  coach_id: 'coach-1',
  capacity: 20,
  current_enrollment: 15,
  base_price: 150,
  price_display: '$150',
  location: 'Field A, Test Elementary',
  min_age: 6,
  max_age: 12,
  start_date: '2024-02-01',
  end_date: '2024-05-01',
  schedule: [
    { day_of_week: 'Monday', start_time: '15:00', end_time: '16:30' },
    { day_of_week: 'Wednesday', start_time: '15:00', end_time: '16:30' },
  ],
  is_active: true,
  cover_photo_url: 'https://example.com/soccer.jpg',
  created_at: '2024-01-01T00:00:00Z',
};

const mockParentUser = {
  id: 'user-parent-1',
  email: 'parent@test.com',
  first_name: 'Test',
  last_name: 'Parent',
  role: 'PARENT',
};

// Custom render with route params
const renderWithRoute = (classId: string = 'class-1') => {
  return render(
    <MemoryRouter initialEntries={[`/class/${classId}`]}>
      <Routes>
        <Route path="/class/:id" element={<ClassDetail />} />
        <Route path="/class" element={<div>Classes List</div>} />
        <Route path="/checkout" element={<div>Checkout Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ClassDetails Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');

    server.use(
      http.get(`${API_BASE}/classes/:id`, () => {
        return HttpResponse.json(mockClass);
      }),
      http.get(`${API_BASE}/users/me`, () => {
        return HttpResponse.json(mockParentUser);
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
    it('should display loading state initially', async () => {
      renderWithRoute();

      expect(screen.getByText(/Loading class details/i)).toBeInTheDocument();
    });

    it('should display back to classes link', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Back to Classes/i)).toBeInTheDocument();
      });
    });

    it('should load and display class name', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });
    });

    it('should display program name', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // CLASS INFORMATION DISPLAY TESTS
  // ===========================================
  describe('Class Information Display', () => {
    it('should display class description', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Learn soccer fundamentals/i)).toBeInTheDocument();
      });
    });

    it('should display location', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      expect(screen.getByText('Field A, Test Elementary')).toBeInTheDocument();
    });

    it('should display age group', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Ages 6 – 12/i)).toBeInTheDocument();
      });
    });

    it('should display price', async () => {
      renderWithRoute();

      await waitFor(() => {
        const priceElements = screen.getAllByText('$150');
        expect(priceElements.length).toBeGreaterThan(0);
      });
    });

    it('should display schedule information', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });

      // Should show schedule recap section
      expect(screen.getByText(/Schedule Recap/i)).toBeInTheDocument();
    });

    it('should display cancellation policy', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Cancellation policy/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // CLASS IMAGE TESTS
  // ===========================================
  describe('Class Image', () => {
    it('should display class image when available', async () => {
      renderWithRoute();

      await waitFor(() => {
        const image = screen.getByAltText('Soccer Basics');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'https://example.com/soccer.jpg');
      });
    });

    it('should display placeholder when no image', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json({
            ...mockClass,
            cover_photo_url: null,
            image_url: null,
          });
        })
      );

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Class image coming soon/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // REGISTRATION LINK TESTS
  // ===========================================
  describe('Registration Link', () => {
    it('should display registration link section', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Direct registration link/i)).toBeInTheDocument();
      });
    });

    it('should display copy link button', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy link/i })).toBeInTheDocument();
      });
    });

    it('should copy link when clicking copy button', async () => {
      const user = userEvent.setup();

      // Mock clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy link/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Copy link/i }));

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // RESERVE SPOT BUTTON TESTS
  // ===========================================
  describe('Reserve Spot Button', () => {
    it('should display Reserve Spot button', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reserve Spot/i })).toBeInTheDocument();
      });
    });

    it('should navigate to checkout when logged in as parent', async () => {
      const user = userEvent.setup();
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reserve Spot/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Reserve Spot/i }));

      await waitFor(() => {
        expect(screen.getByText('Checkout Page')).toBeInTheDocument();
      });
    });

    it('should redirect to login when not logged in', async () => {
      localStorage.clear(); // Remove auth tokens

      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
        })
      );

      const user = userEvent.setup();
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reserve Spot/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Reserve Spot/i }));

      await waitFor(() => {
        expect(screen.getByText(/Please log in/i) || screen.getByText('Login Page')).toBeTruthy();
      });
    });

    it('should show error for non-parent users', async () => {
      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            ...mockParentUser,
            role: 'COACH',
          });
        })
      );

      const user = userEvent.setup();
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reserve Spot/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Reserve Spot/i }));

      await waitFor(() => {
        expect(screen.getByText(/Only parents can register/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // BACK NAVIGATION TESTS
  // ===========================================
  describe('Back Navigation', () => {
    it('should navigate back to classes list', async () => {
      const user = userEvent.setup();
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Back to Classes/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/Back to Classes/i));

      await waitFor(() => {
        expect(screen.getByText('Classes List')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should display error message when class not found', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(
            { message: 'Class not found' },
            { status: 404 }
          );
        })
      );

      renderWithRoute('nonexistent-class');

      await waitFor(() => {
        expect(screen.getByText(/Unable to load this class/i)).toBeInTheDocument();
      });
    });

    it('should display error on server error', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Unable to load this class/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // PRICE AND BILLING TESTS
  // ===========================================
  describe('Price and Billing', () => {
    it('should display price model section', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Price & Membership/i)).toBeInTheDocument();
      });
    });

    it('should display investment section', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Investment/i)).toBeInTheDocument();
      });
    });

    it('should handle missing price gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json({
            ...mockClass,
            base_price: null,
            price_display: null,
            price_text: null,
          });
        })
      );

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Contact for pricing/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // SCHEDULE DISPLAY TESTS
  // ===========================================
  describe('Schedule Display', () => {
    it('should display schedule items', async () => {
      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Schedule Recap/i)).toBeInTheDocument();
      });
    });

    it('should handle empty schedule gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json({
            ...mockClass,
            schedule: [],
          });
        })
      );

      renderWithRoute();

      await waitFor(() => {
        expect(screen.getByText(/Full schedule coming soon/i)).toBeInTheDocument();
      });
    });
  });
});

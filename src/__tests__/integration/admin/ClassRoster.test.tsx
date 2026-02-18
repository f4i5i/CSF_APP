/**
 * Integration Tests for ClassRoster Page
 * Tests roster display, student listing, share link copy, error/loading states
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import { renderAtRoute } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import ClassRoster from '../../../pages/AdminDashboard/ClassRoster';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    error: (msg: string) => mockToastError(msg),
    success: (msg: string) => mockToastSuccess(msg),
  }),
}));

// Mock useParams
const mockParams: { classId?: string } = { classId: 'class-1' };
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockParams,
  useNavigate: () => mockNavigate,
}));

const mockRosterData = {
  class_name: 'Soccer Basics U10',
  program_name: 'Youth Soccer',
  school_name: 'Lincoln Elementary',
  start_date: '2025-01-15',
  end_date: '2025-05-15',
  students: [
    {
      child_name: 'Tommy Johnson',
      child_age: 8,
      child_id: 'child-1',
      enrollment_status: 'active',
      parent_name: 'Sarah Johnson',
      parent_email: 'sarah@test.com',
      parent_phone: '555-0101',
      selected_custom_fees: [
        { name: 'Jersey', amount: '25.00', is_optional: true },
      ],
    },
    {
      child_name: 'Emma Williams',
      child_age: 10,
      child_id: 'child-2',
      enrollment_status: 'active',
      parent_name: 'Mike Williams',
      parent_email: 'mike@test.com',
      parent_phone: '555-0102',
      selected_custom_fees: [],
    },
    {
      child_name: 'Liam Brown',
      child_age: 9,
      child_id: 'child-3',
      enrollment_status: 'ACTIVE',
      parent_name: 'Amy Brown',
      parent_email: 'amy@test.com',
      parent_phone: null,
      selected_custom_fees: null,
    },
  ],
};

describe('ClassRoster Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');
    mockNavigate.mockClear();
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
    mockParams.classId = 'class-1';

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Loading State', () => {
    it('should display loading state while fetching roster', () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      expect(screen.getByText('Loading roster...')).toBeInTheDocument();
    });
  });

  describe('Roster Data Display', () => {
    it('should display class roster header', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Class Roster')).toBeInTheDocument();
      });
    });

    it('should display class name', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Soccer Basics U10')).toBeInTheDocument();
      });
    });

    it('should display program name', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText(/Youth Soccer/)).toBeInTheDocument();
      });
    });

    it('should display school name', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText(/Lincoln Elementary/)).toBeInTheDocument();
      });
    });

    it('should display student count', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('3 Students Enrolled')).toBeInTheDocument();
      });
    });

    it('should display student names', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Tommy Johnson')).toBeInTheDocument();
        expect(screen.getByText('Emma Williams')).toBeInTheDocument();
        expect(screen.getByText('Liam Brown')).toBeInTheDocument();
      });
    });

    it('should display student age', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Age: 8')).toBeInTheDocument();
        expect(screen.getByText('Age: 10')).toBeInTheDocument();
        expect(screen.getByText('Age: 9')).toBeInTheDocument();
      });
    });

    it('should display parent information', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        expect(screen.getByText('sarah@test.com')).toBeInTheDocument();
        expect(screen.getByText('555-0101')).toBeInTheDocument();
      });
    });

    it('should display enrollment status badges', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        const statusBadges = screen.getAllByText(/active/i);
        expect(statusBadges.length).toBe(3);
      });
    });

    it('should display custom fees for students', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Jersey: $25.00')).toBeInTheDocument();
      });
    });
  });

  describe('Share Link', () => {
    it('should display Copy Link button', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Copy Link')).toBeInTheDocument();
      });
    });

    it('should copy link to clipboard when Copy Link clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Copy Link')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Copy Link'));

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith('Roster link copied to clipboard!');
    });

    it('should show Copied! text after copying', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Copy Link')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Copy Link'));

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Class Roster')).toBeInTheDocument();
      });

      // Find and click the back button (ArrowLeft icon button)
      const backButton = screen.getByRole('button', { name: '' });
      // Get first button which is the back button
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no students enrolled', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json({
            ...mockRosterData,
            students: [],
          });
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('No students enrolled in this class')).toBeInTheDocument();
      });
    });

    it('should handle singular student count', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json({
            ...mockRosterData,
            students: [mockRosterData.students[0]],
          });
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('1 Student Enrolled')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error state when fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(
            { detail: 'Class not found' },
            { status: 404 }
          );
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Roster')).toBeInTheDocument();
      });
    });

    it('should display Go Back button on error', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(
            { detail: 'Not found' },
            { status: 404 }
          );
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Go Back')).toBeInTheDocument();
      });
    });

    it('should navigate back when Go Back clicked on error page', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(
            { detail: 'Not found' },
            { status: 404 }
          );
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Go Back')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Go Back'));

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should show toast error on fetch failure', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(
            { detail: 'Server Error' },
            { status: 500 }
          );
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to load class roster');
      });
    });
  });

  describe('Nested Data Structure Handling', () => {
    it('should handle nested child/parent data structure', async () => {
      const nestedData = {
        ...mockRosterData,
        students: [
          {
            child: {
              id: 'child-nested-1',
              first_name: 'Nested',
              last_name: 'Child',
              age: 7,
            },
            parent: {
              first_name: 'Nested',
              last_name: 'Parent',
              email: 'nested@test.com',
              phone: '555-9999',
            },
            enrollment: { status: 'active' },
            selected_custom_fees: [],
          },
        ],
      };

      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(nestedData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Nested Child')).toBeInTheDocument();
        expect(screen.getByText('Nested Parent')).toBeInTheDocument();
        expect(screen.getByText('nested@test.com')).toBeInTheDocument();
      });
    });

    it('should display Unknown Student when name data is missing', async () => {
      const noNameData = {
        ...mockRosterData,
        students: [
          {
            child_id: 'child-no-name',
            child_age: 8,
            enrollment_status: 'active',
          },
        ],
      };

      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(noNameData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText('Unknown Student')).toBeInTheDocument();
      });
    });
  });

  describe('Date Display', () => {
    it('should display date range when available', async () => {
      server.use(
        http.get(`${API_BASE}/admin/classes/:classId/roster`, () => {
          return HttpResponse.json(mockRosterData);
        })
      );

      render(<ClassRoster />);

      await waitFor(() => {
        expect(screen.getByText(/1\/15\/2025/)).toBeInTheDocument();
        expect(screen.getByText(/5\/15\/2025/)).toBeInTheDocument();
      });
    });
  });
});

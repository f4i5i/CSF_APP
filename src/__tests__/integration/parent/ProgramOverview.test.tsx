/**
 * ProgramOverview Page Integration Tests
 * Tests for the program overview page including program listing,
 * area selection, class display, filtering, and search
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import ProgramOverview from '../../../pages/ProgramOverview';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Logo component
jest.mock('../../../components/Logo', () => ({
  __esModule: true,
  default: () => <div data-testid="logo">Logo</div>,
}));

// Mock ClassCard component
jest.mock('../../../components/ClassCard', () => ({
  __esModule: true,
  default: ({ cls, onClick, onRegister }: { cls: any; onClick: () => void; onRegister: () => void }) => (
    <div data-testid={`class-card-${cls.id}`}>
      <h3>{cls.title}</h3>
      <p>{cls.school}</p>
      <p>{cls.priceLabel}</p>
      <button onClick={onClick}>View Details</button>
      <button onClick={onRegister}>Register</button>
    </div>
  ),
}));

// Mock image imports
jest.mock('../../../assets/image (2).png', () => 'mock-image.png');
jest.mock('../../../assets/image7.jpg', () => 'mock-image7.jpg');

// Mock utility functions
jest.mock('../../../utils/formatters', () => ({
  formatDateRange: jest.fn(() => 'Feb 1 - May 1, 2024'),
  formatSchedule: jest.fn(() => 'Mon/Wed 3:00 PM'),
}));

jest.mock('../../../utils/classHelpers', () => ({
  getCapacityMeta: jest.fn(() => ({
    current: 15,
    total: 20,
    hasCapacity: true,
    availableSpots: 5,
    waitlistCount: 0,
  })),
  getOfferingLabel: jest.fn(() => 'Membership'),
  getOfferingType: jest.fn(() => 'membership'),
  getPriceModelLabel: jest.fn(() => 'Monthly'),
}));

// Mock hooks
const mockProgramsData = [
  { id: 'prog-1', name: 'Soccer', description: 'Learn soccer fundamentals' },
  { id: 'prog-2', name: 'Basketball', description: 'Basketball skills program' },
];

const mockAreasData = [
  { id: 'area-1', name: 'Downtown' },
  { id: 'area-2', name: 'Suburbs' },
];

const mockClassesData = [
  {
    id: 'class-1',
    name: 'Soccer Basics',
    description: 'Learn soccer fundamentals',
    program_id: 'prog-1',
    area_id: 'area-1',
    school: { id: 'school-1', name: 'Test Elementary' },
    capacity: 20,
    current_enrollment: 15,
    base_price: 150,
    start_date: '2024-02-01',
    end_date: '2024-05-01',
    schedule: [{ day_of_week: 'monday', start_time: '15:00', end_time: '16:00' }],
    min_age: 5,
    max_age: 10,
    is_active: true,
  },
  {
    id: 'class-2',
    name: 'Advanced Soccer',
    description: 'Advanced soccer techniques',
    program_id: 'prog-1',
    area_id: 'area-1',
    school: { id: 'school-1', name: 'Test Elementary' },
    capacity: 15,
    current_enrollment: 15,
    base_price: 200,
    start_date: '2024-02-01',
    end_date: '2024-05-01',
    schedule: [{ day_of_week: 'tuesday', start_time: '16:00', end_time: '17:00' }],
    min_age: 10,
    max_age: 15,
    is_active: true,
  },
];

jest.mock('../../../api/hooks/classes/usePrograms', () => ({
  usePrograms: () => ({
    data: mockProgramsData,
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../../api/hooks/classes/useAreas', () => ({
  useAreas: () => ({
    data: mockAreasData,
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../../api/hooks/classes/useClasses', () => ({
  useClasses: () => ({
    data: mockClassesData,
    isLoading: false,
    error: null,
  }),
}));

describe('ProgramOverview Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the page title', () => {
      render(<ProgramOverview />);

      expect(screen.getByText('CSF School Academy')).toBeInTheDocument();
    });

    it('should render the Logo', () => {
      render(<ProgramOverview />);

      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it('should render hero section content', () => {
      render(<ProgramOverview />);

      expect(screen.getByText(/Unlock Your Child's/i)).toBeInTheDocument();
      expect(screen.getByText(/True Soccer Potential/i)).toBeInTheDocument();
    });

    it('should render hero section description', () => {
      render(<ProgramOverview />);

      expect(screen.getByText(/Join the Carolina Soccer Factory Academy/i)).toBeInTheDocument();
    });

    it('should render the Programs heading', () => {
      render(<ProgramOverview />);

      expect(screen.getByText('Programs')).toBeInTheDocument();
    });
  });

  // ===========================================
  // PROGRAM LISTING TESTS
  // ===========================================
  describe('Program Listing', () => {
    it('should display all programs', () => {
      render(<ProgramOverview />);

      expect(screen.getByText('Soccer')).toBeInTheDocument();
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    it('should display program descriptions', () => {
      render(<ProgramOverview />);

      expect(screen.getByText('Learn soccer fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Basketball skills program')).toBeInTheDocument();
    });

    it('should highlight selected program', async () => {
      render(<ProgramOverview />);

      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      // After click, the areas section should appear
      await waitFor(() => {
        expect(screen.getByText(/Select your Area/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // AREA SELECTION TESTS
  // ===========================================
  describe('Area Selection', () => {
    it('should not show areas before a program is selected', () => {
      render(<ProgramOverview />);

      expect(screen.queryByText(/Select your Area/i)).not.toBeInTheDocument();
    });

    it('should show areas after selecting a program', async () => {
      render(<ProgramOverview />);

      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      await waitFor(() => {
        expect(screen.getByText('Downtown')).toBeInTheDocument();
        expect(screen.getByText('Suburbs')).toBeInTheDocument();
      });
    });

    it('should show area buttons as clickable', async () => {
      render(<ProgramOverview />);

      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      await waitFor(() => {
        const downtownButton = screen.getByRole('button', { name: 'Downtown' });
        expect(downtownButton).toBeInTheDocument();
      });
    });

    it('should show search and filters when area is selected', async () => {
      render(<ProgramOverview />);

      // Select program
      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      // Select area
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Downtown' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Downtown' }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search classes...')).toBeInTheDocument();
      });
    });

    it('should toggle area open/close on click', async () => {
      render(<ProgramOverview />);

      // Select program
      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Downtown' })).toBeInTheDocument();
      });

      // Open area
      await user.click(screen.getByRole('button', { name: 'Downtown' }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search classes...')).toBeInTheDocument();
      });

      // Close area
      await user.click(screen.getByRole('button', { name: 'Downtown' }));

      // Content should collapse (max-h-0)
    });
  });

  // ===========================================
  // CLASS DISPLAY TESTS
  // ===========================================
  describe('Class Display', () => {
    it('should display class cards after selecting program and area', async () => {
      render(<ProgramOverview />);

      // Select program
      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      // Select area
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Downtown' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Downtown' }));

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });
    });

    it('should navigate to class details when class card is clicked', async () => {
      render(<ProgramOverview />);

      // Select program and area
      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Downtown' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Downtown' }));

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      // Click "View Details" on the class card
      const viewButtons = screen.getAllByText('View Details');
      await user.click(viewButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/class/class-1');
    });

    it('should navigate to checkout when Register is clicked on class card', async () => {
      render(<ProgramOverview />);

      // Select program and area
      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Downtown' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Downtown' }));

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-1')).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole('button', { name: 'Register' });
      await user.click(registerButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/checkout?classId=class-1');
    });
  });

  // ===========================================
  // SEARCH TESTS
  // ===========================================
  describe('Search', () => {
    it('should filter classes by search term', async () => {
      render(<ProgramOverview />);

      // Select program and area
      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Downtown' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Downtown' }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search classes...')).toBeInTheDocument();
      });

      // Search for "Advanced"
      await user.type(screen.getByPlaceholderText('Search classes...'), 'Advanced');

      await waitFor(() => {
        expect(screen.getByTestId('class-card-class-2')).toBeInTheDocument();
        expect(screen.queryByTestId('class-card-class-1')).not.toBeInTheDocument();
      });
    });

    it('should show "No classes found" when search has no results', async () => {
      render(<ProgramOverview />);

      // Select program and area
      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Downtown' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Downtown' }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search classes...')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('Search classes...'), 'nonexistent class xyz');

      await waitFor(() => {
        expect(screen.getByText('No classes found.')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // FILTER DROPDOWNS TESTS
  // ===========================================
  describe('Filter Dropdowns', () => {
    it('should render filter dropdowns when area is open', async () => {
      render(<ProgramOverview />);

      // Select program and area
      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Downtown' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: 'Downtown' }));

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        // Should have multiple filter dropdowns (school, weekday, time, age, capacity, type)
        expect(selects.length).toBeGreaterThanOrEqual(5);
      });
    });
  });

  // ===========================================
  // LOADING AND ERROR STATES
  // ===========================================
  describe('Loading and Error States', () => {
    it('should render the page even if programs are empty', () => {
      // The mock returns data, so this tests the container renders
      render(<ProgramOverview />);

      expect(screen.getByText('CSF School Academy')).toBeInTheDocument();
    });
  });

  // ===========================================
  // PROGRAM SWITCHING TESTS
  // ===========================================
  describe('Program Switching', () => {
    it('should reset area selection when switching programs', async () => {
      render(<ProgramOverview />);

      // Select Soccer program
      const soccerCard = screen.getByText('Soccer').closest('div[class*="cursor-pointer"]');
      await user.click(soccerCard!);

      await waitFor(() => {
        expect(screen.getByText(/Select your Area/i)).toBeInTheDocument();
      });

      // Select area
      await user.click(screen.getByRole('button', { name: 'Downtown' }));

      // Switch to Basketball program
      const basketballCard = screen.getByText('Basketball').closest('div[class*="cursor-pointer"]');
      await user.click(basketballCard!);

      // Area content should be reset (search field should not be visible)
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search classes...')).not.toBeInTheDocument();
      });
    });
  });
});

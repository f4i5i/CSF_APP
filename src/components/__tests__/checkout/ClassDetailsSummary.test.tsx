/**
 * Unit Tests for ClassDetailsSummary Component
 * Tests class details display, schedule formatting, date ranges, and loading state
 */

import React from 'react';
import { render, screen } from '../../../__tests__/utils/test-utils';
import ClassDetailsSummary from '../../checkout/ClassDetailsSummary';

describe('ClassDetailsSummary Component', () => {
  const mockClassData = {
    name: 'Soccer Basics',
    schedule: [
      { day_of_week: 'Monday', start_time: '4:00 PM', end_time: '5:00 PM' },
      { day_of_week: 'Wednesday', start_time: '4:00 PM', end_time: '5:00 PM' },
    ],
    start_date: '2025-01-15',
    end_date: '2025-03-15',
    location: 'Main Field',
    min_age: 6,
    max_age: 10,
    base_price: 150,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component with class data', () => {
      render(<ClassDetailsSummary classData={mockClassData} hasCapacity={true} />);
      expect(screen.getByText('Class Details')).toBeInTheDocument();
    });

    it('should render class name', () => {
      render(<ClassDetailsSummary classData={mockClassData} hasCapacity={true} />);
      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
    });

    it('should render schedule', () => {
      render(<ClassDetailsSummary classData={mockClassData} hasCapacity={true} />);
      expect(screen.getByText('Schedule:')).toBeInTheDocument();
      expect(
        screen.getByText('Monday 4:00 PM - 5:00 PM, Wednesday 4:00 PM - 5:00 PM')
      ).toBeInTheDocument();
    });

    it('should render location', () => {
      render(<ClassDetailsSummary classData={mockClassData} hasCapacity={true} />);
      expect(screen.getByText('Location:')).toBeInTheDocument();
      expect(screen.getByText('Main Field')).toBeInTheDocument();
    });

    it('should render age range', () => {
      render(<ClassDetailsSummary classData={mockClassData} hasCapacity={true} />);
      expect(screen.getByText('Age Range:')).toBeInTheDocument();
      expect(screen.getByText('6 - 10 years')).toBeInTheDocument();
    });

    it('should render price', () => {
      render(<ClassDetailsSummary classData={mockClassData} hasCapacity={true} />);
      expect(screen.getByText('Price:')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    it('should render date range', () => {
      render(<ClassDetailsSummary classData={mockClassData} hasCapacity={true} />);
      expect(screen.getByText('Duration:')).toBeInTheDocument();
    });
  });

  // ===========================================
  // LOADING / NULL STATE
  // ===========================================
  describe('Loading State', () => {
    it('should render skeleton when classData is null', () => {
      const { container } = render(
        <ClassDetailsSummary classData={null} hasCapacity={true} />
      );
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should not render class details sections when classData is null', () => {
      render(<ClassDetailsSummary classData={null} hasCapacity={true} />);
      expect(screen.queryByText('Class Details')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // SCHEDULE DISPLAY
  // ===========================================
  describe('Schedule Display', () => {
    it('should show "Schedule TBD" when no schedule provided', () => {
      const classNoSchedule = { ...mockClassData, schedule: [] };
      render(<ClassDetailsSummary classData={classNoSchedule} hasCapacity={true} />);
      expect(screen.getByText('Schedule TBD')).toBeInTheDocument();
    });

    it('should show "Schedule TBD" when schedule is null', () => {
      const classNoSchedule = { ...mockClassData, schedule: null };
      render(<ClassDetailsSummary classData={classNoSchedule} hasCapacity={true} />);
      expect(screen.getByText('Schedule TBD')).toBeInTheDocument();
    });

    it('should format single schedule entry', () => {
      const classSingleSchedule = {
        ...mockClassData,
        schedule: [
          { day_of_week: 'Friday', start_time: '3:00 PM', end_time: '4:30 PM' },
        ],
      };
      render(
        <ClassDetailsSummary classData={classSingleSchedule} hasCapacity={true} />
      );
      expect(screen.getByText('Friday 3:00 PM - 4:30 PM')).toBeInTheDocument();
    });
  });

  // ===========================================
  // DATE RANGE DISPLAY
  // ===========================================
  describe('Date Range Display', () => {
    it('should not show duration when dates are missing', () => {
      const classNoDates = {
        ...mockClassData,
        start_date: null,
        end_date: null,
      };
      render(<ClassDetailsSummary classData={classNoDates} hasCapacity={true} />);
      expect(screen.queryByText('Duration:')).not.toBeInTheDocument();
    });

    it('should not show duration when only start_date is provided', () => {
      const classPartialDates = {
        ...mockClassData,
        end_date: null,
      };
      render(<ClassDetailsSummary classData={classPartialDates} hasCapacity={true} />);
      expect(screen.queryByText('Duration:')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // AGE RANGE DISPLAY
  // ===========================================
  describe('Age Range Display', () => {
    it('should show "X+ years" when only min_age is set', () => {
      const classMinOnly = { ...mockClassData, max_age: null };
      render(<ClassDetailsSummary classData={classMinOnly} hasCapacity={true} />);
      expect(screen.getByText('6+ years')).toBeInTheDocument();
    });

    it('should show "Up to X years" when only max_age is set', () => {
      const classMaxOnly = { ...mockClassData, min_age: null };
      render(<ClassDetailsSummary classData={classMaxOnly} hasCapacity={true} />);
      expect(screen.getByText('Up to 10 years')).toBeInTheDocument();
    });

    it('should not show age range when neither age is set', () => {
      const classNoAges = { ...mockClassData, min_age: null, max_age: null };
      render(<ClassDetailsSummary classData={classNoAges} hasCapacity={true} />);
      expect(screen.queryByText('Age Range:')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // PRICE DISPLAY
  // ===========================================
  describe('Price Display', () => {
    it('should display $0.00 for free class', () => {
      const freeClass = { ...mockClassData, base_price: 0 };
      render(<ClassDetailsSummary classData={freeClass} hasCapacity={true} />);
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should use price field as fallback when base_price is not set', () => {
      const classWithPrice = {
        ...mockClassData,
        base_price: undefined,
        price: 200,
      };
      render(<ClassDetailsSummary classData={classWithPrice} hasCapacity={true} />);
      expect(screen.getByText('$200.00')).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should not render location when not provided', () => {
      const classNoLocation = { ...mockClassData, location: null };
      render(
        <ClassDetailsSummary classData={classNoLocation} hasCapacity={true} />
      );
      expect(screen.queryByText('Location:')).not.toBeInTheDocument();
    });

    it('should handle empty string location', () => {
      const classEmptyLocation = { ...mockClassData, location: '' };
      render(
        <ClassDetailsSummary classData={classEmptyLocation} hasCapacity={true} />
      );
      expect(screen.queryByText('Location:')).not.toBeInTheDocument();
    });
  });
});

/**
 * Unit Tests for ChildSelector Component
 * Tests child rendering, selection, multi-select, eligibility, sibling discounts, and edge cases
 */

import React from 'react';
import { render, screen, waitFor } from '../../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import ChildSelector from '../../checkout/ChildSelector';

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/checkout/class-1', search: '' }),
}));

describe('ChildSelector Component', () => {
  const mockChildren = [
    {
      id: 'child-1',
      first_name: 'Alice',
      last_name: 'Smith',
      date_of_birth: '2015-06-15',
      grade: '3rd',
      enrollments: [],
    },
    {
      id: 'child-2',
      first_name: 'Bob',
      last_name: 'Smith',
      date_of_birth: '2017-09-20',
      grade: '1st',
      enrollments: [],
    },
  ];

  const mockClassData = {
    id: 'class-1',
    name: 'Soccer Basics',
    base_price: 100,
    min_age: 5,
    max_age: 12,
  };

  const defaultProps = {
    children: mockChildren,
    selectedId: null,
    selectedIds: [],
    onSelect: jest.fn(),
    onToggle: jest.fn(),
    classData: mockClassData,
    multiSelect: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component with children', () => {
      render(<ChildSelector {...defaultProps} />);
      expect(screen.getByText('Select Children')).toBeInTheDocument();
    });

    it('should render child names', () => {
      render(<ChildSelector {...defaultProps} />);
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });

    it('should render "Select Child" title in single-select mode', () => {
      render(<ChildSelector {...defaultProps} multiSelect={false} />);
      expect(screen.getByText('Select Child')).toBeInTheDocument();
    });

    it('should display child age', () => {
      render(<ChildSelector {...defaultProps} />);
      // Ages depend on the current date, so just check the prefix
      const ageElements = screen.getAllByText(/^Age:/);
      expect(ageElements.length).toBe(2);
    });

    it('should display child grade', () => {
      render(<ChildSelector {...defaultProps} />);
      expect(screen.getByText(/Grade 3rd/)).toBeInTheDocument();
      expect(screen.getByText(/Grade 1st/)).toBeInTheDocument();
    });

    it('should show multi-select hint when there are multiple children', () => {
      render(<ChildSelector {...defaultProps} />);
      expect(
        screen.getByText(/Select multiple children to enroll them together/)
      ).toBeInTheDocument();
    });

    it('should show free class hint for free classes', () => {
      render(
        <ChildSelector
          {...defaultProps}
          classData={{ ...mockClassData, base_price: 0 }}
        />
      );
      expect(
        screen.getByText(/Select the children you want to enroll in this free class/)
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty State', () => {
    it('should show empty state when no children', () => {
      render(<ChildSelector {...defaultProps} children={[]} />);
      expect(
        screen.getByText(/No children found/)
      ).toBeInTheDocument();
    });

    it('should show empty state when children is null', () => {
      render(<ChildSelector {...defaultProps} children={null} />);
      expect(
        screen.getByText(/No children found/)
      ).toBeInTheDocument();
    });

    it('should show "Add Your First Child" button in empty state', () => {
      render(<ChildSelector {...defaultProps} children={[]} />);
      expect(
        screen.getByRole('button', { name: /Add Your First Child/i })
      ).toBeInTheDocument();
    });

    it('should navigate to register child on add button click', async () => {
      render(<ChildSelector {...defaultProps} children={[]} />);

      await userEvent.click(screen.getByRole('button', { name: /Add Your First Child/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/registerchild');
    });
  });

  // ===========================================
  // MULTI-SELECT TESTS
  // ===========================================
  describe('Multi-Select Mode', () => {
    it('should call onToggle when a child is clicked in multi-select mode', async () => {
      render(<ChildSelector {...defaultProps} />);

      await userEvent.click(screen.getByText('Alice Smith'));
      expect(defaultProps.onToggle).toHaveBeenCalledWith('child-1');
    });

    it('should show selected count badge when children are selected', () => {
      render(
        <ChildSelector
          {...defaultProps}
          selectedIds={['child-1', 'child-2']}
        />
      );
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    it('should show note about selected children count', () => {
      render(
        <ChildSelector
          {...defaultProps}
          selectedIds={['child-1', 'child-2']}
        />
      );
      expect(screen.getByText('2 children will be enrolled together')).toBeInTheDocument();
    });

    it('should show singular note when one child is selected', () => {
      render(
        <ChildSelector
          {...defaultProps}
          selectedIds={['child-1']}
        />
      );
      expect(
        screen.getByText('Selected child will be enrolled in this class')
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // SINGLE-SELECT TESTS
  // ===========================================
  describe('Single-Select Mode', () => {
    it('should call onSelect in single-select mode', async () => {
      render(
        <ChildSelector {...defaultProps} multiSelect={false} />
      );

      await userEvent.click(screen.getByText('Alice Smith'));
      expect(defaultProps.onSelect).toHaveBeenCalledWith('child-1');
    });
  });

  // ===========================================
  // SIBLING DISCOUNT TESTS
  // ===========================================
  describe('Sibling Discounts', () => {
    it('should show sibling discount summary when multiple children selected', () => {
      render(
        <ChildSelector
          {...defaultProps}
          selectedIds={['child-1', 'child-2']}
        />
      );
      expect(screen.getByText('Sibling Discount Applied!')).toBeInTheDocument();
    });

    it('should display savings amount', () => {
      render(
        <ChildSelector
          {...defaultProps}
          selectedIds={['child-1', 'child-2']}
        />
      );
      // Second child gets 25% off $100 = $25
      expect(screen.getByText('-$25.00')).toBeInTheDocument();
    });

    it('should show 25% OFF badge for second child', () => {
      render(
        <ChildSelector
          {...defaultProps}
          selectedIds={['child-1', 'child-2']}
        />
      );
      expect(screen.getByText('25% OFF')).toBeInTheDocument();
    });

    it('should show position labels for selected children', () => {
      render(
        <ChildSelector
          {...defaultProps}
          selectedIds={['child-1', 'child-2']}
        />
      );
      expect(screen.getByText('First child (no discount)')).toBeInTheDocument();
      expect(screen.getByText('2nd child - 25% sibling discount')).toBeInTheDocument();
    });

    it('should not show discounts for free classes', () => {
      render(
        <ChildSelector
          {...defaultProps}
          classData={{ ...mockClassData, base_price: 0 }}
          selectedIds={['child-1', 'child-2']}
        />
      );
      expect(screen.queryByText('Sibling Discount Applied!')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // ELIGIBILITY TESTS
  // ===========================================
  describe('Eligibility Checks', () => {
    it('should disable child who is already enrolled', () => {
      const enrolledChildren = [
        {
          ...mockChildren[0],
          enrollments: [{ class_id: 'class-1', status: 'active' }],
        },
        mockChildren[1],
      ];

      render(
        <ChildSelector {...defaultProps} children={enrolledChildren} />
      );

      expect(screen.getByText(/Already enrolled in this class/)).toBeInTheDocument();
    });

    it('should disable child below minimum age', () => {
      // Create a child who is 3 years old (below min_age of 5)
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      const youngChild = [
        {
          id: 'child-young',
          first_name: 'Young',
          last_name: 'Child',
          date_of_birth: threeYearsAgo.toISOString(),
          grade: null,
          enrollments: [],
        },
      ];

      render(
        <ChildSelector {...defaultProps} children={youngChild} />
      );

      expect(screen.getByText(/Must be at least 5 years old/)).toBeInTheDocument();
    });

    it('should disable child above maximum age', () => {
      const oldChild = [
        {
          id: 'child-old',
          first_name: 'Old',
          last_name: 'Child',
          date_of_birth: '2000-01-01', // 25+ years old
          grade: null,
          enrollments: [],
        },
      ];

      render(
        <ChildSelector {...defaultProps} children={oldChild} />
      );

      expect(screen.getByText(/Must be 12 years old or younger/)).toBeInTheDocument();
    });

    it('should not call onToggle for ineligible children', async () => {
      const enrolledChildren = [
        {
          ...mockChildren[0],
          enrollments: [{ class_id: 'class-1', status: 'active' }],
        },
      ];

      render(
        <ChildSelector {...defaultProps} children={enrolledChildren} />
      );

      // The button should be disabled
      const button = screen.getByRole('button', { name: /Alice Smith/i });
      expect(button).toBeDisabled();
    });

    it('should allow enrollment when no age restrictions', () => {
      render(
        <ChildSelector
          {...defaultProps}
          classData={{ id: 'class-1', name: 'Open Class', base_price: 50 }}
        />
      );

      const buttons = screen.getAllByRole('button');
      // Filter out non-child buttons -- child buttons should not be disabled
      const childButtons = buttons.filter(
        (btn) => btn.textContent?.includes('Alice') || btn.textContent?.includes('Bob')
      );
      childButtons.forEach((btn) => {
        expect(btn).not.toBeDisabled();
      });
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should handle child without date of birth', () => {
      const childNoDob = [
        {
          id: 'child-no-dob',
          first_name: 'NoDob',
          last_name: 'Child',
          date_of_birth: null,
          grade: '2nd',
          enrollments: [],
        },
      ];

      render(<ChildSelector {...defaultProps} children={childNoDob} />);
      expect(screen.getByText('NoDob Child')).toBeInTheDocument();
      expect(screen.queryByText(/^Age:/)).not.toBeInTheDocument();
    });

    it('should handle child without grade', () => {
      const childNoGrade = [
        {
          id: 'child-no-grade',
          first_name: 'NoGrade',
          last_name: 'Child',
          date_of_birth: '2015-06-15',
          grade: null,
          enrollments: [],
        },
      ];

      render(<ChildSelector {...defaultProps} children={childNoGrade} />);
      expect(screen.getByText('NoGrade Child')).toBeInTheDocument();
      expect(screen.queryByText(/• Grade/)).not.toBeInTheDocument();
    });

    it('should handle ACTIVE (uppercase) enrollment status', () => {
      const enrolledChildren = [
        {
          ...mockChildren[0],
          enrollments: [{ class_id: 'class-1', status: 'ACTIVE' }],
        },
      ];

      render(
        <ChildSelector {...defaultProps} children={enrolledChildren} />
      );

      expect(screen.getByText(/Already enrolled in this class/)).toBeInTheDocument();
    });

    it('should handle PENDING enrollment status (should not block)', () => {
      const pendingChildren = [
        {
          ...mockChildren[0],
          enrollments: [{ class_id: 'class-1', status: 'pending' }],
        },
      ];

      render(
        <ChildSelector {...defaultProps} children={pendingChildren} />
      );

      expect(screen.queryByText('Already enrolled in this class')).not.toBeInTheDocument();
    });

    it('should store intended route when navigating to add child', async () => {
      render(<ChildSelector {...defaultProps} children={[]} />);

      await userEvent.click(screen.getByRole('button', { name: /Add Your First Child/i }));

      expect(sessionStorage.getItem('intendedRoute')).toBe('/checkout/class-1');
    });
  });
});

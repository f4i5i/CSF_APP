/**
 * Unit Tests for CustomFeesSelector Component
 * Tests required fees display, optional fees toggle, multi-child fee grouping
 */

import React from 'react';
import { render, screen } from '../../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import CustomFeesSelector from '../../checkout/CustomFeesSelector';

describe('CustomFeesSelector Component', () => {
  const mockChildren = [
    { id: 'child-1', first_name: 'Alice', last_name: 'Smith' },
    { id: 'child-2', first_name: 'Bob', last_name: 'Smith' },
  ];

  const mockClassDataWithFees = {
    id: 'class-1',
    name: 'Soccer Basics',
    custom_fees: [
      {
        name: 'Uniform Fee',
        amount: 25,
        description: 'Required team uniform',
        is_optional: false,
      },
      {
        name: 'Equipment Rental',
        amount: 15,
        description: 'Optional equipment package',
        is_optional: true,
      },
      {
        name: 'Photo Package',
        amount: 10,
        description: 'Season photo package',
        is_optional: true,
      },
    ],
  };

  const defaultProps = {
    classData: mockClassDataWithFees,
    selectedChildIds: ['child-1'],
    children: mockChildren,
    selectedFeesByChild: {},
    onToggleFee: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component with custom fees', () => {
      render(<CustomFeesSelector {...defaultProps} />);
      expect(screen.getByText('Additional Fees')).toBeInTheDocument();
    });

    it('should display required fees section', () => {
      render(<CustomFeesSelector {...defaultProps} />);
      expect(screen.getByText('Required Fees')).toBeInTheDocument();
    });

    it('should display optional fees section', () => {
      render(<CustomFeesSelector {...defaultProps} />);
      expect(screen.getByText('Optional Fees')).toBeInTheDocument();
    });

    it('should display fee names', () => {
      render(<CustomFeesSelector {...defaultProps} />);
      expect(screen.getByText('Uniform Fee')).toBeInTheDocument();
      expect(screen.getByText('Equipment Rental')).toBeInTheDocument();
      expect(screen.getByText('Photo Package')).toBeInTheDocument();
    });

    it('should display fee amounts', () => {
      render(<CustomFeesSelector {...defaultProps} />);
      expect(screen.getByText('$25.00')).toBeInTheDocument();
      expect(screen.getByText('$15.00')).toBeInTheDocument();
      expect(screen.getByText('$10.00')).toBeInTheDocument();
    });

    it('should display fee descriptions', () => {
      render(<CustomFeesSelector {...defaultProps} />);
      expect(screen.getByText('Required team uniform')).toBeInTheDocument();
      expect(screen.getByText('Optional equipment package')).toBeInTheDocument();
    });

    it('should display "Required" badge for required fees', () => {
      render(<CustomFeesSelector {...defaultProps} />);
      expect(screen.getByText('Required')).toBeInTheDocument();
    });
  });

  // ===========================================
  // NULL / EMPTY STATES
  // ===========================================
  describe('Empty State', () => {
    it('should return null when no custom fees', () => {
      const { container } = render(
        <CustomFeesSelector
          {...defaultProps}
          classData={{ id: 'class-1', name: 'No Fees', custom_fees: [] }}
        />
      );
      expect(container.innerHTML).toBe('');
    });

    it('should return null when custom_fees is undefined', () => {
      const { container } = render(
        <CustomFeesSelector
          {...defaultProps}
          classData={{ id: 'class-1', name: 'No Fees' }}
        />
      );
      expect(container.innerHTML).toBe('');
    });

    it('should return null when custom_fees is null', () => {
      const { container } = render(
        <CustomFeesSelector
          {...defaultProps}
          classData={{ id: 'class-1', name: 'No Fees', custom_fees: null }}
        />
      );
      expect(container.innerHTML).toBe('');
    });
  });

  // ===========================================
  // OPTIONAL FEE TOGGLE (SINGLE CHILD)
  // ===========================================
  describe('Optional Fee Toggle (Single Child)', () => {
    it('should render checkboxes for optional fees', () => {
      render(<CustomFeesSelector {...defaultProps} />);
      const checkboxes = screen.getAllByRole('checkbox');
      // 2 optional fees = 2 checkboxes
      expect(checkboxes.length).toBe(2);
    });

    it('should call onToggleFee when checkbox is clicked', async () => {
      render(<CustomFeesSelector {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);

      expect(defaultProps.onToggleFee).toHaveBeenCalledWith('child-1', 1);
    });

    it('should show fee as selected when in selectedFeesByChild', () => {
      render(
        <CustomFeesSelector
          {...defaultProps}
          selectedFeesByChild={{ 'child-1': [1] }}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
    });

    it('should show fee as unchecked when not in selectedFeesByChild', () => {
      render(
        <CustomFeesSelector
          {...defaultProps}
          selectedFeesByChild={{ 'child-1': [] }}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });
  });

  // ===========================================
  // MULTI-CHILD FEE GROUPING
  // ===========================================
  describe('Multi-Child Fee Grouping', () => {
    it('should group fees by child when multiple children selected', () => {
      render(
        <CustomFeesSelector
          {...defaultProps}
          selectedChildIds={['child-1', 'child-2']}
        />
      );

      // Should see child names as group headers
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should render checkboxes for each child and optional fee', () => {
      render(
        <CustomFeesSelector
          {...defaultProps}
          selectedChildIds={['child-1', 'child-2']}
        />
      );

      // 2 children x 2 optional fees = 4 checkboxes
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(4);
    });

    it('should call onToggleFee with correct child id and fee index', async () => {
      render(
        <CustomFeesSelector
          {...defaultProps}
          selectedChildIds={['child-1', 'child-2']}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // Click the first checkbox under Bob (3rd checkbox: child-2, fee index 1)
      await userEvent.click(checkboxes[2]);

      expect(defaultProps.onToggleFee).toHaveBeenCalledWith('child-2', 1);
    });
  });

  // ===========================================
  // ONLY REQUIRED FEES
  // ===========================================
  describe('Only Required Fees', () => {
    it('should render only required fees section when no optional fees', () => {
      const classOnlyRequired = {
        ...mockClassDataWithFees,
        custom_fees: [
          { name: 'Registration Fee', amount: 20, is_optional: false },
        ],
      };

      render(
        <CustomFeesSelector {...defaultProps} classData={classOnlyRequired} />
      );

      expect(screen.getByText('Required Fees')).toBeInTheDocument();
      expect(screen.queryByText('Optional Fees')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // ONLY OPTIONAL FEES
  // ===========================================
  describe('Only Optional Fees', () => {
    it('should render only optional fees section when no required fees', () => {
      const classOnlyOptional = {
        ...mockClassDataWithFees,
        custom_fees: [
          { name: 'Photo Package', amount: 10, is_optional: true },
        ],
      };

      render(
        <CustomFeesSelector {...defaultProps} classData={classOnlyOptional} />
      );

      expect(screen.queryByText('Required Fees')).not.toBeInTheDocument();
      expect(screen.getByText('Optional Fees')).toBeInTheDocument();
    });
  });
});

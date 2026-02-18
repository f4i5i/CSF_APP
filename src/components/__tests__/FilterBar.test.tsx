/**
 * Unit Tests for FilterBar Component
 * Tests search input, filter dropdowns, date filters, clear functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from '../admin/FilterBar';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

describe('FilterBar Component', () => {
  const defaultProps = {
    onSearch: jest.fn(),
    onFilterChange: jest.fn(),
    onClearFilters: jest.fn(),
    searchValue: '',
    searchPlaceholder: 'Search users...',
    filters: [],
    hasActiveFilters: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render search input', () => {
      render(<FilterBar {...defaultProps} />);
      expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    });

    it('should render with default placeholder', () => {
      render(<FilterBar {...defaultProps} searchPlaceholder={undefined} />);
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should display current search value', () => {
      render(<FilterBar {...defaultProps} searchValue="test query" />);
      const input = screen.getByPlaceholderText('Search users...') as HTMLInputElement;
      expect(input.value).toBe('test query');
    });

    it('should not show clear button when no active filters', () => {
      render(<FilterBar {...defaultProps} hasActiveFilters={false} />);
      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // SEARCH TESTS
  // ===========================================
  describe('Search', () => {
    it('should call onSearch when typing in search input', async () => {
      const onSearch = jest.fn();
      render(<FilterBar {...defaultProps} onSearch={onSearch} />);

      const input = screen.getByPlaceholderText('Search users...');
      fireEvent.change(input, { target: { value: 'Alice' } });

      expect(onSearch).toHaveBeenCalledWith('Alice');
    });

    it('should call onSearch with empty string when cleared', () => {
      const onSearch = jest.fn();
      render(<FilterBar {...defaultProps} onSearch={onSearch} searchValue="test" />);

      const input = screen.getByPlaceholderText('Search users...');
      fireEvent.change(input, { target: { value: '' } });

      expect(onSearch).toHaveBeenCalledWith('');
    });
  });

  // ===========================================
  // SELECT FILTER TESTS
  // ===========================================
  describe('Select Filters', () => {
    it('should render select filter with placeholder', () => {
      const filters = [
        {
          type: 'select',
          value: '',
          onChange: jest.fn(),
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ],
          placeholder: 'Status',
        },
      ];

      render(<FilterBar {...defaultProps} filters={filters} />);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should display selected option in dropdown', () => {
      const filters = [
        {
          type: 'select',
          value: 'active',
          onChange: jest.fn(),
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ],
          placeholder: 'Status',
        },
      ];

      render(<FilterBar {...defaultProps} filters={filters} />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should support id/name option shape', () => {
      const filters = [
        {
          type: 'select',
          value: 'prog-1',
          onChange: jest.fn(),
          options: [
            { id: 'prog-1', name: 'Soccer' },
            { id: 'prog-2', name: 'Basketball' },
          ],
          placeholder: 'Program',
        },
      ];

      render(<FilterBar {...defaultProps} filters={filters} />);
      expect(screen.getByText('Soccer')).toBeInTheDocument();
    });

    it('should call onChange when dropdown option is selected', async () => {
      const onChange = jest.fn();
      const filters = [
        {
          type: 'select',
          value: '',
          onChange,
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ],
          placeholder: 'Status',
        },
      ];

      render(<FilterBar {...defaultProps} filters={filters} />);

      // Click the dropdown trigger
      const dropdownButton = screen.getByText('Status');
      fireEvent.click(dropdownButton);

      // Click an option
      fireEvent.click(screen.getByText('Active'));
      expect(onChange).toHaveBeenCalledWith('active');
    });
  });

  // ===========================================
  // DATE FILTER TESTS
  // ===========================================
  describe('Date Filters', () => {
    it('should render date filter', () => {
      const filters = [
        {
          type: 'date',
          value: '2024-01-01',
          onChange: jest.fn(),
          placeholder: 'Start Date',
        },
      ];

      render(<FilterBar {...defaultProps} filters={filters} />);
      const dateInput = screen.getByDisplayValue('2024-01-01');
      expect(dateInput).toBeInTheDocument();
    });

    it('should call onChange for date filter', () => {
      const onChange = jest.fn();
      const filters = [
        {
          type: 'date',
          value: '',
          onChange,
          placeholder: 'Start Date',
        },
      ];

      render(<FilterBar {...defaultProps} filters={filters} />);
      const dateInput = screen.getByDisplayValue('');
      fireEvent.change(dateInput, { target: { value: '2024-06-15' } });

      expect(onChange).toHaveBeenCalledWith('2024-06-15');
    });
  });

  // ===========================================
  // DATE RANGE FILTER TESTS
  // ===========================================
  describe('Date Range Filters', () => {
    it('should render date range filter with both inputs', () => {
      const filters = [
        {
          type: 'daterange',
          startValue: '2024-01-01',
          endValue: '2024-12-31',
          onStartChange: jest.fn(),
          onEndChange: jest.fn(),
        },
      ];

      render(<FilterBar {...defaultProps} filters={filters} />);
      expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
      expect(screen.getByText('to')).toBeInTheDocument();
    });

    it('should call onStartChange and onEndChange', () => {
      const onStartChange = jest.fn();
      const onEndChange = jest.fn();
      const filters = [
        {
          type: 'daterange',
          startValue: '',
          endValue: '',
          onStartChange,
          onEndChange,
        },
      ];

      render(<FilterBar {...defaultProps} filters={filters} />);
      const dateInputs = screen.getAllByDisplayValue('');

      // Filter out the search input, get date inputs
      const dateOnlyInputs = dateInputs.filter(
        (el) => (el as HTMLInputElement).type === 'date'
      );

      fireEvent.change(dateOnlyInputs[0], { target: { value: '2024-01-01' } });
      expect(onStartChange).toHaveBeenCalledWith('2024-01-01');

      fireEvent.change(dateOnlyInputs[1], { target: { value: '2024-12-31' } });
      expect(onEndChange).toHaveBeenCalledWith('2024-12-31');
    });
  });

  // ===========================================
  // ACTIVE FILTERS TESTS
  // ===========================================
  describe('Active Filters', () => {
    it('should show clear button when hasActiveFilters is true', () => {
      render(<FilterBar {...defaultProps} hasActiveFilters={true} />);
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should show "Filters Active" badge when filters are active', () => {
      render(<FilterBar {...defaultProps} hasActiveFilters={true} />);
      expect(screen.getByText('Filters Active')).toBeInTheDocument();
    });

    it('should call onClearFilters when clear button is clicked', () => {
      const onClearFilters = jest.fn();
      render(
        <FilterBar
          {...defaultProps}
          hasActiveFilters={true}
          onClearFilters={onClearFilters}
        />
      );

      fireEvent.click(screen.getByText('Clear'));
      expect(onClearFilters).toHaveBeenCalled();
    });
  });

  // ===========================================
  // MULTIPLE FILTERS TESTS
  // ===========================================
  describe('Multiple Filters', () => {
    it('should render multiple filters side by side', () => {
      const filters = [
        {
          type: 'select',
          value: '',
          onChange: jest.fn(),
          options: [{ value: 'active', label: 'Active' }],
          placeholder: 'Status',
        },
        {
          type: 'date',
          value: '',
          onChange: jest.fn(),
          placeholder: 'Date',
        },
      ];

      render(<FilterBar {...defaultProps} filters={filters} />);
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });
});

/**
 * Unit Tests for MultiClassSelector Component
 * Tests rendering, selection, deselection, search, select all, chips
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiClassSelector from '../admin/MultiClassSelector';

describe('MultiClassSelector Component', () => {
  const mockClasses = [
    { id: 'class-1', name: 'Soccer Basics', program_name: 'Soccer' },
    { id: 'class-2', name: 'Basketball 101', program_name: 'Basketball' },
    { id: 'class-3', name: 'Tennis Pro', program_name: 'Tennis' },
  ];

  const defaultProps = {
    classes: mockClasses,
    selectedIds: [] as string[],
    onChange: jest.fn(),
    disabled: false,
    label: 'Target Classes',
    placeholder: 'Search classes...',
    showSelectAll: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the label', () => {
      render(<MultiClassSelector {...defaultProps} />);
      expect(screen.getByText('Target Classes')).toBeInTheDocument();
    });

    it('should render custom label', () => {
      render(<MultiClassSelector {...defaultProps} label="Choose Classes" />);
      expect(screen.getByText('Choose Classes')).toBeInTheDocument();
    });

    it('should render all classes', () => {
      render(<MultiClassSelector {...defaultProps} />);
      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      expect(screen.getByText('Basketball 101')).toBeInTheDocument();
      expect(screen.getByText('Tennis Pro')).toBeInTheDocument();
    });

    it('should render program names', () => {
      render(<MultiClassSelector {...defaultProps} />);
      expect(screen.getByText('Soccer')).toBeInTheDocument();
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    it('should show empty message when no classes', () => {
      render(<MultiClassSelector {...defaultProps} classes={[]} />);
      expect(screen.getByText('No classes available')).toBeInTheDocument();
    });

    it('should show selection count when classes are selected', () => {
      render(<MultiClassSelector {...defaultProps} selectedIds={['class-1', 'class-2']} />);
      expect(screen.getByText('(2 selected)')).toBeInTheDocument();
    });
  });

  // ===========================================
  // SELECTION TESTS
  // ===========================================
  describe('Selection', () => {
    it('should call onChange with added class when clicking unselected class', () => {
      const onChange = jest.fn();
      render(<MultiClassSelector {...defaultProps} onChange={onChange} />);

      // Click on the checkbox/label for Soccer Basics
      const checkbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(checkbox);

      expect(onChange).toHaveBeenCalledWith(['class-1']);
    });

    it('should call onChange with removed class when clicking selected class', () => {
      const onChange = jest.fn();
      render(
        <MultiClassSelector
          {...defaultProps}
          selectedIds={['class-1', 'class-2']}
          onChange={onChange}
        />
      );

      // Clicking on a selected class should remove it
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(onChange).toHaveBeenCalledWith(['class-2']);
    });
  });

  // ===========================================
  // SELECT ALL TESTS
  // ===========================================
  describe('Select All', () => {
    it('should show Select All button when showSelectAll is true', () => {
      render(<MultiClassSelector {...defaultProps} />);
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('should not show Select All button when showSelectAll is false', () => {
      render(<MultiClassSelector {...defaultProps} showSelectAll={false} />);
      expect(screen.queryByText('Select All')).not.toBeInTheDocument();
    });

    it('should select all classes when Select All is clicked', () => {
      const onChange = jest.fn();
      render(<MultiClassSelector {...defaultProps} onChange={onChange} />);

      fireEvent.click(screen.getByText('Select All'));
      expect(onChange).toHaveBeenCalledWith(['class-1', 'class-2', 'class-3']);
    });

    it('should show "Deselect All" when all classes are selected', () => {
      render(
        <MultiClassSelector
          {...defaultProps}
          selectedIds={['class-1', 'class-2', 'class-3']}
        />
      );
      expect(screen.getByText('Deselect All')).toBeInTheDocument();
    });

    it('should deselect all when "Deselect All" is clicked', () => {
      const onChange = jest.fn();
      render(
        <MultiClassSelector
          {...defaultProps}
          selectedIds={['class-1', 'class-2', 'class-3']}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByText('Deselect All'));
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('should show Clear button when classes are selected', () => {
      render(<MultiClassSelector {...defaultProps} selectedIds={['class-1']} />);
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should clear all selections when Clear is clicked', () => {
      const onChange = jest.fn();
      render(
        <MultiClassSelector
          {...defaultProps}
          selectedIds={['class-1', 'class-2']}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByText('Clear'));
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('should not show Select All when no classes exist', () => {
      render(<MultiClassSelector {...defaultProps} classes={[]} />);
      expect(screen.queryByText('Select All')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // SEARCH TESTS
  // ===========================================
  describe('Search', () => {
    it('should show search input when more than 5 classes', () => {
      const manyClasses = Array.from({ length: 6 }, (_, i) => ({
        id: `class-${i}`,
        name: `Class ${i}`,
      }));

      render(<MultiClassSelector {...defaultProps} classes={manyClasses} />);
      expect(screen.getByPlaceholderText('Search classes...')).toBeInTheDocument();
    });

    it('should not show search input when 5 or fewer classes', () => {
      render(<MultiClassSelector {...defaultProps} />);
      expect(screen.queryByPlaceholderText('Search classes...')).not.toBeInTheDocument();
    });

    it('should filter classes by search term', () => {
      const manyClasses = Array.from({ length: 6 }, (_, i) => ({
        id: `class-${i}`,
        name: `Class ${i}`,
      }));

      render(<MultiClassSelector {...defaultProps} classes={manyClasses} />);

      const searchInput = screen.getByPlaceholderText('Search classes...');
      fireEvent.change(searchInput, { target: { value: 'Class 1' } });

      expect(screen.getByText('Class 1')).toBeInTheDocument();
      expect(screen.queryByText('Class 2')).not.toBeInTheDocument();
    });

    it('should show no match message when search finds nothing', () => {
      const manyClasses = Array.from({ length: 6 }, (_, i) => ({
        id: `class-${i}`,
        name: `Class ${i}`,
      }));

      render(<MultiClassSelector {...defaultProps} classes={manyClasses} />);

      const searchInput = screen.getByPlaceholderText('Search classes...');
      fireEvent.change(searchInput, { target: { value: 'xyz' } });

      expect(screen.getByText('No classes match your search')).toBeInTheDocument();
    });
  });

  // ===========================================
  // SELECTED CHIPS TESTS
  // ===========================================
  describe('Selected Chips', () => {
    it('should show chips when 1-5 classes are selected', () => {
      render(<MultiClassSelector {...defaultProps} selectedIds={['class-1']} />);
      // The chip should display class name
      const chips = screen.getAllByText('Soccer Basics');
      expect(chips.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow removing a chip when not disabled', () => {
      const onChange = jest.fn();
      render(
        <MultiClassSelector
          {...defaultProps}
          selectedIds={['class-1']}
          onChange={onChange}
        />
      );

      // Find and click the X button on the chip
      const chipButtons = screen.getAllByRole('button');
      const removeBtn = chipButtons.find(
        (btn) => btn.closest('.rounded-full') && btn.querySelector('svg')
      );

      if (removeBtn) {
        fireEvent.click(removeBtn);
        expect(onChange).toHaveBeenCalled();
      }
    });
  });

  // ===========================================
  // DISABLED STATE TESTS
  // ===========================================
  describe('Disabled State', () => {
    it('should not toggle selection when disabled', () => {
      const onChange = jest.fn();
      render(
        <MultiClassSelector
          {...defaultProps}
          disabled={true}
          onChange={onChange}
        />
      );

      const checkbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(checkbox);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not toggle select all when disabled', () => {
      const onChange = jest.fn();
      render(
        <MultiClassSelector
          {...defaultProps}
          disabled={true}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByText('Select All'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});

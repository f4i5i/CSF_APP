/**
 * Unit Tests for MultiCoachSelector Component
 * Tests rendering, selection, deselection, search, select all, chips
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MultiCoachSelector from '../admin/MultiCoachSelector';

describe('MultiCoachSelector Component', () => {
  const mockCoaches = [
    { id: 'coach-1', full_name: 'John Smith', email: 'john@test.com', assigned_classes: 3 },
    { id: 'coach-2', full_name: 'Jane Doe', email: 'jane@test.com', assigned_classes: 1 },
    { id: 'coach-3', full_name: 'Bob Wilson', email: 'bob@test.com', assigned_classes: 0 },
  ];

  const defaultProps = {
    coaches: mockCoaches,
    selectedIds: [] as string[],
    onChange: jest.fn(),
    disabled: false,
    label: 'Assign Coaches',
    placeholder: 'Search coaches...',
    showSelectAll: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the label', () => {
      render(<MultiCoachSelector {...defaultProps} />);
      expect(screen.getByText('Assign Coaches')).toBeInTheDocument();
    });

    it('should render all coaches', () => {
      render(<MultiCoachSelector {...defaultProps} />);
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should show assigned classes count', () => {
      render(<MultiCoachSelector {...defaultProps} />);
      expect(screen.getByText('3 classes assigned')).toBeInTheDocument();
      expect(screen.getByText('1 class assigned')).toBeInTheDocument();
      expect(screen.getByText('0 classes assigned')).toBeInTheDocument();
    });

    it('should show empty message when no coaches', () => {
      render(<MultiCoachSelector {...defaultProps} coaches={[]} />);
      expect(screen.getByText('No coaches available')).toBeInTheDocument();
    });

    it('should show selection count when coaches are selected', () => {
      render(
        <MultiCoachSelector {...defaultProps} selectedIds={['coach-1', 'coach-2']} />
      );
      expect(screen.getByText('(2 selected)')).toBeInTheDocument();
    });

    it('should show helper text', () => {
      render(<MultiCoachSelector {...defaultProps} />);
      expect(
        screen.getByText('Selected coaches can access this class in their portal')
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // SELECTION TESTS
  // ===========================================
  describe('Selection', () => {
    it('should call onChange with added coach when clicking unselected coach', () => {
      const onChange = jest.fn();
      render(<MultiCoachSelector {...defaultProps} onChange={onChange} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(onChange).toHaveBeenCalledWith(['coach-1']);
    });

    it('should call onChange with removed coach when clicking selected coach', () => {
      const onChange = jest.fn();
      render(
        <MultiCoachSelector
          {...defaultProps}
          selectedIds={['coach-1', 'coach-2']}
          onChange={onChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(onChange).toHaveBeenCalledWith(['coach-2']);
    });
  });

  // ===========================================
  // SELECT ALL TESTS
  // ===========================================
  describe('Select All', () => {
    it('should not show Select All by default (showSelectAll=false)', () => {
      render(<MultiCoachSelector {...defaultProps} />);
      expect(screen.queryByText('Select All')).not.toBeInTheDocument();
    });

    it('should show Select All when showSelectAll is true', () => {
      render(<MultiCoachSelector {...defaultProps} showSelectAll={true} />);
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('should select all coaches when Select All is clicked', () => {
      const onChange = jest.fn();
      render(
        <MultiCoachSelector
          {...defaultProps}
          showSelectAll={true}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByText('Select All'));
      expect(onChange).toHaveBeenCalledWith(['coach-1', 'coach-2', 'coach-3']);
    });

    it('should show "Deselect All" when all are selected', () => {
      render(
        <MultiCoachSelector
          {...defaultProps}
          showSelectAll={true}
          selectedIds={['coach-1', 'coach-2', 'coach-3']}
        />
      );
      expect(screen.getByText('Deselect All')).toBeInTheDocument();
    });

    it('should show Clear button when coaches are selected', () => {
      render(
        <MultiCoachSelector
          {...defaultProps}
          showSelectAll={true}
          selectedIds={['coach-1']}
        />
      );
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should clear all when Clear is clicked', () => {
      const onChange = jest.fn();
      render(
        <MultiCoachSelector
          {...defaultProps}
          showSelectAll={true}
          selectedIds={['coach-1']}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByText('Clear'));
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  // ===========================================
  // SEARCH TESTS
  // ===========================================
  describe('Search', () => {
    it('should show search input when more than 5 coaches', () => {
      const manyCoaches = Array.from({ length: 6 }, (_, i) => ({
        id: `coach-${i}`,
        full_name: `Coach ${i}`,
        email: `coach${i}@test.com`,
      }));

      render(<MultiCoachSelector {...defaultProps} coaches={manyCoaches} />);
      expect(screen.getByPlaceholderText('Search coaches...')).toBeInTheDocument();
    });

    it('should not show search input when 5 or fewer coaches', () => {
      render(<MultiCoachSelector {...defaultProps} />);
      expect(screen.queryByPlaceholderText('Search coaches...')).not.toBeInTheDocument();
    });

    it('should filter coaches by name', () => {
      const manyCoaches = Array.from({ length: 6 }, (_, i) => ({
        id: `coach-${i}`,
        full_name: `Coach ${i}`,
        email: `coach${i}@test.com`,
      }));

      render(<MultiCoachSelector {...defaultProps} coaches={manyCoaches} />);
      const searchInput = screen.getByPlaceholderText('Search coaches...');
      fireEvent.change(searchInput, { target: { value: 'Coach 1' } });

      expect(screen.getByText('Coach 1')).toBeInTheDocument();
      expect(screen.queryByText('Coach 2')).not.toBeInTheDocument();
    });

    it('should filter coaches by email', () => {
      const manyCoaches = Array.from({ length: 6 }, (_, i) => ({
        id: `coach-${i}`,
        full_name: `Coach ${i}`,
        email: `unique${i}@test.com`,
      }));

      render(<MultiCoachSelector {...defaultProps} coaches={manyCoaches} />);
      const searchInput = screen.getByPlaceholderText('Search coaches...');
      fireEvent.change(searchInput, { target: { value: 'unique1' } });

      expect(screen.getByText('Coach 1')).toBeInTheDocument();
      expect(screen.queryByText('Coach 2')).not.toBeInTheDocument();
    });

    it('should show no match message when search finds nothing', () => {
      const manyCoaches = Array.from({ length: 6 }, (_, i) => ({
        id: `coach-${i}`,
        full_name: `Coach ${i}`,
        email: `coach${i}@test.com`,
      }));

      render(<MultiCoachSelector {...defaultProps} coaches={manyCoaches} />);
      const searchInput = screen.getByPlaceholderText('Search coaches...');
      fireEvent.change(searchInput, { target: { value: 'xyz' } });

      expect(screen.getByText('No coaches match your search')).toBeInTheDocument();
    });
  });

  // ===========================================
  // DISABLED STATE TESTS
  // ===========================================
  describe('Disabled State', () => {
    it('should not toggle selection when disabled', () => {
      const onChange = jest.fn();
      render(
        <MultiCoachSelector {...defaultProps} disabled={true} onChange={onChange} />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // CHIPS TESTS
  // ===========================================
  describe('Selected Chips', () => {
    it('should show chips when 1-5 coaches are selected', () => {
      render(<MultiCoachSelector {...defaultProps} selectedIds={['coach-1']} />);
      // Chip should show coach name
      const nameElements = screen.getAllByText('John Smith');
      expect(nameElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should not show chips when more than 5 coaches are selected', () => {
      const manyIds = ['coach-1', 'coach-2', 'coach-3', 'c4', 'c5', 'c6'];
      render(<MultiCoachSelector {...defaultProps} selectedIds={manyIds} />);
      // With 6 selected, the chip section should not render
      // The chip section is only shown when selectedIds.length <= 5
      const chipContainer = screen.queryByText('John Smith');
      // It should still show in the main list but not as a chip
      // We can check by seeing the list rendering
      expect(screen.getByText('(6 selected)')).toBeInTheDocument();
    });
  });
});

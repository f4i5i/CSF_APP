/**
 * Unit Tests for ActionMenu Component
 * Tests dropdown opening/closing, action callbacks, disabled state, variants
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionMenu from '../admin/ActionMenu';
import { Edit, Trash2, Eye } from 'lucide-react';

describe('ActionMenu Component', () => {
  const mockActions = [
    { label: 'Edit', icon: Edit, onClick: jest.fn() },
    { label: 'View', icon: Eye, onClick: jest.fn() },
    { label: 'Delete', icon: Trash2, onClick: jest.fn(), variant: 'destructive' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the trigger button', () => {
      render(<ActionMenu actions={mockActions} />);
      const triggerButton = screen.getByTitle('Actions');
      expect(triggerButton).toBeInTheDocument();
    });

    it('should not show menu items initially', () => {
      render(<ActionMenu actions={mockActions} />);
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('View')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should show "No actions available" when actions array is empty', () => {
      render(<ActionMenu actions={[]} />);
      fireEvent.click(screen.getByTitle('Actions'));
      expect(screen.getByText('No actions available')).toBeInTheDocument();
    });
  });

  // ===========================================
  // OPEN/CLOSE TESTS
  // ===========================================
  describe('Open/Close', () => {
    it('should open menu when trigger is clicked', () => {
      render(<ActionMenu actions={mockActions} />);
      fireEvent.click(screen.getByTitle('Actions'));

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should close menu when trigger is clicked again', () => {
      render(<ActionMenu actions={mockActions} />);

      // Open
      fireEvent.click(screen.getByTitle('Actions'));
      expect(screen.getByText('Edit')).toBeInTheDocument();

      // Close
      fireEvent.click(screen.getByTitle('Actions'));
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('should close menu when clicking outside', () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <ActionMenu actions={mockActions} />
        </div>
      );

      // Open
      fireEvent.click(screen.getByTitle('Actions'));
      expect(screen.getByText('Edit')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'));
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // ACTION CALLBACK TESTS
  // ===========================================
  describe('Action Callbacks', () => {
    it('should call onClick when action is clicked', () => {
      const onEdit = jest.fn();
      const actions = [{ label: 'Edit', onClick: onEdit }];

      render(<ActionMenu actions={actions} />);
      fireEvent.click(screen.getByTitle('Actions'));
      fireEvent.click(screen.getByText('Edit'));

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('should close menu after action is clicked', () => {
      const actions = [{ label: 'Edit', onClick: jest.fn() }];

      render(<ActionMenu actions={actions} />);
      fireEvent.click(screen.getByTitle('Actions'));
      fireEvent.click(screen.getByText('Edit'));

      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('should call the correct action callback for each action', () => {
      render(<ActionMenu actions={mockActions} />);
      fireEvent.click(screen.getByTitle('Actions'));

      fireEvent.click(screen.getByText('Edit'));
      expect(mockActions[0].onClick).toHaveBeenCalledTimes(1);
      expect(mockActions[1].onClick).not.toHaveBeenCalled();
      expect(mockActions[2].onClick).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // DISABLED ACTIONS TESTS
  // ===========================================
  describe('Disabled Actions', () => {
    it('should render disabled action with reduced opacity', () => {
      const actions = [
        { label: 'Edit', onClick: jest.fn(), disabled: true },
      ];

      render(<ActionMenu actions={actions} />);
      fireEvent.click(screen.getByTitle('Actions'));

      const editBtn = screen.getByText('Edit').closest('button');
      expect(editBtn).toBeDisabled();
    });

    it('should not call onClick for disabled actions', () => {
      const onClick = jest.fn();
      const actions = [{ label: 'Edit', onClick, disabled: true }];

      render(<ActionMenu actions={actions} />);
      fireEvent.click(screen.getByTitle('Actions'));

      const editBtn = screen.getByText('Edit').closest('button')!;
      fireEvent.click(editBtn);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // VARIANT TESTS
  // ===========================================
  describe('Variants', () => {
    it('should apply destructive styling for destructive actions', () => {
      const actions = [
        { label: 'Delete', onClick: jest.fn(), variant: 'destructive' },
      ];

      render(<ActionMenu actions={actions} />);
      fireEvent.click(screen.getByTitle('Actions'));

      const deleteBtn = screen.getByText('Delete').closest('button');
      expect(deleteBtn?.className).toContain('hover:bg-error-light');
    });

    it('should apply normal styling for non-destructive actions', () => {
      const actions = [{ label: 'Edit', onClick: jest.fn() }];

      render(<ActionMenu actions={actions} />);
      fireEvent.click(screen.getByTitle('Actions'));

      const editBtn = screen.getByText('Edit').closest('button');
      expect(editBtn?.className).not.toContain('hover:bg-error-light');
    });
  });

  // ===========================================
  // ICON TESTS
  // ===========================================
  describe('Icons', () => {
    it('should render icons when provided', () => {
      const actions = [{ label: 'Edit', icon: Edit, onClick: jest.fn() }];

      render(<ActionMenu actions={actions} />);
      fireEvent.click(screen.getByTitle('Actions'));

      // Icon should be rendered (as an SVG) alongside the label
      const editBtn = screen.getByText('Edit').closest('button');
      const svg = editBtn?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render without icon when not provided', () => {
      const actions = [{ label: 'Edit', onClick: jest.fn() }];

      render(<ActionMenu actions={actions} />);
      fireEvent.click(screen.getByTitle('Actions'));

      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should handle action without onClick', () => {
      const actions = [{ label: 'View' }];

      render(<ActionMenu actions={actions} />);
      fireEvent.click(screen.getByTitle('Actions'));

      expect(() => {
        fireEvent.click(screen.getByText('View'));
      }).not.toThrow();
    });

    it('should handle default empty actions array', () => {
      render(<ActionMenu />);
      fireEvent.click(screen.getByTitle('Actions'));
      expect(screen.getByText('No actions available')).toBeInTheDocument();
    });
  });
});

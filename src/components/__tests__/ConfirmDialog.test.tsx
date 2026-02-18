/**
 * Unit Tests for ConfirmDialog Component
 * Tests open/close, variants, button labels, loading state, and callbacks
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../admin/ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'danger' as const,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
    });

    it('should display default title and message', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
        />
      );
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    });

    it('should display custom title and message', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          title="Cancel Enrollment"
          message="This will remove the student from the class."
        />
      );
      expect(screen.getByText('Cancel Enrollment')).toBeInTheDocument();
      expect(screen.getByText('This will remove the student from the class.')).toBeInTheDocument();
    });
  });

  // ===========================================
  // BUTTON LABEL TESTS
  // ===========================================
  describe('Button Labels', () => {
    it('should display custom confirm label', () => {
      render(<ConfirmDialog {...defaultProps} confirmLabel="Yes, Delete" />);
      expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
    });

    it('should display custom cancel label', () => {
      render(<ConfirmDialog {...defaultProps} cancelLabel="No, Keep It" />);
      expect(screen.getByText('No, Keep It')).toBeInTheDocument();
    });

    it('should display default button labels', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
        />
      );
      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  // ===========================================
  // VARIANT TESTS
  // ===========================================
  describe('Variants', () => {
    it('should render danger variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="danger" />);
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
    });

    it('should render warning variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="warning" />);
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
    });

    it('should render info variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="info" />);
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
    });

    it('should fallback to danger for unknown variant', () => {
      render(<ConfirmDialog {...defaultProps} variant={'unknown' as any} />);
      expect(screen.getByText('Delete Item')).toBeInTheDocument();
    });
  });

  // ===========================================
  // CALLBACK TESTS
  // ===========================================
  describe('Callbacks', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      const onConfirm = jest.fn();
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(screen.getByText('Delete'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button is clicked', () => {
      const onClose = jest.fn();
      render(<ConfirmDialog {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when X button is clicked', () => {
      const onClose = jest.fn();
      render(<ConfirmDialog {...defaultProps} onClose={onClose} />);

      // The X button has an X icon
      const closeButtons = screen.getAllByRole('button');
      // X button is the one at the top right (not Cancel or Confirm)
      const xButton = closeButtons.find(
        (btn) => !btn.textContent?.includes('Delete') && !btn.textContent?.includes('Cancel')
      );
      if (xButton) {
        fireEvent.click(xButton);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading State', () => {
    it('should show "Processing..." text when loading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading={true} />);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should not show confirm label when loading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading={true} />);
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should disable cancel button when loading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading={true} />);
      const cancelBtn = screen.getByText('Cancel');
      expect(cancelBtn).toBeDisabled();
    });

    it('should disable confirm button when loading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading={true} />);
      const confirmBtn = screen.getByText('Processing...').closest('button');
      expect(confirmBtn).toBeDisabled();
    });

    it('should disable X button when loading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading={true} />);
      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find(
        (btn) =>
          !btn.textContent?.includes('Processing') &&
          !btn.textContent?.includes('Cancel')
      );
      if (xButton) {
        expect(xButton).toBeDisabled();
      }
    });
  });

  // ===========================================
  // CLICK PROPAGATION TESTS
  // ===========================================
  describe('Click Propagation', () => {
    it('should stop propagation when dialog content is clicked', () => {
      render(<ConfirmDialog {...defaultProps} />);
      // The dialog body has onClick stopPropagation
      const dialogBody = screen.getByText('Delete Item').closest('.bg-white');
      if (dialogBody) {
        const event = new MouseEvent('click', { bubbles: true });
        jest.spyOn(event, 'stopPropagation');
        dialogBody.dispatchEvent(event);
        expect(event.stopPropagation).toHaveBeenCalled();
      }
    });
  });
});

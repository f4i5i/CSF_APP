/**
 * Unit Tests for RefundModal Component
 * Tests open/close, full/partial refund, validation, submit, loading state
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RefundModal from '../admin/RefundModal';

describe('RefundModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    paymentAmount: 150.0,
    paymentId: 'pay_123',
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
      render(<RefundModal {...defaultProps} />);
      expect(screen.getByText('Issue Refund')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<RefundModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Issue Refund')).not.toBeInTheDocument();
    });

    it('should display payment amount', () => {
      render(<RefundModal {...defaultProps} />);
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    it('should display payment ID', () => {
      render(<RefundModal {...defaultProps} />);
      expect(screen.getByText(/pay_123/)).toBeInTheDocument();
    });

    it('should not display payment ID when not provided', () => {
      render(<RefundModal {...defaultProps} paymentId={undefined} />);
      expect(screen.queryByText(/Payment ID:/)).not.toBeInTheDocument();
    });

    it('should render refund type radio buttons', () => {
      render(<RefundModal {...defaultProps} />);
      expect(screen.getByText('Full Refund')).toBeInTheDocument();
      expect(screen.getByText('Partial Refund')).toBeInTheDocument();
    });

    it('should have full refund selected by default', () => {
      render(<RefundModal {...defaultProps} />);
      const fullRadio = screen.getByDisplayValue('full') as HTMLInputElement;
      expect(fullRadio.checked).toBe(true);
    });

    it('should show reason textarea', () => {
      render(<RefundModal {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('Explain why this refund is being issued...')
      ).toBeInTheDocument();
    });

    it('should show warning about irreversible action', () => {
      render(<RefundModal {...defaultProps} />);
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    });
  });

  // ===========================================
  // REFUND TYPE TESTS
  // ===========================================
  describe('Refund Type Selection', () => {
    it('should switch to partial refund mode', () => {
      render(<RefundModal {...defaultProps} />);
      const partialRadio = screen.getByDisplayValue('partial');
      fireEvent.click(partialRadio);

      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    });

    it('should not show refund amount input for full refund', () => {
      render(<RefundModal {...defaultProps} />);
      expect(screen.queryByPlaceholderText('0.00')).not.toBeInTheDocument();
    });

    it('should show refund amount input for partial refund', () => {
      render(<RefundModal {...defaultProps} />);
      fireEvent.click(screen.getByDisplayValue('partial'));
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    });

    it('should show full amount in summary for full refund', () => {
      render(<RefundModal {...defaultProps} />);
      // The refund summary should show the full payment amount
      const summaryText = screen.getByText(/Refund Amount:/);
      expect(summaryText.parentElement?.textContent).toContain('$150.00');
    });
  });

  // ===========================================
  // VALIDATION TESTS
  // ===========================================
  describe('Validation', () => {
    it('should show error when submitting without reason', async () => {
      render(<RefundModal {...defaultProps} />);

      // Submit without filling reason
      const submitBtn = screen.getByText('Issue Refund');
      fireEvent.click(submitBtn);

      expect(screen.getByText('Please provide a reason for the refund')).toBeInTheDocument();
    });

    it('should show error for invalid partial amount', () => {
      render(<RefundModal {...defaultProps} />);

      // Switch to partial
      fireEvent.click(screen.getByDisplayValue('partial'));

      // Enter invalid amount
      const amountInput = screen.getByPlaceholderText('0.00');
      fireEvent.change(amountInput, { target: { value: '-5' } });

      // Add reason
      const reasonInput = screen.getByPlaceholderText(
        'Explain why this refund is being issued...'
      );
      fireEvent.change(reasonInput, { target: { value: 'Test reason' } });

      // Submit
      fireEvent.click(screen.getByText('Issue Refund'));

      expect(screen.getByText('Please enter a valid refund amount')).toBeInTheDocument();
    });

    it('should show error when partial amount exceeds payment amount', () => {
      render(<RefundModal {...defaultProps} />);

      fireEvent.click(screen.getByDisplayValue('partial'));

      const amountInput = screen.getByPlaceholderText('0.00');
      fireEvent.change(amountInput, { target: { value: '200' } });

      const reasonInput = screen.getByPlaceholderText(
        'Explain why this refund is being issued...'
      );
      fireEvent.change(reasonInput, { target: { value: 'Test reason' } });

      fireEvent.click(screen.getByText('Issue Refund'));

      expect(
        screen.getByText('Refund amount cannot exceed payment amount')
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // SUBMIT TESTS
  // ===========================================
  describe('Submit', () => {
    it('should call onConfirm with full refund data', () => {
      const onConfirm = jest.fn();
      render(<RefundModal {...defaultProps} onConfirm={onConfirm} />);

      // Fill reason
      const reasonInput = screen.getByPlaceholderText(
        'Explain why this refund is being issued...'
      );
      fireEvent.change(reasonInput, { target: { value: 'Customer requested' } });

      // Submit
      fireEvent.click(screen.getByText('Issue Refund'));

      expect(onConfirm).toHaveBeenCalledWith({
        amount: 150.0,
        reason: 'Customer requested',
        type: 'full',
      });
    });

    it('should call onConfirm with partial refund data', () => {
      const onConfirm = jest.fn();
      render(<RefundModal {...defaultProps} onConfirm={onConfirm} />);

      // Switch to partial
      fireEvent.click(screen.getByDisplayValue('partial'));

      // Enter amount
      const amountInput = screen.getByPlaceholderText('0.00');
      fireEvent.change(amountInput, { target: { value: '75' } });

      // Fill reason
      const reasonInput = screen.getByPlaceholderText(
        'Explain why this refund is being issued...'
      );
      fireEvent.change(reasonInput, { target: { value: 'Half refund' } });

      // Submit
      fireEvent.click(screen.getByText('Issue Refund'));

      expect(onConfirm).toHaveBeenCalledWith({
        amount: 75,
        reason: 'Half refund',
        type: 'partial',
      });
    });
  });

  // ===========================================
  // CLOSE / CANCEL TESTS
  // ===========================================
  describe('Close / Cancel', () => {
    it('should call onClose when Cancel button is clicked', () => {
      const onClose = jest.fn();
      render(<RefundModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', () => {
      const onClose = jest.fn();
      render(<RefundModal {...defaultProps} onClose={onClose} />);

      // X button is the one outside the form buttons
      const allButtons = screen.getAllByRole('button');
      const xButton = allButtons.find(
        (btn) =>
          !btn.textContent?.includes('Cancel') &&
          !btn.textContent?.includes('Issue Refund') &&
          !btn.textContent?.includes('Full') &&
          !btn.textContent?.includes('Partial')
      );
      if (xButton) {
        fireEvent.click(xButton);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should not close when loading', () => {
      const onClose = jest.fn();
      render(<RefundModal {...defaultProps} onClose={onClose} isLoading={true} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading State', () => {
    it('should show "Processing..." when loading', () => {
      render(<RefundModal {...defaultProps} isLoading={true} />);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should disable submit button when loading', () => {
      render(<RefundModal {...defaultProps} isLoading={true} />);
      const submitBtn = screen.getByText('Processing...').closest('button');
      expect(submitBtn).toBeDisabled();
    });

    it('should disable cancel button when loading', () => {
      render(<RefundModal {...defaultProps} isLoading={true} />);
      const cancelBtn = screen.getByText('Cancel');
      expect(cancelBtn).toBeDisabled();
    });
  });
});

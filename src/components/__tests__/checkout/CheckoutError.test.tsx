/**
 * Unit Tests for CheckoutError Component
 * Tests error display, error parsing, retry/home actions, and contact support link
 */

import React from 'react';
import { render, screen } from '../../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import CheckoutError from '../../checkout/CheckoutError';

describe('CheckoutError Component', () => {
  const defaultProps = {
    error: 'Something went wrong during checkout',
    onRetry: jest.fn(),
    onGoHome: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<CheckoutError {...defaultProps} />);
      expect(screen.getByText('Checkout Error')).toBeInTheDocument();
    });

    it('should display the error message', () => {
      render(<CheckoutError {...defaultProps} />);
      expect(
        screen.getByText('Something went wrong during checkout')
      ).toBeInTheDocument();
    });

    it('should display common issues section', () => {
      render(<CheckoutError {...defaultProps} />);
      expect(screen.getByText('Common Issues:')).toBeInTheDocument();
      expect(
        screen.getByText('Class may no longer be available')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Payment information may be incomplete')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Network connection issues')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Session may have expired')
      ).toBeInTheDocument();
    });

    it('should display Contact Support link', () => {
      render(<CheckoutError {...defaultProps} />);
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Contact Support/i })
      ).toHaveAttribute('href', '/contact');
    });
  });

  // ===========================================
  // ERROR PARSING
  // ===========================================
  describe('Error Parsing', () => {
    it('should display string error directly', () => {
      render(<CheckoutError {...defaultProps} error="Custom error message" />);
      expect(screen.getByText('Checkout Error')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should extract message from error.response.data.message', () => {
      const errorObject = {
        response: {
          data: {
            message: 'Server validation error',
          },
        },
      };

      render(<CheckoutError {...defaultProps} error={errorObject} />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Server validation error')).toBeInTheDocument();
    });

    it('should extract message from error.message', () => {
      const errorObject = {
        message: 'Network timeout',
      };

      render(<CheckoutError {...defaultProps} error={errorObject} />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Network timeout')).toBeInTheDocument();
    });

    it('should show default message for unknown error format', () => {
      const errorObject = {};

      render(<CheckoutError {...defaultProps} error={errorObject} />);
      expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
      expect(
        screen.getByText('An unexpected error occurred. Please try again.')
      ).toBeInTheDocument();
    });

    it('should show default message for null error', () => {
      render(<CheckoutError {...defaultProps} error={null} />);
      expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
    });

    it('should show default message for undefined error', () => {
      render(<CheckoutError {...defaultProps} error={undefined} />);
      expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
    });
  });

  // ===========================================
  // ACTION BUTTONS
  // ===========================================
  describe('Action Buttons', () => {
    it('should render Try Again button when onRetry is provided', () => {
      render(<CheckoutError {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /Try Again/i })
      ).toBeInTheDocument();
    });

    it('should call onRetry when Try Again is clicked', async () => {
      render(<CheckoutError {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Try Again/i })
      );

      expect(defaultProps.onRetry).toHaveBeenCalled();
    });

    it('should not render Try Again button when onRetry is not provided', () => {
      render(
        <CheckoutError
          {...defaultProps}
          onRetry={undefined}
        />
      );

      expect(
        screen.queryByRole('button', { name: /Try Again/i })
      ).not.toBeInTheDocument();
    });

    it('should render Go to Dashboard button', () => {
      render(<CheckoutError {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /Go to Dashboard/i })
      ).toBeInTheDocument();
    });

    it('should call onGoHome when Go to Dashboard is clicked', async () => {
      render(<CheckoutError {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Go to Dashboard/i })
      );

      expect(defaultProps.onGoHome).toHaveBeenCalled();
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should handle Error instance', () => {
      const error = new Error('Standard error message');
      render(<CheckoutError {...defaultProps} error={error} />);
      expect(screen.getByText('Standard error message')).toBeInTheDocument();
    });

    it('should prioritize response.data.message over error.message', () => {
      const error = {
        message: 'Generic message',
        response: {
          data: {
            message: 'Specific server error',
          },
        },
      };

      render(<CheckoutError {...defaultProps} error={error} />);
      expect(screen.getByText('Specific server error')).toBeInTheDocument();
      expect(screen.queryByText('Generic message')).not.toBeInTheDocument();
    });
  });
});

/**
 * Unit Tests for WaitlistFlow Component
 * Tests waitlist display, join action, success state, error handling
 */

import React from 'react';
import { render, screen, waitFor } from '../../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import WaitlistFlow from '../../checkout/WaitlistFlow';

describe('WaitlistFlow Component', () => {
  const mockClassData = {
    id: 'class-1',
    name: 'Soccer Basics',
    capacity: 20,
    current_enrollment: 20,
    waitlist_count: 3,
    start_date: '2025-02-01',
  };

  const defaultProps = {
    classData: mockClassData,
    childId: 'child-1',
    onJoinWaitlist: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<WaitlistFlow {...defaultProps} />);
      expect(
        screen.getByText('Class is Currently Full')
      ).toBeInTheDocument();
    });

    it('should display class name', () => {
      render(<WaitlistFlow {...defaultProps} />);
      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
    });

    it('should display waitlist count', () => {
      render(<WaitlistFlow {...defaultProps} />);
      expect(screen.getByText('3 students')).toBeInTheDocument();
    });

    it('should display capacity info', () => {
      render(<WaitlistFlow {...defaultProps} />);
      expect(screen.getByText('20/20')).toBeInTheDocument();
    });

    it('should display start date', () => {
      render(<WaitlistFlow {...defaultProps} />);
      expect(screen.getByText('Starts:')).toBeInTheDocument();
    });

    it('should render the Join Waitlist button', () => {
      render(<WaitlistFlow {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /Join Waitlist/i })
      ).toBeInTheDocument();
    });

    it('should render the Back to Classes button', () => {
      render(<WaitlistFlow {...defaultProps} />);
      expect(screen.getByText('Back to Classes')).toBeInTheDocument();
    });

    it('should display waitlist benefits', () => {
      render(<WaitlistFlow {...defaultProps} />);
      expect(screen.getByText(/Waitlist Benefits/)).toBeInTheDocument();
      expect(
        screen.getByText(/Automatic email notifications/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Priority enrollment/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/No payment required/)
      ).toBeInTheDocument();
    });

    it('should display the waiting message', () => {
      render(<WaitlistFlow {...defaultProps} />);
      expect(
        screen.getByText(/Don't worry! You can join the waitlist/)
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // WAITLIST COUNT DISPLAY
  // ===========================================
  describe('Waitlist Count Display', () => {
    it('should show singular "student" for count of 1', () => {
      render(
        <WaitlistFlow
          {...defaultProps}
          classData={{ ...mockClassData, waitlist_count: 1 }}
        />
      );
      expect(screen.getByText('1 student')).toBeInTheDocument();
    });

    it('should show plural "students" for count > 1', () => {
      render(<WaitlistFlow {...defaultProps} />);
      expect(screen.getByText('3 students')).toBeInTheDocument();
    });

    it('should not show waitlist count when undefined', () => {
      render(
        <WaitlistFlow
          {...defaultProps}
          classData={{ ...mockClassData, waitlist_count: undefined }}
        />
      );
      expect(screen.queryByText('Current Waitlist:')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // JOIN WAITLIST ACTION
  // ===========================================
  describe('Join Waitlist Action', () => {
    it('should call onJoinWaitlist when button is clicked', async () => {
      defaultProps.onJoinWaitlist.mockResolvedValueOnce(undefined);

      render(<WaitlistFlow {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Join Waitlist/i })
      );

      expect(defaultProps.onJoinWaitlist).toHaveBeenCalledWith(
        'class-1',
        'child-1'
      );
    });

    it('should show Joining Waitlist text during submission', async () => {
      let resolveJoin: (value: any) => void;
      defaultProps.onJoinWaitlist.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveJoin = resolve;
        })
      );

      render(<WaitlistFlow {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Join Waitlist/i })
      );

      expect(screen.getByText('Joining Waitlist...')).toBeInTheDocument();

      resolveJoin!(undefined);

      await waitFor(() => {
        expect(
          screen.queryByText('Joining Waitlist...')
        ).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // SUCCESS STATE
  // ===========================================
  describe('Success State', () => {
    it('should show success message after joining waitlist', async () => {
      defaultProps.onJoinWaitlist.mockResolvedValueOnce(undefined);

      render(<WaitlistFlow {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Join Waitlist/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText('Added to Waitlist!')
        ).toBeInTheDocument();
      });
    });

    it('should show what happens next section after joining', async () => {
      defaultProps.onJoinWaitlist.mockResolvedValueOnce(undefined);

      render(<WaitlistFlow {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Join Waitlist/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/What happens next\?/)
        ).toBeInTheDocument();
      });
    });

    it('should show Go to Dashboard button after joining', async () => {
      defaultProps.onJoinWaitlist.mockResolvedValueOnce(undefined);

      render(<WaitlistFlow {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Join Waitlist/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Go to Dashboard/i })
        ).toBeInTheDocument();
      });
    });

    it('should show email notification message after joining', async () => {
      defaultProps.onJoinWaitlist.mockResolvedValueOnce(undefined);

      render(<WaitlistFlow {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Join Waitlist/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/email notification when a spot becomes available/)
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING
  // ===========================================
  describe('Error Handling', () => {
    it('should display error when join fails', async () => {
      defaultProps.onJoinWaitlist.mockRejectedValueOnce(
        new Error('Server error')
      );

      render(<WaitlistFlow {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Join Waitlist/i })
      );

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });

    it('should display generic error when error has no message', async () => {
      defaultProps.onJoinWaitlist.mockRejectedValueOnce({});

      render(<WaitlistFlow {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Join Waitlist/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText('Failed to join waitlist. Please try again.')
        ).toBeInTheDocument();
      });
    });

    it('should show error when no child is selected', () => {
      render(
        <WaitlistFlow {...defaultProps} childId={null} />
      );

      // When no child is selected, the button is disabled and a warning message
      // is shown below the button (not via the error handler)
      expect(
        screen.getByText('Please select a child before joining the waitlist')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Join Waitlist/i })
      ).toBeDisabled();
    });
  });

  // ===========================================
  // NO CHILD SELECTED STATE
  // ===========================================
  describe('No Child Selected', () => {
    it('should disable the button when no child is selected', () => {
      render(
        <WaitlistFlow {...defaultProps} childId={null} />
      );

      const button = screen.getByRole('button', { name: /Join Waitlist/i });
      expect(button).toBeDisabled();
    });

    it('should show warning when no child is selected', () => {
      render(
        <WaitlistFlow {...defaultProps} childId={null} />
      );

      expect(
        screen.getByText('Please select a child before joining the waitlist')
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should handle missing class data gracefully', () => {
      render(
        <WaitlistFlow
          {...defaultProps}
          classData={null}
        />
      );

      expect(screen.getByText('Class Details')).toBeInTheDocument();
    });

    it('should handle missing capacity data', () => {
      render(
        <WaitlistFlow
          {...defaultProps}
          classData={{ ...mockClassData, capacity: null }}
        />
      );

      expect(screen.queryByText('Capacity:')).not.toBeInTheDocument();
    });

    it('should handle missing start date', () => {
      render(
        <WaitlistFlow
          {...defaultProps}
          classData={{ ...mockClassData, start_date: null }}
        />
      );

      expect(screen.queryByText('Starts:')).not.toBeInTheDocument();
    });
  });
});

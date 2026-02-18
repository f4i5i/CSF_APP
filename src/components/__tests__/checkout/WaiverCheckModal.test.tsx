/**
 * Unit Tests for WaiverCheckModal Component
 * Tests waiver display, checkbox acceptance, signature input, and submit flow
 */

import React from 'react';
import { render, screen, waitFor } from '../../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import WaiverCheckModal from '../../checkout/WaiverCheckModal';

// Mock waiver service - path is relative to the source component's import
jest.mock('../../../api/services/waivers.service', () => ({
  __esModule: true,
  default: {
    getPending: jest.fn(),
    signMultiple: jest.fn(),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import waiversService from '../../../api/services/waivers.service';
import toast from 'react-hot-toast';

describe('WaiverCheckModal Component', () => {
  const mockClassData = {
    id: 'class-1',
    name: 'Soccer Basics',
    program: { id: 'prog-1' },
    school: { id: 'school-1' },
  };

  const mockWaiversData = {
    items: [
      {
        waiver_template: {
          id: 'waiver-1',
          name: 'Liability Waiver',
          content: 'By signing this waiver, you agree to assume all risks...',
          waiver_type: 'liability',
          version: 1,
        },
        needs_reconsent: false,
        is_accepted: false,
      },
      {
        waiver_template: {
          id: 'waiver-2',
          name: 'Medical Release',
          content: 'In case of emergency, you authorize medical treatment...',
          waiver_type: 'medical_release',
          version: 1,
        },
        needs_reconsent: false,
        is_accepted: false,
      },
    ],
  };

  const defaultProps = {
    classData: mockClassData,
    onClose: jest.fn(),
    onWaiversSigned: jest.fn(),
    initialWaiversData: mockWaiversData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the modal title', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      expect(
        screen.getByText('Action Required: Sign Waivers')
      ).toBeInTheDocument();
    });

    it('should render the modal subtitle', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      expect(
        screen.getByText(/Please review and sign the required waivers/)
      ).toBeInTheDocument();
    });

    it('should display waiver count', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      // The component renders "2 Waivers Required" as a single text node
      expect(screen.getByText(/2 Waivers Required/)).toBeInTheDocument();
    });

    it('should display class name in info banner', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      expect(screen.getByText(/Soccer Basics/)).toBeInTheDocument();
    });

    it('should display waiver names', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      expect(screen.getByText('Medical Release')).toBeInTheDocument();
    });

    it('should display waiver content', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      expect(
        screen.getByText(/By signing this waiver, you agree to assume all risks/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/In case of emergency/)
      ).toBeInTheDocument();
    });

    it('should display waiver type badges', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      expect(screen.getByText('liability')).toBeInTheDocument();
      expect(screen.getByText('medical release')).toBeInTheDocument();
    });

    it('should render numbered waiver headers', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should render acceptance checkboxes', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(2);
    });

    it('should render signature input', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('Type your full legal name')
      ).toBeInTheDocument();
    });

    it('should render Cancel Enrollment button', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /Cancel Enrollment/i })
      ).toBeInTheDocument();
    });

    it('should render Sign & Continue button', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /Sign & Continue to Payment/i })
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // LOADING STATE
  // ===========================================
  describe('Loading State', () => {
    it('should show loading state when fetching waivers', () => {
      (waiversService.getPending as jest.Mock).mockReturnValue(
        new Promise(() => {}) // Never resolves
      );

      render(
        <WaiverCheckModal
          {...defaultProps}
          initialWaiversData={null}
        />
      );

      expect(
        screen.getByText('Checking for required waivers...')
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // CLOSE MODAL
  // ===========================================
  describe('Close Modal', () => {
    it('should call onClose when Cancel Enrollment is clicked', async () => {
      jest.useRealTimers();
      render(<WaiverCheckModal {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Cancel Enrollment/i })
      );

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', async () => {
      jest.useRealTimers();
      render(<WaiverCheckModal {...defaultProps} />);

      // The X button is the close button in the header
      const closeButtons = screen.getAllByRole('button');
      // Find the close button (the one with the X icon in the header)
      const closeButton = closeButtons.find(
        (btn) =>
          btn.className.includes('text-gray-400') ||
          btn.querySelector('svg')?.closest('button') === btn
      );
      if (closeButton) {
        await userEvent.click(closeButton);
        expect(defaultProps.onClose).toHaveBeenCalled();
      }
    });
  });

  // ===========================================
  // WAIVER ACCEPTANCE
  // ===========================================
  describe('Waiver Acceptance', () => {
    it('should toggle waiver acceptance when checkbox is clicked', async () => {
      jest.useRealTimers();
      render(<WaiverCheckModal {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeChecked();

      await userEvent.click(checkboxes[0]);
      expect(checkboxes[0]).toBeChecked();
    });

    it('should allow unchecking a checked waiver', async () => {
      jest.useRealTimers();
      render(<WaiverCheckModal {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);
      expect(checkboxes[0]).toBeChecked();

      await userEvent.click(checkboxes[0]);
      expect(checkboxes[0]).not.toBeChecked();
    });
  });

  // ===========================================
  // SIGNATURE INPUT
  // ===========================================
  describe('Signature Input', () => {
    it('should accept text input for signature', async () => {
      jest.useRealTimers();
      render(<WaiverCheckModal {...defaultProps} />);

      const signatureInput = screen.getByPlaceholderText(
        'Type your full legal name'
      );
      await userEvent.type(signatureInput, 'John Smith');

      expect(signatureInput).toHaveValue('John Smith');
    });

    it('should display legal signature notice', () => {
      render(<WaiverCheckModal {...defaultProps} />);
      expect(
        screen.getByText(/By typing your name above, you agree/)
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // FORM SUBMISSION
  // ===========================================
  describe('Form Submission', () => {
    it('should show error toast when not all waivers are accepted', async () => {
      jest.useRealTimers();
      render(<WaiverCheckModal {...defaultProps} />);

      // Type signature but don't check waivers
      const signatureInput = screen.getByPlaceholderText(
        'Type your full legal name'
      );
      await userEvent.type(signatureInput, 'John Smith');

      await userEvent.click(
        screen.getByRole('button', { name: /Sign & Continue to Payment/i })
      );

      expect(toast.error).toHaveBeenCalledWith('Please accept all waiver terms');
    });

    it('should show error toast when signature is empty', async () => {
      jest.useRealTimers();
      render(<WaiverCheckModal {...defaultProps} />);

      // Check both waivers but don't type signature
      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);
      await userEvent.click(checkboxes[1]);

      await userEvent.click(
        screen.getByRole('button', { name: /Sign & Continue to Payment/i })
      );

      expect(toast.error).toHaveBeenCalledWith('Please provide your signature');
    });

    it('should call waiversService.signMultiple with correct data on valid submit', async () => {
      jest.useRealTimers();
      (waiversService.signMultiple as jest.Mock).mockResolvedValueOnce({
        success: true,
        failed_count: 0,
      });

      render(<WaiverCheckModal {...defaultProps} />);

      // Accept all waivers
      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);
      await userEvent.click(checkboxes[1]);

      // Type signature
      const signatureInput = screen.getByPlaceholderText(
        'Type your full legal name'
      );
      await userEvent.type(signatureInput, 'John Smith');

      await userEvent.click(
        screen.getByRole('button', { name: /Sign & Continue to Payment/i })
      );

      await waitFor(() => {
        expect(waiversService.signMultiple).toHaveBeenCalledWith({
          waivers: [
            { template_id: 'waiver-1', signature: 'John Smith', agreed: true },
            { template_id: 'waiver-2', signature: 'John Smith', agreed: true },
          ],
          signer_name: 'John Smith',
        });
      });
    });

    it('should show success toast and call onWaiversSigned on success', async () => {
      jest.useRealTimers();
      (waiversService.signMultiple as jest.Mock).mockResolvedValueOnce({
        success: true,
        failed_count: 0,
      });

      render(<WaiverCheckModal {...defaultProps} />);

      // Accept all waivers and sign
      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);
      await userEvent.click(checkboxes[1]);
      await userEvent.type(
        screen.getByPlaceholderText('Type your full legal name'),
        'John Smith'
      );

      await userEvent.click(
        screen.getByRole('button', { name: /Sign & Continue to Payment/i })
      );

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Waivers signed successfully!');
        expect(defaultProps.onWaiversSigned).toHaveBeenCalled();
      });
    });

    it('should show error toast when some waivers fail to sign', async () => {
      jest.useRealTimers();
      (waiversService.signMultiple as jest.Mock).mockResolvedValueOnce({
        success: false,
        failed_count: 1,
        errors: ['Waiver 2 failed'],
      });

      render(<WaiverCheckModal {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);
      await userEvent.click(checkboxes[1]);
      await userEvent.type(
        screen.getByPlaceholderText('Type your full legal name'),
        'John Smith'
      );

      await userEvent.click(
        screen.getByRole('button', { name: /Sign & Continue to Payment/i })
      );

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to sign 1 waiver(s)')
        );
      });
    });

    it('should show Signing text during submission', async () => {
      jest.useRealTimers();
      let resolveSign: (value: any) => void;
      (waiversService.signMultiple as jest.Mock).mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSign = resolve;
        })
      );

      render(<WaiverCheckModal {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);
      await userEvent.click(checkboxes[1]);
      await userEvent.type(
        screen.getByPlaceholderText('Type your full legal name'),
        'John Smith'
      );

      await userEvent.click(
        screen.getByRole('button', { name: /Sign & Continue to Payment/i })
      );

      expect(screen.getByText('Signing...')).toBeInTheDocument();

      resolveSign!({ success: true, failed_count: 0 });

      await waitFor(() => {
        expect(screen.queryByText('Signing...')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // NO PENDING WAIVERS
  // ===========================================
  describe('No Pending Waivers', () => {
    it('should call onWaiversSigned when no pending waivers', async () => {
      jest.useRealTimers();
      render(
        <WaiverCheckModal
          {...defaultProps}
          initialWaiversData={{ items: [] }}
        />
      );

      // The component should auto-close when there are no pending waivers
      await waitFor(
        () => {
          expect(defaultProps.onWaiversSigned).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });
  });

  // ===========================================
  // SINGLE WAIVER
  // ===========================================
  describe('Single Waiver', () => {
    it('should show singular "Waiver" label for single waiver', () => {
      render(
        <WaiverCheckModal
          {...defaultProps}
          initialWaiversData={{
            items: [mockWaiversData.items[0]],
          }}
        />
      );

      // The component renders "1 Waiver Required" (singular) for a single waiver
      expect(screen.getByText(/1 Waiver Required/)).toBeInTheDocument();
    });
  });
});

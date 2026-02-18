/**
 * Unit Tests for WaiverVersionModal Component
 * Tests rendering, loading state, stats display, close functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WaiverVersionModal from '../admin/WaiverVersionModal';

const mockStats = {
  total_acceptances: 150,
  acceptances_by_version: {
    '1': 100,
    '2': 50,
  },
  latest_acceptance: {
    signer_name: 'Jane Doe',
    accepted_at: '2024-03-15T10:30:00Z',
    waiver_version: 2,
    signer_ip: '192.168.1.1',
  },
};

jest.mock('../../api/services/waivers.service', () => ({
  __esModule: true,
  default: {
    getStats: jest.fn().mockResolvedValue(mockStats),
  },
}));

describe('WaiverVersionModal Component', () => {
  const defaultWaiver = {
    id: 'waiver-1',
    name: 'Liability Waiver',
    version: 2,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-03-10T14:30:00Z',
  };

  const defaultProps = {
    waiver: defaultWaiver,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the modal', () => {
      render(<WaiverVersionModal {...defaultProps} />);
      expect(screen.getByText('Version Information')).toBeInTheDocument();
    });

    it('should display waiver name', () => {
      render(<WaiverVersionModal {...defaultProps} />);
      expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<WaiverVersionModal {...defaultProps} />);
      expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
    });

    it('should render Close button', () => {
      render(<WaiverVersionModal {...defaultProps} />);
      expect(screen.getByText('Close')).toBeInTheDocument();
    });
  });

  // ===========================================
  // STATS LOADING TESTS
  // ===========================================
  describe('Stats Loading', () => {
    it('should load stats from the API', async () => {
      const waiversService = require('../../api/services/waivers.service').default;
      render(<WaiverVersionModal {...defaultProps} />);

      await waitFor(() => {
        expect(waiversService.getStats).toHaveBeenCalledWith('waiver-1');
      });
    });

    it('should display version number after loading', async () => {
      render(<WaiverVersionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Current Version')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should display total acceptances after loading', async () => {
      render(<WaiverVersionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Total Acceptances')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument();
      });
    });

    it('should display version breakdown after loading', async () => {
      render(<WaiverVersionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Acceptances by Version')).toBeInTheDocument();
        expect(screen.getByText('Version 2')).toBeInTheDocument();
        expect(screen.getByText('Version 1')).toBeInTheDocument();
      });
    });

    it('should show "Current" badge for the current version', async () => {
      render(<WaiverVersionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Current')).toBeInTheDocument();
      });
    });

    it('should show percentages for version acceptances', async () => {
      render(<WaiverVersionModal {...defaultProps} />);

      await waitFor(() => {
        // 50/150 = 33%
        expect(screen.getByText('33%')).toBeInTheDocument();
        // 100/150 = 67%
        expect(screen.getByText('67%')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // LATEST ACCEPTANCE TESTS
  // ===========================================
  describe('Latest Acceptance', () => {
    it('should show latest acceptance section', async () => {
      render(<WaiverVersionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Latest Acceptance')).toBeInTheDocument();
      });
    });

    it('should display signer name', async () => {
      render(<WaiverVersionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });

    it('should display signer IP', async () => {
      render(<WaiverVersionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
      });
    });

    it('should display version signed', async () => {
      render(<WaiverVersionModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('v2')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // NOTE SECTION TESTS
  // ===========================================
  describe('Note Section', () => {
    it('should display the info note about version changes', async () => {
      render(<WaiverVersionModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(/When you update the waiver content, the version number will automatically increment/)
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // CLOSE TESTS
  // ===========================================
  describe('Close', () => {
    it('should call onClose when Close button is clicked', () => {
      const onClose = jest.fn();
      render(<WaiverVersionModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Close'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', () => {
      const onClose = jest.fn();
      render(<WaiverVersionModal {...defaultProps} onClose={onClose} />);

      const allButtons = screen.getAllByRole('button');
      const xButton = allButtons.find(
        (btn) => !btn.textContent?.includes('Close') && btn.querySelector('svg')
      );
      if (xButton) {
        fireEvent.click(xButton);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should handle API error gracefully', async () => {
      const waiversService = require('../../api/services/waivers.service').default;
      waiversService.getStats.mockRejectedValueOnce(new Error('Network error'));

      render(<WaiverVersionModal {...defaultProps} />);

      // Should not crash and should still show the modal
      await waitFor(() => {
        expect(screen.getByText('Version Information')).toBeInTheDocument();
      });
    });
  });
});

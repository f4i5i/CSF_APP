import React from 'react';
import { render, screen, waitFor } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import MembershipList from '../payment/MembershipList';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../api/services/enrollment.service', () => ({
  enrollmentService: {
    getMy: jest.fn(),
    cancel: jest.fn(),
    getCancellationPreview: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  },
}));

jest.mock('../../utils/format', () => ({
  formatCurrency: (val) => `$${Number(val || 0).toFixed(2)}`,
  formatDate: (val) => {
    if (!val) return '';
    return new Date(val).toLocaleDateString('en-US');
  },
}));

const { enrollmentService } = require('../../api/services/enrollment.service');

describe('MembershipList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    enrollmentService.getMy.mockReturnValue(new Promise(() => {}));
    const { container } = render(<MembershipList />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    enrollmentService.getMy.mockRejectedValue(new Error('Network error'));
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load memberships')).toBeInTheDocument();
    });
  });

  it('renders Try Again button on error', async () => {
    enrollmentService.getMy.mockRejectedValue(new Error('Fail'));
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('renders empty state', async () => {
    enrollmentService.getMy.mockResolvedValue([]);
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('No active memberships found')).toBeInTheDocument();
    });
  });

  it('renders Active Memberships heading', async () => {
    enrollmentService.getMy.mockResolvedValue([
      {
        id: 1,
        child_id: 1,
        child_name: 'John Doe',
        class_name: 'Soccer 101',
        status: 'ACTIVE',
        final_price: 100,
        enrolled_at: '2026-01-01',
      },
    ]);
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('Active Memberships')).toBeInTheDocument();
    });
  });

  it('renders child name', async () => {
    enrollmentService.getMy.mockResolvedValue([
      {
        id: 1,
        child_id: 1,
        child_name: 'Jane Smith',
        class_name: 'Basketball',
        status: 'ACTIVE',
        final_price: 150,
        enrolled_at: '2026-01-01',
      },
    ]);
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('renders class name', async () => {
    enrollmentService.getMy.mockResolvedValue([
      {
        id: 1,
        child_id: 1,
        child_name: 'Test Child',
        class_name: 'Yoga Class',
        status: 'ACTIVE',
        final_price: 80,
        enrolled_at: '2026-01-01',
      },
    ]);
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('Yoga Class')).toBeInTheDocument();
    });
  });

  it('renders status badge', async () => {
    enrollmentService.getMy.mockResolvedValue([
      {
        id: 1,
        child_id: 1,
        child_name: 'Kid',
        class_name: 'Class',
        status: 'ACTIVE',
        final_price: 100,
        enrolled_at: '2026-01-01',
      },
    ]);
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('renders Cancel button for active enrollment', async () => {
    enrollmentService.getMy.mockResolvedValue([
      {
        id: 1,
        child_id: 1,
        child_name: 'Kid',
        class_name: 'Class',
        status: 'ACTIVE',
        final_price: 100,
        enrolled_at: '2026-01-01',
      },
    ]);
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('renders Pause button for active enrollment', async () => {
    enrollmentService.getMy.mockResolvedValue([
      {
        id: 1,
        child_id: 1,
        child_name: 'Kid',
        class_name: 'Class',
        status: 'ACTIVE',
        final_price: 100,
        enrolled_at: '2026-01-01',
      },
    ]);
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });
  });

  it('renders Resume button for paused enrollment', async () => {
    enrollmentService.getMy.mockResolvedValue([
      {
        id: 1,
        child_id: 1,
        child_name: 'Kid',
        class_name: 'Class',
        status: 'PAUSED',
        final_price: 100,
        enrolled_at: '2026-01-01',
      },
    ]);
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('Resume')).toBeInTheDocument();
    });
  });

  it('renders total summary', async () => {
    enrollmentService.getMy.mockResolvedValue([
      {
        id: 1,
        child_id: 1,
        child_name: 'Kid',
        class_name: 'Class',
        status: 'ACTIVE',
        final_price: 100,
        enrolled_at: '2026-01-01',
      },
    ]);
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('Total Active Memberships')).toBeInTheDocument();
      expect(screen.getByText('Total Monthly Cost')).toBeInTheDocument();
    });
  });

  it('handles items response format', async () => {
    enrollmentService.getMy.mockResolvedValue({
      items: [
        {
          id: 1,
          child_id: 1,
          child_name: 'Kid',
          class_name: 'Class',
          status: 'ACTIVE',
          final_price: 100,
          enrolled_at: '2026-01-01',
        },
      ],
    });
    render(<MembershipList />);
    await waitFor(() => {
      expect(screen.getByText('Active Memberships')).toBeInTheDocument();
      expect(screen.getByText('Kid')).toBeInTheDocument();
    });
  });
});

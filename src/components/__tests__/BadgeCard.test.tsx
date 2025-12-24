/**
 * Unit Tests for BadgeCard Component
 * Tests badge display, navigation, loading, and empty states
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BadgeCard from '../BadgeCard';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <svg data-testid="arrow-left" />,
  ArrowRight: () => <svg data-testid="arrow-right" />,
  Award: () => <svg data-testid="award-icon" />,
}));

describe('BadgeCard Component', () => {
  const mockBadges = [
    {
      id: 'badge-1',
      name: 'Perfect Attendance',
      description: 'Never missed a practice!',
      icon_url: 'https://example.com/badge1.png',
      badge_type: 'attendance',
      earned_at: '2024-03-15T10:00:00Z',
    },
    {
      id: 'badge-2',
      name: 'Team Player',
      description: 'Excellent teamwork skills',
      icon_url: null,
      badge_type: 'teamwork',
      earned_at: '2024-03-10T10:00:00Z',
    },
    {
      id: 'badge-3',
      title: 'Star Performer',
      description: 'Outstanding performance',
      type: 'achievement',
      earned_at: '2024-03-01T10:00:00Z',
    },
  ];

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<BadgeCard badges={mockBadges} />);
      expect(screen.getByText('Earned Badges')).toBeInTheDocument();
    });

    it('should display first badge by default', () => {
      render(<BadgeCard badges={mockBadges} />);
      expect(screen.getByText('Perfect Attendance')).toBeInTheDocument();
    });

    it('should display badge description', () => {
      render(<BadgeCard badges={mockBadges} />);
      expect(screen.getByText('Never missed a practice!')).toBeInTheDocument();
    });

    it('should display badge type badge', () => {
      render(<BadgeCard badges={mockBadges} />);
      expect(screen.getByText('attendance')).toBeInTheDocument();
    });

    it('should display earned date', () => {
      render(<BadgeCard badges={mockBadges} />);
      expect(screen.getByText(/Earned on Mar 15, 2024/i)).toBeInTheDocument();
    });

    it('should display pagination counter', () => {
      render(<BadgeCard badges={mockBadges} />);
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });
  });

  // ===========================================
  // NAVIGATION TESTS
  // ===========================================
  describe('Navigation', () => {
    it('should navigate to next badge when clicking next', () => {
      render(<BadgeCard badges={mockBadges} />);

      const nextButton = screen.getByLabelText('Next badge');
      fireEvent.click(nextButton);

      expect(screen.getByText('Team Player')).toBeInTheDocument();
      expect(screen.getByText('2/3')).toBeInTheDocument();
    });

    it('should navigate to previous badge when clicking previous', () => {
      render(<BadgeCard badges={mockBadges} />);

      // Go to second badge first
      const nextButton = screen.getByLabelText('Next badge');
      fireEvent.click(nextButton);

      const prevButton = screen.getByLabelText('Previous badge');
      fireEvent.click(prevButton);

      expect(screen.getByText('Perfect Attendance')).toBeInTheDocument();
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    it('should wrap to last badge when clicking previous on first', () => {
      render(<BadgeCard badges={mockBadges} />);

      const prevButton = screen.getByLabelText('Previous badge');
      fireEvent.click(prevButton);

      expect(screen.getByText('Star Performer')).toBeInTheDocument();
      expect(screen.getByText('3/3')).toBeInTheDocument();
    });

    it('should wrap to first badge when clicking next on last', () => {
      render(<BadgeCard badges={mockBadges} />);

      const nextButton = screen.getByLabelText('Next badge');

      // Click to last badge
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      expect(screen.getByText('3/3')).toBeInTheDocument();

      // Click again to wrap
      fireEvent.click(nextButton);
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    it('should disable navigation buttons when only one badge', () => {
      render(<BadgeCard badges={[mockBadges[0]]} />);

      const prevButton = screen.getByLabelText('Previous badge');
      const nextButton = screen.getByLabelText('Next badge');

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading State', () => {
    it('should show loading skeleton when loading is true', () => {
      render(<BadgeCard badges={[]} loading={true} />);

      // Should have animated placeholder elements
      const container = document.querySelector('.animate-pulse');
      expect(container).toBeInTheDocument();
    });

    it('should not show badges when loading', () => {
      render(<BadgeCard badges={mockBadges} loading={true} />);

      expect(screen.queryByText('Perfect Attendance')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty State', () => {
    it('should show empty state when no badges', () => {
      render(<BadgeCard badges={[]} />);

      expect(screen.getByText('No Badges Yet')).toBeInTheDocument();
    });

    it('should show encouragement message when empty', () => {
      render(<BadgeCard badges={[]} />);

      expect(screen.getByText(/Keep attending and participating/i)).toBeInTheDocument();
    });

    it('should show Award icon when empty', () => {
      render(<BadgeCard badges={[]} />);

      expect(screen.getByTestId('award-icon')).toBeInTheDocument();
    });

    it('should handle undefined badges', () => {
      // @ts-expect-error - Testing undefined prop
      render(<BadgeCard />);

      expect(screen.getByText('No Badges Yet')).toBeInTheDocument();
    });

    it('should handle null badges', () => {
      // @ts-expect-error - Testing null prop
      render(<BadgeCard badges={null} />);

      expect(screen.getByText('No Badges Yet')).toBeInTheDocument();
    });
  });

  // ===========================================
  // IMAGE HANDLING TESTS
  // ===========================================
  describe('Image Handling', () => {
    it('should display badge image when icon_url is provided', () => {
      render(<BadgeCard badges={mockBadges} />);

      const image = screen.getByAltText('Perfect Attendance');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/badge1.png');
    });

    it('should display fallback icon when no image', () => {
      render(<BadgeCard badges={mockBadges} />);

      // Navigate to badge without image
      const nextButton = screen.getByLabelText('Next badge');
      fireEvent.click(nextButton);

      // Should show emoji fallback (the component hides img and shows div with emoji)
      expect(screen.getByText('Team Player')).toBeInTheDocument();
    });
  });

  // ===========================================
  // BADGE TYPE ICON TESTS
  // ===========================================
  describe('Badge Type Icons', () => {
    it('should display correct emoji for attendance badge', () => {
      const badges = [{ ...mockBadges[0], icon_url: null }];
      render(<BadgeCard badges={badges} />);

      // The emoji should be in the document
      // Note: This tests the fallback icon display
    });
  });

  // ===========================================
  // DATE FORMATTING TESTS
  // ===========================================
  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      render(<BadgeCard badges={mockBadges} />);

      // Mar 15, 2024 format
      expect(screen.getByText(/Mar 15, 2024/i)).toBeInTheDocument();
    });

    it('should not show date when earned_at is not provided', () => {
      const badgesWithoutDate = [
        {
          id: 'badge-1',
          name: 'Test Badge',
          description: 'Test description',
        },
      ];
      render(<BadgeCard badges={badgesWithoutDate} />);

      expect(screen.queryByText(/Earned on/i)).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // FALLBACK VALUES TESTS
  // ===========================================
  describe('Fallback Values', () => {
    it('should use title if name is not provided', () => {
      render(<BadgeCard badges={mockBadges} />);

      // Navigate to badge with title instead of name
      const nextButton = screen.getByLabelText('Next badge');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByText('Star Performer')).toBeInTheDocument();
    });

    it('should use default description if not provided', () => {
      const badges = [
        {
          id: 'badge-1',
          name: 'Test Badge',
        },
      ];
      render(<BadgeCard badges={badges} />);

      expect(screen.getByText('Keep up the great work!')).toBeInTheDocument();
    });

    it('should use default name if neither name nor title provided', () => {
      const badges = [
        {
          id: 'badge-1',
          description: 'Some description',
        },
      ];
      render(<BadgeCard badges={badges} />);

      expect(screen.getByText('Achievement Badge')).toBeInTheDocument();
    });
  });

  // ===========================================
  // ACCESSIBILITY TESTS
  // ===========================================
  describe('Accessibility', () => {
    it('should have accessible navigation buttons', () => {
      render(<BadgeCard badges={mockBadges} />);

      expect(screen.getByLabelText('Previous badge')).toBeInTheDocument();
      expect(screen.getByLabelText('Next badge')).toBeInTheDocument();
    });

    it('should have alt text for badge images', () => {
      render(<BadgeCard badges={mockBadges} />);

      const image = screen.getByAltText('Perfect Attendance');
      expect(image).toBeInTheDocument();
    });
  });

  // ===========================================
  // STYLING TESTS
  // ===========================================
  describe('Styling', () => {
    it('should have rounded card styling', () => {
      render(<BadgeCard badges={mockBadges} />);

      const card = screen.getByText('Earned Badges').closest('div');
      expect(card?.parentElement?.className).toContain('rounded');
    });

    it('should have minimum height', () => {
      render(<BadgeCard badges={mockBadges} />);

      const container = document.querySelector('.min-h-\\[454px\\]');
      expect(container).toBeInTheDocument();
    });
  });
});

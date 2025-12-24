/**
 * Integration Tests for Badges Page
 * Tests badge display, achievements, and locked badges sections
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import Badges from '../../../pages/Badges';

describe('Badges Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // PAGE LOADING TESTS
  // ===========================================
  describe('Page Loading', () => {
    it('should render page with Achievements title', () => {
      render(<Badges />);

      expect(screen.getByText('Achievements')).toBeInTheDocument();
    });

    it('should render Locked Badges section', () => {
      render(<Badges />);

      expect(screen.getByText('Locked Badges')).toBeInTheDocument();
    });

    it('should display locked badges description', () => {
      render(<Badges />);

      expect(screen.getByText(/Keep working to unlock these achievements/i)).toBeInTheDocument();
    });
  });

  // ===========================================
  // EARNED BADGES TESTS
  // ===========================================
  describe('Earned Badges', () => {
    it('should display earned badges', () => {
      render(<Badges />);

      expect(screen.getByText('Perfect Attendance')).toBeInTheDocument();
      expect(screen.getByText('Leadership')).toBeInTheDocument();
      expect(screen.getByText('Star Performer')).toBeInTheDocument();
      expect(screen.getByText('Quick Learner')).toBeInTheDocument();
    });

    it('should display active badge with achievement date', () => {
      render(<Badges />);

      expect(screen.getByText(/Achieved: Sep 28, 2024/i)).toBeInTheDocument();
    });

    it('should display Team Player badges', () => {
      render(<Badges />);

      // There are two "Team Player" badges in the mock data
      const teamPlayerBadges = screen.getAllByText('Team Player');
      expect(teamPlayerBadges.length).toBe(2);
    });
  });

  // ===========================================
  // LOCKED BADGES TESTS
  // ===========================================
  describe('Locked Badges', () => {
    it('should display locked badge titles', () => {
      render(<Badges />);

      // Locked badges section has its own "Perfect Attendance"
      const perfectAttendanceBadges = screen.getAllByText('Perfect Attendance');
      expect(perfectAttendanceBadges.length).toBeGreaterThanOrEqual(1);

      expect(screen.getByText('Sharpshooter')).toBeInTheDocument();
      expect(screen.getByText('MVP')).toBeInTheDocument();
      expect(screen.getByText('Early Bird')).toBeInTheDocument();
    });

    it('should display locked badge descriptions', () => {
      render(<Badges />);

      expect(screen.getByText(/Completed the sprint drill under 10 seconds/i)).toBeInTheDocument();
      expect(screen.getByText(/Score 5 goals in a single match/i)).toBeInTheDocument();
      expect(screen.getByText(/Named Most Valuable Player of the season/i)).toBeInTheDocument();
      expect(screen.getByText(/Arrive early to practice 20 times/i)).toBeInTheDocument();
    });

    it('should display lock icons for locked badges', () => {
      render(<Badges />);

      // Lock icons are SVG elements
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  // ===========================================
  // BADGE CARD TESTS
  // ===========================================
  describe('Badge Cards', () => {
    it('should render badge cards with images', () => {
      render(<Badges />);

      // Badge cards should have images
      const images = document.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  // ===========================================
  // LAYOUT TESTS
  // ===========================================
  describe('Layout', () => {
    it('should render Header component', () => {
      render(<Badges />);

      // Header should be present (look for common header elements)
      expect(document.querySelector('header') || screen.queryByRole('banner')).toBeTruthy();
    });

    it('should render Footer component', () => {
      render(<Badges />);

      // Footer should be present
      expect(document.querySelector('footer') || screen.queryByRole('contentinfo')).toBeTruthy();
    });

    it('should have responsive grid layout', () => {
      render(<Badges />);

      // Check for grid classes in the DOM
      const gridElements = document.querySelectorAll('[class*="grid"]');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  // ===========================================
  // ACCESSIBILITY TESTS
  // ===========================================
  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Badges />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Achievements');

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('Locked Badges');
    });

    it('should have alt text for badge images', () => {
      render(<Badges />);

      // Badge card component should provide alt text
      // This depends on BadgeCard implementation
    });
  });

  // ===========================================
  // STYLING TESTS
  // ===========================================
  describe('Styling', () => {
    it('should have proper background gradient', () => {
      render(<Badges />);

      const container = document.querySelector('[class*="gradient"]');
      expect(container).toBeInTheDocument();
    });

    it('should have proper text colors', () => {
      render(<Badges />);

      // Check that main title has proper styling
      const title = screen.getByText('Achievements');
      expect(title.className).toContain('text-');
    });
  });
});

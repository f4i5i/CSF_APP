/**
 * Integration Tests for Gallery Page
 * Tests photo gallery display and layout
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import Gallery from '../../../pages/Gallery';

describe('Gallery Page Integration Tests', () => {
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
    it('should render page with Photo Gallery title', () => {
      render(<Gallery />);

      expect(screen.getByText('Photo Gallery')).toBeInTheDocument();
    });

    it('should render Header component', () => {
      render(<Gallery />);

      // Header should be present
      expect(document.querySelector('header') || screen.queryByRole('banner')).toBeTruthy();
    });

    it('should render Footer component', () => {
      render(<Gallery />);

      // Footer should be present
      expect(document.querySelector('footer') || screen.queryByRole('contentinfo')).toBeTruthy();
    });
  });

  // ===========================================
  // GALLERY IMAGES TESTS
  // ===========================================
  describe('Gallery Images', () => {
    it('should display gallery images', () => {
      render(<Gallery />);

      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should have multiple images in gallery', () => {
      render(<Gallery />);

      // The gallery has 9 images (3 per column, 3 columns)
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(9);
    });

    it('should have proper image styling', () => {
      render(<Gallery />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img.className).toContain('rounded-xl');
        expect(img.className).toContain('object-cover');
      });
    });
  });

  // ===========================================
  // LAYOUT TESTS
  // ===========================================
  describe('Layout', () => {
    it('should have grid layout', () => {
      render(<Gallery />);

      const grid = document.querySelector('[class*="grid-cols-3"]');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive grid classes', () => {
      render(<Gallery />);

      const grid = document.querySelector('[class*="max-sm:grid-cols-1"]');
      expect(grid).toBeInTheDocument();
    });

    it('should have three columns on desktop', () => {
      render(<Gallery />);

      // Check for flex-col divs inside grid (columns)
      const columns = document.querySelectorAll('.grid > .flex.flex-col');
      expect(columns.length).toBe(3);
    });

    it('should have proper gap between images', () => {
      render(<Gallery />);

      const grid = document.querySelector('[class*="gap-4"]');
      expect(grid).toBeInTheDocument();
    });
  });

  // ===========================================
  // BACKGROUND AND STYLING TESTS
  // ===========================================
  describe('Styling', () => {
    it('should have proper background gradient', () => {
      render(<Gallery />);

      const container = document.querySelector('[class*="gradient"]');
      expect(container).toBeInTheDocument();
    });

    it('should have proper title styling', () => {
      render(<Gallery />);

      const title = screen.getByText('Photo Gallery');
      expect(title.className).toContain('font-bold');
      expect(title.className).toContain('text-');
    });

    it('should have proper container padding', () => {
      render(<Gallery />);

      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main?.className).toContain('py-8');
    });
  });

  // ===========================================
  // ACCESSIBILITY TESTS
  // ===========================================
  describe('Accessibility', () => {
    it('should have proper heading', () => {
      render(<Gallery />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Photo Gallery');
    });

    it('should have main content area', () => {
      render(<Gallery />);

      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
    });
  });

  // ===========================================
  // IMAGE SOURCE TESTS
  // ===========================================
  describe('Image Sources', () => {
    it('should have valid src attributes on images', () => {
      render(<Gallery />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('src');
        // Src should be a non-empty string
        const src = img.getAttribute('src');
        expect(src).toBeTruthy();
      });
    });
  });

  // ===========================================
  // RESPONSIVE TESTS
  // ===========================================
  describe('Responsive Design', () => {
    it('should have mobile-specific classes', () => {
      render(<Gallery />);

      // Check for max-sm classes
      const mobileClasses = document.querySelector('[class*="max-sm"]');
      expect(mobileClasses).toBeInTheDocument();
    });
  });
});

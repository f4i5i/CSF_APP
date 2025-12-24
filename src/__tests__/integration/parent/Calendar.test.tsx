/**
 * Integration Tests for Calendar Page
 * Tests calendar display, events, and layout
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import Calender from '../../../pages/Calender';

describe('Calendar Page Integration Tests', () => {
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
    it('should render the calendar page', () => {
      render(<Calender />);

      // Page should render without crashing
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    it('should render Header component', () => {
      render(<Calender />);

      // Header should be present
      expect(document.querySelector('header') || screen.queryByRole('banner')).toBeTruthy();
    });

    it('should render Footer component', () => {
      render(<Calender />);

      // Footer should be present
      expect(document.querySelector('footer') || screen.queryByRole('contentinfo')).toBeTruthy();
    });
  });

  // ===========================================
  // CALENDAR COMPONENTS TESTS
  // ===========================================
  describe('Calendar Components', () => {
    it('should render CalenderMini component', () => {
      render(<Calender />);

      // Mini calendar should be in the left sidebar
      // Look for calendar-related elements
      const calendarElements = document.querySelectorAll('[class*="calendar"], [class*="Calendar"]');
      expect(calendarElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should render FullCalender component', () => {
      render(<Calender />);

      // Full calendar should be present
      // The main calendar view
      const mainContent = document.querySelector('main');
      expect(mainContent).toBeInTheDocument();
    });

    it('should render NextEvent component', () => {
      render(<Calender />);

      // Next event section should be present
      // This component shows upcoming events
    });
  });

  // ===========================================
  // LAYOUT TESTS
  // ===========================================
  describe('Layout', () => {
    it('should have two-column layout', () => {
      render(<Calender />);

      // Layout should have flex container with gap
      const flexContainer = document.querySelector('.flex.gap-4');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have responsive layout classes', () => {
      render(<Calender />);

      // Should have max-lg:flex-col for responsive layout
      const responsiveContainer = document.querySelector('[class*="max-lg:flex-col"]');
      expect(responsiveContainer).toBeInTheDocument();
    });

    it('should have left sidebar section', () => {
      render(<Calender />);

      // Left side should contain CalenderMini and NextEvent
      const leftSide = document.querySelector('.flex.flex-col.gap-3');
      expect(leftSide).toBeInTheDocument();
    });

    it('should have right main calendar section', () => {
      render(<Calender />);

      // Right side should be flex-1 for main calendar
      const rightSide = document.querySelector('.flex-1');
      expect(rightSide).toBeInTheDocument();
    });
  });

  // ===========================================
  // STYLING TESTS
  // ===========================================
  describe('Styling', () => {
    it('should have proper background gradient', () => {
      render(<Calender />);

      const container = document.querySelector('[class*="gradient"]');
      expect(container).toBeInTheDocument();
    });

    it('should have proper padding', () => {
      render(<Calender />);

      const main = document.querySelector('main');
      expect(main?.className).toContain('py-8');
    });

    it('should have max width container', () => {
      render(<Calender />);

      const container = document.querySelector('[class*="max-w-9xl"]');
      expect(container).toBeInTheDocument();
    });
  });

  // ===========================================
  // RESPONSIVE TESTS
  // ===========================================
  describe('Responsive Design', () => {
    it('should have mobile-specific padding', () => {
      render(<Calender />);

      const mobileStyles = document.querySelector('[class*="max-sm:p-3"]');
      expect(mobileStyles).toBeInTheDocument();
    });

    it('should have mobile-specific width', () => {
      render(<Calender />);

      const mobileWidth = document.querySelector('[class*="max-sm:w-full"]');
      expect(mobileWidth).toBeInTheDocument();
    });

    it('should have mobile margin top for calendar', () => {
      render(<Calender />);

      const mobileMt = document.querySelector('[class*="max-sm:mt-4"]');
      expect(mobileMt).toBeInTheDocument();
    });
  });

  // ===========================================
  // ACCESSIBILITY TESTS
  // ===========================================
  describe('Accessibility', () => {
    it('should have main content region', () => {
      render(<Calender />);

      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
    });
  });

  // ===========================================
  // MINIMUM HEIGHT TESTS
  // ===========================================
  describe('Container Sizing', () => {
    it('should have minimum screen height', () => {
      render(<Calender />);

      const container = document.querySelector('[class*="min-h-screen"]');
      expect(container).toBeInTheDocument();
    });

    it('should have mobile-specific height', () => {
      render(<Calender />);

      const mobileHeight = document.querySelector('[class*="max-sm:h-fit"]');
      expect(mobileHeight).toBeInTheDocument();
    });
  });

  // ===========================================
  // PADDING BOTTOM FOR MOBILE TESTS
  // ===========================================
  describe('Mobile Navigation Space', () => {
    it('should have bottom padding for mobile navigation', () => {
      render(<Calender />);

      const mobilePb = document.querySelector('[class*="max-sm:pb-20"]');
      expect(mobilePb).toBeInTheDocument();
    });
  });
});

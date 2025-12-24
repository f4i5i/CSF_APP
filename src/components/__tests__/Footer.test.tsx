/**
 * Unit Tests for Footer Component
 * Tests rendering, links, and styling
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component', () => {
  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the footer', () => {
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should display copyright text', () => {
      render(<Footer />);
      expect(screen.getByText(/© 2025 Carolina Soccer Factory/i)).toBeInTheDocument();
    });

    it('should display "All rights reserved" text', () => {
      render(<Footer />);
      expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    });
  });

  // ===========================================
  // LINKS TESTS
  // ===========================================
  describe('Links', () => {
    it('should have Privacy link', () => {
      render(<Footer />);
      expect(screen.getByText('Privacy')).toBeInTheDocument();
    });

    it('should have Get help link', () => {
      render(<Footer />);
      expect(screen.getByText('Get help')).toBeInTheDocument();
    });

    it('should have Privacy link with href', () => {
      render(<Footer />);
      const privacyLink = screen.getByText('Privacy').closest('a');
      expect(privacyLink).toHaveAttribute('href', '#');
    });

    it('should have Get help link with href', () => {
      render(<Footer />);
      const helpLink = screen.getByText('Get help').closest('a');
      expect(helpLink).toHaveAttribute('href', '#');
    });
  });

  // ===========================================
  // POSITIONING TESTS
  // ===========================================
  describe('Positioning', () => {
    it('should be fixed by default', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toContain('fixed');
    });

    it('should be relative when isFixed is false', () => {
      render(<Footer isFixed={false} />);
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toContain('relative');
    });

    it('should be at bottom when fixed', () => {
      render(<Footer isFixed={true} />);
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toContain('bottom-0');
    });
  });

  // ===========================================
  // STYLING TESTS
  // ===========================================
  describe('Styling', () => {
    it('should have full width', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toContain('w-full');
    });

    it('should have backdrop blur', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toContain('backdrop-blur-sm');
    });

    it('should have transparent background', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toContain('transparent');
    });
  });

  // ===========================================
  // ICONS TESTS
  // ===========================================
  describe('Icons', () => {
    it('should render lock icon for Privacy', () => {
      render(<Footer />);
      const privacyLink = screen.getByText('Privacy').closest('a');
      const svg = privacyLink?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render help icon for Get help', () => {
      render(<Footer />);
      const helpLink = screen.getByText('Get help').closest('a');
      const svg = helpLink?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  // ===========================================
  // RESPONSIVE TESTS
  // ===========================================
  describe('Responsive Classes', () => {
    it('should have responsive padding classes', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toMatch(/sm:py-4|pt-4/);
    });

    it('should have mobile-specific flex classes', () => {
      render(<Footer />);
      // Check for max-sm classes in the inner div
      const innerDiv = screen.getByText('Privacy').closest('div')?.parentElement;
      expect(innerDiv?.className).toContain('max-sm:flex-col-reverse');
    });
  });

  // ===========================================
  // ACCESSIBILITY TESTS
  // ===========================================
  describe('Accessibility', () => {
    it('should use footer semantic element', () => {
      render(<Footer />);
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should have hover styles on links', () => {
      render(<Footer />);
      const privacyLink = screen.getByText('Privacy').closest('a');
      expect(privacyLink?.className).toContain('hover:underline');
    });
  });

  // ===========================================
  // CONTENT STRUCTURE TESTS
  // ===========================================
  describe('Content Structure', () => {
    it('should have two links in the links section', () => {
      render(<Footer />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBe(2);
    });

    it('should display links on the right side', () => {
      render(<Footer />);
      // Links container should have flex with gap
      const linksContainer = screen.getByText('Privacy').closest('div');
      expect(linksContainer?.className).toContain('gap-5');
    });
  });
});

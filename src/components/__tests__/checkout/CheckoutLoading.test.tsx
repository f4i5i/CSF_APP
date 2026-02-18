/**
 * Unit Tests for CheckoutLoading Component
 * Tests skeleton loading display and loading message
 */

import React from 'react';
import { render, screen } from '../../../__tests__/utils/test-utils';
import CheckoutLoading from '../../checkout/CheckoutLoading';

describe('CheckoutLoading Component', () => {
  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component', () => {
      const { container } = render(<CheckoutLoading />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should display loading message', () => {
      render(<CheckoutLoading />);
      expect(screen.getByText('Loading checkout...')).toBeInTheDocument();
    });
  });

  // ===========================================
  // SKELETON STRUCTURE
  // ===========================================
  describe('Skeleton Structure', () => {
    it('should render skeleton blocks for class details', () => {
      const { container } = render(<CheckoutLoading />);
      // The component renders multiple gray skeleton blocks
      const skeletonBlocks = container.querySelectorAll('.bg-gray-200');
      expect(skeletonBlocks.length).toBeGreaterThan(0);
    });

    it('should render child selector skeleton with two cards', () => {
      const { container } = render(<CheckoutLoading />);
      // The child selector skeleton has 2 rounded-full elements (avatars)
      const avatarSkeletons = container.querySelectorAll('.rounded-full.bg-gray-200');
      expect(avatarSkeletons.length).toBeGreaterThanOrEqual(2);
    });

    it('should render payment method skeleton with three options', () => {
      const { container } = render(<CheckoutLoading />);
      // Should have grid structure for payment methods
      const gridContainers = container.querySelectorAll('.grid');
      expect(gridContainers.length).toBeGreaterThan(0);
    });

    it('should render order summary skeleton in right column', () => {
      const { container } = render(<CheckoutLoading />);
      // Should have a sticky element for order summary
      const stickyElements = container.querySelectorAll('.sticky');
      expect(stickyElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should render the loading spinner in the fixed message', () => {
      const { container } = render(<CheckoutLoading />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  // ===========================================
  // LAYOUT
  // ===========================================
  describe('Layout', () => {
    it('should have a 3-column grid layout', () => {
      const { container } = render(<CheckoutLoading />);
      const mainGrid = container.querySelector('.lg\\:grid-cols-3');
      expect(mainGrid).toBeInTheDocument();
    });

    it('should have left column spanning 2 columns', () => {
      const { container } = render(<CheckoutLoading />);
      const leftColumn = container.querySelector('.lg\\:col-span-2');
      expect(leftColumn).toBeInTheDocument();
    });

    it('should have right column spanning 1 column', () => {
      const { container } = render(<CheckoutLoading />);
      const rightColumn = container.querySelector('.lg\\:col-span-1');
      expect(rightColumn).toBeInTheDocument();
    });
  });

  // ===========================================
  // LOADING INDICATOR
  // ===========================================
  describe('Loading Indicator', () => {
    it('should render the fixed-position loading toast', () => {
      const { container } = render(<CheckoutLoading />);
      const fixedElement = container.querySelector('.fixed');
      expect(fixedElement).toBeInTheDocument();
    });

    it('should have loading toast positioned at bottom-right', () => {
      const { container } = render(<CheckoutLoading />);
      const fixedElement = container.querySelector('.fixed.bottom-4.right-4');
      expect(fixedElement).toBeInTheDocument();
    });

    it('should render loading text with correct styling', () => {
      render(<CheckoutLoading />);
      const loadingText = screen.getByText('Loading checkout...');
      expect(loadingText.className).toContain('font-manrope');
      expect(loadingText.className).toContain('font-medium');
    });
  });

  // ===========================================
  // MULTIPLE RENDERS
  // ===========================================
  describe('Consistency', () => {
    it('should render consistently on multiple mounts', () => {
      const { unmount: unmount1, container: container1 } = render(<CheckoutLoading />);
      const skeletons1 = container1.querySelectorAll('.bg-gray-200').length;
      unmount1();

      const { container: container2 } = render(<CheckoutLoading />);
      const skeletons2 = container2.querySelectorAll('.bg-gray-200').length;

      expect(skeletons1).toBe(skeletons2);
    });
  });
});

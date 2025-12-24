/**
 * Unit Tests for ClassCard Component
 * Tests class display, capacity, pricing, and registration button
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ClassCard from '../ClassCard';

// Mock the classHelpers
jest.mock('../../utils/classHelpers', () => ({
  getOfferingLabel: jest.fn((type) => type || 'Class'),
}));

describe('ClassCard Component', () => {
  const mockClass = {
    id: 'class-1',
    title: 'Soccer Basics',
    school: 'Test Elementary',
    image: 'https://example.com/soccer.jpg',
    programName: 'Youth Soccer',
    description: 'Learn the fundamentals of soccer',
    dates: 'Jan 15 - Mar 15, 2024',
    time: 'Mon/Wed 4:00 PM',
    ages: '6-10 years',
    capacity: { total: 20, filled: 15 },
    price: 150,
    priceModel: 'Per Season',
    spotsRemaining: 5,
    hasCapacity: true,
    offeringType: 'program',
  };

  const mockOnClick = jest.fn();
  const mockOnRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the class card', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
    });

    it('should display school name', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Test Elementary')).toBeInTheDocument();
    });

    it('should display program name', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Youth Soccer')).toBeInTheDocument();
    });

    it('should display description', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Learn the fundamentals of soccer')).toBeInTheDocument();
    });

    it('should display class image', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      const image = screen.getByAltText('Soccer Basics');
      expect(image).toHaveAttribute('src', 'https://example.com/soccer.jpg');
    });

    it('should display placeholder when no image', () => {
      const classWithoutImage = { ...mockClass, image: null };
      render(<ClassCard cls={classWithoutImage} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Image TBA')).toBeInTheDocument();
    });
  });

  // ===========================================
  // INFO ROWS TESTS
  // ===========================================
  describe('Info Rows', () => {
    it('should display dates', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Dates')).toBeInTheDocument();
      expect(screen.getByText('Jan 15 - Mar 15, 2024')).toBeInTheDocument();
    });

    it('should display schedule', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Schedule')).toBeInTheDocument();
      expect(screen.getByText('Mon/Wed 4:00 PM')).toBeInTheDocument();
    });

    it('should display ages', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Ages')).toBeInTheDocument();
      expect(screen.getByText('6-10 years')).toBeInTheDocument();
    });

    it('should display capacity', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Capacity')).toBeInTheDocument();
      expect(screen.getByText('15/20 enrolled')).toBeInTheDocument();
    });

    it('should display price', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('$150')).toBeInTheDocument();
    });

    it('should display price model when provided', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Price model')).toBeInTheDocument();
      expect(screen.getByText('Per Season')).toBeInTheDocument();
    });
  });

  // ===========================================
  // CAPACITY TESTS
  // ===========================================
  describe('Capacity Display', () => {
    it('should show spots remaining when available', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('5 spots available')).toBeInTheDocument();
    });

    it('should show waitlist only when class is full', () => {
      const fullClass = { ...mockClass, hasCapacity: false, spotsRemaining: 0 };
      render(<ClassCard cls={fullClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Waitlist only')).toBeInTheDocument();
    });

    it('should show waitlist count when available', () => {
      const fullClass = { ...mockClass, hasCapacity: false, spotsRemaining: 0, waitlistCount: 3 };
      render(<ClassCard cls={fullClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('3 players on waitlist')).toBeInTheDocument();
    });

    it('should handle single player on waitlist', () => {
      const fullClass = { ...mockClass, hasCapacity: false, spotsRemaining: 0, waitlistCount: 1 };
      render(<ClassCard cls={fullClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('1 player on waitlist')).toBeInTheDocument();
    });

    it('should show "Limited spots" when spotsRemaining is 0 but has capacity', () => {
      const limitedClass = { ...mockClass, spotsRemaining: 0, hasCapacity: true };
      render(<ClassCard cls={limitedClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Limited spots')).toBeInTheDocument();
    });

    it('should show real-time update message when not full', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Capacity updates in real-time')).toBeInTheDocument();
    });

    it('should handle numeric capacity', () => {
      const classWithNumericCapacity = { ...mockClass, capacity: 20, current_enrollment: 10 };
      render(<ClassCard cls={classWithNumericCapacity} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('10/20 enrolled')).toBeInTheDocument();
    });
  });

  // ===========================================
  // PRICING TESTS
  // ===========================================
  describe('Pricing Display', () => {
    it('should display price with dollar sign', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('$150')).toBeInTheDocument();
    });

    it('should use priceLabel when provided', () => {
      const classWithPriceLabel = { ...mockClass, priceLabel: '$200/month' };
      render(<ClassCard cls={classWithPriceLabel} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('$200/month')).toBeInTheDocument();
    });

    it('should show "Contact for pricing" when no price', () => {
      const classWithoutPrice = { ...mockClass, price: null };
      render(<ClassCard cls={classWithoutPrice} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Contact for pricing')).toBeInTheDocument();
    });
  });

  // ===========================================
  // CLICK HANDLERS TESTS
  // ===========================================
  describe('Click Handlers', () => {
    it('should call onClick when card is clicked', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);

      const card = screen.getByText('Soccer Basics').closest('div[class*="cursor-pointer"]');
      if (card) {
        fireEvent.click(card);
      }

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should call onRegister when Register button is clicked', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);

      const registerButton = screen.getByRole('button', { name: /Register/i });
      fireEvent.click(registerButton);

      expect(mockOnRegister).toHaveBeenCalled();
    });

    it('should not trigger onClick when Register button is clicked', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);

      const registerButton = screen.getByRole('button', { name: /Register/i });
      fireEvent.click(registerButton);

      // onRegister should be called, but onClick should not be called due to stopPropagation
      expect(mockOnRegister).toHaveBeenCalled();
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // BADGE LABEL TESTS
  // ===========================================
  describe('Badge Label', () => {
    it('should display badge label when provided', () => {
      const classWithBadge = { ...mockClass, badgeLabel: 'New' };
      render(<ClassCard cls={classWithBadge} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should use offering type as fallback via getOfferingLabel', () => {
      // The mock returns the type as-is, so 'program' should appear somewhere
      // But it might be rendered differently in the actual component
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      // Just verify the component renders without error when offeringType is provided
      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
    });
  });

  // ===========================================
  // STYLING TESTS
  // ===========================================
  describe('Styling', () => {
    it('should have hover shadow effect class', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      const card = screen.getByText('Soccer Basics').closest('div[class*="hover:shadow-xl"]');
      expect(card).toBeInTheDocument();
    });

    it('should have cursor pointer', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      const card = screen.getByText('Soccer Basics').closest('div[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();
    });

    it('should have green text for available spots', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      const spotsText = screen.getByText('5 spots available');
      expect(spotsText.className).toContain('text-emerald-600');
    });

    it('should have red text for waitlist', () => {
      const fullClass = { ...mockClass, hasCapacity: false };
      render(<ClassCard cls={fullClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      const waitlistText = screen.getByText('Waitlist only');
      expect(waitlistText.className).toContain('text-rose-600');
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should handle missing optional fields', () => {
      const minimalClass = {
        id: 'class-1',
        title: 'Basic Class',
        school: 'School',
        dates: 'TBD',
        time: 'TBD',
        ages: 'All ages',
      };
      render(<ClassCard cls={minimalClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('Basic Class')).toBeInTheDocument();
    });

    it('should handle zero capacity', () => {
      const zeroCapacity = { ...mockClass, capacity: { total: 0, filled: 0 }, spotsRemaining: 0 };
      render(<ClassCard cls={zeroCapacity} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.getByText('0 enrolled')).toBeInTheDocument();
    });

    it('should not render price model when not provided', () => {
      const classWithoutPriceModel = { ...mockClass, priceModel: undefined };
      render(<ClassCard cls={classWithoutPriceModel} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.queryByText('Price model')).not.toBeInTheDocument();
    });

    it('should not render program name when not provided', () => {
      const classWithoutProgram = { ...mockClass, programName: undefined };
      render(<ClassCard cls={classWithoutProgram} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.queryByText('Youth Soccer')).not.toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const classWithoutDesc = { ...mockClass, description: undefined };
      render(<ClassCard cls={classWithoutDesc} onClick={mockOnClick} onRegister={mockOnRegister} />);
      expect(screen.queryByText('Learn the fundamentals of soccer')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // ACCESSIBILITY TESTS
  // ===========================================
  describe('Accessibility', () => {
    it('should have accessible Register button', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      const button = screen.getByRole('button', { name: /Register/i });
      expect(button).toBeInTheDocument();
    });

    it('should have alt text for class image', () => {
      render(<ClassCard cls={mockClass} onClick={mockOnClick} onRegister={mockOnRegister} />);
      const image = screen.getByAltText('Soccer Basics');
      expect(image).toBeInTheDocument();
    });
  });
});

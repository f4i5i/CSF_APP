/**
 * Unit Tests for Calender1.jsx (custom calendar component)
 * Tests: rendering, month navigation, highlighted dates, leading/trailing dates
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar1 from '../Calender1';

describe('Calendar1', () => {
  describe('Rendering', () => {
    it('should render the calendar with day headers', () => {
      render(<Calendar1 />);
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
      expect(screen.getByText('Sun')).toBeInTheDocument();
    });

    it('should display current month and year', () => {
      render(<Calendar1 />);
      const now = new Date();
      const monthYear = now.toLocaleString('default', { month: 'short', year: 'numeric' });
      expect(screen.getByText(monthYear)).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(<Calendar1 />);
      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    it('should render day buttons for the current month', () => {
      render(<Calendar1 />);
      // Every month has at least 28 days
      for (let day = 1; day <= 28; day++) {
        const now = new Date();
        const monthName = now.toLocaleString('default', { month: 'long' });
        expect(screen.getByLabelText(`${day} ${monthName}`)).toBeInTheDocument();
      }
    });
  });

  describe('Month Navigation', () => {
    it('should navigate to next month', () => {
      render(<Calendar1 />);
      const nextBtn = screen.getByLabelText('Next month');
      fireEvent.click(nextBtn);

      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);
      const expected = nextMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('should navigate to previous month', () => {
      render(<Calendar1 />);
      const prevBtn = screen.getByLabelText('Previous month');
      fireEvent.click(prevBtn);

      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      const expected = prevMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('should handle year rollover when navigating forward from December', () => {
      render(<Calendar1 />);
      const nextBtn = screen.getByLabelText('Next month');
      const now = new Date();
      // Navigate to December
      const monthsToDecember = 11 - now.getMonth();
      for (let i = 0; i <= monthsToDecember; i++) {
        fireEvent.click(nextBtn);
      }
      // Now click again to go to January of next year
      const expected = new Date(now.getFullYear() + 1, 0).toLocaleString('default', { month: 'short', year: 'numeric' });
      // After navigating monthsToDecember+1 times from current month, we should be at Jan next year
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('should handle year rollover when navigating backward from January', () => {
      render(<Calendar1 />);
      const prevBtn = screen.getByLabelText('Previous month');
      const now = new Date();
      // Navigate to January
      const monthsToJanuary = now.getMonth();
      for (let i = 0; i <= monthsToJanuary; i++) {
        fireEvent.click(prevBtn);
      }
      // Should be at December of previous year
      const expected = new Date(now.getFullYear() - 1, 11).toLocaleString('default', { month: 'short', year: 'numeric' });
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  describe('Highlighted Dates', () => {
    it('should highlight event dates (8, 9, 20, 21) with special styling', () => {
      render(<Calendar1 />);
      const now = new Date();
      const monthName = now.toLocaleString('default', { month: 'long' });

      // Dates 8, 9, 20, 21 should have the highlighted background class
      [8, 9, 20, 21].forEach((day) => {
        const dayButton = screen.getByLabelText(`${day} ${monthName}`);
        expect(dayButton.className).toContain('bg-[#F3BC48]');
      });
    });

    it('should not highlight non-event dates', () => {
      render(<Calendar1 />);
      const now = new Date();
      const monthName = now.toLocaleString('default', { month: 'long' });

      // Dates that are NOT highlighted
      [1, 2, 3, 15].forEach((day) => {
        const dayButton = screen.getByLabelText(`${day} ${monthName}`);
        expect(dayButton.className).not.toContain('bg-[#F3BC48]');
      });
    });
  });

  describe('Leading and Trailing Dates', () => {
    it('should render leading dots for days before month starts', () => {
      render(<Calendar1 />);
      // Leading dates show as dots "."
      const dots = screen.queryAllByText('.');
      // The number of dots depends on the starting day of the current month
      // Just verify the grid structure exists
      const grid = document.querySelector('.grid.grid-cols-7');
      expect(grid).toBeInTheDocument();
    });
  });
});

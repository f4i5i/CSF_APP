/**
 * Unit Tests for Calender.jsx (DayPicker-based calendar)
 * Tests: rendering, highlighted dates, custom caption
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the CSS import that doesn't exist in this version
jest.mock('react-day-picker/dist/style.css', () => ({}), { virtual: true });

// Mock react-day-picker
jest.mock('react-day-picker', () => ({
  DayPicker: ({ mode, selected, modifiers, modifiersStyles, components, className, defaultMonth }: any) => (
    <div data-testid="day-picker" data-mode={mode} className={className}>
      <div data-testid="selected-count">{Array.isArray(selected) ? selected.length : 0}</div>
      <div data-testid="has-highlighted">{modifiers?.highlighted ? 'true' : 'false'}</div>
      {components?.Caption && <components.Caption />}
    </div>
  ),
}));

// Mock CustomCaption
jest.mock('../Calendar/CustomCaption', () => {
  return function MockCustomCaption() {
    return <div data-testid="custom-caption">Custom Caption</div>;
  };
});

import Calendar from '../Calender';

describe('Calendar (DayPicker)', () => {
  describe('Rendering', () => {
    it('should render the calendar component', () => {
      render(<Calendar />);
      expect(screen.getByTestId('day-picker')).toBeInTheDocument();
    });

    it('should display the "Calendar" heading', () => {
      render(<Calendar />);
      expect(screen.getByText('Calendar')).toBeInTheDocument();
    });

    it('should use single selection mode', () => {
      render(<Calendar />);
      expect(screen.getByTestId('day-picker')).toHaveAttribute('data-mode', 'single');
    });
  });

  describe('Highlighted Dates', () => {
    it('should pass highlighted dates as modifiers', () => {
      render(<Calendar />);
      expect(screen.getByTestId('has-highlighted')).toHaveTextContent('true');
    });

    it('should have 4 selected/highlighted dates', () => {
      render(<Calendar />);
      expect(screen.getByTestId('selected-count')).toHaveTextContent('4');
    });
  });

  describe('Custom Caption', () => {
    it('should render the custom caption component', () => {
      render(<Calendar />);
      expect(screen.getByTestId('custom-caption')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have calendar-mini className', () => {
      render(<Calendar />);
      const picker = screen.getByTestId('day-picker');
      expect(picker.className).toContain('calendar-mini');
    });
  });
});

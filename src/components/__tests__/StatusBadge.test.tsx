/**
 * Unit Tests for StatusBadge Component
 * Tests status label mapping, sizes, custom labels, and fallback behavior
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../admin/StatusBadge';

describe('StatusBadge Component', () => {
  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render with a status label', () => {
      render(<StatusBadge status="active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render as a span element', () => {
      render(<StatusBadge status="pending" />);
      const badge = screen.getByText('Pending');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  // ===========================================
  // STATUS LABEL MAPPING TESTS
  // ===========================================
  describe('Status Labels', () => {
    const statusLabels: [string, string][] = [
      ['pending', 'Pending'],
      ['confirmed', 'Confirmed'],
      ['completed', 'Completed'],
      ['cancelled', 'Cancelled'],
      ['refunded', 'Refunded'],
      ['succeeded', 'Succeeded'],
      ['failed', 'Failed'],
      ['processing', 'Processing'],
      ['active', 'Active'],
      ['inactive', 'Inactive'],
      ['withdrawn', 'Withdrawn'],
      ['paid', 'Paid'],
      ['overdue', 'Overdue'],
      ['upcoming', 'Upcoming'],
      ['waitlisted', 'Waitlisted'],
      ['notified', 'Notified'],
      ['enrolled', 'Enrolled'],
    ];

    test.each(statusLabels)(
      'should display "%s" status as "%s"',
      (status, expectedLabel) => {
        render(<StatusBadge status={status} />);
        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      }
    );
  });

  // ===========================================
  // CASE INSENSITIVITY TESTS
  // ===========================================
  describe('Case Insensitivity', () => {
    it('should handle uppercase status', () => {
      render(<StatusBadge status="ACTIVE" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should handle mixed case status', () => {
      render(<StatusBadge status="Pending" />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  // ===========================================
  // CUSTOM LABEL TESTS
  // ===========================================
  describe('Custom Labels', () => {
    it('should display customLabel when provided', () => {
      render(<StatusBadge status="active" customLabel="Enrolled" />);
      expect(screen.getByText('Enrolled')).toBeInTheDocument();
    });

    it('should prefer customLabel over default status label', () => {
      render(<StatusBadge status="active" customLabel="Custom Status" />);
      expect(screen.getByText('Custom Status')).toBeInTheDocument();
      expect(screen.queryByText('Active')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // SIZE TESTS
  // ===========================================
  describe('Size Variants', () => {
    it('should render with default sm size', () => {
      render(<StatusBadge status="active" />);
      const badge = screen.getByText('Active');
      expect(badge.className).toContain('text-sm');
    });

    it('should render with xs size', () => {
      render(<StatusBadge status="active" size="xs" />);
      const badge = screen.getByText('Active');
      expect(badge.className).toContain('text-xs');
    });

    it('should render with md size', () => {
      render(<StatusBadge status="active" size="md" />);
      const badge = screen.getByText('Active');
      expect(badge.className).toContain('text-base');
    });

    it('should render with lg size', () => {
      render(<StatusBadge status="active" size="lg" />);
      const badge = screen.getByText('Active');
      expect(badge.className).toContain('text-lg');
    });
  });

  // ===========================================
  // STYLING TESTS
  // ===========================================
  describe('Styling', () => {
    it('should have green styles for active status', () => {
      render(<StatusBadge status="active" />);
      const badge = screen.getByText('Active');
      expect(badge.className).toContain('bg-green-100');
      expect(badge.className).toContain('text-green-800');
    });

    it('should have yellow styles for pending status', () => {
      render(<StatusBadge status="pending" />);
      const badge = screen.getByText('Pending');
      expect(badge.className).toContain('bg-yellow-100');
      expect(badge.className).toContain('text-yellow-800');
    });

    it('should have red styles for failed status', () => {
      render(<StatusBadge status="failed" />);
      const badge = screen.getByText('Failed');
      expect(badge.className).toContain('bg-red-100');
      expect(badge.className).toContain('text-red-800');
    });

    it('should have purple styles for refunded status', () => {
      render(<StatusBadge status="refunded" />);
      const badge = screen.getByText('Refunded');
      expect(badge.className).toContain('bg-purple-100');
      expect(badge.className).toContain('text-purple-800');
    });

    it('should have rounded-full class', () => {
      render(<StatusBadge status="active" />);
      const badge = screen.getByText('Active');
      expect(badge.className).toContain('rounded-full');
    });

    it('should have border class', () => {
      render(<StatusBadge status="active" />);
      const badge = screen.getByText('Active');
      expect(badge.className).toContain('border');
    });
  });

  // ===========================================
  // FALLBACK TESTS
  // ===========================================
  describe('Fallback Behavior', () => {
    it('should fallback to pending style for unknown status', () => {
      render(<StatusBadge status="unknown_status" />);
      // Falls back to pending label
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should handle null status', () => {
      render(<StatusBadge status={null as any} />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should handle undefined status', () => {
      render(<StatusBadge status={undefined as any} />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });
});

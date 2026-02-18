import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import AttendanceRow from '../attendence/AttendenceRow';

describe('AttendanceRow', () => {
  it('renders date text', () => {
    render(<AttendanceRow date="March 15, 2026" status="Present" />);
    expect(screen.getByText('March 15, 2026')).toBeInTheDocument();
  });

  it('renders Present status', () => {
    render(<AttendanceRow date="March 15, 2026" status="Present" />);
    expect(screen.getByText('Present')).toBeInTheDocument();
  });

  it('renders Absent status', () => {
    render(<AttendanceRow date="March 16, 2026" status="Absent" />);
    expect(screen.getByText('Absent')).toBeInTheDocument();
  });

  it('shows green styling for Present', () => {
    const { container } = render(<AttendanceRow date="March 15" status="Present" />);
    const iconBox = container.querySelector('.bg-\\[\\#DEF9CD\\]');
    expect(iconBox).toBeInTheDocument();
  });

  it('shows red styling for Absent', () => {
    const { container } = render(<AttendanceRow date="March 15" status="Absent" />);
    const iconBox = container.querySelector('.bg-\\[\\#FFE2E2\\]');
    expect(iconBox).toBeInTheDocument();
  });
});

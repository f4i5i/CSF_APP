import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import StudentList from '../checkIn/StudentList';

describe('StudentList', () => {
  const students = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Student ${String.fromCharCode(65 + i)}`,
    grade: `${i + 1}`,
    checked: i < 3,
  }));

  const defaultProps = {
    students,
    search: '',
    sort: 'Alphabetical',
    setSort: jest.fn(),
    onOpen: jest.fn(),
    onCheckIn: jest.fn(),
    checkingIn: false,
  };

  it('renders student count header', () => {
    render(<StudentList {...defaultProps} />);
    expect(screen.getByText('Students (3/8)')).toBeInTheDocument();
  });

  it('renders first page of students (5 per page)', () => {
    render(<StudentList {...defaultProps} />);
    expect(screen.getByText('Student A')).toBeInTheDocument();
    expect(screen.getByText('Student E')).toBeInTheDocument();
    expect(screen.queryByText('Student F')).not.toBeInTheDocument();
  });

  it('shows pagination for more than 5 students', () => {
    render(<StudentList {...defaultProps} />);
    const pageButtons = screen.getByText('2');
    expect(pageButtons).toBeInTheDocument();
  });

  it('navigates to page 2', async () => {
    const user = userEvent.setup();
    render(<StudentList {...defaultProps} />);
    await user.click(screen.getByText('2'));
    expect(screen.getByText('Student F')).toBeInTheDocument();
    expect(screen.queryByText('Student A')).not.toBeInTheDocument();
  });

  it('filters students by search', () => {
    render(<StudentList {...defaultProps} search="Student A" />);
    expect(screen.getByText('Student A')).toBeInTheDocument();
    expect(screen.queryByText('Student B')).not.toBeInTheDocument();
    expect(screen.getByText('Students (1/1)')).toBeInTheDocument();
  });

  it('shows empty state when no students match', () => {
    render(<StudentList {...defaultProps} search="zzz" />);
    expect(screen.getByText('No students found')).toBeInTheDocument();
  });

  it('renders sort dropdown button', () => {
    render(<StudentList {...defaultProps} />);
    expect(screen.getByText('Alphabetical')).toBeInTheDocument();
  });

  it('opens sort dropdown on click', async () => {
    const user = userEvent.setup();
    render(<StudentList {...defaultProps} />);
    await user.click(screen.getByText('Alphabetical'));
    expect(screen.getByText('Grade')).toBeInTheDocument();
    expect(screen.getByText('Check-In Status')).toBeInTheDocument();
  });

  it('calls setSort when option selected', async () => {
    const user = userEvent.setup();
    render(<StudentList {...defaultProps} />);
    await user.click(screen.getByText('Alphabetical'));
    await user.click(screen.getByText('Grade'));
    expect(defaultProps.setSort).toHaveBeenCalledWith('Grade');
  });
});

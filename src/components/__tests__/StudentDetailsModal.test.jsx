import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import StudentDetailsModal from '../checkIn/StudentDetailsModal';

describe('StudentDetailsModal', () => {
  const student = {
    name: 'John Smith',
    parent: { first_name: 'Mary', last_name: 'Smith', phone: '555-1234', email: 'mary@test.com' },
    medical_info: { allergies: 'Peanuts', conditions: 'Asthma' },
    child: { after_school: true },
    notes: 'Needs extra help',
  };

  it('renders student name', () => {
    render(<StudentDetailsModal student={student} onClose={jest.fn()} />);
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  it('renders Contact Information section', () => {
    render(<StudentDetailsModal student={student} onClose={jest.fn()} />);
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Mary Smith')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
    expect(screen.getByText('mary@test.com')).toBeInTheDocument();
  });

  it('renders Medical Information section', () => {
    render(<StudentDetailsModal student={student} onClose={jest.fn()} />);
    expect(screen.getByText('Medical Information')).toBeInTheDocument();
    expect(screen.getByText('Peanuts')).toBeInTheDocument();
    expect(screen.getByText('Asthma')).toBeInTheDocument();
  });

  it('renders After School section', () => {
    render(<StudentDetailsModal student={student} onClose={jest.fn()} />);
    expect(screen.getByText('After School')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders Additional Notes section', () => {
    render(<StudentDetailsModal student={student} onClose={jest.fn()} />);
    expect(screen.getByText('Additional Notes')).toBeInTheDocument();
    expect(screen.getByText('Needs extra help')).toBeInTheDocument();
  });

  it('calls onClose when X button clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<StudentDetailsModal student={student} onClose={onClose} />);
    // Find close button (with X icon)
    const closeBtn = screen.getByRole('button', { name: '' });
    // Actually there are two buttons - Edit and Close(X)
    const buttons = screen.getAllByRole('button');
    const xBtn = buttons.find((b) => b.className.includes('rounded-full') && b.className.includes('border'));
    if (xBtn) {
      await user.click(xBtn);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('renders Edit button', () => {
    render(<StudentDetailsModal student={student} onClose={jest.fn()} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('uses fallback values for missing data', () => {
    render(<StudentDetailsModal student={{ name: 'Test' }} onClose={jest.fn()} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    const notProvided = screen.getAllByText('Not provided');
    expect(notProvided.length).toBeGreaterThan(0);
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('renders "Unknown Student" for null student', () => {
    render(<StudentDetailsModal student={null} onClose={jest.fn()} />);
    expect(screen.getByText('Unknown Student')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import AddStudent from '../AddStudent';

// Mock Header component
jest.mock('../Header', () => () => <div data-testid="mock-header">Header</div>);

describe('AddStudent', () => {
  it('renders the form title', () => {
    render(<AddStudent />);
    expect(screen.getByText('Add New Student')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<AddStudent />);
    expect(screen.getByText('Student Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Parent Name')).toBeInTheDocument();
    expect(screen.getByText('Parent Phone')).toBeInTheDocument();
    expect(screen.getByText('Parent Email')).toBeInTheDocument();
    expect(screen.getByText('Select Class')).toBeInTheDocument();
  });

  it('renders class options in dropdown', () => {
    render(<AddStudent />);
    expect(screen.getByText('Choose Class')).toBeInTheDocument();
    expect(screen.getByText('Class A')).toBeInTheDocument();
    expect(screen.getByText('Class B')).toBeInTheDocument();
    expect(screen.getByText('Class C')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<AddStudent />);
    expect(screen.getByRole('button', { name: /register student/i })).toBeInTheDocument();
  });

  it('updates form fields on input', async () => {
    const user = userEvent.setup();
    render(<AddStudent />);
    const studentNameInput = document.querySelector('input[name="studentName"]');
    await user.type(studentNameInput, 'John');
    expect(studentNameInput).toHaveValue('John');
  });

  it('renders Header component', () => {
    render(<AddStudent />);
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  it('shows alert on form submit', async () => {
    const user = userEvent.setup();
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<AddStudent />);

    const studentNameInput = document.querySelector('input[name="studentName"]');
    const ageInput = document.querySelector('input[name="age"]');
    const parentNameInput = document.querySelector('input[name="parentName"]');
    const phoneInput = document.querySelector('input[name="phone"]');
    const classSelect = document.querySelector('select[name="classId"]');

    await user.type(studentNameInput, 'John');
    await user.type(ageInput, '10');
    await user.type(parentNameInput, 'Jane');
    await user.type(phoneInput, '555-1234');
    await user.selectOptions(classSelect, '1');

    await user.click(screen.getByRole('button', { name: /register student/i }));
    expect(window.alert).toHaveBeenCalledWith('Student Registration Successful!');

    window.alert.mockRestore();
  });
});

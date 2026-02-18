import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import InputField from '../InputField';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Eye: () => <svg data-testid="eye-icon" />,
  EyeOff: () => <svg data-testid="eye-off-icon" />,
}));

describe('InputField', () => {
  const defaultProps = {
    label: 'Email',
    name: 'email',
    value: '',
    onChange: jest.fn(),
  };

  it('renders label text', () => {
    render(<InputField {...defaultProps} />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders input with correct name', () => {
    render(<InputField {...defaultProps} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email');
  });

  it('renders input with given value', () => {
    render(<InputField {...defaultProps} value="test@example.com" />);
    expect(screen.getByRole('textbox')).toHaveValue('test@example.com');
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<InputField {...defaultProps} onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders placeholder text', () => {
    render(<InputField {...defaultProps} placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('renders as password type', () => {
    render(<InputField {...defaultProps} type="password" />);
    const input = document.querySelector('input[name="email"]');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('shows error message', () => {
    render(<InputField {...defaultProps} error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('applies required attribute', () => {
    render(<InputField {...defaultProps} required />);
    const input = document.querySelector('input[name="email"]');
    expect(input).toBeRequired();
  });

  it('applies disabled state', () => {
    render(<InputField {...defaultProps} disabled />);
    const input = document.querySelector('input[name="email"]');
    expect(input).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<InputField {...defaultProps} className="my-class" />);
    expect(document.querySelector('.my-class')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import GenericButton from '../GenericButton';

describe('GenericButton', () => {
  it('renders children text', () => {
    render(<GenericButton>Click Me</GenericButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<GenericButton>Btn</GenericButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('accepts type="submit"', () => {
    render(<GenericButton type="submit">Submit</GenericButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<GenericButton onClick={handleClick}>Click</GenericButton>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<GenericButton onClick={handleClick} disabled>Click</GenericButton>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies disabled styling when disabled', () => {
    render(<GenericButton disabled>Disabled</GenericButton>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.className).toContain('opacity-50');
    expect(btn.className).toContain('cursor-not-allowed');
  });

  it('applies primary variant by default', () => {
    render(<GenericButton>Primary</GenericButton>);
    expect(screen.getByRole('button').className).toContain('bg-[#F3BC48]');
  });

  it('applies secondary variant', () => {
    render(<GenericButton variant="secondary">Secondary</GenericButton>);
    expect(screen.getByRole('button').className).toContain('bg-gray-100');
  });

  it('applies danger variant', () => {
    render(<GenericButton variant="danger">Delete</GenericButton>);
    expect(screen.getByRole('button').className).toContain('bg-red-500');
  });

  it('applies outline variant', () => {
    render(<GenericButton variant="outline">Outline</GenericButton>);
    expect(screen.getByRole('button').className).toContain('border-gray-300');
  });

  it('applies md size by default', () => {
    render(<GenericButton>Med</GenericButton>);
    expect(screen.getByRole('button').className).toContain('text-[12px]');
  });

  it('applies sm size', () => {
    render(<GenericButton size="sm">Small</GenericButton>);
    expect(screen.getByRole('button').className).toContain('text-[10px]');
  });

  it('applies lg size', () => {
    render(<GenericButton size="lg">Large</GenericButton>);
    expect(screen.getByRole('button').className).toContain('text-[16px]');
  });

  it('appends custom className', () => {
    render(<GenericButton className="my-custom">Custom</GenericButton>);
    expect(screen.getByRole('button').className).toContain('my-custom');
  });
});

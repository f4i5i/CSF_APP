import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import TimePicker12Hour from '../ui/TimePicker12Hour';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('TimePicker12Hour', () => {
  it('renders with placeholder when no value', () => {
    render(<TimePicker12Hour value="" onChange={jest.fn()} />);
    expect(screen.getByText('Select time')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(<TimePicker12Hour value="" onChange={jest.fn()} placeholder="Pick a time" />);
    expect(screen.getByText('Pick a time')).toBeInTheDocument();
  });

  it('displays formatted time when value is set', () => {
    render(<TimePicker12Hour value="14:30" onChange={jest.fn()} />);
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  it('displays AM time correctly', () => {
    render(<TimePicker12Hour value="09:00" onChange={jest.fn()} />);
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
  });

  it('displays midnight correctly', () => {
    render(<TimePicker12Hour value="00:00" onChange={jest.fn()} />);
    expect(screen.getByText('12:00 AM')).toBeInTheDocument();
  });

  it('displays noon correctly', () => {
    render(<TimePicker12Hour value="12:00" onChange={jest.fn()} />);
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(<TimePicker12Hour value="09:00" onChange={jest.fn()} />);
    await user.click(screen.getByText('9:00 AM'));
    expect(screen.getByText('Hour')).toBeInTheDocument();
    expect(screen.getByText('Min')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders hour options', async () => {
    const user = userEvent.setup();
    render(<TimePicker12Hour value="09:00" onChange={jest.fn()} />);
    await user.click(screen.getByText('9:00 AM'));
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders minute options', async () => {
    const user = userEvent.setup();
    render(<TimePicker12Hour value="09:00" onChange={jest.fn()} />);
    await user.click(screen.getByText('9:00 AM'));
    expect(screen.getByText('00')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('renders AM/PM options', async () => {
    const user = userEvent.setup();
    render(<TimePicker12Hour value="09:00" onChange={jest.fn()} />);
    await user.click(screen.getByText('9:00 AM'));
    expect(screen.getByText('AM')).toBeInTheDocument();
    expect(screen.getByText('PM')).toBeInTheDocument();
  });

  it('applies error styling', () => {
    const { container } = render(
      <TimePicker12Hour value="09:00" onChange={jest.fn()} error={true} />
    );
    const button = container.querySelector('button');
    expect(button.className).toContain('border-btn-gold');
  });
});

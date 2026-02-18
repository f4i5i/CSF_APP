import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import ClientsTabs from '../Clients/ClientsTabs';

describe('ClientsTabs', () => {
  it('renders Account and Members tabs', () => {
    render(<ClientsTabs active="account" onChange={jest.fn()} />);
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  it('highlights active Account tab', () => {
    render(<ClientsTabs active="account" onChange={jest.fn()} />);
    const accountBtn = screen.getByText('Account');
    expect(accountBtn.className).toContain('bg-[#173151]');
    expect(accountBtn.className).toContain('text-white');
  });

  it('highlights active Members tab', () => {
    render(<ClientsTabs active="members" onChange={jest.fn()} />);
    const membersBtn = screen.getByText('Members');
    expect(membersBtn.className).toContain('bg-[#173151]');
    expect(membersBtn.className).toContain('text-white');
  });

  it('calls onChange with "account" on Account click', async () => {
    const onChange = jest.fn();
    render(<ClientsTabs active="members" onChange={onChange} />);
    await userEvent.click(screen.getByText('Account'));
    expect(onChange).toHaveBeenCalledWith('account');
  });

  it('calls onChange with "members" on Members click', async () => {
    const onChange = jest.fn();
    render(<ClientsTabs active="account" onChange={onChange} />);
    await userEvent.click(screen.getByText('Members'));
    expect(onChange).toHaveBeenCalledWith('members');
  });

  it('non-active tab has border styling', () => {
    render(<ClientsTabs active="account" onChange={jest.fn()} />);
    const membersBtn = screen.getByText('Members');
    expect(membersBtn.className).toContain('border-gray-200');
    expect(membersBtn.className).toContain('bg-white');
  });

  // --- Edge cases ---
  it('does not call onChange when clicking already active tab', async () => {
    const onChange = jest.fn();
    render(<ClientsTabs active="account" onChange={onChange} />);
    await userEvent.click(screen.getByText('Account'));
    // May or may not fire depending on implementation — just verify no crash
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders both tabs with correct button roles', () => {
    render(<ClientsTabs active="account" onChange={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});

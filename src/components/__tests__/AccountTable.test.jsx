import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import AccountTable from '../Clients/AccountTable';

describe('AccountTable', () => {
  const data = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    last_name: `Last${i}`,
    first_name: `First${i}`,
    email: `user${i}@test.com`,
    phone: `555-000${i}`,
    status: 'active',
    class_name: `Class ${i}`,
    registration_date: '2026-01-15',
    balance: 100 + i,
  }));

  it('renders accounts count', () => {
    render(<AccountTable data={data} />);
    expect(screen.getByText('15 accounts')).toBeInTheDocument();
  });

  it('renders "Select page" checkbox', () => {
    render(<AccountTable data={data} />);
    expect(screen.getByText('Select page')).toBeInTheDocument();
  });

  it('renders page size selector', () => {
    render(<AccountTable data={data} />);
    const select = document.querySelector('select');
    expect(select).toBeInTheDocument();
  });

  it('renders pagination', () => {
    render(<AccountTable data={data} />);
    // With 8 per page default, should have 2 pages
    const pagination = screen.getByText('1');
    expect(pagination).toBeInTheDocument();
  });

  it('shows 0 accounts for empty data', () => {
    render(<AccountTable data={[]} />);
    expect(screen.getByText('0 accounts')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<AccountTable data={data} />);
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders first page of data', () => {
    render(<AccountTable data={data} />);
    expect(screen.getByText('Last0')).toBeInTheDocument();
    expect(screen.getByText('First0')).toBeInTheDocument();
  });

  it('toggles select all checkbox', async () => {
    const user = userEvent.setup();
    render(<AccountTable data={data} />);
    const checkbox = document.querySelector('input[type="checkbox"]');
    await user.click(checkbox);
    // All checkboxes on the page should be checked
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    // First checkbox is the select-all
    expect(checkboxes[0]).toBeChecked();
  });
});

import React from 'react';
import { render, screen } from '../../__tests__/utils/test-utils';
import MembersTable from '../Clients/MembersTable';

describe('MembersTable', () => {
  const data = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    child_first_name: `Child${i}`,
    child_last_name: `Last${i}`,
    parent_first_name: `Parent${i}`,
    parent_last_name: `PLast${i}`,
    parent_email: `parent${i}@test.com`,
    class_name: `Class ${i}`,
    enrollment_date: '2026-01-15',
    badges: [],
  }));

  it('renders members count', () => {
    render(<MembersTable data={data} />);
    expect(screen.getByText('5 members')).toBeInTheDocument();
  });

  it('renders "Select page" checkbox', () => {
    render(<MembersTable data={data} />);
    expect(screen.getByText('Select page')).toBeInTheDocument();
  });

  it('renders table with member data', () => {
    render(<MembersTable data={data} />);
    expect(screen.getByText('Child0')).toBeInTheDocument();
    expect(screen.getByText('Parent0')).toBeInTheDocument();
  });

  it('renders empty state for no data', () => {
    render(<MembersTable data={[]} />);
    expect(screen.getByText('0 members')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<MembersTable data={data} />);
    expect(screen.getByText('Child First Name')).toBeInTheDocument();
    expect(screen.getByText('Parent Email')).toBeInTheDocument();
  });
});

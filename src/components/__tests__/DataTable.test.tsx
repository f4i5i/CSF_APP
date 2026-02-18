/**
 * Unit Tests for DataTable Component
 * Tests rendering, sorting, pagination, expandable rows, column types, and callbacks
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '../admin/DataTable';

// Mock StatusBadge since DataTable imports it
jest.mock('../admin/StatusBadge', () => {
  return function MockStatusBadge({ status }: { status: string }) {
    return <span data-testid="status-badge">{status}</span>;
  };
});

describe('DataTable Component', () => {
  const defaultColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
  ];

  const defaultData = [
    { id: '1', name: 'Alice', email: 'alice@test.com', role: 'Admin' },
    { id: '2', name: 'Bob', email: 'bob@test.com', role: 'Coach' },
    { id: '3', name: 'Charlie', email: 'charlie@test.com', role: 'Parent' },
  ];

  const defaultProps = {
    columns: defaultColumns,
    data: defaultData,
    totalItems: 3,
    currentPage: 1,
    itemsPerPage: 10,
  };

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render table with column headers', () => {
      render(<DataTable {...defaultProps} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('should render data rows', () => {
      render(<DataTable {...defaultProps} />);
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('bob@test.com')).toBeInTheDocument();
      expect(screen.getByText('Parent')).toBeInTheDocument();
    });

    it('should show empty message when no data', () => {
      render(<DataTable columns={defaultColumns} data={[]} totalItems={0} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      render(
        <DataTable
          columns={defaultColumns}
          data={[]}
          totalItems={0}
          emptyMessage="No users found"
        />
      );
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('should render loading skeleton when loading', () => {
      const { container } = render(
        <DataTable columns={defaultColumns} data={[]} loading={true} />
      );
      // Loading skeleton has animate-pulse class
      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });

    it('should render column headers in loading state', () => {
      render(<DataTable columns={defaultColumns} data={[]} loading={true} />);
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  // ===========================================
  // COLUMN TYPE TESTS
  // ===========================================
  describe('Column Types', () => {
    it('should render status badge for status column type', () => {
      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status', type: 'status' },
      ];
      const data = [{ id: '1', name: 'Alice', status: 'active' }];

      render(<DataTable columns={columns} data={data} totalItems={1} />);
      expect(screen.getByTestId('status-badge')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('should render currency formatted values', () => {
      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'amount', label: 'Amount', type: 'currency' },
      ];
      const data = [{ id: '1', name: 'Order 1', amount: 150.5 }];

      render(<DataTable columns={columns} data={data} totalItems={1} />);
      expect(screen.getByText('$150.50')).toBeInTheDocument();
    });

    it('should render formatted date values', () => {
      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'created_at', label: 'Created', type: 'date' },
      ];
      const data = [{ id: '1', name: 'Item 1', created_at: '2024-03-15' }];

      render(<DataTable columns={columns} data={data} totalItems={1} />);
      expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument();
    });

    it('should render dash for null date', () => {
      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'created_at', label: 'Created', type: 'date' },
      ];
      const data = [{ id: '1', name: 'Item 1', created_at: null }];

      render(<DataTable columns={columns} data={data} totalItems={1} />);
      // The null date should render as "-"
      const cells = screen.getAllByRole('cell');
      const dateCell = cells.find((cell) => cell.textContent === '-');
      expect(dateCell).toBeInTheDocument();
    });

    it('should render dash for missing values', () => {
      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
      ];
      const data = [{ id: '1', name: 'Alice', phone: '' }];

      render(<DataTable columns={columns} data={data} totalItems={1} />);
      // Empty value should show dash
      const cells = screen.getAllByRole('cell');
      const emptyCell = cells.find((cell) => cell.textContent === '-');
      expect(emptyCell).toBeInTheDocument();
    });

    it('should render custom render function', () => {
      const columns = [
        { key: 'name', label: 'Name', render: (value: string) => <strong data-testid="custom-render">{value.toUpperCase()}</strong> },
      ];
      const data = [{ id: '1', name: 'Alice' }];

      render(<DataTable columns={columns} data={data} totalItems={1} />);
      expect(screen.getByTestId('custom-render')).toHaveTextContent('ALICE');
    });

    it('should render action buttons for actions column type', () => {
      const onEdit = jest.fn();
      const columns = [
        { key: 'name', label: 'Name' },
        {
          key: 'actions',
          label: 'Actions',
          type: 'actions',
          actions: [{ label: 'Edit', onClick: onEdit }],
        },
      ];
      const data = [{ id: '1', name: 'Alice' }];

      render(<DataTable columns={columns} data={data} totalItems={1} />);
      const editBtn = screen.getByTitle('Edit');
      expect(editBtn).toBeInTheDocument();

      fireEvent.click(editBtn);
      expect(onEdit).toHaveBeenCalled();
    });

    it('should support dynamic actions via function', () => {
      const onDelete = jest.fn();
      const columns = [
        { key: 'name', label: 'Name' },
        {
          key: 'actions',
          label: 'Actions',
          type: 'actions',
          actions: (row: any) => [
            { label: `Delete ${row.name}`, onClick: onDelete, variant: 'destructive' },
          ],
        },
      ];
      const data = [{ id: '1', name: 'Alice' }];

      render(<DataTable columns={columns} data={data} totalItems={1} />);
      const deleteBtn = screen.getByTitle('Delete Alice');
      expect(deleteBtn).toBeInTheDocument();
    });
  });

  // ===========================================
  // SORTING TESTS
  // ===========================================
  describe('Sorting', () => {
    it('should sort by column when sortable column header is clicked', () => {
      const columns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email' },
      ];

      render(
        <DataTable
          columns={columns}
          data={defaultData}
          totalItems={3}
          pagination={false}
        />
      );

      // Click the Name header to sort ascending
      fireEvent.click(screen.getByText('Name'));

      const rows = screen.getAllByRole('row');
      // First row is header, then data rows are sorted alphabetically
      expect(within(rows[1]).getByText('Alice')).toBeInTheDocument();
    });

    it('should toggle sort direction on second click', () => {
      const columns = [
        { key: 'name', label: 'Name', sortable: true },
      ];

      render(
        <DataTable
          columns={columns}
          data={defaultData}
          totalItems={3}
          pagination={false}
        />
      );

      // Click once for asc, second time for desc
      fireEvent.click(screen.getByText('Name'));
      fireEvent.click(screen.getByText('Name'));

      const rows = screen.getAllByRole('row');
      // Descending: Charlie should be first data row
      expect(within(rows[1]).getByText('Charlie')).toBeInTheDocument();
    });

    it('should not sort when non-sortable column header is clicked', () => {
      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
      ];

      render(
        <DataTable
          columns={columns}
          data={defaultData}
          totalItems={3}
          pagination={false}
        />
      );

      fireEvent.click(screen.getByText('Name'));

      // Order should remain the same
      const rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('Alice')).toBeInTheDocument();
    });
  });

  // ===========================================
  // PAGINATION TESTS
  // ===========================================
  describe('Pagination', () => {
    it('should display pagination info', () => {
      render(<DataTable {...defaultProps} totalItems={25} />);
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
    });

    it('should show page numbers', () => {
      render(
        <DataTable
          {...defaultProps}
          totalItems={50}
          currentPage={1}
          itemsPerPage={10}
        />
      );
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should call onPageChange when page number is clicked', () => {
      const onPageChange = jest.fn();
      render(
        <DataTable
          {...defaultProps}
          totalItems={50}
          currentPage={1}
          itemsPerPage={10}
          onPageChange={onPageChange}
        />
      );

      fireEvent.click(screen.getByText('2'));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when next button is clicked', () => {
      const onPageChange = jest.fn();
      render(
        <DataTable
          {...defaultProps}
          totalItems={50}
          currentPage={1}
          itemsPerPage={10}
          onPageChange={onPageChange}
        />
      );

      // Next button is the second ChevronRight/ChevronLeft button
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      fireEvent.click(nextButton);
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should disable prev button on first page', () => {
      render(
        <DataTable
          {...defaultProps}
          totalItems={50}
          currentPage={1}
          itemsPerPage={10}
        />
      );

      const buttons = screen.getAllByRole('button');
      // First pagination button is the prev button
      expect(buttons[0]).toBeDisabled();
    });

    it('should not show pagination when pagination is false', () => {
      render(
        <DataTable
          {...defaultProps}
          pagination={false}
        />
      );
      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // ROW CLICK TESTS
  // ===========================================
  describe('Row Click', () => {
    it('should call onRowClick when a row is clicked', () => {
      const onRowClick = jest.fn();
      render(<DataTable {...defaultProps} onRowClick={onRowClick} />);

      fireEvent.click(screen.getByText('Alice'));
      expect(onRowClick).toHaveBeenCalledWith(defaultData[0]);
    });

    it('should not throw when onRowClick is not provided', () => {
      expect(() => {
        render(<DataTable {...defaultProps} />);
        fireEvent.click(screen.getByText('Alice'));
      }).not.toThrow();
    });
  });

  // ===========================================
  // EXPANDABLE ROWS TESTS
  // ===========================================
  describe('Expandable Rows', () => {
    it('should render expand buttons when expandable is true', () => {
      render(
        <DataTable
          {...defaultProps}
          expandable={true}
          renderExpanded={(row) => <div>Details for {row.name}</div>}
        />
      );

      // There should be expand buttons for each row
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show expanded content when row is expanded', async () => {
      render(
        <DataTable
          {...defaultProps}
          expandable={true}
          renderExpanded={(row) => <div>Details for {row.name}</div>}
        />
      );

      // Click the first expand button (filter out pagination buttons)
      const allButtons = screen.getAllByRole('button');
      // Expand buttons are the first ones in each row
      fireEvent.click(allButtons[0]);

      expect(screen.getByText('Details for Alice')).toBeInTheDocument();
    });

    it('should call onExpand callback when expanding', async () => {
      const onExpand = jest.fn();
      render(
        <DataTable
          {...defaultProps}
          expandable={true}
          renderExpanded={(row) => <div>Details for {row.name}</div>}
          onExpand={onExpand}
        />
      );

      const allButtons = screen.getAllByRole('button');
      fireEvent.click(allButtons[0]);

      expect(onExpand).toHaveBeenCalledWith(defaultData[0]);
    });
  });

  // ===========================================
  // CURRENCY EDGE CASES
  // ===========================================
  describe('Currency Edge Cases', () => {
    it('should handle null currency values', () => {
      const columns = [
        { key: 'amount', label: 'Amount', type: 'currency' },
      ];
      const data = [{ id: '1', amount: null }];

      render(<DataTable columns={columns} data={data} totalItems={1} />);
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle zero currency values', () => {
      const columns = [
        { key: 'amount', label: 'Amount', type: 'currency' },
      ];
      const data = [{ id: '1', amount: 0 }];

      render(<DataTable columns={columns} data={data} totalItems={1} />);
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });
});

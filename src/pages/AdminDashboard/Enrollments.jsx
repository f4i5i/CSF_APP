/**
 * Enrollments Management Page
 * Admin page for managing class enrollments
 */

import React, { useState, useEffect } from 'react';
import { Users, Eye, XCircle, CheckCircle, Calendar } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import enrollmentsService from '../../api/services/enrollments.service';

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
  });

  useEffect(() => {
    fetchEnrollments();
  }, [currentPage, statusFilter, classFilter, searchQuery]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await enrollmentsService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        class_id: classFilter,
        search: searchQuery,
      });
      setEnrollments(response.data || response);
      setTotalItems(response.total || response.length);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (enrollmentId, newStatus) => {
    try {
      await enrollmentsService.update(enrollmentId, { status: newStatus });
      fetchEnrollments();
    } catch (error) {
      console.error('Failed to update enrollment status:', error);
      alert('Failed to update enrollment status');
    }
  };

  const handleCancelEnrollment = async (enrollmentId, reason) => {
    try {
      await enrollmentsService.cancel(enrollmentId, { reason });
      fetchEnrollments();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error('Failed to cancel enrollment:', error);
      alert('Failed to cancel enrollment');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (value) => <span className="font-mono text-sm">#{value}</span>,
    },
    {
      key: 'child',
      label: 'Child',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151]">
            {row.child?.first_name} {row.child?.last_name}
          </p>
          <p className="text-xs text-gray-500">Age: {row.child?.age || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'parent',
      label: 'Parent',
      render: (value, row) => (
        <div>
          <p className="text-sm text-gray-700">
            {row.parent?.first_name} {row.parent?.last_name}
          </p>
          <p className="text-xs text-gray-500">{row.parent?.email}</p>
        </div>
      ),
    },
    {
      key: 'class',
      label: 'Class',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151] text-sm">{row.class?.name}</p>
          <p className="text-xs text-gray-500">{row.class?.schedule}</p>
        </div>
      ),
    },
    {
      key: 'start_date',
      label: 'Start Date',
      type: 'date',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true,
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (value) => (
        <span className={`text-xs font-semibold ${value === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
          {value || 'Pending'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'right',
      actions: (row) => [
        {
          label: 'View Details',
          icon: Eye,
          onClick: () => alert(`View enrollment ${row.id}`),
        },
        {
          label: 'View Attendance',
          icon: Calendar,
          onClick: () => alert(`View attendance for ${row.id}`),
        },
        {
          label: 'Mark as Active',
          icon: CheckCircle,
          onClick: () => handleUpdateStatus(row.id, 'active'),
          disabled: row.status === 'active',
        },
        {
          label: 'Cancel Enrollment',
          icon: XCircle,
          variant: 'destructive',
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: 'Cancel Enrollment',
              message: `Are you sure you want to cancel the enrollment for ${row.child?.first_name}?`,
              action: () => handleCancelEnrollment(row.id, 'Cancelled by admin'),
            });
          },
          disabled: row.status === 'cancelled',
        },
      ],
    },
  ];

  const filters = [
    {
      type: 'select',
      placeholder: 'All Statuses',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ];

  const hasActiveFilters = statusFilter || classFilter || searchQuery;
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setClassFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#173151] font-manrope">
            Enrollments Management
          </h1>
          <p className="text-gray-600 font-manrope mt-1">
            View and manage all class enrollments
          </p>
        </div>

        <FilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search by child name, parent, or class..."
          onSearch={setSearchQuery}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <DataTable
          columns={columns}
          data={enrollments}
          loading={loading}
          emptyMessage="No enrollments found"
          pagination={true}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
      />
    </div>
  );
}

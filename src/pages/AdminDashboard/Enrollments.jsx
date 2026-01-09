/**
 * Enrollments Management Page
 * Admin page for managing class enrollments with full CRUD
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, XCircle, CheckCircle } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import EnrollmentFormModal from '../../components/admin/EnrollmentFormModal';
import enrollmentsService from '../../api/services/enrollments.service';
import classesService from '../../api/services/classes.service';
import toast from 'react-hot-toast';
import Header from '../../components/Header';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'waitlisted', label: 'Waitlisted' },
];

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  waitlisted: 'bg-purple-100 text-purple-800',
};

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [classes, setClasses] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classesService.getAll({ limit: 100 });
      setClasses(response.items || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const params = {
        limit: itemsPerPage,
        offset,
      };

      if (statusFilter) params.status = statusFilter;
      if (classFilter) params.class_id = classFilter;

      const response = await enrollmentsService.getAll(params);
      setEnrollments(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      toast.error('Failed to load enrollments');
      setEnrollments([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, classFilter, searchQuery]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleCreateEnrollment = () => {
    setModalMode('create');
    setSelectedEnrollment(null);
    setModalOpen(true);
  };

  const handleEditEnrollment = (enrollment) => {
    setModalMode('edit');
    setSelectedEnrollment(enrollment);
    setModalOpen(true);
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    try {
      await enrollmentsService.delete(enrollmentId);
      toast.success('Enrollment deleted successfully');
      fetchEnrollments();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error('Failed to delete enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete enrollment');
    }
  };

  const handleCancelEnrollment = async (enrollmentId) => {
    try {
      await enrollmentsService.cancel(enrollmentId, { reason: 'Cancelled by admin' });
      toast.success('Enrollment cancelled successfully');
      fetchEnrollments();
      setConfirmDialog({ isOpen: false });
    } catch (error) {
      console.error('Failed to cancel enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel enrollment');
    }
  };

  const handleActivateEnrollment = async (enrollmentId) => {
    try {
      await enrollmentsService.activate(enrollmentId);
      toast.success('Enrollment activated successfully');
      fetchEnrollments();
    } catch (error) {
      console.error('Failed to activate enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to activate enrollment');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEnrollment(null);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setSelectedEnrollment(null);
    fetchEnrollments();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const columns = [
    {
      key: 'child_name',
      label: 'Child',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151] font-manrope">
            {value || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500 font-manrope">ID: {row.child_id?.slice(0, 8)}...</p>
        </div>
      ),
    },
    {
      key: 'class_name',
      label: 'Class',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151] text-sm font-manrope">{value || 'Unknown'}</p>
          <p className="text-xs text-gray-500 font-manrope">ID: {row.class_id?.slice(0, 8)}...</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
            STATUS_COLORS[value] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'final_price',
      label: 'Price',
      render: (value, row) => (
        <div className="text-sm font-manrope">
          <p className="font-semibold text-[#173151]">{formatPrice(value)}</p>
          {row.discount_amount > 0 && (
            <p className="text-xs text-green-600">-{formatPrice(row.discount_amount)} discount</p>
          )}
        </div>
      ),
    },
    {
      key: 'enrolled_at',
      label: 'Enrolled',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 font-manrope">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-500 font-manrope">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'right',
      actions: (row) => {
        const actions = [
          {
            label: 'Edit',
            icon: Edit,
            onClick: () => handleEditEnrollment(row),
          },
        ];

        // Add activate button for pending enrollments
        if (row.status === 'pending') {
          actions.push({
            label: 'Activate',
            icon: CheckCircle,
            onClick: () => handleActivateEnrollment(row.id),
          });
        }

        // Add cancel button for active/pending enrollments
        if (row.status === 'active' || row.status === 'pending') {
          actions.push({
            label: 'Cancel',
            icon: XCircle,
            variant: 'warning',
            onClick: () => {
              setConfirmDialog({
                isOpen: true,
                title: 'Cancel Enrollment',
                message: `Are you sure you want to cancel the enrollment for "${row.child_name}" in "${row.class_name}"?`,
                action: () => handleCancelEnrollment(row.id),
              });
            },
          });
        }

        // Always add delete button
        actions.push({
          label: 'Delete',
          icon: Trash2,
          variant: 'destructive',
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: 'Delete Enrollment',
              message: `Are you sure you want to permanently delete this enrollment? This action cannot be undone.`,
              action: () => handleDeleteEnrollment(row.id),
            });
          },
        });

        return actions;
      },
    },
  ];

  const filters = [
    {
      type: 'select',
      placeholder: 'All Statuses',
      value: statusFilter,
      onChange: setStatusFilter,
      options: STATUS_OPTIONS,
    },
    {
      type: 'select',
      placeholder: 'All Classes',
      value: classFilter,
      onChange: setClassFilter,
      options: [
        { value: '', label: 'All Classes' },
        ...classes.map((c) => ({ value: c.id, label: c.name })),
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
    <div className="h-full">
      <Header />

      <div className="max-w-9xl mx-auto sm:px-4 px-0">
        <div className="mb-8 flex lg:flex-row flex-col lg:items-center items-start lg:gap-0 gap-4 justify-between">
          <div>
            <h1 className="lg:text-[46px] text-[20px] md:text-[30px] font-bold text-text-primary font-kollektif">
              Enrollments Management
            </h1>
            <p className="text-neutral-main font-manrope mt-1">
              Create, manage, and track all class enrollments
            </p>
          </div>

          <button
            onClick={handleCreateEnrollment}
            className="flex items-center gap-2 font-manrope bg-btn-gold text-text-body px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Enrollment
          </button>
        </div>

        <FilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search by child or class name..."
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

      <EnrollmentFormModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        initialData={selectedEnrollment}
        onSuccess={handleModalSuccess}
      />

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

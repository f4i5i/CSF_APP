/**
 * Enrollments Management Page
 * Admin page for managing class enrollments with full CRUD
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, XCircle, CheckCircle, Eye, X, Calendar, Clock, MapPin, Users, DollarSign, Tag, User, Loader2 } from 'lucide-react';
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

  const [viewModal, setViewModal] = useState({ isOpen: false, enrollment: null, classData: null, loadingDetails: false });

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
  }, [currentPage, statusFilter, classFilter]);

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
      toast.error(error.message || 'Failed to delete enrollment');
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
      toast.error(error.message || 'Failed to cancel enrollment');
    }
  };

  const handleActivateEnrollment = async (enrollmentId) => {
    try {
      await enrollmentsService.activate(enrollmentId);
      toast.success('Enrollment activated successfully');
      fetchEnrollments();
    } catch (error) {
      console.error('Failed to activate enrollment:', error);
      toast.error(error.message || 'Failed to activate enrollment');
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

  const handleViewEnrollment = async (enrollment) => {
    setViewModal({ isOpen: true, enrollment, classData: null, loadingDetails: true });
    try {
      const [fullEnrollment, classData] = await Promise.allSettled([
        enrollmentsService.getById(enrollment.id),
        enrollment.class_id ? classesService.getById(enrollment.class_id) : Promise.resolve(null),
      ]);
      setViewModal(prev => ({
        ...prev,
        enrollment: fullEnrollment.status === 'fulfilled' ? fullEnrollment.value : enrollment,
        classData: classData.status === 'fulfilled' ? classData.value : null,
        loadingDetails: false,
      }));
    } catch {
      setViewModal(prev => ({ ...prev, loadingDetails: false }));
    }
  };

  const closeViewModal = () => {
    setViewModal({ isOpen: false, enrollment: null, classData: null, loadingDetails: false });
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
      key: 'selected_custom_fees',
      label: 'Fees',
      render: (value) => {
        const fees = value || [];
        if (fees.length === 0) {
          return <span className="text-xs text-gray-400 font-manrope">None</span>;
        }
        const total = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
        return (
          <div className="text-sm font-manrope">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              {fees.length} fee{fees.length > 1 ? 's' : ''}
            </span>
            <p className="text-xs text-gray-500 mt-0.5">{formatPrice(total)}</p>
          </div>
        );
      },
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
            label: 'View',
            icon: Eye,
            onClick: () => handleViewEnrollment(row),
          },
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
    <div className="h-full flex flex-col overflow-hidden">
      <Header />

      <div className="max-w-9xl mx-auto px-3 sm:px-4 py-4 flex-1 flex flex-col min-h-0 w-full">
        <div className="shrink-0 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center items-start gap-3 sm:gap-4 justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-[30px] lg:text-[46px] font-bold text-text-primary font-kollektif truncate">
              Enrollments Management
            </h1>
            <p className="text-xs sm:text-sm text-neutral-main font-manrope mt-1 hidden sm:block">
              Create, manage, and track all class enrollments
            </p>
          </div>

          <button
            onClick={handleCreateEnrollment}
            className="flex items-center gap-1.5 sm:gap-2 font-manrope bg-btn-gold text-text-body px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Create </span>Enrollment
          </button>
        </div>

        <div className="shrink-0">
          <FilterBar
            searchValue={searchQuery}
            searchPlaceholder="Search by child or class name..."
            onSearch={setSearchQuery}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col pb-2">
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

      {/* View Enrollment Modal */}
      {viewModal.isOpen && (() => {
        const enr = viewModal.enrollment;
        const cls = viewModal.classData;
        const isLoading = viewModal.loadingDetails;

        const statusLabel = enr?.status || 'N/A';
        const statusColor = STATUS_COLORS[statusLabel] || 'bg-gray-100 text-gray-800';

        const childName = enr?.child_name || enr?.child?.first_name
          ? `${enr?.child?.first_name || ''} ${enr?.child?.last_name || ''}`.trim()
          : 'Unknown';
        const className = enr?.class_name || cls?.name || 'Unknown';
        const schoolName = enr?.school_name || cls?.school?.name || cls?.school_name || '';
        const programName = cls?.program?.name || cls?.program_name || '';
        const areaName = cls?.area?.name || cls?.area_name || '';

        const weekdays = enr?.weekdays || cls?.weekdays || [];
        const scheduleStr = weekdays.length > 0
          ? `${weekdays.map(d => d.substring(0, 3)).join(', ')} ${cls?.start_time || ''} – ${cls?.end_time || ''}`
          : cls?.schedule?.length > 0
            ? cls.schedule.map(s => `${s.day_of_week?.substring(0, 3)} ${s.start_time}-${s.end_time}`).join(', ')
            : 'N/A';

        const selectedFees = enr?.selected_custom_fees || [];
        const allClassFees = cls?.custom_fees || [];
        const selectedFeeNames = new Set(selectedFees.map(f => f.name));
        const hasAnyFees = allClassFees.length > 0 || selectedFees.length > 0;

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={closeViewModal}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg text-heading-dark font-manrope flex items-center gap-1.5 sm:gap-2">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-btn-gold shrink-0" />
                    Enrollment Details
                  </h3>
                </div>
                <button
                  onClick={closeViewModal}
                  className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-btn-gold" />
                  </div>
                ) : (
                  <>
                    {/* Title + Status */}
                    <div className="mb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-heading-dark font-manrope">{className}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${statusColor}`}>
                          {statusLabel}
                        </span>
                        {programName && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{programName}</span>
                        )}
                        {areaName && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">{areaName}</span>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Child */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <User className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Child</span>
                        </div>
                        <p className="text-sm text-text-primary font-manrope font-semibold">{childName}</p>
                        {enr?.child_id && <p className="text-xs text-text-muted font-mono mt-0.5">ID: {enr.child_id.slice(0, 8)}...</p>}
                      </div>

                      {/* Schedule */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Calendar className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Schedule</span>
                        </div>
                        <p className="text-sm text-text-primary font-manrope">{scheduleStr}</p>
                      </div>

                      {/* Dates */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Clock className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Class Dates</span>
                        </div>
                        <p className="text-sm text-text-primary font-manrope">
                          {cls?.start_date ? new Date(cls.start_date).toLocaleDateString() : 'N/A'} — {cls?.end_date ? new Date(cls.end_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>

                      {/* Enrolled Date */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Enrolled On</span>
                        </div>
                        <p className="text-sm text-text-primary font-manrope">{formatDate(enr?.enrolled_at || enr?.created_at)}</p>
                      </div>

                      {/* Location */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <MapPin className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</span>
                        </div>
                        <p className="text-sm text-text-primary font-manrope">{cls?.location || schoolName || 'To be announced'}</p>
                      </div>

                      {/* Capacity */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Users className="w-3.5 h-3.5 text-btn-gold shrink-0" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Capacity</span>
                        </div>
                        <p className="text-sm text-text-primary font-manrope">
                          <span className="font-semibold">{cls?.current_enrollment || 0}</span>
                          <span className="text-text-muted"> / {cls?.capacity || 0} enrolled</span>
                        </p>
                      </div>

                      {/* Cancellation Info (if cancelled) */}
                      {enr?.status === 'cancelled' && (
                        <div className="bg-red-50 rounded-lg p-3 sm:col-span-2">
                          <div className="flex items-center gap-2 mb-1.5">
                            <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Cancellation</span>
                          </div>
                          <p className="text-sm text-red-700 font-manrope">
                            {enr.cancelled_at ? `Cancelled on ${formatDate(enr.cancelled_at)}` : 'Cancelled'}
                            {enr.cancellation_reason && ` — ${enr.cancellation_reason}`}
                          </p>
                        </div>
                      )}

                      {/* Waitlist Info (if waitlisted) */}
                      {enr?.status === 'waitlisted' && (
                        <div className="bg-purple-50 rounded-lg p-3 sm:col-span-2">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Waitlist</span>
                          </div>
                          <p className="text-sm text-purple-700 font-manrope">
                            Priority: <span className="font-semibold capitalize">{enr.waitlist_priority || 'Regular'}</span>
                            {enr.auto_promote && ' • Auto-promote enabled'}
                            {enr.claim_window_expires_at && ` • Claim expires: ${formatDate(enr.claim_window_expires_at)}`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Pricing Section */}
                    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2.5 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-btn-gold shrink-0" />
                          <span className="text-sm font-semibold text-heading-dark font-manrope">Pricing</span>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-muted font-manrope">Base Price</span>
                          <span className="text-sm font-semibold text-heading-dark font-manrope">{formatPrice(enr?.base_price)}</span>
                        </div>
                        {Number(enr?.discount_amount) > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600 font-manrope">Discount</span>
                            <span className="text-sm font-semibold text-green-600 font-manrope">-{formatPrice(enr.discount_amount)}</span>
                          </div>
                        )}
                        {selectedFees.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted font-manrope">Custom Fees ({selectedFees.length})</span>
                            <span className="text-sm font-semibold text-heading-dark font-manrope">
                              {formatPrice(selectedFees.reduce((sum, f) => sum + Number(f.amount || 0), 0))}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
                          <span className="text-sm font-semibold text-text-primary font-manrope">Final Price</span>
                          <span className="text-lg font-bold text-heading-dark font-manrope">{formatPrice(enr?.final_price)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Custom Fees Breakdown - Paid vs Not Paid */}
                    {hasAnyFees && (
                      <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2.5 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-btn-gold shrink-0" />
                            <span className="text-sm font-semibold text-heading-dark font-manrope">Custom Fees</span>
                            {selectedFees.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                                {selectedFees.length} paid
                              </span>
                            )}
                            {allClassFees.filter(f => !selectedFeeNames.has(f.name)).length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
                                {allClassFees.filter(f => !selectedFeeNames.has(f.name)).length} skipped
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-3 sm:p-4 space-y-2">
                          {/* Show all class fees with paid/not-paid status */}
                          {allClassFees.length > 0 ? allClassFees.map((fee, idx) => {
                            const isPaid = selectedFeeNames.has(fee.name);
                            return (
                              <div key={idx} className={`flex items-start justify-between rounded-lg px-3 py-2.5 ${isPaid ? 'bg-green-50' : 'bg-gray-50'}`}>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    {isPaid ? (
                                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
                                    )}
                                    <p className={`text-sm font-medium font-manrope truncate ${isPaid ? 'text-text-primary' : 'text-gray-400'}`}>
                                      {fee.name || 'Unnamed Fee'}
                                    </p>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                                      fee.is_optional ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                      {fee.is_optional ? 'Optional' : 'Required'}
                                    </span>
                                  </div>
                                  {fee.description && (
                                    <p className="text-xs text-text-muted font-manrope mt-0.5 ml-6">{fee.description}</p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end shrink-0 ml-3">
                                  <span className={`text-sm font-bold font-manrope ${isPaid ? 'text-heading-dark' : 'text-gray-400 line-through'}`}>
                                    {formatPrice(fee.amount)}
                                  </span>
                                  <span className={`text-[10px] font-semibold mt-0.5 ${isPaid ? 'text-green-600' : 'text-gray-400'}`}>
                                    {isPaid ? 'Paid' : 'Not Paid'}
                                  </span>
                                </div>
                              </div>
                            );
                          }) : (
                            /* Fallback: if class data not loaded, show selected fees only */
                            selectedFees.map((fee, idx) => (
                              <div key={idx} className="flex items-start justify-between bg-green-50 rounded-lg px-3 py-2.5">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                  <p className="text-sm font-medium text-text-primary font-manrope truncate">{fee.name || 'Fee'}</p>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                                    fee.is_optional ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                                  }`}>
                                    {fee.is_optional ? 'Optional' : 'Required'}
                                  </span>
                                </div>
                                <div className="flex flex-col items-end shrink-0 ml-3">
                                  <span className="text-sm font-bold text-heading-dark font-manrope">{formatPrice(fee.amount)}</span>
                                  <span className="text-[10px] font-semibold text-green-600 mt-0.5">Paid</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Subscription Info (if applicable) */}
                    {enr?.stripe_subscription_id && (
                      <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2.5 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-btn-gold shrink-0" />
                            <span className="text-sm font-semibold text-heading-dark font-manrope">Subscription</span>
                          </div>
                        </div>
                        <div className="p-3 sm:p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted font-manrope">Status</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                              enr.subscription_status === 'active' ? 'bg-green-100 text-green-800'
                                : enr.subscription_status === 'past_due' ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {enr.subscription_status || 'N/A'}
                            </span>
                          </div>
                          {enr.current_period_start && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-text-muted font-manrope">Current Period</span>
                              <span className="text-sm text-text-primary font-manrope">
                                {formatDate(enr.current_period_start)} — {formatDate(enr.current_period_end)}
                              </span>
                            </div>
                          )}
                          {enr.cancel_at_period_end && (
                            <p className="text-xs text-amber-600 font-manrope mt-1">Cancels at end of current period</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 sm:p-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-manrope"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

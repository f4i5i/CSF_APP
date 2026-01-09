/**
 * Installments Management Page
 * Admin page for managing installment plans and payment schedules
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  Bell,
  Eye,
  AlertCircle,
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import installmentsService from '../../api/services/installments.service';

export default function Installments() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Modal states
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await installmentsService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
        search: searchQuery,
        overdue: overdueOnly,
      });

      setPlans(response.data || response);
      setTotalItems(response.total || response.length);
    } catch (error) {
      console.error('Failed to fetch installment plans:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery, overdueOnly]);

  // Fetch installment plans
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Mark payment as paid
  const handleMarkAsPaid = async (planId, paymentId) => {
    setIsProcessing(true);
    try {
      await installmentsService.markAsPaid(planId, paymentId);
      alert('Payment marked as paid successfully');
      fetchPlans();
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    } catch (error) {
      console.error('Failed to mark payment as paid:', error);
      alert('Failed to mark payment as paid');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel installment plan
  const handleCancelPlan = async (planId, reason) => {
    setIsProcessing(true);
    try {
      await installmentsService.cancel(planId, { reason });
      alert('Installment plan cancelled successfully');
      fetchPlans();
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    } catch (error) {
      console.error('Failed to cancel plan:', error);
      alert('Failed to cancel installment plan');
    } finally {
      setIsProcessing(false);
    }
  };

  // Send payment reminder
  const handleSendReminder = async (planId) => {
    try {
      await installmentsService.sendReminder(planId);
      alert('Payment reminder sent successfully');
    } catch (error) {
      console.error('Failed to send reminder:', error);
      alert('Failed to send payment reminder');
    }
  };

  // Define table columns
  const columns = [
    {
      key: 'id',
      label: 'Plan ID',
      sortable: true,
      render: (value) => <span className="font-mono text-sm">#{value}</span>,
    },
    {
      key: 'user',
      label: 'Customer',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151]">
            {row.user?.first_name} {row.user?.last_name}
          </p>
          <p className="text-xs text-gray-500">{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'child',
      label: 'Child',
      render: (value, row) => (
        <span className="text-gray-700">
          {row.child?.first_name} {row.child?.last_name}
        </span>
      ),
    },
    {
      key: 'class',
      label: 'Class',
      render: (value, row) => (
        <span className="text-gray-700">{row.class?.name || '-'}</span>
      ),
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      type: 'currency',
      sortable: true,
      align: 'right',
    },
    {
      key: 'paid_count',
      label: 'Payments',
      render: (value, row) => (
        <div className="text-sm">
          <span className="font-semibold text-[#173151]">
            {row.paid_count || 0}/{row.total_count || 0}
          </span>
          <p className="text-xs text-gray-500">
            ${parseFloat(row.amount_paid || 0).toFixed(2)} paid
          </p>
        </div>
      ),
    },
    {
      key: 'next_due_date',
      label: 'Next Due',
      render: (value, row) => {
        if (!value || row.status === 'completed') {
          return <span className="text-xs text-gray-500">-</span>;
        }

        const dueDate = new Date(value);
        const isOverdue = dueDate < new Date();

        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
            <div className="flex items-center gap-1">
              {isOverdue && <AlertCircle className="w-4 h-4" />}
              <span>{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            {isOverdue && (
              <span className="text-xs font-semibold">OVERDUE</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'right',
      actions: (row) => [
        {
          label: 'View Schedule',
          icon: Eye,
          onClick: () => alert(`View payment schedule for plan ${row.id}`),
        },
        {
          label: 'Mark Next as Paid',
          icon: CheckCircle,
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: 'Mark Payment as Paid',
              message: 'Are you sure you want to mark the next installment payment as paid? This cannot be undone.',
              action: () => handleMarkAsPaid(row.id, row.next_payment_id),
            });
          },
          disabled: row.status === 'completed' || row.status === 'cancelled',
        },
        {
          label: 'Send Reminder',
          icon: Bell,
          onClick: () => handleSendReminder(row.id),
          disabled: row.status === 'completed' || row.status === 'cancelled',
        },
        {
          label: 'Cancel Plan',
          icon: XCircle,
          variant: 'destructive',
          onClick: () => {
            setConfirmDialog({
              isOpen: true,
              title: 'Cancel Installment Plan',
              message: `Are you sure you want to cancel this installment plan? This action cannot be undone.`,
              action: () => handleCancelPlan(row.id, 'Cancelled by admin'),
            });
          },
          disabled: row.status === 'completed' || row.status === 'cancelled',
        },
      ],
    },
  ];

  // Filter configuration
  const filters = [
    {
      type: 'select',
      placeholder: 'All Statuses',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'overdue', label: 'Overdue' },
      ],
    },
  ];

  const hasActiveFilters = statusFilter || searchQuery || overdueOnly;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setOverdueOnly(false);
    setCurrentPage(1);
  };

  // Calculate stats
  const overduePlans = plans.filter((p) => {
    if (!p.next_due_date || p.status !== 'active') return false;
    return new Date(p.next_due_date) < new Date();
  }).length;

  const totalActive = plans.filter((p) => p.status === 'active').length;

  return (
    <div className="h-full py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#173151] font-manrope">
                Installments Management
              </h1>
              <p className="text-gray-600 font-manrope mt-1">
                Manage payment plans and schedules
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[120px]">
                <p className="text-sm text-gray-600 font-manrope">Active Plans</p>
                <p className="text-2xl font-bold text-[#173151] font-manrope mt-1">
                  {totalActive}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[120px]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-gray-600 font-manrope">Overdue</p>
                </div>
                <p className="text-2xl font-bold text-red-600 font-manrope mt-1">
                  {overduePlans}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search by customer name, child, or class..."
          onSearch={setSearchQuery}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {/* Overdue Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="w-4 h-4 text-[#F3BC48] focus:ring-[#F3BC48] rounded"
            />
            <span className="text-sm font-manrope text-gray-700 font-semibold">
              Show Overdue Only
            </span>
          </label>
        </div>

        {/* Installments Table */}
        <DataTable
          columns={columns}
          data={plans}
          loading={loading}
          emptyMessage="No installment plans found"
          pagination={true}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="warning"
        isLoading={isProcessing}
      />
    </div>
  );
}

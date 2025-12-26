/**
 * Refunds Management Page
 * Admin page for reviewing and processing refund requests
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import Header from '../../components/Header';
import adminService from '../../api/services/admin.service';
import toast from 'react-hot-toast';

export default function RefundsManagement() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [processedRefunds, setProcessedRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingRefunds();
    } else {
      fetchProcessedRefunds();
    }
  }, [activeTab, currentPage, searchQuery, dateFrom, dateTo]);

  const fetchPendingRefunds = async () => {
    setLoading(true);
    try {
      const response = await adminService.getPendingRefunds();
      setPendingRefunds(response.items || []);
      setTotalItems(response.total || response.items?.length || 0);
    } catch (error) {
      console.error('Failed to fetch pending refunds:', error);
      toast.error('Failed to load pending refunds');
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessedRefunds = async () => {
    setLoading(true);
    try {
      const response = await adminService.getRefunds({
        payment_status: activeTab === 'approved' ? 'refunded' : 'partially_refunded',
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        start_date: dateFrom || undefined,
        end_date: dateTo || undefined,
      });
      setProcessedRefunds(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch processed refunds:', error);
      toast.error('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (refund) => {
    setSelectedRefund(refund);
    setShowApproveModal(true);
  };

  const handleReject = (refund) => {
    setSelectedRefund(refund);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRefund) return;
    setProcessing(true);
    try {
      await adminService.approveRefund(selectedRefund.payment_id);
      toast.success('Refund approved successfully');
      setShowApproveModal(false);
      setSelectedRefund(null);
      fetchPendingRefunds();
    } catch (error) {
      console.error('Failed to approve refund:', error);
      toast.error(error.response?.data?.detail || 'Failed to approve refund');
    } finally {
      setProcessing(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedRefund || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setProcessing(true);
    try {
      await adminService.rejectRefund(selectedRefund.payment_id, rejectReason);
      toast.success('Refund rejected');
      setShowRejectModal(false);
      setSelectedRefund(null);
      setRejectReason('');
      fetchPendingRefunds();
    } catch (error) {
      console.error('Failed to reject refund:', error);
      toast.error(error.response?.data?.detail || 'Failed to reject refund');
    } finally {
      setProcessing(false);
    }
  };

  const pendingColumns = [
    {
      key: 'payment_id',
      label: 'Payment ID',
      render: (value) => (
        <span className="font-mono text-sm text-gray-600">{value?.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'user_name',
      label: 'Customer',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151]">{value || 'N/A'}</p>
          <p className="text-xs text-gray-500">{row.user_email}</p>
        </div>
      ),
    },
    {
      key: 'original_amount',
      label: 'Original',
      render: (value) => (
        <span className="text-gray-600">${parseFloat(value || 0).toFixed(2)}</span>
      ),
      align: 'right',
    },
    {
      key: 'refund_amount',
      label: 'Refund Amount',
      render: (value) => (
        <span className="font-semibold text-red-600">${parseFloat(value || 0).toFixed(2)}</span>
      ),
      align: 'right',
    },
    {
      key: 'refund_requested_at',
      label: 'Requested',
      type: 'date',
      sortable: true,
    },
    {
      key: 'payment_type',
      label: 'Type',
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 capitalize">
          {value || 'N/A'}
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
          label: 'Approve',
          icon: CheckCircle,
          onClick: () => handleApprove(row),
          className: 'text-green-600 hover:text-green-700',
        },
        {
          label: 'Reject',
          icon: XCircle,
          onClick: () => handleReject(row),
          className: 'text-red-600 hover:text-red-700',
        },
      ],
    },
  ];

  const processedColumns = [
    {
      key: 'payment_id',
      label: 'Payment ID',
      render: (value) => (
        <span className="font-mono text-sm text-gray-600">{value?.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'user_name',
      label: 'Customer',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151]">{value || 'N/A'}</p>
          <p className="text-xs text-gray-500">{row.user_email}</p>
        </div>
      ),
    },
    {
      key: 'original_amount',
      label: 'Original',
      render: (value) => (
        <span className="text-gray-600">${parseFloat(value || 0).toFixed(2)}</span>
      ),
      align: 'right',
    },
    {
      key: 'refund_amount',
      label: 'Refunded',
      render: (value) => (
        <span className="font-semibold text-green-600">${parseFloat(value || 0).toFixed(2)}</span>
      ),
      align: 'right',
    },
    {
      key: 'refunded_at',
      label: 'Processed',
      type: 'date',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => {
        const statusConfig = {
          refunded: { label: 'Refunded', color: 'green', icon: CheckCircle },
          partially_refunded: { label: 'Partial', color: 'yellow', icon: AlertCircle },
        };
        const config = statusConfig[value] || statusConfig.refunded;
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-${config.color}-100 text-${config.color}-800`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
        );
      },
    },
  ];

  const filters = [
    {
      type: 'daterange',
      startValue: dateFrom,
      endValue: dateTo,
      onStartChange: setDateFrom,
      onEndChange: setDateTo,
    },
  ];

  const hasActiveFilters = searchQuery || dateFrom || dateTo;
  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const totalPendingAmount = pendingRefunds.reduce(
    (sum, r) => sum + parseFloat(r.refund_amount || 0),
    0
  );

  const tabs = [
    { id: 'pending', label: 'Pending', icon: Clock, count: pendingRefunds.length },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', icon: XCircle },
  ];

  return (
    <div className="h-full max-sm:pb-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#173151] font-manrope">
                Refunds Management
              </h1>
              <p className="text-gray-600 font-manrope mt-1">
                Review and process refund requests
              </p>
            </div>

            {activeTab === 'pending' && pendingRefunds.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[160px]">
                <p className="text-sm text-gray-600 font-manrope">Pending Refunds</p>
                <p className="text-2xl font-bold text-red-600 font-manrope mt-1">
                  ${totalPendingAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-manrope text-sm transition-colors ${
                  isActive
                    ? 'bg-[#173151] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-white/20' : 'bg-red-100 text-red-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab !== 'pending' && (
          <FilterBar
            searchValue={searchQuery}
            searchPlaceholder="Search by customer name or email..."
            onSearch={setSearchQuery}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <DataTable
            columns={activeTab === 'pending' ? pendingColumns : processedColumns}
            data={activeTab === 'pending' ? pendingRefunds : processedRefunds}
            loading={loading}
            emptyMessage={
              activeTab === 'pending'
                ? 'No pending refund requests'
                : 'No refunds found'
            }
            pagination={activeTab !== 'pending'}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Approve Modal */}
        {showApproveModal && selectedRefund && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#173151]">Approve Refund</h2>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-medium">{selectedRefund.user_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Original Amount</span>
                  <span className="font-medium">${parseFloat(selectedRefund.original_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Refund Amount</span>
                  <span className="font-bold text-green-600 text-lg">
                    ${parseFloat(selectedRefund.refund_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                This will process the refund through Stripe and credit the customer's payment method.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve Refund
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedRefund && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#173151]">Reject Refund</h2>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-medium">{selectedRefund.user_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Refund Requested</span>
                  <span className="font-medium text-red-600">
                    ${parseFloat(selectedRefund.refund_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this refund request..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={processing || !rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Reject Refund
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

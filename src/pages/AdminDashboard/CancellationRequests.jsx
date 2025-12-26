/**
 * Cancellation Requests Management Page
 * Admin page for reviewing and processing enrollment cancellation requests
 *
 * Policy:
 * - 15+ days before class start: Auto-approved with refund
 * - Less than 15 days: Requires admin review
 */

import React, { useState, useEffect } from 'react';
import {
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import Header from '../../components/Header';
import adminService from '../../api/services/admin.service';
import toast from 'react-hot-toast';

export default function CancellationRequests() {
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    auto_approved: 0,
    rejected: 0,
    total_refunded: '0.00',
  });
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [activeTab, currentPage]);

  const fetchStats = async () => {
    try {
      const data = await adminService.getCancellationRequestStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === 'pending') {
        data = await adminService.getPendingCancellationRequests();
      } else {
        data = await adminService.getCancellationRequests({
          status: activeTab,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        });
      }
      setRequests(data.items || []);
      setTotalItems(data.total || data.items?.length || 0);
    } catch (error) {
      console.error('Failed to fetch cancellation requests:', error);
      toast.error('Failed to load cancellation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setApprovedAmount(request.requested_refund_amount || '');
    setAdminNotes('');
    setShowApproveModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectReason('');
    setAdminNotes('');
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      const body = {
        admin_notes: adminNotes || undefined,
      };
      if (approvedAmount && parseFloat(approvedAmount) !== parseFloat(selectedRequest.requested_refund_amount)) {
        body.approved_amount = parseFloat(approvedAmount);
      }
      await adminService.approveCancellationRequest(selectedRequest.id, body);
      toast.success('Cancellation approved and refund processed');
      setShowApproveModal(false);
      setSelectedRequest(null);
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Failed to approve cancellation:', error);
      toast.error(error.response?.data?.detail || 'Failed to approve cancellation');
    } finally {
      setProcessing(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setProcessing(true);
    try {
      await adminService.rejectCancellationRequest(selectedRequest.id, {
        rejection_reason: rejectReason,
        admin_notes: adminNotes || undefined,
      });
      toast.success('Cancellation request rejected');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Failed to reject cancellation:', error);
      toast.error(error.response?.data?.detail || 'Failed to reject cancellation');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending Review', color: 'yellow', icon: Clock },
      approved: { label: 'Approved', color: 'green', icon: CheckCircle },
      auto_approved: { label: 'Auto-Approved', color: 'blue', icon: RefreshCw },
      rejected: { label: 'Rejected', color: 'red', icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const columns = [
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
      key: 'child_name',
      label: 'Child',
      render: (value) => (
        <span className="text-gray-700">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'class_name',
      label: 'Class',
      render: (value) => (
        <span className="font-medium text-[#173151]">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'days_until_class',
      label: 'Days Until Class',
      render: (value, row) => (
        <div className="text-center">
          <span className={`font-bold ${value < 15 ? 'text-red-600' : 'text-green-600'}`}>
            {value}
          </span>
          <p className="text-xs text-gray-500">{row.class_start_date}</p>
        </div>
      ),
      align: 'center',
    },
    {
      key: 'requested_refund_amount',
      label: 'Refund Amount',
      render: (value, row) => (
        <div className="text-right">
          <span className="font-semibold text-[#173151]">
            ${parseFloat(value || 0).toFixed(2)}
          </span>
          {row.approved_refund_amount && row.status !== 'pending' && (
            <p className="text-xs text-green-600">
              Refunded: ${parseFloat(row.approved_refund_amount).toFixed(2)}
            </p>
          )}
        </div>
      ),
      align: 'right',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value),
      align: 'center',
    },
    {
      key: 'created_at',
      label: 'Requested',
      type: 'date',
      sortable: true,
    },
  ];

  // Add actions column for pending requests
  if (activeTab === 'pending') {
    columns.push({
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
    });
  } else {
    columns.push({
      key: 'view',
      label: '',
      render: (_, row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="text-[#173151] hover:text-[#F3BC48] text-sm font-medium"
        >
          View Details
        </button>
      ),
      align: 'right',
    });
  }

  const tabs = [
    { id: 'pending', label: 'Pending Review', icon: Clock, count: stats.pending },
    { id: 'approved', label: 'Approved', icon: CheckCircle, count: stats.approved },
    { id: 'auto_approved', label: 'Auto-Approved', icon: RefreshCw, count: stats.auto_approved },
    { id: 'rejected', label: 'Rejected', icon: XCircle, count: stats.rejected },
  ];

  return (
    <div className="h-full max-sm:pb-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#173151] font-manrope">
                Cancellation Requests
              </h1>
              <p className="text-gray-600 font-manrope mt-1">
                Review and process enrollment cancellation requests
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[140px]">
                <p className="text-sm text-gray-600 font-manrope">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 font-manrope mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[140px]">
                <p className="text-sm text-gray-600 font-manrope">Total Refunded</p>
                <p className="text-2xl font-bold text-green-600 font-manrope mt-1">
                  ${parseFloat(stats.total_refunded || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">Cancellation Policy</h3>
              <p className="text-sm text-blue-700 mt-1">
                <strong>15+ days before class start:</strong> Auto-approved with full refund<br />
                <strong>Less than 15 days:</strong> Requires admin review - appears in Pending tab
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-manrope text-sm transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#173151] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-white/20' : tab.id === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={requests}
            loading={loading}
            emptyMessage={
              activeTab === 'pending'
                ? 'No pending cancellation requests'
                : `No ${activeTab.replace('_', '-')} requests found`
            }
            pagination={activeTab !== 'pending'}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Approve Modal */}
        {showApproveModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#173151]">Approve Cancellation</h2>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-medium">{selectedRequest.user_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Child</span>
                  <span className="font-medium">{selectedRequest.child_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Class</span>
                  <span className="font-medium">{selectedRequest.class_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Days Until Class</span>
                  <span className={`font-medium ${selectedRequest.days_until_class < 15 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedRequest.days_until_class} days
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Original amount: ${parseFloat(selectedRequest.enrollment_amount || 0).toFixed(2)}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>

              <p className="text-sm text-gray-500 mb-6">
                This will process the refund through Stripe and cancel the enrollment.
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
                      Approve & Refund
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#173151]">Reject Cancellation</h2>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-medium">{selectedRequest.user_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Child</span>
                  <span className="font-medium">{selectedRequest.child_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Refund Requested</span>
                  <span className="font-medium text-red-600">
                    ${parseFloat(selectedRequest.requested_refund_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this cancellation request..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              <p className="text-sm text-gray-500 mb-6">
                The enrollment will remain active. The customer will be notified of the rejection.
              </p>

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
                      Reject Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#173151]">Request Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedRequest.user_name}</p>
                    <p className="text-xs text-gray-500">{selectedRequest.user_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Child</p>
                    <p className="font-medium">{selectedRequest.child_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-medium">{selectedRequest.class_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class Start Date</p>
                    <p className="font-medium">{selectedRequest.class_start_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Days Until Class (at request)</p>
                    <p className={`font-medium ${selectedRequest.days_until_class < 15 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedRequest.days_until_class} days
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Requested</p>
                    <p className="font-medium">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Enrollment Amount</p>
                      <p className="font-medium">${parseFloat(selectedRequest.enrollment_amount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Requested Refund</p>
                      <p className="font-medium">${parseFloat(selectedRequest.requested_refund_amount || 0).toFixed(2)}</p>
                    </div>
                    {selectedRequest.approved_refund_amount && (
                      <div>
                        <p className="text-sm text-gray-500">Approved Refund</p>
                        <p className="font-medium text-green-600">${parseFloat(selectedRequest.approved_refund_amount).toFixed(2)}</p>
                      </div>
                    )}
                    {selectedRequest.stripe_refund_id && (
                      <div>
                        <p className="text-sm text-gray-500">Stripe Refund ID</p>
                        <p className="font-mono text-sm">{selectedRequest.stripe_refund_id}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRequest.reason && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-500 mb-1">Customer's Reason</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
                  </div>
                )}

                {selectedRequest.rejection_reason && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-500 mb-1">Rejection Reason</p>
                    <p className="text-red-700 bg-red-50 p-3 rounded-lg">{selectedRequest.rejection_reason}</p>
                  </div>
                )}

                {selectedRequest.admin_notes && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-500 mb-1">Admin Notes</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRequest.admin_notes}</p>
                  </div>
                )}

                {selectedRequest.reviewed_by_name && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-500 mb-1">Reviewed By</p>
                    <p className="font-medium">{selectedRequest.reviewed_by_name}</p>
                    {selectedRequest.reviewed_at && (
                      <p className="text-xs text-gray-500">
                        {new Date(selectedRequest.reviewed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

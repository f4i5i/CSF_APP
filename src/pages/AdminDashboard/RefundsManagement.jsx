/**
 * Refunds Management Page
 * Admin page for viewing refunded invoices
 * Uses Invoice table as source of truth for billing records
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Search, Calendar, Download, Eye, RefreshCw } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import Header from '../../components/Header';
import adminService from '../../api/services/admin.service';
import { formatDate, formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';

export default function RefundsManagement() {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalRefunded, setTotalRefunded] = useState(0);
  const itemsPerPage = 10;

  // View modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);

  useEffect(() => {
    fetchRefunds();
    fetchStats();
  }, [currentPage, searchQuery, dateFrom, dateTo]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };
      if (searchQuery) params.search = searchQuery;
      if (dateFrom) params.start_date = dateFrom;
      if (dateTo) params.end_date = dateTo;

      const response = await adminService.getRefundedInvoices(params);
      setRefunds(response.items || []);
      setTotalItems(response.total || 0);
      setTotalRefunded(response.total_refunded || 0);
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
      toast.error('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getInvoiceStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleViewRefund = (refund) => {
    setSelectedRefund(refund);
    setViewModalOpen(true);
  };

  const columns = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-[#173151]">{value}</span>
        </div>
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
      key: 'invoice_date',
      label: 'Date',
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value ? formatDate(value) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <span className="text-sm text-gray-600 line-clamp-1">
          {value || 'Class Registration'}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'Amount',
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-red-600">
          {formatCurrency(value)}
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
          label: 'View',
          icon: Eye,
          onClick: () => handleViewRefund(row),
        },
      ],
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

  return (
    <div className="h-full max-sm:pb-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#173151] font-manrope">
                Refunds
              </h1>
              <p className="text-gray-600 font-manrope text-sm mt-1">
                View all refunded invoices
              </p>
            </div>

            <button
              onClick={() => { fetchRefunds(); fetchStats(); }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600 font-manrope">Total Refunded</p>
            <p className="text-2xl font-bold text-red-600 font-manrope mt-1">
              {formatCurrency(totalRefunded)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600 font-manrope">Refund Count</p>
            <p className="text-2xl font-bold text-[#173151] font-manrope mt-1">
              {totalItems}
            </p>
          </div>
          {stats && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-600 font-manrope">Last 30 Days</p>
                <p className="text-2xl font-bold text-orange-600 font-manrope mt-1">
                  {formatCurrency(stats.refunds_last_30_days?.amount || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.refunds_last_30_days?.count || 0} refunds
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-600 font-manrope">Total Invoices</p>
                <p className="text-2xl font-bold text-[#173151] font-manrope mt-1">
                  {stats.total_invoices || 0}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <FilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search by invoice # or customer..."
          onSearch={setSearchQuery}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={refunds}
            loading={loading}
            emptyMessage="No refunds found"
            pagination={true}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* View Refund Modal */}
      {viewModalOpen && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-[#173151] font-manrope">
                Refund Details
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Invoice Number</span>
                <span className="font-medium">{selectedRefund.invoice_number}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Customer</span>
                <div className="text-right">
                  <p className="font-medium">{selectedRefund.user_name}</p>
                  <p className="text-sm text-gray-500">{selectedRefund.user_email}</p>
                </div>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Invoice Date</span>
                <span className="font-medium">
                  {selectedRefund.invoice_date ? formatDate(selectedRefund.invoice_date) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Description</span>
                <span className="font-medium text-right max-w-[200px]">
                  {selectedRefund.description || 'Class Registration'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(selectedRefund.subtotal)}</span>
              </div>
              {selectedRefund.discount > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(selectedRefund.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-lg">{formatCurrency(selectedRefund.total)}</span>
              </div>
              <div className="flex justify-between py-2 bg-red-50 px-3 rounded-lg">
                <span className="text-red-700 font-medium">Refund Amount</span>
                <span className="font-bold text-red-600 text-lg">
                  {formatCurrency(selectedRefund.refund_amount)}
                </span>
              </div>

              {selectedRefund.stripe_invoice_id && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Stripe Invoice</span>
                  <span className="font-mono text-sm text-gray-500">
                    {selectedRefund.stripe_invoice_id}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-6 py-2 bg-[#173151] text-white rounded-lg hover:bg-[#173151]/90 font-manrope"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

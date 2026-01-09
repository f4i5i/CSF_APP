/**
 * Invoices Management Page
 * Admin page for managing invoices from the Invoice table
 * Includes Stripe sync functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Eye, RefreshCw, X } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import FilterBar from '../../components/admin/FilterBar';
import Header from '../../components/Header';
import invoicesService from '../../api/services/invoices.service';
import { formatDate, formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // View modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };
      if (statusFilter) params.status = statusFilter;

      const response = await invoicesService.getAll(params);
      setInvoices(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSyncFromStripe = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const result = await invoicesService.syncAllFromStripe();
      setSyncMessage({
        type: 'success',
        text: `Synced ${result.summary?.created || 0} new, ${result.summary?.updated || 0} updated invoices from Stripe`
      });
      toast.success('Invoices synced from Stripe');
      // Reload invoices after sync
      await fetchInvoices();
    } catch (error) {
      console.error('Failed to sync invoices:', error);
      setSyncMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to sync invoices from Stripe'
      });
      toast.error('Failed to sync invoices');
    } finally {
      setSyncing(false);
      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const blob = await invoicesService.downloadPdf(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-800' },
      sent: { label: 'Sent', bg: 'bg-blue-100', text: 'text-blue-800' },
      draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-800' },
      overdue: { label: 'Overdue', bg: 'bg-red-100', text: 'text-red-800' },
      partially_paid: { label: 'Partial', bg: 'bg-yellow-100', text: 'text-yellow-800' },
      cancelled: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-500' },
      refunded: { label: 'Refunded', bg: 'bg-orange-100', text: 'text-orange-800' },
    };
    const config = statusMap[status] || statusMap.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-[#173151]">{value}</span>
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
      key: 'user',
      label: 'Customer',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[#173151]">
            {row.user_name || row.user?.full_name || 'N/A'}
          </p>
          <p className="text-xs text-gray-500">{row.user_email || row.user?.email}</p>
        </div>
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
        <span className="font-semibold text-[#173151]">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'stripe_invoice_id',
      label: 'Stripe',
      render: (value) => (
        value ? (
          <span className="text-xs text-gray-400 font-mono">
            {value.slice(0, 12)}...
          </span>
        ) : (
          <span className="text-xs text-gray-300">-</span>
        )
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
          onClick: () => handleViewInvoice(row),
        },
        {
          label: 'Download',
          icon: Download,
          onClick: () => handleDownloadInvoice(row.id, row.invoice_number),
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
        { value: 'paid', label: 'Paid' },
        { value: 'sent', label: 'Sent' },
        { value: 'draft', label: 'Draft' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'refunded', label: 'Refunded' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      type: 'daterange',
      startValue: dateFrom,
      endValue: dateTo,
      onStartChange: setDateFrom,
      onEndChange: setDateTo,
    },
  ];

  const hasActiveFilters = statusFilter || searchQuery || dateFrom || dateTo;
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // Calculate totals
  const paidTotal = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + parseFloat(i.total || 0), 0);

  return (
    <div className="h-full max-sm:pb-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#173151] font-manrope">
                Invoices
              </h1>
              <p className="text-gray-600 font-manrope text-sm mt-1">
                View and manage all invoices
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3 min-w-[120px]">
                <p className="text-xs text-gray-600 font-manrope">Total Paid</p>
                <p className="text-xl font-bold text-green-600 font-manrope">
                  {formatCurrency(paidTotal)}
                </p>
              </div>

              <button
                onClick={handleSyncFromStripe}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-btn-gold text-heading-dark rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-manrope font-semibold"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync from Stripe'}
              </button>
            </div>
          </div>
        </div>

        {/* Sync Message */}
        {syncMessage && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            syncMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {syncMessage.text}
          </div>
        )}

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
            data={invoices}
            loading={loading}
            emptyMessage="No invoices found. Click 'Sync from Stripe' to import invoices."
            pagination={true}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* View Invoice Modal */}
      {viewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#173151] font-manrope">
                Invoice Details
              </h2>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Invoice Number</span>
                <span className="font-medium">{selectedInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Status</span>
                {getStatusBadge(selectedInvoice.status)}
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Customer</span>
                <div className="text-right">
                  <p className="font-medium">
                    {selectedInvoice.user_name || selectedInvoice.user?.full_name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedInvoice.user_email || selectedInvoice.user?.email}
                  </p>
                </div>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Invoice Date</span>
                <span className="font-medium">
                  {selectedInvoice.invoice_date ? formatDate(selectedInvoice.invoice_date) : 'N/A'}
                </span>
              </div>
              {selectedInvoice.due_date && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Due Date</span>
                  <span className="font-medium">{formatDate(selectedInvoice.due_date)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Description</span>
                <span className="font-medium text-right max-w-[200px]">
                  {selectedInvoice.description || 'Class Registration'}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(selectedInvoice.discount)}
                    </span>
                  </div>
                )}
                {selectedInvoice.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">{formatCurrency(selectedInvoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(selectedInvoice.amount_paid)}
                  </span>
                </div>
              </div>

              {selectedInvoice.stripe_invoice_id && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Stripe Invoice ID</span>
                  <span className="font-mono text-sm text-gray-500">
                    {selectedInvoice.stripe_invoice_id}
                  </span>
                </div>
              )}

              {selectedInvoice.billing_period_start && selectedInvoice.billing_period_end && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Billing Period</span>
                  <span className="font-medium text-sm">
                    {formatDate(selectedInvoice.billing_period_start)} - {formatDate(selectedInvoice.billing_period_end)}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => handleDownloadInvoice(selectedInvoice.id, selectedInvoice.invoice_number)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-2 font-manrope"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
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

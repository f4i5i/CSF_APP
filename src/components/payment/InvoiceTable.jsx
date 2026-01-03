import React, { useState, useEffect } from 'react';
import { Download, FileText, Filter, ChevronDown, RefreshCw } from 'lucide-react';
import invoicesService from '../../api/services/invoices.service';
import { formatDate, formatCurrency } from '../../utils/format';

const InvoiceTable = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, paid, sent, overdue
  const [showFilters, setShowFilters] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, [filter]);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (filter !== 'all') {
        filters.status = filter;
      }

      const data = await invoicesService.getMyInvoices(filters);
      setInvoices(data.items || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
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
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handleSyncFromStripe = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const result = await invoicesService.syncFromStripe();
      setSyncMessage({
        type: 'success',
        text: `Synced ${result.summary.created} new, ${result.summary.updated} updated invoices from Stripe`
      });
      // Reload invoices after sync
      await loadInvoices();
    } catch (error) {
      console.error('Failed to sync invoices:', error);
      setSyncMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to sync invoices from Stripe'
      });
    } finally {
      setSyncing(false);
      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      sent: 'bg-blue-100 text-blue-800 border-blue-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      partially_paid: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
      refunded: 'bg-orange-100 text-orange-800 border-orange-200',
    };

    const labels = {
      paid: 'Paid',
      sent: 'Sent',
      draft: 'Draft',
      overdue: 'Overdue',
      partially_paid: 'Partial',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="border rounded-xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-btn-gold"></div>
        <p className="mt-2 text-gray-600">Loading invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-xl p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadInvoices}
          className="mt-4 px-4 py-2 bg-btn-gold text-heading-dark rounded-lg hover:bg-yellow-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sync Message */}
      {syncMessage && (
        <div className={`p-3 rounded-lg text-sm ${
          syncMessage.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {syncMessage.text}
        </div>
      )}

      {/* Filters and Sync */}
      <div className="flex gap-3 items-center justify-between flex-wrap">
        <div className="flex gap-3 max-sm:flex-wrap items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-btn-gold text-heading-dark'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'sent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overdue
            </button>
          </div>
        )}
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSyncFromStripe}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-btn-gold text-heading-dark rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync from Stripe'}
        </button>
      </div>

      {/* Table */}
      <div className="border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[#666D80] font-semibold border-b border-[#dfe1e7] bg-[#F6F8FA]">
              <tr className='' >
                <th className="py-3 px-4 text-left  font-medium">Invoice #</th>
                <th className="py-3 px-4 text-left font-medium">Date</th>
                <th className="py-3 px-4 text-left font-medium">Description</th>
                <th className="py-3 px-4 text-right font-medium">Amount</th>
                <th className="py-3 px-4 text-center font-medium">Status</th>
                <th className="py-3 px-4 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-heading-dark">
                          {invoice.invoice_number}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">
                        {invoice.description || 'Class Registration'}
                      </span>
                      {invoice.billing_period_start && invoice.billing_period_end && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {formatDate(invoice.billing_period_start, { month: 'short', day: 'numeric' })} - {formatDate(invoice.billing_period_end, { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-heading-dark">
                        {formatCurrency(invoice.total)}
                      </span>
                      {invoice.discount > 0 && (
                        <div className="text-xs text-green-600 mt-0.5">
                          -{formatCurrency(invoice.discount)} discount
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-btn-secondary hover:text-btn-gold hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {invoices.length > 0 && (
        <div className="text-sm text-gray-600 text-right">
          Showing {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;

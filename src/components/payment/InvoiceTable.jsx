import React, { useState, useEffect } from 'react';
import { Download, FileText, Filter, ChevronDown } from 'lucide-react';
import paymentsService from '../../api/services/payments.service';
import { formatDate, formatCurrency } from '../../utils/format';

const InvoiceTable = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, succeeded, pending, failed
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (filter !== 'all') {
        filters.status = filter;
      }

      const data = await paymentsService.getAll(filters);
      setPayments(data.items || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
      setError('Failed to load payment history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const blob = await paymentsService.downloadReceipt(paymentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      succeeded: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200',
      partially_refunded: 'bg-orange-100 text-orange-800 border-orange-200',
    };

    const labels = {
      succeeded: 'Paid',
      pending: 'Pending',
      processing: 'Processing',
      failed: 'Failed',
      refunded: 'Refunded',
      partially_refunded: 'Partial Refund',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPaymentTypeLabel = (payment) => {
    if (payment.payment_type === 'installment' && payment.installment_plan) {
      return `Installment ${payment.installment_plan.installment_number}/${payment.installment_plan.num_installments}`;
    }

    const labels = {
      one_time: 'One-Time',
      subscription: 'Subscription',
      installment: 'Installment',
    };

    return labels[payment.payment_type] || payment.payment_type;
  };

  if (loading) {
    return (
      <div className="border rounded-xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-btn-gold"></div>
        <p className="mt-2 text-gray-600">Loading payment history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-xl p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadPayments}
          className="mt-4 px-4 py-2 bg-btn-gold text-heading-dark rounded-lg hover:bg-yellow-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 items-center">
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
              onClick={() => setFilter('succeeded')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'succeeded'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Failed
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b border-[#dfe1e7] bg-[#F6F8FA]">
              <tr>
                <th className="py-3 px-4 text-left font-medium">Invoice #</th>
                <th className="py-3 px-4 text-left font-medium">Date</th>
                <th className="py-3 px-4 text-left font-medium">Type</th>
                <th className="py-3 px-4 text-right font-medium">Amount</th>
                <th className="py-3 px-4 text-center font-medium">Status</th>
                <th className="py-3 px-4 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-heading-dark">
                          #{payment.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(payment.paid_at || payment.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">
                        {getPaymentTypeLabel(payment)}
                      </span>
                      {payment.installment_plan && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {formatCurrency(payment.installment_plan.remaining_amount)} remaining
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-heading-dark">
                        {formatCurrency(payment.amount)}
                      </span>
                      {payment.refund_amount > 0 && (
                        <div className="text-xs text-orange-600 mt-0.5">
                          -{formatCurrency(payment.refund_amount)} refunded
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {payment.status === 'succeeded' && (
                        <button
                          onClick={() => handleDownloadReceipt(payment.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-btn-secondary hover:text-btn-gold hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Download Receipt"
                        >
                          <Download className="w-4 h-4" />
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {payments.length > 0 && (
        <div className="text-sm text-gray-600 text-right">
          Showing {payments.length} payment{payments.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;

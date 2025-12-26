import React, { useState, useEffect } from "react";
import { AlertCircle, Calendar, CreditCard, Users } from "lucide-react";
import invoicesService from "../../api/services/invoices.service";
import { formatCurrency, formatDate } from "../../utils/format";

const BillingInfo = () => {
  const [billingSummary, setBillingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBillingSummary();
  }, []);

  const loadBillingSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoicesService.getBillingSummary();
      setBillingSummary(data);
    } catch (err) {
      console.error("Failed to load billing summary:", err);
      setError("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border rounded-xl p-5">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="border rounded-xl p-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-xl p-5">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
        <button
          onClick={loadBillingSummary}
          className="mt-3 text-sm text-btn-secondary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const hasUpcomingPayment = billingSummary?.next_due_date && billingSummary?.next_payment_amount;
  const hasBalance = billingSummary?.current_balance > 0;

  return (
    <div className="border rounded-xl p-5">
      <h2 className="font-semibold text-lg mb-2">Billing Period</h2>

      {billingSummary?.billing_period_start && billingSummary?.billing_period_end && (
        <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {formatDate(billingSummary.billing_period_start, { month: 'short', day: 'numeric' })} -{" "}
          {formatDate(billingSummary.billing_period_end)}
        </p>
      )}

      <div className="space-y-4">
        {/* Current Balance */}
        <div className="border rounded-xl">
          <div className="border-b border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-600">Current Balance</p>
            <p className={`text-2xl font-semibold mt-1 ${hasBalance ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(billingSummary?.current_balance || 0)}
            </p>
            {!hasBalance && (
              <p className="text-xs text-green-600 mt-1">All paid up!</p>
            )}
          </div>

          {/* Upcoming Payment */}
          {hasUpcomingPayment && (
            <div className="p-4 bg-yellow-50">
              <p className="text-sm font-medium text-gray-700">Next Payment Due</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-semibold text-heading-dark">
                  {formatCurrency(billingSummary.next_payment_amount)}
                </span>
                <span className="text-sm text-gray-500">
                  on {formatDate(billingSummary.next_due_date)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Active Enrollments</span>
            </div>
            <p className="text-lg font-semibold text-heading-dark">
              {billingSummary?.active_enrollments_count || 0}
            </p>
          </div>

          <div className="border rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs">Paid This Month</span>
            </div>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(billingSummary?.total_paid_this_period || 0)}
            </p>
          </div>
        </div>

        {/* Pending Payments Alert */}
        {billingSummary?.pending_payments_count > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {billingSummary.pending_payments_count} pending payment{billingSummary.pending_payments_count !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Please complete your pending payments to avoid service interruption.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingInfo;

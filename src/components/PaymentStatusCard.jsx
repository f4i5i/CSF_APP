import React from 'react';
import { Link } from 'react-router-dom';

const PaymentStatusCard = ({ summary = null, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h3 className="text-xl xxl1:text-2xl font-semibold font-manrope text-[#1b1b1b] mb-4">Payment Status</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // No payment data
  if (!summary) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold font-manrope text-[#1b1b1b] mb-4">Payment Status</h3>
        <div className="text-center py-6 text-gray-500">
          <p>No payment information available</p>
        </div>
      </div>
    );
  }

  const {
    active_plans = 0,
    total_remaining = 0,
    next_due = null,
  } = summary;

  const hasOutstanding = total_remaining > 0;
  const hasUpcoming = next_due !== null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold font-manrope text-[#1b1b1b]">Payment Status</h3>
        <Link
          to="/paymentbilling"
          className="text-sm text-primary hover:underline font-medium"
        >
          View All
        </Link>
      </div>

      {/* Outstanding Balance */}
      {hasOutstanding ? (
        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Outstanding Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                ${total_remaining.toFixed(2)}
              </p>
            </div>
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {active_plans > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              {active_plans} active payment {active_plans === 1 ? 'plan' : 'plans'}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">All Paid Up!</p>
              <p className="text-sm text-gray-600">No outstanding balance</p>
            </div>
          </div>
        </div>
      )}

      {/* Next Payment Due */}
      {hasUpcoming && next_due && (
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <p className="text-sm text-gray-600 mb-2">Next Payment Due</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                ${next_due.amount?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500">
                {next_due.due_date
                  ? new Date(next_due.due_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Date TBD'}
              </p>
            </div>

            {/* Days until due */}
            {next_due.due_date && (
              <div className="text-right">
                {(() => {
                  const daysUntil = Math.ceil(
                    (new Date(next_due.due_date) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  const isOverdue = daysUntil < 0;
                  const isDueSoon = daysUntil <= 3 && daysUntil >= 0;

                  return (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        isOverdue
                          ? 'bg-red-100 text-red-700'
                          : isDueSoon
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isOverdue
                        ? `Overdue by ${Math.abs(daysUntil)} days`
                        : `Due in ${daysUntil} days`}
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <Link
        to="/paymentbilling"
        className="block w-full text-center px-4 py-3 bg-primary text-black font-medium rounded-lg hover:bg-yellow-500 transition"
      >
        {hasOutstanding ? 'Make Payment' : 'View Payment History'}
      </Link>
    </div>
  );
};

export default PaymentStatusCard;

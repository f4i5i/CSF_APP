/**
 * RefundModal Component
 * Modal for issuing full or partial refunds
 */

import React, { useState } from 'react';
import { DollarSign, X } from 'lucide-react';

export default function RefundModal({
  isOpen,
  onClose,
  onConfirm,
  paymentAmount = 0,
  paymentId,
  isLoading = false,
}) {
  const [refundAmount, setRefundAmount] = useState('');
  const [refundType, setRefundType] = useState('full'); // 'full' | 'partial'
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (refundType === 'partial') {
      const amount = parseFloat(refundAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid refund amount');
        return;
      }
      if (amount > paymentAmount) {
        setError('Refund amount cannot exceed payment amount');
        return;
      }
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the refund');
      return;
    }

    const finalAmount = refundType === 'full' ? paymentAmount : parseFloat(refundAmount);

    onConfirm({
      amount: finalAmount,
      reason: reason.trim(),
      type: refundType,
    });
  };

  const handleClose = () => {
    if (!isLoading) {
      setRefundAmount('');
      setRefundType('full');
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold font-manrope text-[#173151]">
              Issue Refund
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Payment Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-manrope text-[#666D80]">
              Original Payment Amount:{' '}
              <span className="font-semibold text-[#173151]">
                ${parseFloat(paymentAmount).toFixed(2)}
              </span>
            </p>
            {paymentId && (
              <p className="text-xs font-manrope text-[#666D80] mt-1">
                Payment ID: {paymentId}
              </p>
            )}
          </div>

          {/* Refund Type */}
          <div>
            <label className="block text-sm font-manrope font-semibold text-[#173151] mb-2">
              Refund Type
            </label>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center gap-2 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[#F3BC48] transition">
                <input
                  type="radio"
                  name="refundType"
                  value="full"
                  checked={refundType === 'full'}
                  onChange={(e) => setRefundType(e.target.value)}
                  className="text-[#F3BC48] focus:ring-[#F3BC48]"
                />
                <span className="text-sm font-manrope text-[#173151]">Full Refund</span>
              </label>
              <label className="flex-1 flex items-center gap-2 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[#F3BC48] transition">
                <input
                  type="radio"
                  name="refundType"
                  value="partial"
                  checked={refundType === 'partial'}
                  onChange={(e) => setRefundType(e.target.value)}
                  className="text-[#F3BC48] focus:ring-[#F3BC48]"
                />
                <span className="text-sm font-manrope text-[#173151]">Partial Refund</span>
              </label>
            </div>
          </div>

          {/* Refund Amount (for partial) */}
          {refundType === 'partial' && (
            <div>
              <label className="block text-sm font-manrope font-semibold text-[#173151] mb-2">
                Refund Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-manrope">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={paymentAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg font-manrope text-base focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none"
                  required={refundType === 'partial'}
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-manrope font-semibold text-[#173151] mb-2">
              Reason for Refund *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this refund is being issued..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-manrope text-base focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none resize-none"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-manrope text-red-800">{error}</p>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-manrope text-yellow-900">
              <strong>Refund Amount:</strong> $
              {refundType === 'full'
                ? parseFloat(paymentAmount).toFixed(2)
                : parseFloat(refundAmount || 0).toFixed(2)}
            </p>
            <p className="text-xs font-manrope text-yellow-800 mt-1">
              This action cannot be undone. The customer will be notified.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-manrope font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-manrope font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Issue Refund'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

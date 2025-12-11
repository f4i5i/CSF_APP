/**
 * OrderConfirmation Component
 * Displays successful order confirmation with enrollment details
 */

import React from 'react';
import { CheckCircle, Calendar, User, CreditCard, Mail, Download, ArrowRight } from 'lucide-react';

export default function OrderConfirmation({ orderData, enrollmentData, onDownloadReceipt }) {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Success Animation Container */}
      <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20 mb-6">
        <div className="text-center py-8">
          {/* Success Icon with Animation */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Title */}
          <h1 className="text-fluid-2xl font-bold font-manrope text-[#173151] mb-2">
            Enrollment Confirmed!
          </h1>

          <p className="text-fluid-lg font-manrope text-[#666D80] mb-6">
            Payment successful. Your child has been enrolled in the class.
          </p>

          {/* Order Number */}
          {orderData?.order_number && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3BC48]/10 rounded-lg">
              <span className="font-manrope text-sm text-[#666D80]">Order Number:</span>
              <span className="font-manrope font-bold text-base text-[#173151]">
                {orderData.order_number}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20 mb-6">
        <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] mb-4">
          Order Details
        </h2>

        <div className="space-y-4">
          {/* Class Information */}
          {enrollmentData?.class && (
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <Calendar className="w-5 h-5 text-[#F3BC48] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-manrope font-semibold text-base text-[#173151] mb-1">
                  {enrollmentData.class.name}
                </p>
                <p className="font-manrope text-sm text-[#666D80]">
                  {enrollmentData.class.schedule}
                </p>
                <p className="font-manrope text-sm text-[#666D80]">
                  {formatDate(enrollmentData.class.start_date)} - {formatDate(enrollmentData.class.end_date)}
                </p>
              </div>
            </div>
          )}

          {/* Student Information */}
          {enrollmentData?.child && (
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <User className="w-5 h-5 text-[#F3BC48] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-manrope font-semibold text-sm text-[#173151]">Student</p>
                <p className="font-manrope text-base text-[#666D80]">
                  {enrollmentData.child.first_name} {enrollmentData.child.last_name}
                </p>
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
            <CreditCard className="w-5 h-5 text-[#F3BC48] flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="font-manrope font-semibold text-sm text-[#173151] mb-2">
                Payment Summary
              </p>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-manrope text-[#666D80]">Amount Paid:</span>
                  <span className="font-manrope font-semibold text-[#173151]">
                    {formatCurrency(orderData?.total || orderData?.amount_paid)}
                  </span>
                </div>

                {orderData?.payment_method && (
                  <div className="flex justify-between text-sm">
                    <span className="font-manrope text-[#666D80]">Payment Method:</span>
                    <span className="font-manrope text-[#173151] capitalize">
                      {orderData.payment_method.replace('_', ' ')}
                    </span>
                  </div>
                )}

                {orderData?.payment_date && (
                  <div className="flex justify-between text-sm">
                    <span className="font-manrope text-[#666D80]">Payment Date:</span>
                    <span className="font-manrope text-[#173151]">
                      {formatDate(orderData.payment_date)}
                    </span>
                  </div>
                )}
              </div>

              {/* Installment Plan Info */}
              {orderData?.payment_plan === 'installments' && orderData?.installment_plan && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="font-manrope text-sm text-blue-800 mb-1">
                    <strong>Payment Plan:</strong> {orderData.installment_plan.count} Months
                  </p>
                  <p className="font-manrope text-sm text-blue-700">
                    Next payment: {formatDate(orderData.installment_plan.next_due_date)} - {formatCurrency(orderData.installment_plan.amount_per_month)}
                  </p>
                </div>
              )}

              {/* Subscription Info */}
              {orderData?.payment_plan === 'subscribe' && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                  <p className="font-manrope text-sm text-purple-800">
                    <strong>Subscription Active:</strong> Auto-renews monthly
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20 mb-6">
        <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] mb-4">
          What's Next?
        </h2>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#F3BC48] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-manrope text-sm text-[#173151] font-semibold">
                Confirmation Email Sent
              </p>
              <p className="font-manrope text-sm text-[#666D80]">
                Check your inbox for enrollment details and class information
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#F3BC48] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-manrope text-sm text-[#173151] font-semibold">
                Mark Your Calendar
              </p>
              <p className="font-manrope text-sm text-[#666D80]">
                First class starts on {formatDate(enrollmentData?.class?.start_date)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-[#F3BC48] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-manrope text-sm text-[#173151] font-semibold">
                View in Dashboard
              </p>
              <p className="font-manrope text-sm text-[#666D80]">
                Track attendance and progress in your parent dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onDownloadReceipt && (
          <button
            onClick={onDownloadReceipt}
            className="flex-1 px-6 py-3 bg-white border-2 border-[#173151] text-[#173151] font-manrope font-semibold rounded-lg hover:bg-[#173151] hover:text-white transition flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Receipt
          </button>
        )}

        <button
          onClick={() => (window.location.href = '/dashboard')}
          className="flex-1 px-6 py-3 bg-[#173151] text-white font-manrope font-semibold rounded-lg hover:bg-[#173151]/90 transition flex items-center justify-center gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm font-manrope text-blue-800 text-center">
          Questions? Contact us at{' '}
          <a href="mailto:support@example.com" className="font-semibold underline">
            support@example.com
          </a>{' '}
          or call{' '}
          <a href="tel:+1234567890" className="font-semibold underline">
            (123) 456-7890
          </a>
        </p>
      </div>
    </div>
  );
}

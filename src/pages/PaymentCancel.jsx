import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

/**
 * Payment Cancel Page
 * Displayed when user cancels Stripe Checkout
 */
const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Cancel Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl font-bold text-heading-dark mb-4 font-manrope">
          Payment Cancelled
        </h1>
        <p className="text-text-secondary mb-8 font-manrope">
          Your payment was not processed. No charges have been made to your account.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/classes')}
            className="w-full bg-btn-gold text-heading-dark font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors font-manrope flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Classes
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full border-2 border-gray-300 text-heading-dark font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-manrope"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 mt-6 font-manrope">
          Need help? Contact us at{' '}
          <a href="mailto:support@csf.com" className="text-btn-secondary hover:underline">
            support@csf.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

/**
 * Payment Success Page
 * Displayed after successful Stripe Checkout completion
 */
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-heading-dark mb-4 font-manrope">
          Payment Successful!
        </h1>
        <p className="text-text-secondary mb-6 font-manrope">
          Your payment has been processed successfully. Your enrollment is now active.
        </p>

        {/* Session ID */}
        {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 font-manrope mb-1">Transaction ID</p>
            <p className="text-sm font-mono text-gray-700 break-all">{sessionId}</p>
          </div>
        )}

        {/* Countdown */}
        <p className="text-sm text-text-secondary mb-6 font-manrope">
          Redirecting to dashboard in <span className="font-bold text-btn-gold">{countdown}</span> seconds...
        </p>

        {/* Manual Navigation */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-btn-gold text-heading-dark font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors font-manrope"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;

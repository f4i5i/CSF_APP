/**
 * StripePaymentForm Component
 * Handles secure card payment collection using Stripe Elements
 */

import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px', // Prevents iOS zoom
      color: '#0D0D12',
      fontFamily: '"Inter", "Manrope", sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: false,
};

export default function StripePaymentForm({
  clientSecret,
  amount = 0,
  onSuccess,
  onError,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setError(event.error ? event.error.message : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait a moment.');
      return;
    }

    if (!clientSecret) {
      setError('Payment setup not complete. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        // Payment failed
        setError(stripeError.message);
        if (onError) {
          onError(stripeError);
        }
        setIsProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        // Payment succeeded
        setIsProcessing(false);
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
      } else {
        // Unexpected status
        setError('Payment status: ' + paymentIntent.status);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An unexpected error occurred');
      setIsProcessing(false);
      if (onError) {
        onError(err);
      }
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] leading-[1.5] tracking-[-0.2px]">
          Payment Information
        </h2>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-green-600" />
          <span className="text-xs font-manrope text-green-600 font-medium">
            Secure Payment
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Element */}
        <div>
          <label className="block text-sm font-manrope font-semibold text-[#173151] mb-2">
            Card Information
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <div className="pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus-within:border-[#F3BC48] focus-within:ring-2 focus-within:ring-[#F3BC48]/20 transition">
              <CardElement
                options={CARD_ELEMENT_OPTIONS}
                onChange={handleCardChange}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-manrope font-semibold text-sm text-red-900">
                Payment Error
              </p>
              <p className="font-manrope text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Security Info */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-manrope text-sm text-blue-900">
                <strong>Your payment is secure.</strong> We use Stripe for payment processing.
                Your card information is encrypted and never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Amount Display */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="font-manrope font-semibold text-base text-[#173151]">
            Total Amount
          </span>
          <span className="font-manrope font-bold text-xl text-[#F3BC48]">
            ${parseFloat(amount).toFixed(2)}
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || !cardComplete || isProcessing}
          className="w-full py-4 bg-[#173151] text-white font-manrope font-semibold text-lg rounded-lg hover:bg-[#173151]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pay ${parseFloat(amount).toFixed(2)}
            </>
          )}
        </button>

        {/* Test Card Info (only show in development) */}
        {process.env.REACT_APP_ENV === 'development' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs font-manrope">
            <p className="font-semibold text-yellow-900 mb-1">Test Mode:</p>
            <p className="text-yellow-800">
              Use card: 4242 4242 4242 4242, any future expiry, any CVC
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

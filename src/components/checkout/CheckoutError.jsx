/**
 * CheckoutError Component
 * Displays error messages with retry and navigation options
 */

import React from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

export default function CheckoutError({ error, onRetry, onGoHome }) {
  // Parse error message
  const getErrorDetails = () => {
    if (typeof error === 'string') {
      return {
        title: 'Checkout Error',
        message: error,
      };
    }

    if (error?.response?.data?.message) {
      return {
        title: 'Error',
        message: error.response.data.message,
      };
    }

    if (error?.message) {
      return {
        title: 'Error',
        message: error.message,
      };
    }

    return {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Please try again.',
    };
  };

  const { title, message } = getErrorDetails();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
        <div className="text-center py-8">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          {/* Error Title */}
          <h2 className="text-fluid-xl font-bold font-manrope text-[#173151] mb-2">
            {title}
          </h2>

          {/* Error Message */}
          <p className="text-fluid-base font-manrope text-[#666D80] mb-8 max-w-md mx-auto">
            {message}
          </p>

          {/* Common Error Scenarios */}
          <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left max-w-md mx-auto">
            <p className="font-manrope font-semibold text-sm text-blue-900 mb-2">
              Common Issues:
            </p>
            <ul className="font-manrope text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Class may no longer be available</li>
              <li>Payment information may be incomplete</li>
              <li>Network connection issues</li>
              <li>Session may have expired</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-6 py-3 bg-[#F3BC48] text-white font-manrope font-semibold rounded-lg hover:bg-[#F3BC48]/90 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
            )}

            <button
              onClick={onGoHome || (() => (window.location.href = '/dashboard'))}
              className="px-6 py-3 bg-[#173151] text-white font-manrope font-semibold rounded-lg hover:bg-[#173151]/90 transition flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </button>
          </div>

          {/* Support Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-manrope text-[#666D80]">
              Need help?{' '}
              <a
                href="/contact"
                className="text-[#F3BC48] hover:text-[#F3BC48]/90 font-semibold underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Technical Details (for debugging) */}
      {process.env.REACT_APP_ENV === 'development' && error && (
        <div className="mt-6 bg-gray-900 text-white rounded-lg p-4 text-left">
          <p className="font-mono text-xs font-semibold mb-2">Debug Info:</p>
          <pre className="font-mono text-xs overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

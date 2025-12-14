import React from 'react';
import { Link } from 'react-router-dom';

const WaiversAlert = ({ pendingWaivers = [], loading = false }) => {
  // Don't show if no pending waivers
  if (loading || !pendingWaivers || pendingWaivers.length === 0) {
    return null;
  }

  const count = pendingWaivers.length;

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Warning Icon */}
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Action Required: Sign Waivers
          </h3>
          <p className="text-gray-700 mb-3">
            You have <strong>{count}</strong> {count === 1 ? 'waiver' : 'waivers'}
            {' '}that {count === 1 ? 'needs' : 'need'} your signature before your child can participate in activities.
          </p>

          {/* Waiver List */}
          {count <= 3 && (
            <ul className="mb-3 space-y-1">
              {pendingWaivers.map((waiver) => (
                <li key={waiver.id} className="text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {waiver.name || waiver.template?.name || 'Liability Waiver'}
                  {(waiver.type || waiver.template?.type) && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      {waiver.type || waiver.template.type}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Action Button */}
          <Link
            to="/waivers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Sign {count === 1 ? 'Waiver' : `${count} Waivers`} Now
          </Link>
        </div>

        {/* Close Button (optional - dismissible) */}
        <button
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
          onClick={() => {
            // Optional: Add dismiss functionality
            // This could set a "dismissed" flag in localStorage
          }}
          title="Dismiss (reminder will return)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WaiversAlert;

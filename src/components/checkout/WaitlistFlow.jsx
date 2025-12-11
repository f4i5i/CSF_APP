/**
 * WaitlistFlow Component
 * Displays when class is full and allows joining the waitlist
 */

import React, { useState } from 'react';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function WaitlistFlow({ classData, childId, onJoinWaitlist }) {
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  const handleJoinWaitlist = async () => {
    if (!childId) {
      setError('Please select a child first');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      await onJoinWaitlist(classData.id, childId);
      setJoined(true);
    } catch (err) {
      console.error('Failed to join waitlist:', err);
      setError(err.message || 'Failed to join waitlist. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (joined) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-fluid-xl font-bold font-manrope text-[#173151] mb-2">
            Added to Waitlist!
          </h2>

          <p className="text-fluid-base font-manrope text-[#666D80] mb-6">
            You'll receive an email notification when a spot becomes available.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-manrope text-blue-800">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-sm font-manrope text-blue-700 mt-2 space-y-1 text-left list-disc list-inside">
              <li>We'll notify you via email when a spot opens</li>
              <li>You'll have 24 hours to complete enrollment</li>
              <li>You can manage your waitlist status in your dashboard</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-[#173151] text-white font-manrope font-semibold rounded-lg hover:bg-[#173151]/90 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
      <div className="text-center py-8">
        {/* Full Class Icon */}
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-10 h-10 text-orange-600" />
        </div>

        {/* Title */}
        <h2 className="text-fluid-xl font-bold font-manrope text-[#173151] mb-2">
          Class is Currently Full
        </h2>

        {/* Waitlist Info */}
        <p className="text-fluid-base font-manrope text-[#666D80] mb-6">
          Don't worry! You can join the waitlist and we'll notify you when a spot becomes
          available.
        </p>

        {/* Class Details Card */}
        <div className="bg-white rounded-lg p-4 mb-6 text-left">
          <h3 className="font-manrope font-semibold text-base text-[#173151] mb-3">
            {classData?.name || 'Class Details'}
          </h3>

          <div className="space-y-2">
            {/* Current Waitlist Count */}
            {classData?.waitlist_count !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-manrope text-[#666D80]">
                  Current Waitlist:
                </span>
                <span className="text-sm font-manrope font-semibold text-[#173151]">
                  {classData.waitlist_count} {classData.waitlist_count === 1 ? 'student' : 'students'}
                </span>
              </div>
            )}

            {/* Capacity */}
            {classData?.capacity && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-manrope text-[#666D80]">Capacity:</span>
                <span className="text-sm font-manrope font-semibold text-[#173151]">
                  {classData.current_enrollment || 0}/{classData.capacity}
                </span>
              </div>
            )}

            {/* Start Date */}
            {classData?.start_date && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-manrope text-[#666D80]">Starts:</span>
                <span className="text-sm font-manrope font-semibold text-[#173151]">
                  {new Date(classData.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="font-manrope font-semibold text-sm text-red-900">Error</p>
              <p className="font-manrope text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="font-manrope text-sm text-blue-900">
                <strong>Waitlist Benefits:</strong>
              </p>
              <ul className="font-manrope text-sm text-blue-700 mt-1 space-y-1 list-disc list-inside">
                <li>Automatic email notifications when spots open</li>
                <li>Priority enrollment over new registrations</li>
                <li>No payment required until spot is available</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Join Waitlist Button */}
        <button
          onClick={handleJoinWaitlist}
          disabled={isJoining || !childId}
          className="w-full sm:w-auto px-8 py-4 bg-[#F3BC48] text-white font-manrope font-semibold text-lg rounded-lg hover:bg-[#F3BC48]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
        >
          {isJoining ? (
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
              Joining Waitlist...
            </>
          ) : (
            <>
              <Users className="w-5 h-5" />
              Join Waitlist
            </>
          )}
        </button>

        {!childId && (
          <p className="text-sm font-manrope text-orange-600 mt-3">
            Please select a child before joining the waitlist
          </p>
        )}

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mt-4 text-sm font-manrope text-[#666D80] hover:text-[#173151] transition underline"
        >
          Back to Classes
        </button>
      </div>
    </div>
  );
}

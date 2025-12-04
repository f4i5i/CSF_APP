import React from 'react';
import { Link } from 'react-router-dom';

const EnrollmentCard = ({ enrollments = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h3 className="text-xl font-manrope font-normal mb-4">Active Classes</h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h1 className="text-xl xxl1:text-2xl font-semibold font-manrope text-[#1b1b1b] mb-4">Active Classes</h1>
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No active enrollments</p>
          <Link
            to="/classes"
            className="inline-block px-4 py-2 bg-primary text-black rounded-lg hover:bg-yellow-500 transition"
          >
            Browse Classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl xxl1:text-2xl font-semibold font-manrope text-[#1b1b1b]">Active Classes</h1>
        <Link
          to="/enrollments"
          className="text-sm text-primary hover:underline font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {enrollments.slice(0, 3).map((enrollment) => (
          <div
            key={enrollment.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">
                  {enrollment.class?.program?.sport_type === 'basketball' ? '🏀' :
                   enrollment.class?.program?.sport_type === 'soccer' ? '⚽' :
                   enrollment.class?.program?.sport_type === 'baseball' ? '⚾' :
                   enrollment.class?.program?.sport_type === 'volleyball' ? '🏐' :
                   '🎯'}
                </span>
                <h4 className="font-medium text-gray-900">
                  {enrollment.class?.name || 'Class Name'}
                </h4>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                {enrollment.class?.schedule && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {enrollment.class.schedule}
                  </span>
                )}

                {enrollment.class?.school?.name && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {enrollment.class.school.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                enrollment.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {enrollment.status || 'Active'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {enrollments.length > 3 && (
        <div className="mt-4 text-center">
          <Link
            to="/enrollments"
            className="text-sm text-primary hover:underline font-medium"
          >
            +{enrollments.length - 3} more classes
          </Link>
        </div>
      )}
    </div>
  );
};

export default EnrollmentCard;

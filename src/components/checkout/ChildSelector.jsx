/**
 * ChildSelector Component
 * Allows parent to select which child to enroll in the class
 */

import React from 'react';
import { User } from 'lucide-react';

export default function ChildSelector({ children, selectedId, onSelect, classData }) {
  if (!children || children.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
        <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] mb-4">
          Select Child
        </h2>
        <p className="text-fluid-base font-manrope text-[#666D80]">
          No children found. Please add a child to your account first.
        </p>
      </div>
    );
  }

  // Calculate child's age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Check if child is eligible based on age
  const checkEligibility = (child) => {
    if (!classData || (!classData.min_age && !classData.max_age)) {
      return { eligible: true, message: null };
    }

    const age = calculateAge(child.date_of_birth);
    if (!age) return { eligible: true, message: null };

    const minAge = classData.min_age;
    const maxAge = classData.max_age;

    if (minAge && age < minAge) {
      return {
        eligible: false,
        message: `Must be at least ${minAge} years old`,
      };
    }

    if (maxAge && age > maxAge) {
      return {
        eligible: false,
        message: `Must be ${maxAge} years old or younger`,
      };
    }

    return { eligible: true, message: null };
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
      <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] leading-[1.5] tracking-[-0.2px] mb-4">
        Select Child
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {children.map((child) => {
          const eligibility = checkEligibility(child);
          const isSelected = selectedId === child.id;
          const age = calculateAge(child.date_of_birth);

          return (
            <button
              key={child.id}
              onClick={() => onSelect(child.id)}
              disabled={!eligibility.eligible}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-[#F3BC48] bg-[#F3BC48]/10'
                    : eligibility.eligible
                    ? 'border-gray-200 bg-white hover:border-[#F3BC48]/50 hover:shadow-md'
                    : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#F3BC48] rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-[#173151]/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-[#173151]" />
                </div>

                {/* Child Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-manrope font-semibold text-fluid-base text-[#173151] truncate">
                    {child.first_name} {child.last_name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {age && (
                      <span className="text-sm font-manrope text-[#666D80]">
                        Age: {age}
                      </span>
                    )}
                    {child.grade && (
                      <span className="text-sm font-manrope text-[#666D80]">
                        • Grade {child.grade}
                      </span>
                    )}
                  </div>

                  {/* Eligibility Warning */}
                  {!eligibility.eligible && eligibility.message && (
                    <div className="mt-2 text-xs font-manrope text-red-600 bg-red-50 px-2 py-1 rounded">
                      ⚠️ {eligibility.message}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Child Note */}
      {selectedId && (
        <p className="mt-3 text-sm font-manrope text-[#666D80]">
          Selected child will be enrolled in this class
        </p>
      )}
    </div>
  );
}

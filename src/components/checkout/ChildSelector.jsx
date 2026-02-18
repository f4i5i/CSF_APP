/**
 * ChildSelector Component
 * Allows parent to select which child(ren) to enroll in the class
 * Supports both single-select and multi-select modes with sibling discount display
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, UserPlus, Check, Users } from 'lucide-react';

// Sibling discount tiers (matching backend)
const SIBLING_DISCOUNTS = {
  1: 0,      // First child: no discount
  2: 0.25,   // 2nd child: 25% off
  3: 0.35,   // 3rd child: 35% off
  4: 0.45,   // 4th+ child: 45% off
};

const getSiblingDiscount = (position) => {
  if (position <= 0) return 0;
  if (position >= 4) return SIBLING_DISCOUNTS[4];
  return SIBLING_DISCOUNTS[position] || 0;
};

export default function ChildSelector({
  children,
  selectedId,
  selectedIds = [], // NEW: Support multiple selection
  onSelect,
  onToggle, // NEW: Toggle selection for multi-select
  classData,
  multiSelect = true, // NEW: Enable multi-select by default
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddChild = () => {
    // Save current checkout route to sessionStorage so we can return here
    sessionStorage.setItem('intendedRoute', location.pathname + location.search);
    navigate('/registerchild');
  };

  if (!children || children.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
        <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] mb-4">
          Select Child
        </h2>
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3BC48]/10 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-[#173151]" />
          </div>
          <p className="text-fluid-base font-manrope text-[#666D80] mb-4">
            No children found. Please add a child to your account to continue enrollment.
          </p>
          <button
            onClick={handleAddChild}
            className="flex items-center gap-2 mx-auto py-3 px-6 bg-[#F3BC48] hover:bg-[#e5a920] border border-[#e1e1e1] text-base font-medium font-manrope rounded-lg text-[#173151] transition-colors shadow-sm"
          >
            <UserPlus size={20} className="text-[#173151]" />
            <span>Add Your First Child</span>
          </button>
        </div>
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

  // Check if child is already enrolled in this class
  const checkAlreadyEnrolled = (child) => {
    if (!classData || !child.enrollments) return false;

    // Only check for ACTIVE (paid) enrollments - PENDING enrollments from failed checkouts should not block
    return child.enrollments.some(
      (enrollment) =>
        enrollment.class_id === classData.id &&
        (enrollment.status === 'active' || enrollment.status === 'ACTIVE')
    );
  };

  // Note: Children can now be enrolled in multiple classes simultaneously
  // Only duplicate enrollment in the SAME class is prevented

  // Check if child is eligible based on age and enrollment status
  const checkEligibility = (child) => {
    // Only check if already enrolled in THIS specific class (prevent duplicates)
    if (checkAlreadyEnrolled(child)) {
      return {
        eligible: false,
        message: 'Already enrolled in this class',
        alreadyEnrolled: true,
        hasActiveClass: false,
      };
    }

    // Children CAN now enroll in multiple different classes

    if (!classData || (!classData.min_age && !classData.max_age)) {
      return { eligible: true, message: null, alreadyEnrolled: false, hasActiveClass: false };
    }

    const age = calculateAge(child.date_of_birth);
    if (!age) return { eligible: true, message: null, alreadyEnrolled: false, hasActiveClass: false };

    const minAge = classData.min_age;
    const maxAge = classData.max_age;

    if (minAge && age < minAge) {
      return {
        eligible: false,
        message: `Must be at least ${minAge} years old`,
        alreadyEnrolled: false,
        hasActiveClass: false,
      };
    }

    if (maxAge && age > maxAge) {
      return {
        eligible: false,
        message: `Must be ${maxAge} years old or younger`,
        alreadyEnrolled: false,
        hasActiveClass: false,
      };
    }

    return { eligible: true, message: null, alreadyEnrolled: false, hasActiveClass: false };
  };

  // Check if class is free (no sibling discounts for free classes)
  const classFee = Number(classData?.base_price || classData?.price || 0);
  const isFreeClass = classFee === 0;

  // Handle click based on mode
  const handleChildClick = (childId) => {
    if (multiSelect && onToggle) {
      onToggle(childId);
    } else if (onSelect) {
      onSelect(childId);
    }
  };

  // Check if child is selected (support both modes)
  const isChildSelected = (childId) => {
    if (multiSelect) {
      return selectedIds.includes(childId);
    }
    return selectedId === childId;
  };

  // Get sibling position for discount display
  const getChildPosition = (childId) => {
    const index = selectedIds.indexOf(childId);
    return index >= 0 ? index + 1 : 0;
  };

  // Calculate total savings preview
  const calculateSavingsPreview = () => {
    if (!classData || selectedIds.length <= 1) return null;

    const price = classData.base_price || classData.price || 0;
    let totalSavings = 0;

    selectedIds.forEach((_, index) => {
      const position = index + 1;
      const discount = getSiblingDiscount(position);
      totalSavings += price * discount;
    });

    return totalSavings;
  };

  const totalSavings = calculateSavingsPreview();

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] leading-[1.5] tracking-[-0.2px]">
          {multiSelect ? 'Select Children' : 'Select Child'}
        </h2>
        {multiSelect && selectedIds.length > 0 && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F3BC48]/20 text-[#173151] rounded-full text-sm font-medium">
            <Users size={16} />
            {selectedIds.length} selected
          </span>
        )}
      </div>

      {/* Multi-select hint */}
      {multiSelect && children.length > 1 && (
        <p className="text-sm font-manrope text-[#666D80] mb-3">
          {isFreeClass
            ? 'Select the children you want to enroll in this free class.'
            : 'Select multiple children to enroll them together and get sibling discounts!'}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {children.map((child) => {
          const eligibility = checkEligibility(child);
          const isSelected = isChildSelected(child.id);
          const age = calculateAge(child.date_of_birth);
          const position = getChildPosition(child.id);
          const discountPercent = position > 0 ? getSiblingDiscount(position) * 100 : 0;

          return (
            <button
              key={child.id}
              onClick={() => eligibility.eligible && handleChildClick(child.id)}
              disabled={!eligibility.eligible}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-[#F3BC48] bg-[#F3BC48]/10 shadow-md'
                    : eligibility.eligible
                    ? 'border-gray-200 bg-white hover:border-[#F3BC48]/50 hover:shadow-md'
                    : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                }
              `}
            >
              {/* Selection Indicator / Checkbox */}
              <div className={`absolute top-2 right-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-[#F3BC48] border-[#F3BC48]'
                  : 'bg-white border-gray-300'
              }`}>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>

              {/* Sibling Discount Badge */}
              {isSelected && discountPercent > 0 && !isFreeClass && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-500 text-white">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3 mt-1">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-[#F3BC48]/30' : 'bg-[#173151]/10'
                }`}>
                  <User className={`w-6 h-6 ${isSelected ? 'text-[#173151]' : 'text-[#173151]'}`} />
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

                  {/* Sibling Position Label */}
                  {isSelected && position > 0 && !isFreeClass && (
                    <div className="mt-2 text-xs font-manrope text-[#173151]">
                      {position === 1 && 'First child (no discount)'}
                      {position === 2 && '2nd child - 25% sibling discount'}
                      {position === 3 && '3rd child - 35% sibling discount'}
                      {position >= 4 && `${position}th child - 45% sibling discount`}
                    </div>
                  )}

                  {/* Eligibility Warning */}
                  {!eligibility.eligible && eligibility.message && (
                    <div className={`mt-2 text-xs font-manrope px-2 py-1 rounded ${
                      eligibility.alreadyEnrolled
                        ? 'text-blue-700 bg-blue-50 border border-blue-200'
                        : eligibility.hasActiveClass
                        ? 'text-orange-700 bg-orange-50 border border-orange-200'
                        : 'text-red-600 bg-red-50'
                    }`}>
                      {eligibility.alreadyEnrolled ? '✓' : eligibility.hasActiveClass ? '📚' : '⚠️'} {eligibility.message}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sibling Discount Summary */}
      {multiSelect && selectedIds.length > 1 && totalSavings > 0 && !isFreeClass && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold font-manrope text-green-800">
                Sibling Discount Applied!
              </p>
              <p className="text-xs font-manrope text-green-700 mt-1">
                Enrolling {selectedIds.length} children together saves you money
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold font-manrope text-green-700">
                -${totalSavings.toFixed(2)}
              </p>
              <p className="text-xs font-manrope text-green-600">savings</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Children Note */}
      {selectedIds.length > 0 && (
        <p className="mt-3 text-sm font-manrope text-[#666D80]">
          {selectedIds.length === 1
            ? 'Selected child will be enrolled in this class'
            : `${selectedIds.length} children will be enrolled together`}
        </p>
      )}
    </div>
  );
}

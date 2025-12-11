/**
 * StatusBadge Component
 * Displays color-coded status badges for orders, payments, enrollments, etc.
 */

import React from 'react';

const STATUS_STYLES = {
  // Order statuses
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    label: 'Pending',
  },
  confirmed: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    label: 'Confirmed',
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    label: 'Cancelled',
  },
  refunded: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    label: 'Refunded',
  },

  // Payment statuses
  succeeded: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    label: 'Succeeded',
  },
  failed: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    label: 'Failed',
  },
  processing: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    label: 'Processing',
  },

  // Enrollment statuses
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    label: 'Active',
  },
  inactive: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    label: 'Inactive',
  },
  withdrawn: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    label: 'Withdrawn',
  },

  // Installment statuses
  paid: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    label: 'Paid',
  },
  overdue: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    label: 'Overdue',
  },
  upcoming: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    label: 'Upcoming',
  },

  // Waitlist statuses
  waitlisted: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    label: 'Waitlisted',
  },
  notified: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    label: 'Notified',
  },
  enrolled: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    label: 'Enrolled',
  },
};

export default function StatusBadge({ status, customLabel, size = 'sm' }) {
  const statusKey = status?.toLowerCase() || 'pending';
  const style = STATUS_STYLES[statusKey] || STATUS_STYLES.pending;
  const displayLabel = customLabel || style.label;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        ${style.bg} ${style.text} ${style.border}
        ${sizeClasses[size]}
        font-manrope font-semibold
        rounded-full border
        whitespace-nowrap
      `}
    >
      {displayLabel}
    </span>
  );
}

/**
 * ConfirmDialog Component
 * Modal dialog for confirming destructive actions (delete, cancel, etc.)
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false,
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-error-main',
      iconBg: 'bg-error-light/10',
      button: 'bg-error-main hover:bg-error-dark transition-colors',
    },
    warning: {
      icon: 'text-warning-main',
      iconBg: 'bg-warning-main/10',
      button: 'bg-warning-main hover:bg-warning-dark transition-colors text-heading-dark',
    },
    info: {
      icon: 'text-btn-secondary',
      iconBg: 'bg-btn-secondary/10',
      button: 'bg-btn-secondary hover:bg-btn-gold transition-colors text-white',
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-[12px] shadow-2xl max-w-md w-full border border-border-light"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border-light">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-manrope text-heading-dark ">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm font-manrope text-text-muted leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-lightest rounded-b-[12px] border-t border-border-light">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-manrope font-semibold text-text-primary border border-border-light hover:bg-neutral-lightest rounded-[8px] transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 text-sm font-manrope font-semibold text-white rounded-[8px] transition
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
              ${styles.button}
            `}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

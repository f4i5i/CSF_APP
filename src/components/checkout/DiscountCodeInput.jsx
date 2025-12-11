/**
 * DiscountCodeInput Component
 * Allows user to enter and apply discount codes
 */

import React, { useState } from 'react';
import { Tag, X, Check } from 'lucide-react';

export default function DiscountCodeInput({ onApply, onRemove, appliedDiscount, isLoading }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a discount code');
      return;
    }

    setError('');
    try {
      await onApply(code.trim().toUpperCase());
      setCode('');
    } catch (err) {
      setError(err.message || 'Invalid discount code');
    }
  };

  const handleRemove = () => {
    setCode('');
    setError('');
    onRemove();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
      <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] leading-[1.5] tracking-[-0.2px] mb-4">
        Discount Code
      </h2>

      {/* Applied Discount Display */}
      {appliedDiscount && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-manrope font-semibold text-sm text-green-900">
                  Discount Applied!
                </p>
                <p className="font-manrope text-xs text-green-700 mt-0.5">
                  Code: <strong>{appliedDiscount.code}</strong>
                  {appliedDiscount.type === 'percentage' && (
                    <span> - {appliedDiscount.value}% off</span>
                  )}
                  {appliedDiscount.type === 'fixed_amount' && (
                    <span> - ${appliedDiscount.value} off</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-green-100 rounded-full transition"
              title="Remove discount"
            >
              <X className="w-5 h-5 text-green-700" />
            </button>
          </div>
        </div>
      )}

      {/* Admin-Applied Discounts (Read-Only) */}
      {appliedDiscount && appliedDiscount.adminApplied && (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-manrope font-semibold text-sm text-purple-900">
                Special Discount Applied
              </p>
              <p className="font-manrope text-xs text-purple-700 mt-0.5">
                {appliedDiscount.description || 'Applied by administrator'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Discount Code Input */}
      {!appliedDiscount && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter discount code"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-manrope text-base focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none uppercase"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleApply}
              disabled={isLoading || !code.trim()}
              className="px-6 py-3 bg-[#F3BC48] text-white font-manrope font-semibold rounded-lg hover:bg-[#F3BC48]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Applying...' : 'Apply'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-sm font-manrope text-red-600 bg-red-50 px-3 py-2 rounded">
              <X className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Help Text */}
          <p className="text-xs font-manrope text-[#666D80]">
            Have a promo code? Enter it above to receive your discount.
          </p>
        </div>
      )}
    </div>
  );
}

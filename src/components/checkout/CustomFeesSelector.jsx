/**
 * CustomFeesSelector Component
 * Displays required fees (auto-added) and optional fees (checkboxes) during checkout
 */

import React from 'react';
import { Check, Tag } from 'lucide-react';

export default function CustomFeesSelector({
  classData,
  selectedChildIds = [],
  children = [],
  selectedFeesByChild = {},
  onToggleFee,
}) {
  const customFees = classData?.custom_fees;

  // Don't render if no custom fees
  if (!customFees || customFees.length === 0) return null;

  const requiredFees = customFees
    .map((fee, idx) => ({ ...fee, index: idx }))
    .filter(fee => !fee.is_optional);

  const optionalFees = customFees
    .map((fee, idx) => ({ ...fee, index: idx }))
    .filter(fee => fee.is_optional);

  // Get selected children info
  const selectedChildren = selectedChildIds
    .map(id => children.find(c => c.id === id))
    .filter(Boolean);

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
      <div className="flex items-center gap-2 mb-4">
        <Tag size={20} className="text-[#173151]" />
        <h3 className="text-fluid-lg font-semibold font-manrope text-[#173151]">
          Additional Fees
        </h3>
      </div>

      {/* Required Fees */}
      {requiredFees.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-manrope font-semibold text-[#666D80] uppercase tracking-wide mb-2">
            Required Fees
          </p>
          <div className="space-y-2">
            {requiredFees.map((fee) => (
              <div
                key={fee.index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#173151] flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                  <div>
                    <span className="font-manrope font-medium text-sm text-[#173151]">
                      {fee.name}
                    </span>
                    {fee.description && (
                      <p className="text-xs text-[#666D80] font-manrope">{fee.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-manrope font-semibold text-sm text-[#173151]">
                    ${parseFloat(fee.amount).toFixed(2)}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded font-manrope">
                    Required
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Fees */}
      {optionalFees.length > 0 && (
        <div>
          <p className="text-xs font-manrope font-semibold text-[#666D80] uppercase tracking-wide mb-2">
            Optional Fees
          </p>

          {/* Single child or no children selected: simple list */}
          {selectedChildren.length <= 1 ? (
            <div className="space-y-2">
              {optionalFees.map((fee) => {
                const childId = selectedChildIds[0];
                const isSelected = childId && (selectedFeesByChild[childId] || []).includes(fee.index);

                return (
                  <label
                    key={fee.index}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => childId && onToggleFee(childId, fee.index)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-manrope font-medium text-sm text-[#173151]">
                          {fee.name}
                        </span>
                        {fee.description && (
                          <p className="text-xs text-[#666D80] font-manrope">{fee.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-manrope font-semibold text-sm text-[#173151]">
                      ${parseFloat(fee.amount).toFixed(2)}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            /* Multiple children: group by child */
            <div className="space-y-4">
              {selectedChildren.map((child) => (
                <div key={child.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <span className="font-manrope font-semibold text-sm text-[#173151]">
                      {child.first_name || child.full_name || 'Child'}
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    {optionalFees.map((fee) => {
                      const isSelected = (selectedFeesByChild[child.id] || []).includes(fee.index);

                      return (
                        <label
                          key={fee.index}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleFee(child.id, fee.index)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-manrope text-sm text-[#173151]">
                              {fee.name}
                            </span>
                          </div>
                          <span className="font-manrope font-medium text-sm text-[#173151]">
                            ${parseFloat(fee.amount).toFixed(2)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

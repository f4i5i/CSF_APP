/**
 * InstallmentPlanSelector Component
 * Allows user to choose installment plan (2, 3, 4, or 6 months)
 */

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import installmentsService from '../../api/services/installments.service';

export default function InstallmentPlanSelector({ orderTotal = 0, selectedPlan, onSelect }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoPay, setAutoPay] = useState(true);

  // Available installment options
  const installmentOptions = [
    { count: 2, label: '2 Months' },
    { count: 3, label: '3 Months' },
    { count: 4, label: '4 Months' },
    { count: 6, label: '6 Months' },
  ];

  // Calculate installment preview
  useEffect(() => {
    if (orderTotal > 0) {
      calculatePlans();
    }
  }, [orderTotal]);

  const calculatePlans = async () => {
    setLoading(true);
    try {
      const calculatedPlans = installmentOptions.map((option) => {
        const amountPerMonth = orderTotal / option.count;
        return {
          count: option.count,
          label: option.label,
          amountPerMonth: amountPerMonth.toFixed(2),
          total: orderTotal.toFixed(2),
          firstPaymentAmount: amountPerMonth.toFixed(2),
        };
      });

      setPlans(calculatedPlans);
    } catch (error) {
      console.error('Failed to calculate installment plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    onSelect({ ...plan, autoPay });
  };

  if (loading) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
      <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] leading-[1.5] tracking-[-0.2px] mb-4">
        Choose Payment Plan
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.count === plan.count;

          return (
            <button
              key={plan.count}
              onClick={() => handleSelectPlan(plan)}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-[#F3BC48] bg-[#F3BC48]/10 shadow-md'
                    : 'border-gray-200 bg-white hover:border-[#F3BC48]/50 hover:shadow-md'
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
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-[#F3BC48]/20' : 'bg-[#173151]/10'
                  }`}
                >
                  <Calendar
                    className={`w-5 h-5 ${isSelected ? 'text-[#F3BC48]' : 'text-[#173151]'}`}
                  />
                </div>

                {/* Plan Info */}
                <div className="flex-1">
                  <h3 className="font-manrope font-semibold text-fluid-base text-[#173151] mb-1">
                    {plan.label}
                  </h3>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#666D80]" />
                      <span className="text-sm font-manrope text-[#666D80]">
                        ${plan.amountPerMonth}/month
                      </span>
                    </div>

                    <p className="text-xs font-manrope text-[#666D80]">
                      Total: ${plan.total}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Auto-pay Option */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoPay}
            onChange={(e) => setAutoPay(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-[#F3BC48] focus:ring-[#F3BC48]"
          />
          <div>
            <p className="font-manrope font-semibold text-sm text-blue-900">
              Enable Auto-Pay (Recommended)
            </p>
            <p className="font-manrope text-xs text-blue-700 mt-1">
              Automatically charge your card each month. You can cancel anytime.
            </p>
          </div>
        </label>
      </div>

      {/* Payment Schedule Preview */}
      {selectedPlan && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-manrope font-semibold text-sm text-[#173151] mb-2">
            Payment Schedule Preview:
          </h4>
          <div className="space-y-1">
            {Array.from({ length: selectedPlan.count }).map((_, index) => {
              const date = new Date();
              date.setMonth(date.getMonth() + index);
              const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div key={index} className="flex justify-between text-sm font-manrope">
                  <span className="text-[#666D80]">
                    Payment {index + 1} ({dateStr})
                  </span>
                  <span className="font-semibold text-[#173151]">
                    ${selectedPlan.amountPerMonth}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

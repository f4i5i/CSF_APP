/**
 * PaymentMethodSelector Component
 * Allows user to choose between Pay in Full, Subscribe, or Installments
 */

import React from 'react';
import { CreditCard, RefreshCw, Calendar } from 'lucide-react';

export default function PaymentMethodSelector({ selected, onSelect, classPrice = 0 }) {
  const paymentMethods = [
    {
      id: 'full',
      name: 'Pay in Full',
      icon: CreditCard,
      description: 'Pay the full amount now',
      badge: null,
      price: classPrice,
    },
    {
      id: 'subscribe',
      name: 'Subscribe',
      icon: RefreshCw,
      description: 'Recurring monthly membership',
      badge: 'Auto-renew',
      price: classPrice, // Backend will calculate monthly rate
    },
    {
      id: 'installments',
      name: 'Installments',
      icon: Calendar,
      description: 'Split payment over time',
      badge: 'Flexible',
      price: classPrice,
    },
  ];

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
      <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] leading-[1.5] tracking-[-0.2px] mb-4">
        Payment Method
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selected === method.id;

          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-[#F3BC48] bg-[#F3BC48]/10 shadow-md'
                    : 'border-gray-200 bg-white hover:border-[#F3BC48]/50 hover:shadow-md'
                }
              `}
            >
              {/* Badge */}
              {method.badge && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F3BC48] text-white">
                    {method.badge}
                  </span>
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-5 h-5 bg-[#F3BC48] rounded-full flex items-center justify-center">
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

              <div className="mt-2">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-[#F3BC48]/20' : 'bg-[#173151]/10'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${isSelected ? 'text-[#F3BC48]' : 'text-[#173151]'}`}
                  />
                </div>

                {/* Method Name */}
                <h3 className="font-manrope font-semibold text-fluid-base text-[#173151] mb-1">
                  {method.name}
                </h3>

                {/* Description */}
                <p className="text-sm font-manrope text-[#666D80] mb-2">
                  {method.description}
                </p>

                {/* Price Display */}
                {method.price > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-manrope text-[#666D80] mb-1">
                      {method.id === 'full' && 'Total'}
                      {method.id === 'subscribe' && 'Monthly'}
                      {method.id === 'installments' && 'Total'}
                    </p>
                    <p className="text-lg font-bold font-manrope text-[#173151]">
                      ${parseFloat(method.price).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm font-manrope text-blue-800">
          {selected === 'full' && '💳 Pay the full amount securely with your credit card'}
          {selected === 'subscribe' &&
            '🔄 Automatic monthly payments - cancel anytime'}
          {selected === 'installments' &&
            '📅 Choose your payment schedule in the next step'}
        </p>
      </div>
    </div>
  );
}

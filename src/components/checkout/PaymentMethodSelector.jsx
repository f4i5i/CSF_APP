/**
 * PaymentMethodSelector Component
 * Allows user to choose between Pay in Full, Subscribe, or Installments
 */

import React, { useEffect } from 'react';
import { CreditCard, RefreshCw, Calendar } from 'lucide-react';

export default function PaymentMethodSelector({ selected, onSelect, classPrice = 0, classData }) {
  // Calculate months for subscription billing
  // Billing starts from class start_date (or today if already started)
  const getSubscriptionMonths = () => {
    if (!classData?.end_date) return null;

    const endDate = new Date(classData.end_date);
    const today = new Date();

    // Use class start_date if available, otherwise today
    let billingStart = today;
    if (classData?.start_date) {
      const startDate = new Date(classData.start_date);
      // Use the later of today or class start date
      billingStart = startDate > today ? startDate : today;
    }

    // Calculate months between billingStart and endDate (inclusive)
    const startYear = billingStart.getFullYear();
    const startMonth = billingStart.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();

    const months = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
    return months > 0 ? months : null;
  };

  const monthsRemaining = getSubscriptionMonths();
  const classEndDate = classData?.end_date
    ? new Date(classData.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  // Check if this is a subscription/membership class
  const isSubscriptionClass = classData?.class_type === 'membership' ||
                              classData?.billing_model === 'monthly' ||
                              classData?.membership_price != null;

  // Monthly price for subscription
  const monthlyPrice = classData?.membership_price || classPrice;

  const allPaymentMethods = [
    {
      id: 'full',
      name: 'Pay in Full',
      icon: CreditCard,
      description: 'Pay the full amount now (one-time)',
      badge: null,
      price: classPrice,
      enabled: !isSubscriptionClass, // Disable for subscription classes
    },
    {
      id: 'subscribe',
      name: 'Monthly Subscription',
      icon: RefreshCw,
      description: classEndDate
        ? `Recurring monthly until ${classEndDate}`
        : 'Recurring monthly until class ends',
      badge: 'RECURRING',
      price: monthlyPrice,
      priceLabel: '/month',
      monthsRemaining: monthsRemaining,
      enabled: isSubscriptionClass, // Enable for subscription classes
    },
    {
      id: 'installments',
      name: 'Installments',
      icon: Calendar,
      description: 'Split payment over time',
      badge: 'Flexible',
      price: classPrice,
      enabled: classData?.installments_enabled === true && !isSubscriptionClass, // Only if explicitly enabled and not subscription
    },
  ];

  // Filter to only show enabled payment methods
  const paymentMethods = allPaymentMethods.filter(method => method.enabled);

  // Auto-select subscribe for subscription classes
  useEffect(() => {
    if (isSubscriptionClass && !selected) {
      onSelect('subscribe');
    } else if (!isSubscriptionClass && !selected) {
      onSelect('full');
    }
  }, [isSubscriptionClass, selected, onSelect]);

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
                      {method.id === 'full' && 'One-time payment'}
                      {method.id === 'subscribe' && 'Monthly recurring fee'}
                      {method.id === 'installments' && 'Total amount'}
                    </p>
                    <p className="text-lg font-bold font-manrope text-[#173151]">
                      ${parseFloat(method.price).toFixed(2)}
                      {method.priceLabel && <span className="text-sm font-normal text-[#666D80]">{method.priceLabel}</span>}
                    </p>
                    {/* Show subscription duration info */}
                    {method.id === 'subscribe' && method.monthsRemaining && (
                      <p className="text-xs font-manrope text-purple-600 mt-1">
                        ~{method.monthsRemaining} months • Est. total: ${(parseFloat(method.price) * method.monthsRemaining).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <div className={`mt-4 p-3 rounded-lg ${selected === 'subscribe' ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50'}`}>
        <p className={`text-sm font-manrope ${selected === 'subscribe' ? 'text-purple-800' : 'text-blue-800'}`}>
          {selected === 'full' && '💳 Pay the full amount securely with your credit card (one-time payment)'}
          {selected === 'subscribe' && (
            <>
              🔄 <strong>This is a RECURRING monthly subscription.</strong> Your card will be charged <strong>${parseFloat(monthlyPrice).toFixed(2)}/month</strong> automatically until class ends
              {classEndDate && ` (${classEndDate})`}. You can cancel anytime from your account settings.
            </>
          )}
          {selected === 'installments' &&
            '📅 Choose your payment schedule in the next step'}
        </p>
      </div>
    </div>
  );
}

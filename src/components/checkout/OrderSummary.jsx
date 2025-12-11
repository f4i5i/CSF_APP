/**
 * OrderSummary Component
 * Displays order breakdown with line items, fees, discounts, and total
 */

import React from 'react';

export default function OrderSummary({
  classPrice = 0,
  registrationFee = 25,
  processingFeePercent = 2.9,
  discount = null,
  paymentMethod = 'full',
  installmentPlan = null,
}) {
  // Calculate subtotal
  const subtotal = parseFloat(classPrice) + parseFloat(registrationFee);

  // Calculate discount amount
  let discountAmount = 0;
  if (discount) {
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * parseFloat(discount.value)) / 100;
    } else if (discount.type === 'fixed_amount') {
      discountAmount = parseFloat(discount.value);
    }
  }

  // Calculate amount after discount
  const afterDiscount = subtotal - discountAmount;

  // Calculate processing fee
  const processingFee = (afterDiscount * processingFeePercent) / 100;

  // Calculate total
  const total = afterDiscount + processingFee;

  // For installments, calculate first payment
  const firstPayment =
    paymentMethod === 'installments' && installmentPlan
      ? total / (installmentPlan.count || 1)
      : total;

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
      <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] leading-[1.5] tracking-[-0.2px] mb-4">
        Order Summary
      </h2>

      <div className="space-y-3">
        {/* Line Items */}
        <div className="space-y-2">
          {/* Class Price */}
          <div className="flex justify-between items-center">
            <span className="font-manrope font-normal text-fluid-base text-[#666D80]">
              Class Fee
            </span>
            <span className="font-manrope font-medium text-fluid-base text-[#173151]">
              ${parseFloat(classPrice).toFixed(2)}
            </span>
          </div>

          {/* Registration Fee */}
          <div className="flex justify-between items-center">
            <span className="font-manrope font-normal text-fluid-base text-[#666D80]">
              Registration Fee
            </span>
            <span className="font-manrope font-medium text-fluid-base text-[#173151]">
              ${parseFloat(registrationFee).toFixed(2)}
            </span>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-manrope font-medium text-fluid-base text-[#173151]">
              Subtotal
            </span>
            <span className="font-manrope font-medium text-fluid-base text-[#173151]">
              ${subtotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Discount */}
        {discount && discountAmount > 0 && (
          <div className="flex justify-between items-center bg-green-50 -mx-2 px-2 py-2 rounded">
            <div className="flex items-center gap-2">
              <span className="font-manrope font-medium text-fluid-base text-green-700">
                Discount
              </span>
              {discount.code && (
                <span className="text-xs font-manrope font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                  {discount.code}
                </span>
              )}
            </div>
            <span className="font-manrope font-semibold text-fluid-base text-green-700">
              -${discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Processing Fee */}
        <div className="flex justify-between items-center">
          <span className="font-manrope font-normal text-sm text-[#666D80]">
            Processing Fee ({processingFeePercent}%)
          </span>
          <span className="font-manrope font-medium text-sm text-[#666D80]">
            ${processingFee.toFixed(2)}
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
          <span className="font-manrope font-bold text-fluid-lg text-[#173151]">
            Total
          </span>
          <span className="font-manrope font-bold text-fluid-xl text-[#F3BC48]">
            ${total.toFixed(2)}
          </span>
        </div>

        {/* Installment Info */}
        {paymentMethod === 'installments' && installmentPlan && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-manrope text-blue-800 mb-1">
              <strong>Payment Plan:</strong>
            </p>
            <p className="text-sm font-manrope text-blue-700">
              First payment: <strong>${firstPayment.toFixed(2)}</strong>
            </p>
            <p className="text-sm font-manrope text-blue-700">
              Then ${firstPayment.toFixed(2)}/month for{' '}
              {(installmentPlan.count || 1) - 1} more months
            </p>
          </div>
        )}

        {/* Subscribe Info */}
        {paymentMethod === 'subscribe' && (
          <div className="mt-3 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm font-manrope text-purple-800">
              🔄 <strong>Recurring Payment:</strong> Your card will be charged $
              {total.toFixed(2)} monthly until you cancel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

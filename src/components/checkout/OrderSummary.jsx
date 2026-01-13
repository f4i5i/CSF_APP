/**
 * OrderSummary Component
 * Displays order breakdown with line items, fees, discounts, and total
 * Now supports multi-child enrollment with sibling discount display
 */

import React from 'react';
import { Users } from 'lucide-react';

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

export default function OrderSummary({
  classPrice = 0,
  registrationFee = 25,
  processingFeePercent = 2.9,
  discount = null,
  paymentMethod = 'full',
  installmentPlan = null,
  childCount = 1, // NEW: Number of children selected
  children = [], // NEW: Selected children info for display
  lineItems = null, // NEW: Line items from order (with sibling discounts)
}) {
  // Calculate sibling discounts for multiple children
  const calculateWithSiblingDiscount = () => {
    if (childCount <= 1) {
      return {
        items: [{ position: 1, price: parseFloat(classPrice), discount: 0, total: parseFloat(classPrice) }],
        totalBeforeDiscount: parseFloat(classPrice),
        siblingDiscount: 0,
        totalAfterSibling: parseFloat(classPrice),
      };
    }

    const items = [];
    let totalBeforeDiscount = 0;
    let siblingDiscount = 0;
    let totalAfterSibling = 0;

    for (let i = 0; i < childCount; i++) {
      const position = i + 1;
      const price = parseFloat(classPrice);
      const discountRate = getSiblingDiscount(position);
      const discountAmount = price * discountRate;
      const lineTotal = price - discountAmount;

      items.push({
        position,
        price,
        discountRate,
        discount: discountAmount,
        total: lineTotal,
        childName: children[i]?.first_name || `Child ${position}`,
      });

      totalBeforeDiscount += price;
      siblingDiscount += discountAmount;
      totalAfterSibling += lineTotal;
    }

    return { items, totalBeforeDiscount, siblingDiscount, totalAfterSibling };
  };

  const siblingCalc = calculateWithSiblingDiscount();

  // Calculate subtotal (class fees after sibling discount + registration fee)
  const classFeesTotal = siblingCalc.totalAfterSibling;
  const subtotal = classFeesTotal + parseFloat(registrationFee);

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
        {/* Multi-Child Header */}
        {childCount > 1 && (
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Users size={18} className="text-[#173151]" />
            <span className="font-manrope font-semibold text-sm text-[#173151]">
              {childCount} Children Enrolling
            </span>
          </div>
        )}

        {/* Line Items */}
        <div className="space-y-2">
          {/* Single Child: Simple Class Fee Display */}
          {childCount <= 1 && (
            <div className="flex justify-between items-center">
              <span className="font-manrope font-normal text-fluid-base text-[#666D80]">
                {paymentMethod === 'subscribe' ? (
                  <>Membership Fee <span className="text-xs text-purple-600">(Monthly)</span></>
                ) : (
                  'Class Fee'
                )}
              </span>
              <span className="font-manrope font-medium text-fluid-base text-[#173151]">
                ${parseFloat(classPrice).toFixed(2)}
                {paymentMethod === 'subscribe' && <span className="text-xs text-[#666D80]">/mo</span>}
              </span>
            </div>
          )}

          {/* Multiple Children: Line Items with Sibling Discounts */}
          {childCount > 1 && siblingCalc.items.map((item, index) => (
            <div key={index} className="py-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-manrope font-normal text-sm text-[#666D80]">
                    {item.childName}
                  </span>
                  {item.discount > 0 && (
                    <span className="text-xs font-semibold px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                      {(item.discountRate * 100).toFixed(0)}% OFF
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {item.discount > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="font-manrope text-xs text-[#666D80] line-through">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="font-manrope font-medium text-sm text-[#173151]">
                        ${item.total.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-manrope font-medium text-sm text-[#173151]">
                      ${item.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Sibling Discount Total */}
          {childCount > 1 && siblingCalc.siblingDiscount > 0 && (
            <div className="flex justify-between items-center bg-green-50 -mx-2 px-2 py-2 rounded">
              <span className="font-manrope font-medium text-sm text-green-700">
                Sibling Discount Savings
              </span>
              <span className="font-manrope font-semibold text-sm text-green-700">
                -${siblingCalc.siblingDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Class Fees Subtotal (for multi-child) */}
          {childCount > 1 && (
            <div className="flex justify-between items-center pt-1">
              <span className="font-manrope font-normal text-sm text-[#666D80]">
                Class Fees Total
              </span>
              <span className="font-manrope font-medium text-sm text-[#173151]">
                ${classFeesTotal.toFixed(2)}
              </span>
            </div>
          )}

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
          <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-600 text-white">
                RECURRING
              </span>
            </div>
            <p className="text-sm font-manrope text-purple-800 font-medium">
              Monthly Membership Subscription
            </p>
            <p className="text-sm font-manrope text-purple-700 mt-1">
              Your card will be charged <strong>${total.toFixed(2)}/month</strong> automatically. You can cancel anytime from your account settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

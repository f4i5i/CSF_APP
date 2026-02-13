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
  registrationFee = 0,
  processingFeePercent = 0,
  discount = null,
  paymentMethod = 'full',
  installmentPlan = null,
  childCount = 1, // NEW: Number of children selected
  children = [], // NEW: Selected children info for display
  lineItems = null, // NEW: Line items from order (with sibling discounts)
  classData = null, // NEW: Class data for subscription end date
  backendTotal = null, // NEW: Use actual backend total when available
  backendProcessingFee = null, // Processing fee from backend order
}) {
  // Calculate subscription duration
  const getSubscriptionInfo = () => {
    if (!classData?.end_date) return null;
    const endDate = new Date(classData.end_date);
    const today = new Date();
    const months = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24 * 30));
    const formattedEndDate = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return months > 0 ? { months, endDate: formattedEndDate } : null;
  };

  const subscriptionInfo = paymentMethod === 'subscribe' ? getSubscriptionInfo() : null;
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

  // Calculate processing fee - use backend value when available
  const processingFee = backendProcessingFee != null && backendProcessingFee > 0
    ? parseFloat(backendProcessingFee)
    : (afterDiscount * processingFeePercent) / 100;

  // Calculate total - use backend total when available for accuracy
  const total = backendTotal && backendTotal > 0 ? parseFloat(backendTotal) : afterDiscount + processingFee;

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
          {/* Use backend line items when available */}
          {lineItems && lineItems.length > 0 ? (
            <>
              {lineItems.map((item, index) => (
                <div key={index} className="py-1">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-manrope font-normal text-sm text-[#666D80]">
                        {item.description || `${item.child_name} - ${item.class_name}`}
                      </span>
                      {/* Show subscription badge if this is a subscription item */}
                      {item.is_subscription && item.billing_model === 'monthly' && (
                        <span className="text-xs text-purple-600 font-medium">
                          ${parseFloat(item.monthly_price || item.line_total).toFixed(2)}/month × {item.num_months} months
                        </span>
                      )}
                      {item.discount_description && (
                        <span className="text-xs text-green-600">
                          {item.discount_description}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {item.is_subscription && item.billing_model === 'monthly' ? (
                        <span className="font-manrope font-medium text-sm text-[#173151]">
                          ${parseFloat(item.monthly_price || item.line_total).toFixed(2)}/mo
                        </span>
                      ) : item.discount_amount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="font-manrope text-xs text-[#666D80] line-through">
                            ${parseFloat(item.unit_price).toFixed(2)}
                          </span>
                          <span className="font-manrope font-medium text-sm text-[#173151]">
                            ${parseFloat(item.line_total).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-manrope font-medium text-sm text-[#173151]">
                          ${parseFloat(item.line_total || item.unit_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Fallback: Single Child display */}
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

              {/* Fallback: Multiple Children with frontend sibling calc */}
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
            </>
          )}
        </div>

        {/* Discount (from promo code, not already included in line items) */}
        {discount && discountAmount > 0 && !lineItems && (
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
        {processingFee > 0 && (
          <div className="flex justify-between items-center">
            <span className="font-manrope font-normal text-fluid-base text-[#666D80]">
              Processing Fee (3.2%)
            </span>
            <span className="font-manrope font-medium text-fluid-base text-[#173151]">
              ${processingFee.toFixed(2)}
            </span>
          </div>
        )}

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

        {/* Subscribe Info - Check for subscription items from backend or paymentMethod */}
        {(paymentMethod === 'subscribe' || (lineItems && lineItems.some(item => item.is_subscription))) && (
          <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-600 text-white">
                MONTHLY SUBSCRIPTION
              </span>
            </div>
            <p className="text-sm font-manrope text-purple-800 font-medium">
              Monthly Class Subscription
            </p>
            <div className="mt-2 space-y-1">
              {/* Use backend subscription data if available */}
              {lineItems && lineItems.some(item => item.is_subscription) ? (
                <>
                  {(() => {
                    // Calculate totals from subscription line items
                    const subscriptionItems = lineItems.filter(item => item.is_subscription && item.billing_model === 'monthly');
                    const monthlyTotal = subscriptionItems.reduce((sum, item) => sum + parseFloat(item.monthly_price || 0), 0);
                    const maxMonths = Math.max(...subscriptionItems.map(item => item.num_months || 0));
                    const latestEndDate = subscriptionItems
                      .filter(item => item.subscription_end_date)
                      .sort((a, b) => new Date(b.subscription_end_date) - new Date(a.subscription_end_date))[0]?.subscription_end_date;

                    const formattedEndDate = latestEndDate ? new Date(latestEndDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : null;

                    return (
                      <>
                        <p className="text-sm font-manrope text-purple-700">
                          <strong>${monthlyTotal.toFixed(2)}/month</strong> charged automatically
                        </p>
                        <p className="text-sm font-manrope text-purple-700">
                          💳 First payment today, then monthly
                        </p>
                        {formattedEndDate && (
                          <p className="text-sm font-manrope text-purple-700">
                            📅 Charges continue until: <strong>{formattedEndDate}</strong>
                          </p>
                        )}
                        {maxMonths > 0 && (
                          <p className="text-sm font-manrope text-purple-700">
                            📊 {maxMonths} payments totaling: <strong>${(monthlyTotal * maxMonths).toFixed(2)}</strong>
                          </p>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <>
                  <p className="text-sm font-manrope text-purple-700">
                    <strong>${total.toFixed(2)}/month</strong> charged automatically
                  </p>
                  {subscriptionInfo ? (
                    <>
                      <p className="text-sm font-manrope text-purple-700">
                        📅 Charges continue until: <strong>{subscriptionInfo.endDate}</strong>
                      </p>
                      <p className="text-sm font-manrope text-purple-700">
                        📊 Estimated {subscriptionInfo.months} payments totaling: <strong>${(total * subscriptionInfo.months).toFixed(2)}</strong>
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-manrope text-purple-700">
                      📅 Charges continue until class ends
                    </p>
                  )}
                </>
              )}
              <p className="text-xs font-manrope text-purple-600 mt-2 pt-2 border-t border-purple-200">
                Subscription auto-cancels when class ends - no action needed
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

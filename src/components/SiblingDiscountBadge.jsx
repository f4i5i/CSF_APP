import React, { useEffect, useState } from 'react';
import { Users, Tag } from 'lucide-react';
import discountsService from '../api/services/discounts.service';

const SiblingDiscountBadge = ({ childId, onDiscountCalculated }) => {
  const [discountInfo, setDiscountInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (childId) {
      checkDiscount();
    }
  }, [childId]);

  const checkDiscount = async () => {
    try {
      const data = await discountsService.checkSiblingDiscount(childId);
      setDiscountInfo(data);

      // Notify parent component of the discount
      if (onDiscountCalculated && data) {
        onDiscountCalculated(data);
      }
    } catch (error) {
      console.error('Failed to check sibling discount:', error);
      setError('Failed to load discount information');
    } finally {
      setLoading(false);
    }
  };

  // Don't show anything while loading
  if (loading) {
    return null;
  }

  // Don't show if there's an error or no eligibility
  if (error || !discountInfo?.eligible) {
    return null;
  }

  const ordinalSuffix = (num) => {
    const suffixes = { 2: 'nd', 3: 'rd', 4: 'th', 5: 'th', 6: 'th' };
    return suffixes[num] || 'th';
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 mb-4 font-manrope">
      <div className="flex items-start gap-3">
        <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
          <Users className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-semibold text-purple-900">
              Family Discount Applied!
            </h4>
            <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
              Auto-Applied
            </span>
          </div>
          <p className="text-sm text-purple-700">
            {discountInfo.discount_percentage}% off for {discountInfo.sibling_count}
            {ordinalSuffix(discountInfo.sibling_count)} child
          </p>
          <p className="text-xs text-purple-600 mt-1">
            You have {discountInfo.sibling_count} active enrollment{discountInfo.sibling_count !== 1 ? 's' : ''} in your family
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-purple-600">
            -{discountInfo.discount_percentage}%
          </p>
          <p className="text-xs text-purple-500">Sibling Savings</p>
        </div>
      </div>
    </div>
  );
};

export default SiblingDiscountBadge;

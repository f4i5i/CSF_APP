/**
 * CheckOut Page - Complete Checkout Flow
 * Integrates all checkout components for class enrollment with Stripe payment
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCheckoutFlow } from '../hooks/useCheckoutFlow';
import waiversService from '../api/services/waivers.service';

// Import all checkout components
import CheckoutLoading from '../components/checkout/CheckoutLoading';
import CheckoutError from '../components/checkout/CheckoutError';
import WaitlistFlow from '../components/checkout/WaitlistFlow';
import OrderConfirmation from '../components/checkout/OrderConfirmation';
import ClassDetailsSummary from '../components/checkout/ClassDetailsSummary';
import ChildSelector from '../components/checkout/ChildSelector';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import InstallmentPlanSelector from '../components/checkout/InstallmentPlanSelector';
import DiscountCodeInput from '../components/checkout/DiscountCodeInput';
import OrderSummary from '../components/checkout/OrderSummary';
import WaiverCheckModal from '../components/checkout/WaiverCheckModal';

export default function CheckOut() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const classId = searchParams.get('classId');

  // Get checkout state and methods from hook
  const {
    // State
    classData,
    children,
    selectedChildId,
    paymentMethod,
    selectedInstallmentPlan,
    appliedDiscount,
    orderTotal,
    clientSecret,
    hasCapacity,
    loading,
    error,
    orderData,
    enrollmentData,
    paymentSucceeded,

    // Methods
    initializeCheckout,
    selectChild,
    selectPaymentMethod,
    selectInstallmentPlan,
    applyDiscount,
    removeDiscount,
    handlePaymentSuccess,
    handlePaymentError,
    joinWaitlist,
    downloadReceipt,
    retry,
  } = useCheckoutFlow();

  // State for discount loading
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // State for waiver check
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [waiversChecked, setWaiversChecked] = useState(false);
  const [checkingWaivers, setCheckingWaivers] = useState(false);

  // Initialize checkout on mount
  useEffect(() => {
    if (!classId) {
      navigate('/classes');
      return;
    }

    console.log('🔄 useEffect triggered - calling initializeCheckout');
    initializeCheckout(classId);
  }, [classId, navigate, initializeCheckout]);

  // Check for pending waivers when child is selected
  const checkPendingWaivers = useCallback(async () => {
    if (!selectedChildId || !classData || waiversChecked) {
      return;
    }

    try {
      setCheckingWaivers(true);
      const response = await waiversService.getPending({
        program_id: classData?.program?.id || classData?.program_id,
        school_id: classData?.school?.id || classData?.school_id,
      });

      const pendingCount = response?.pending_count || 0;

      if (pendingCount > 0) {
        // Show waiver modal - blocks payment until signed
        setShowWaiverModal(true);
      } else {
        // No pending waivers, mark as checked
        setWaiversChecked(true);
      }
    } catch (error) {
      console.error('Failed to check pending waivers:', error);
      // Don't block checkout on error, but log it
      setWaiversChecked(true);
    } finally {
      setCheckingWaivers(false);
    }
  }, [selectedChildId, classData, waiversChecked]);

  // Run waiver check when child is selected
  useEffect(() => {
    checkPendingWaivers();
  }, [checkPendingWaivers]);

  // Handle waiver signing completion
  const handleWaiversSigned = () => {
    setWaiversChecked(true);
    setShowWaiverModal(false);
  };

  // Handle discount application
  const handleApplyDiscount = async (code) => {
    setIsApplyingDiscount(true);
    try {
      await applyDiscount(code);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // Show loading state
  if (loading) {
    return <CheckoutLoading />;
  }

  // Show error state
  if (error && !classData) {
    return (
      <CheckoutError
        error={error}
        onRetry={retry}
        onGoHome={() => navigate('/classes')}
      />
    );
  }

  // Show order confirmation after successful payment
  if (paymentSucceeded && orderData && enrollmentData) {
    return (
      <OrderConfirmation
        orderData={orderData}
        enrollmentData={enrollmentData}
        onDownloadReceipt={downloadReceipt}
      />
    );
  }

  // Show waitlist flow if class is full
  console.log('🚨 CheckOut render - hasCapacity value:', hasCapacity, 'Type:', typeof hasCapacity);
  console.log('🚨 CheckOut render - !hasCapacity evaluates to:', !hasCapacity);

  if (!hasCapacity) {
    console.log('❌ SHOWING WAITLIST FLOW because hasCapacity is:', hasCapacity);
    return (
      <WaitlistFlow
        classData={classData}
        childId={selectedChildId}
        onJoinWaitlist={joinWaitlist}
      />
    );
  }

  console.log('✅ SHOWING NORMAL CHECKOUT FLOW because hasCapacity is:', hasCapacity);

  // Calculate totals for OrderSummary
  const classPrice = classData?.price || 0;
  const registrationFee = 25; // Default registration fee
  const processingFeePercent = 2.9; // Default processing fee

  // Main checkout flow
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#173151] font-kollektif mb-2">
            Complete Your Enrollment
          </h1>
          <p className="text-fluid-base font-manrope text-[#666D80]">
            Just a few more steps to secure your child's spot
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Checkout Flow */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class Details */}
            <ClassDetailsSummary classData={classData} hasCapacity={hasCapacity} />

            {/* Child Selection */}
            <ChildSelector
              children={children}
              selectedId={selectedChildId}
              onSelect={selectChild}
              classData={classData}
            />

            {/* Waiver Check Notice (if checking) */}
            {selectedChildId && checkingWaivers && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-r-transparent"></div>
                  <p className="font-manrope text-sm text-blue-800">
                    Checking for required waivers...
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method Selection (only show after waivers checked) */}
            {selectedChildId && waiversChecked && (
              <PaymentMethodSelector
                selected={paymentMethod}
                onSelect={selectPaymentMethod}
                classPrice={classPrice}
                classData={classData}
              />
            )}

            {/* Installment Plan Selection (only if installments selected) */}
            {selectedChildId && paymentMethod === 'installments' && (
              <InstallmentPlanSelector
                orderTotal={orderTotal}
                selectedPlan={selectedInstallmentPlan}
                onSelect={selectInstallmentPlan}
              />
            )}

            {/* Discount Code Input */}
            {selectedChildId && paymentMethod && (
              <DiscountCodeInput
                onApply={handleApplyDiscount}
                onRemove={removeDiscount}
                appliedDiscount={appliedDiscount}
                isLoading={isApplyingDiscount}
              />
            )}

            {/* Proceed to Stripe Checkout Button */}
            {selectedChildId &&
              paymentMethod &&
              (paymentMethod !== 'installments' || selectedInstallmentPlan) &&
              clientSecret && (
                <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
                  <div className="text-center">
                    <h3 className="text-fluid-lg font-semibold font-manrope text-[#173151] mb-2">
                      Ready to Complete Payment
                    </h3>
                    <p className="text-sm font-manrope text-[#666D80] mb-6">
                      Review your order summary on the right, then proceed to secure Stripe checkout
                    </p>
                    <button
                      onClick={() => {
                        // Redirect to Stripe Checkout Session URL
                        window.location.href = clientSecret;
                      }}
                      className="w-full py-4 bg-[#F3BC48] hover:bg-[#e0a400] text-[#173151] font-manrope font-bold text-lg rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Proceed to Stripe Checkout
                    </button>
                    <p className="text-xs font-manrope text-[#666D80] mt-3">
                      🔒 You'll be securely redirected to Stripe to complete your payment
                    </p>
                  </div>
                </div>
              )}

            {/* Error Message (if any during checkout) */}
            {error && classData && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-manrope text-sm text-red-800">
                  <strong>Error:</strong> {error.message || error}
                </p>
                <button
                  onClick={retry}
                  className="mt-2 text-sm font-manrope font-semibold text-red-600 hover:text-red-700 underline"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <OrderSummary
                classPrice={classPrice}
                registrationFee={registrationFee}
                processingFeePercent={processingFeePercent}
                discount={appliedDiscount}
                paymentMethod={paymentMethod}
                installmentPlan={selectedInstallmentPlan}
              />

              {/* Help Text */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs font-manrope text-blue-800">
                  <strong>Need Help?</strong>
                </p>
                <p className="text-xs font-manrope text-blue-700 mt-1">
                  Contact us at{' '}
                  <a
                    href="mailto:support@csfacademy.com"
                    className="underline font-semibold"
                  >
                    support@csfacademy.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator (Optional) */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <div
              className={`h-2 flex-1 rounded-full ${
                selectedChildId ? 'bg-[#F3BC48]' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 flex-1 rounded-full ${
                paymentMethod ? 'bg-[#F3BC48]' : 'bg-gray-300'
              }`}
            ></div>
            <div
              className={`h-2 flex-1 rounded-full ${
                clientSecret ? 'bg-[#F3BC48]' : 'bg-gray-300'
              }`}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs font-manrope text-[#666D80]">
            <span>Select Child</span>
            <span>Payment Method</span>
            <span>Complete Payment</span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 text-center">
          <p className="text-xs font-manrope text-[#666D80]">
            🔒 Secured by Stripe | Your payment information is encrypted and secure
          </p>
        </div>
      </div>

      {/* Waiver Check Modal */}
      {showWaiverModal && classData && (
        <WaiverCheckModal
          classData={classData}
          onClose={() => setShowWaiverModal(false)}
          onWaiversSigned={handleWaiversSigned}
        />
      )}
    </div>
  );
}

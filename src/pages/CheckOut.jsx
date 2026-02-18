/**
 * CheckOut Page - Complete Checkout Flow
 * Integrates all checkout components for class enrollment with Stripe payment
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCheckoutFlow } from '../hooks/useCheckoutFlow';
import waiversService from '../api/services/waivers.service';
import { ArrowLeft, Home, CheckCircle } from 'lucide-react';

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
import CustomFeesSelector from '../components/checkout/CustomFeesSelector';
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
    selectedChildIds, // NEW: Multi-select support
    paymentMethod,
    selectedInstallmentPlan,
    appliedDiscount,
    orderTotal,
    orderId, // Track if order is created
    clientSecret,
    hasCapacity,
    loading,
    isLoading, // Loading state for order creation
    error,
    orderData,
    enrollmentData,
    paymentSucceeded,
    siblingDiscountPreview, // NEW: Sibling discount line items
    backendProcessingFee, // Processing fee from backend order
    selectedFeesByChild, // Custom fee selections per child

    // Methods
    initializeCheckout,
    selectChild,
    toggleChildSelection, // NEW: Multi-select toggle
    toggleCustomFee, // Custom fee toggle
    selectPaymentMethod,
    selectInstallmentPlan,
    applyDiscount,
    removeDiscount,
    createOrder, // NEW: Manual order creation
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
  const [pendingWaiversData, setPendingWaiversData] = useState(null);

  // Track if waiver check has been done for current child
  const waiverCheckDoneForChild = React.useRef(null);

  // Initialize checkout on mount
  useEffect(() => {
    if (!classId) {
      navigate('/classes');
      return;
    }

    initializeCheckout(classId);
  }, [classId, navigate, initializeCheckout]);

  // Reset waiver state when child changes
  useEffect(() => {
    if (selectedChildId !== waiverCheckDoneForChild.current) {
      setWaiversChecked(false);
      setPendingWaiversData(null);
      waiverCheckDoneForChild.current = null;
    }
  }, [selectedChildId]);

  // Check for pending waivers when child is selected (only once per child)
  useEffect(() => {
    // Skip if no child selected, no class data, already checked for this child, or already checking
    if (!selectedChildId || !classData || waiverCheckDoneForChild.current === selectedChildId || checkingWaivers) {
      return;
    }

    const checkWaivers = async () => {
      try {
        setCheckingWaivers(true);
        const response = await waiversService.getPending({
          program_id: classData?.program?.id || classData?.program_id,
          school_id: classData?.school?.id || classData?.school_id,
        });

        const pendingCount = response?.pending_count || 0;

        // Mark this child as checked
        waiverCheckDoneForChild.current = selectedChildId;

        if (pendingCount > 0) {
          // Store waiver data and show modal
          setPendingWaiversData(response);
          setShowWaiverModal(true);
        } else {
          // No pending waivers, mark as checked immediately
          setWaiversChecked(true);
        }
      } catch (error) {
        console.error('Failed to check pending waivers:', error);
        // Mark as checked to not block checkout on error
        waiverCheckDoneForChild.current = selectedChildId;
        setWaiversChecked(true);
      } finally {
        setCheckingWaivers(false);
      }
    };

    checkWaivers();
  }, [selectedChildId, classData, checkingWaivers]);

  // Handle waiver signing completion - immediate state update
  const handleWaiversSigned = useCallback(() => {
    setWaiversChecked(true);
    setShowWaiverModal(false);
    setPendingWaiversData(null);
  }, []);

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
  if (!hasCapacity) {
    return (
      <WaitlistFlow
        classData={classData}
        childId={selectedChildId}
        onJoinWaitlist={joinWaitlist}
      />
    );
  }

  // Show success for free enrollment (backend already activated enrollments)
  if (clientSecret === 'FREE' || (paymentSucceeded && !orderData)) {
    return (
      <div className="min-h-screen w-full bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] py-8">
        <div className="max-w-lg mx-auto px-4 text-center pt-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-white/20">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#173151] font-kollektif mb-2">
              Enrollment Confirmed!
            </h1>
            <p className="text-[#666D80] font-manrope mb-2">
              {classData?.name && (
                <span className="block font-semibold text-[#173151] mb-1">{classData.name}</span>
              )}
              Your child has been successfully enrolled in this free class.
            </p>
            <p className="text-sm text-[#666D80] font-manrope mb-6">
              A confirmation email has been sent to your email address.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-[#173151] hover:bg-[#0f2240] text-white font-manrope font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals for OrderSummary
  const classPrice = classData?.price || 0;
  const registrationFee = 25; // Default registration fee
  const processingFeePercent = 2.9; // Default processing fee

  // Check if class is effectively free (no price + no required custom fees)
  const requiredFeesTotal = (classData?.custom_fees || [])
    .filter(f => !f.is_optional)
    .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
  const isFreeClass = Number(classPrice) === 0 && requiredFeesTotal === 0;

  // Check if at least one child is selected (support both single and multi-select)
  const hasChildSelected = (selectedChildIds?.length > 0) || selectedChildId;

  // Main checkout flow
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-[#173151] hover:bg-white/50 rounded-lg transition-colors font-manrope font-medium"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white/80 text-[#173151] rounded-lg transition-colors font-manrope font-medium border border-gray-200"
          >
            <Home size={20} />
            <span className="hidden sm:inline">Go to Dashboard</span>
          </button>
        </div>

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

            {/* Child Selection - Multi-select with Sibling Discount */}
            <ChildSelector
              children={children}
              selectedId={selectedChildId}
              selectedIds={selectedChildIds || []}
              onSelect={selectChild}
              onToggle={toggleChildSelection}
              classData={classData}
              multiSelect={children?.length > 1} // Enable multi-select when multiple children
            />

            {/* Waiver Check Notice (if checking) */}
            {hasChildSelected && checkingWaivers && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-r-transparent"></div>
                  <p className="font-manrope text-sm text-blue-800">
                    Checking for required waivers...
                  </p>
                </div>
              </div>
            )}

            {/* Custom Fees Selection (only show after waivers checked) */}
            {hasChildSelected && waiversChecked && classData?.custom_fees?.length > 0 && (
              <CustomFeesSelector
                classData={classData}
                selectedChildIds={selectedChildIds || (selectedChildId ? [selectedChildId] : [])}
                children={children}
                selectedFeesByChild={selectedFeesByChild}
                onToggleFee={toggleCustomFee}
              />
            )}

            {/* Payment Method Selection (only show after waivers checked, hide for free classes) */}
            {hasChildSelected && waiversChecked && !isFreeClass && (
              <PaymentMethodSelector
                selected={paymentMethod}
                onSelect={selectPaymentMethod}
                classPrice={classPrice}
                classData={classData}
              />
            )}

            {/* Installment Plan Selection (only if installments selected) */}
            {hasChildSelected && paymentMethod === 'installments' && !isFreeClass && (
              <InstallmentPlanSelector
                orderTotal={orderTotal}
                selectedPlan={selectedInstallmentPlan}
                onSelect={selectInstallmentPlan}
              />
            )}

            {/* Discount Code Input (hide for free classes) */}
            {hasChildSelected && paymentMethod && !isFreeClass && (
              <DiscountCodeInput
                onApply={handleApplyDiscount}
                onRemove={removeDiscount}
                appliedDiscount={appliedDiscount}
                isLoading={isApplyingDiscount}
              />
            )}

            {/* Review Order / Free Enrollment Button - Shows before order is created */}
            {hasChildSelected &&
              waiversChecked &&
              (isFreeClass || (paymentMethod && (paymentMethod !== 'installments' || selectedInstallmentPlan))) &&
              !orderId &&
              !isLoading && (
                <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
                  <div className="text-center">
                    <h3 className="text-fluid-lg font-semibold font-manrope text-[#173151] mb-2">
                      {isFreeClass ? 'Ready to Enroll?' : 'Ready to Review Your Order?'}
                    </h3>
                    <p className="text-sm font-manrope text-[#666D80] mb-6">
                      You've selected {selectedChildIds?.length || 1} child{(selectedChildIds?.length || 1) > 1 ? 'ren' : ''} for enrollment.
                      {isFreeClass
                        ? ' This is a free class — no payment required!'
                        : ' Click below to calculate your total with any applicable discounts.'}
                    </p>
                    <button
                      onClick={createOrder}
                      className={`w-full py-4 font-manrope font-bold text-lg rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        isFreeClass
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-[#173151] hover:bg-[#0f2240] text-white'
                      }`}
                    >
                      {isFreeClass ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Complete Free Enrollment
                        </>
                      ) : (
                        <>
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
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                          </svg>
                          Review Order & Calculate Total
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            {/* Loading State while creating order */}
            {isLoading && !clientSecret && (
              <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#F3BC48] border-r-transparent"></div>
                    <span className="font-manrope font-medium text-[#173151]">
                      Preparing your order...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Proceed to Stripe Checkout Button - Shows after order is created */}
            {hasChildSelected &&
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
                registrationFee={0}
                processingFeePercent={3.2}
                discount={appliedDiscount}
                paymentMethod={paymentMethod}
                installmentPlan={selectedInstallmentPlan}
                childCount={selectedChildIds?.length || (selectedChildId ? 1 : 0)}
                children={selectedChildIds?.length > 0
                  ? selectedChildIds.map(id => children.find(c => c.id === id)).filter(Boolean)
                  : selectedChildId
                    ? [children.find(c => c.id === selectedChildId)].filter(Boolean)
                    : []
                }
                lineItems={siblingDiscountPreview}
                classData={classData}
                backendTotal={orderTotal}
                backendProcessingFee={backendProcessingFee}
                customFees={classData?.custom_fees || []}
                selectedFeesByChild={selectedFeesByChild}
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
          initialWaiversData={pendingWaiversData}
        />
      )}
    </div>
  );
}

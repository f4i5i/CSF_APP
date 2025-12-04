import React from "react";

const BillingInfo = () => {
  return (
    <div className="border rounded-xl p-5">
         <h2 className="font-semibold text-lg">Billing period</h2>
          
      <p className="text-sm text-gray-500 mb-2">
        Next billing on <strong>Oct 18, 2025</strong>
      </p>

      <div className="border rounded-xl ">
        <div className="border-b border-gray-100 p-4">
        <p className="text-sm font-medium">Membership</p>
        <p className="text-2xl font-semibold mt-1">$79 <span className="text-sm">/ month</span></p>
        <p className="text-xs text-gray-500 mt-1">Your active subscription plan</p>
</div>
        <button className="text-red-500   p-4 text-sm">
          Cancel Plan
        </button>
      </div>
    </div>
  );
};

export default BillingInfo;

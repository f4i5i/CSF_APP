import React from "react";

const PaymentCard = () => {
  return (
    <div className="w-full border rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <input type="checkbox" className="accent-blue-500" />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
          alt="card"
          className="w-10"
        />
        <p className="text-sm font-medium">•••• •••• •••• 1212</p>
        <span className="text-xs text-gray-500">Expiry 10/29</span>
      </div>

      <button className="text-xl">⋯</button>
    </div>
  );
};

export default PaymentCard;

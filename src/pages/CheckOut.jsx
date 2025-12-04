import React from "react";
import Logo from "../components/Logo";

export default function Checkout() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center overflow-hidden relative">

      {/* Dotted Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>

      {/* CSF School Academy - Top Center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <h1 className="text-[62px] font-bold text-[#173151] font-kollektif drop-shadow-lg">CSF School Academy</h1>
      </div>

      <div className='relative justify-center items-center w-full max-w-4xl px-4 mt-32'>
        {/* CHECKOUT CARD */}
        <div className="bg-white shadow-2xl rounded-3xl px-8 py-6 w-full">
          {/* Logo and Title Section */}
          <div className="relative flex items-center mb-6">
            {/* Logo - Left Side */}
            <div className="flex w-[128px] h-[124px] items-center max-sm:flex max-sm:justify-center max-sm:items-center">
              <Logo />
            </div>

            {/* Title - Centered */}
            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <h2 className="text-2xl font-semibold text-[#0f172a]">Checkout</h2>
              <p className="text-gray-500 mt-1">Complete your registration</p>
            </div>
          </div>

        {/* Checkout Summary Box */}
        <div className="border border-gray-300 rounded-xl p-5 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#173151]">Class Details</h3>

          <div className="space-y-2">
            <p className="text-gray-700"><span className="font-semibold">Class name:</span> Example Class</p>
            <p className="text-gray-700"><span className="font-semibold">Day & Time:</span> Monday - 5:00 PM</p>
            <p className="text-gray-700"><span className="font-semibold">Price:</span> $120</p>
          </div>

        </div>

        {/* Order Overview */}
        <h3 className="text-lg font-semibold mb-4 text-[#173151]">Order Overview</h3>

        <div className="space-y-6">
          {/* Item row */}
          <div className="flex justify-between">
            <div>
              <p className="font-medium">Class Name</p>
              <p className="text-gray-500 text-sm">Child registered</p>
            </div>
            <p className="font-medium">$120</p>
          </div>

          {/* Registration fee */}
          <div className="flex justify-between">
            <p className="font-medium">Registration Fee</p>
            <p className="font-medium">$25</p>
          </div>

          {/* Credit card fee */}
          <div className="flex justify-between">
            <p className="font-medium">Credit Card Fee</p>
            <p className="font-medium">$3</p>
          </div>

          {/* Discounts */}
          <div className="flex justify-between">
            <p className="font-medium">Discounts</p>
            <p className="font-medium">-$10</p>
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-semibold">
            <p>Total</p>
            <p>$138</p>
          </div>

          <button className="w-full bg-[#173151] text-white py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-[#1f3d67] transition">
            Complete Checkout
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

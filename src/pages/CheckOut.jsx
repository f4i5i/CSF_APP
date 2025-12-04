import React from "react";
import Logo from "../components/Logo";

export default function Checkout() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center overflow-y-auto relative py-8 sm:py-0">

      {/* Dotted Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#a1acc7_1px,transparent_1px)] [background-size:18px_18px] opacity-70"></div>

      {/* CSF School Academy - Top Center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-bold text-[#173151] font-kollektif drop-shadow-lg">CSF School Academy</h1>
      </div>

      <div className='relative justify-center items-center w-full max-w-md sm:max-w-2xl md:max-w-4xl px-4 sm:px-6 mt-20 sm:mt-24 md:mt-32'>
        {/* CHECKOUT CARD */}
        <div className="bg-white shadow-2xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 w-full">
          {/* Logo and Title Section */}
          <div className="relative flex items-center mb-6">
            {/* Logo - Left Side */}
            <div className="flex w-16 h-16 sm:w-24 sm:h-24 md:w-[128px] md:h-[124px] items-center justify-center">
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

          <button className="w-full bg-[#173151] text-white py-2 sm:py-3 rounded-xl text-base sm:text-lg font-semibold shadow-md hover:bg-[#1f3d67] transition">
            Complete Checkout
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

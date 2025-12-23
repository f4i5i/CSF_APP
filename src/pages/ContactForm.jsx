import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ContactForm() {
  return (
    // <div className="min-h-screen bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] flex flex-col items-center justify-between px-4">
    <div className="min-h-full flex flex-col justify-between bg-page-gradient">
  
  <Header/>
      {/* PAGE HEADER */}
      <main className="w-full px-5 sm:px-0 my-4 ">
      <h2 className="font-kollektif text-fluid-2xl font-normal text-[#173151] text-center">Get in touch</h2>
      <p className="text-[#0A0A0A] font-manrope text-center mt-2">
        Have a question? We'd love to hear from you.
      </p>

      {/* Form Card */}
      <div className="bg-badge-bg backdrop-blur-md w-full mx-auto max-w-3xl rounded-[30px] mt-6 p-5 sm:p-8 shadow-lg">
        
        {/* Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            className="w-full p-3 text-[16px] rounded-[20px]  placeholder:text-placeholder-color bg-[#f7f8f8] border-gray-100 outline-none"
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full p-3 text-[16px] rounded-[20px]  placeholder:text-placeholder-color bg-[#f7f8f8] border-gray-100 outline-none"
          />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Enter your e-mail"
          className="w-full p-3 text-[16px] rounded-[20px]  placeholder:text-placeholder-color bg-[#f7f8f8] border-gray-100 mt-2 outline-none"
        />

        {/* Message */}
        <textarea
          placeholder="Enter your message"
          className="w-full p-3 text-[16px] rounded-[20px]  placeholder:text-placeholder-color bg-[#f7f8f8] border-gray-100 mt-2 h-32 outline-none"
        ></textarea>

        {/* Button */}
        <button className="w-full bg-[#F3BC48] text-[#0D0D12] font-semibold py-3 rounded-full mt-2 hover:opacity-90 transition">
          Send Message
        </button>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 mx-auto sm:grid-cols-3 gap-4 mt-4 sm:mt-6 w-full max-w-3xl mb-10 sm:mb-0 ">
        
        {/* Phone */}
        <div className="bg-badge-bg rounded-[30px] p-6 text-center shadow-md">
          <h4 className="font-semibold text-[16px] text-nuetral-100">Phone</h4>
          <p className="text-[#3B3B3B] text-[16px] mt-1">00 445 000 2234</p>
        </div>

        {/* Email */}
        <div className="bg-badge-bg rounded-[30px] p-6 text-center shadow-md">
          <h4 className="font-semibold text-[16px] text-nuetral-100">Email</h4>
          <p className="text-[#3B3B3B] text-[16px] mt-1">company@gmail.com</p>
        </div>

        {/* Location */}
        <div className="bg-badge-bg rounded-[30px] p-6 text-center shadow-md">
          <h4 className="font-semibold text-[16px] text-nuetral-100">Location</h4>
          <p className="text-[#3B3B3B] text-[16px] mt-1">6391 Elgin St. Celina, USA</p>
        </div>

      </div>
</main>
<Footer isFixed={false} />
    </div>
  );
}

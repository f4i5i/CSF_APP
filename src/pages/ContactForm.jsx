import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ContactForm() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] flex flex-col items-center justify-between px-4">
  
  <Header/>
      {/* PAGE HEADER */}
      <main className="w-full ">
      <h2 className="text-3xl font-bold text-[#1D3557] text-center">Get in touch</h2>
      <p className="text-gray-600 text-center mt-2">
        Have a question? We'd love to hear from you.
      </p>

      {/* Form Card */}
      <div className="bg-white/80 backdrop-blur-md w-full mx-auto max-w-3xl rounded-3xl mt-6 p-6 shadow-lg">
        
        {/* Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            className="w-full p-3 rounded-xl border border-gray-300 outline-none"
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full p-3 rounded-xl border border-gray-300 outline-none"
          />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Enter your e-mail"
          className="w-full p-3 rounded-xl border border-gray-300 mt-4 outline-none"
        />

        {/* Message */}
        <textarea
          placeholder="Enter your message"
          className="w-full p-3 rounded-xl border border-gray-300 mt-4 h-32 outline-none"
        ></textarea>

        {/* Button */}
        <button className="w-full bg-[#F3BC48] text-[#1D3557] font-semibold py-3 rounded-full mt-6 hover:opacity-90 transition">
          Send Message
        </button>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 mx-auto sm:grid-cols-3 gap-4 mt-8 w-full max-w-4xl">
        
        {/* Phone */}
        <div className="bg-white/70 rounded-2xl p-6 text-center shadow-md">
          <h4 className="font-semibold text-[#1D3557]">Phone</h4>
          <p className="text-gray-600 mt-1">00 445 000 2234</p>
        </div>

        {/* Email */}
        <div className="bg-white/70 rounded-2xl p-6 text-center shadow-md">
          <h4 className="font-semibold text-[#1D3557]">Email</h4>
          <p className="text-gray-600 mt-1">company@gmail.com</p>
        </div>

        {/* Location */}
        <div className="bg-white/70 rounded-2xl p-6 text-center shadow-md">
          <h4 className="font-semibold text-[#1D3557]">Location</h4>
          <p className="text-gray-600 mt-1">6391 Elgin St. Celina, USA</p>
        </div>

      </div>
</main>
<Footer/>
    </div>
  );
}

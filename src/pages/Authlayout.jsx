import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
     <div className="min-h-screen w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-80">
 
  
      {/* MAIN CONTENT */}
      <div className="flex-1 flex justify-center items-center px-4 overflow-hidden">
        <Outlet />
      </div>

      {/* FOOTER */}
      <footer className="w-full py-2 bg-transparent">
        <div className="w-full flex flex-row max-sm:flex max-sm:flex-col-reverse max-sm:gap-2 items-center justify-between px-4 sm:px-10 text-[#000] text-xs sm:text-sm">

          <p className="text-center text-[#000] sm:text-left font-['inter'] font-normal text-sm mb-2 sm:mb-0">
            © 2025 Carolina Soccer Factory. All rights reserved.
          </p>

          <div className="flex gap-5">
           <a href="#" className="flex font-['inter'] font-normal text-sm text-black items-center gap-1 hover:underline"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"> <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect> <path d="M7 11V7a5 5 0 0 1 10 0v4"></path> </svg> Privacy </a>
           <a href="#" className="flex font-['inter'] font-normal text-sm text-black items-center gap-1 hover:underline"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="9"></circle> <path d="M9.1 9a3 3 0 1 1 4.8 2.2c-.7.5-1.2 1.1-1.2 1.8v1"></path> <line x1="12" y1="17" x2="12" y2="17"></line> </svg> Get help </a>
          </div>

        </div>
      </footer>
    </div>
  );
}

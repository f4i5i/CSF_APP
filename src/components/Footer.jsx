import React from 'react'

const Footer = ({ isFixed = true , mobileHidden=false }) => {
  return (
     <footer className={`${isFixed ? "fixed bottom-0 left-0 right-0" : "relative"} ${mobileHidden ? "max-sm:hidden":"max-sm:block"} w-full sm:py-4 pt-4 transparent bg-[#bdc7d4] backdrop-blur-sm `}>
        <div className="w-full flex flex-row max-sm:flex  max-sm:flex-col-reverse max-sm:gap-2 items-center justify-between px-6 text-gray-600 text-xs sm:text-sm">

          <p className="text-center sm:text-left font-['inter']  text-black text-sm mb-2 sm:mb-0">
            © 2025 Carolina Soccer Factory. All rights reserved.
          </p>

          <div className="flex gap-5">
           <button type="button" className="flex font-['inter']  text-sm text-black items-center gap-1 hover:underline"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"> <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect> <path d="M7 11V7a5 5 0 0 1 10 0v4"></path> </svg> Privacy </button>
           <button type="button" className="flex font-['inter']  text-sm text-black items-center gap-1 hover:underline"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="9"></circle> <path d="M9.1 9a3 3 0 1 1 4.8 2.2c-.7.5-1.2 1.1-1.2 1.8v1"></path> <line x1="12" y1="17" x2="12" y2="17"></line> </svg> Get help </button>
          </div>

        </div>
      </footer>
  )
}

export default Footer
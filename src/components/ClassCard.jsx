export default function ClassCard({ cls, onClick, onRegister }) {
  return (

<div
  className="bg-[#FFFFFF50] shadow rounded-lg sm:rounded-xl overflow-hidden hover:shadow-lg transition p-3 sm:p-4 cursor-pointer"
  onClick={onClick}
>
          {/* Top row - Logo and Register button */}
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            {/* Logo/Image placeholder */}
            <div className="border-2 border-gray-400 rounded-lg w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center bg-gray-50">
              <img
        src={cls.image}
        className="w-full h-full object-cover rounded-md"
      />  </div>

            {/* Register button */}
            <div
              className="border-1 border-[#F3BC48] flex justify-center items-center rounded-lg px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-[#F3BC48] cursor-pointer transition"
              onClick={(e) => {
                e.stopPropagation();
                onRegister?.();
              }}
            >
              <span className="text-[#0D0D12] text-sm sm:text-base font-semibold">Register</span>
            </div>
          </div>

          {/* Center - Name of class (big) */}
          <div className="rounded-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 flex items-center justify-center">
            <span className="text-[#173151] text-lg sm:text-xl md:text-2xl font-semibold text-center">{cls.title}</span>
          </div>

          {/* Bottom row - Day/Time and Start/End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Day and time */}
            <div className="rounded-lg p-3 sm:p-4 md:p-6 flex items-center justify-center">
              <span className="text-sm sm:text-base text-gray-800 text-center">{cls.time}</span>
            </div>

            {/* Start + end date */}
            <div className="rounded-lg p-3 sm:p-4 md:p-6 flex items-center justify-center">
              <span className="text-sm sm:text-base text-gray-800 text-center">{cls.dates}</span>
            </div>
          </div>
        </div>
      
         
  
  );
}

export default function ClassCard({ cls, onClick, onRegister }) {
  return (

<div
  className="bg-[#FFFFFF50] shadow rounded-xl overflow-hidden hover:shadow-lg transition p-4 cursor-pointer"
  onClick={onClick}
>
          {/* Top row - Logo and Register button */}
          <div className="flex justify-between items-start mb-6">
            {/* Logo/Image placeholder */}
            <div className="border-2  border-gray-400 rounded-lg w-24 h-24 flex items-center justify-center bg-gray-50">
              <img
        src={cls.image}
        className="w-full h-full object-cover rounded-md"
      />  </div>
            
            {/* Register button */}
            <div
              className="border-2 border-blue-400 rounded-lg px-8 py-3 bg-blue-50 cursor-pointer hover:bg-blue-100 transition"
              onClick={(e) => {
                e.stopPropagation();
                onRegister?.();
              }}
            >
              <span className="text-blue-600 font-semibold">Register</span>
            </div>
          </div>

          {/* Center - Name of class (big) */}
          <div className="rounded-lg p-8 mb-6 flex items-center justify-center ">
            <span className="text-[#173151] text-2xl font-semibold">{cls.title}</span>
          </div>

          {/* Bottom row - Day/Time and Start/End Date */}
          <div className="grid grid-cols-2 gap-6">
            {/* Day and time */}
            <div className=" rounded-lg p-6 flex items-center justify-center ">
              <span className="text-gray-800">{cls.time}</span>
            </div>
            
            {/* Start + end date */}
            <div className=" rounded-lg p-6 flex items-center justify-center ">
              <span className="text-gray-800">{cls.dates}</span>
            </div>
          </div>
        </div>
      
         
  
  );
}

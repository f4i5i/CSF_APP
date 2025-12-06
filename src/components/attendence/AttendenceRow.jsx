import React from "react";

export default function AttendanceRow({ date, status }) {
  const isPresent = status === "Present";

  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3 shadow-sm">
      <div
        className={`w-[73px] h-[67px] max-xxl:w-[50px] max-xxl:h-[44px] rounded-[20px] flex items-center justify-center 
        ${isPresent ? "bg-[#DEF9CD] text-[#32AE60]" : "bg-[#FFE2E2] text-[#E7000B]"}`}
      >
        {isPresent ? "✔" : "✘"}
      </div>

      <div className="flex flex-col">
        <p className="font-manrope font-semibold text-[16px] text-[#0f1d2e] max-xxl1:text-sm xxl1:text-xl">{date}</p>
        <p className="text-sm text-[#0f1d2e] max-xl:text-xs max-xxl1:text-base">{status}</p>
      </div>
    </div>
  );
}

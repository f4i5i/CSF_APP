import React from "react";

export default function AttendanceRow({ date, status }) {
  const isPresent = status === "Present";

  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3 shadow-sm">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center 
        ${isPresent ? "bg-green-200 text-green-700" : "bg-red-200 text-red-600"}`}
      >
        {isPresent ? "✔" : "✘"}
      </div>

      <div className="flex flex-col">
        <p className="font-manrope font-medium text-[16px] xxl1:text-xl">{date}</p>
        <p className="text-sm text-gray-500 xxl1:text-base">{status}</p>
      </div>
    </div>
  );
}

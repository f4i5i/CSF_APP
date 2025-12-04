import { X } from "lucide-react";

export default function Attachment({ file }) {
  return (
    <div className="flex items-center gap-2 bg-white/50 px-4 py-2.5 rounded-full max-sm:text-xs">
      {/* Certificate icon with yellow background */}
      <div className="bg-[#F9EFCD] rounded-full p-2 flex items-center justify-center">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.5 8.33333V5C17.5 4.08 16.75 3.33333 15.8333 3.33333H4.16667C3.25 3.33333 2.5 4.08 2.5 5V15C2.5 15.92 3.25 16.6667 4.16667 16.6667H10"
            stroke="#FFC205"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.1667 18.3333L15.8333 16.6667L17.5 18.3333"
            stroke="#FFC205"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.8333 13.3333V16.6667"
            stroke="#FFC205"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <span className="font-manrope font-bold text-sm text-black opacity-70 max-sm:text-xs">
        {file.name || file}
      </span>

      <X size={12} className="text-[#8796AF] cursor-pointer" />
    </div>
  );
}

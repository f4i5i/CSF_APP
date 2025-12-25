import { Check, FileText } from "lucide-react";
import { useState } from "react";
import StudentDetailsModal from "./StudentDetailsModal";

const StudentCard = ({ student,onOpenModal }) => {
     const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between bg-[#FFFFFF33] border border-[#FFFFFF33] rounded-[14px] px-4 py-3 lg:p-5 shadow-sm cursor-pointer" onClick={() => onOpenModal(student)}>
      <div className="flex items-center gap-4">
        {/* Check Status */}
        <div
          className={`w-10 h-10 xl:w-12 xl:h-12 rounded-full flex items-center justify-center 
            ${student.checked ? "bg-green-500 text-white" : "border border-[#C9CBD3]"}`}
        >
          {student.checked && <Check size={14} />}
        </div>

        {/* Avatar */}
        <img
          src={student.img}
          alt={student.name}
          className="w-10 h-10 xl:w-12 xl:h-12 rounded-full object-cover"
        />

        {/* Name + Grade */}
        <div>
          <p className="font-semibold text-xl max-xxl:text-lg max-xl:text-base max-sm:text-base text-[#0F1D2E] font-manrope">{student.name}</p>
          <p className="text-sm max-sm:text-xs max-xxl:text-xs  font-manrope font-medium opacity-50 text-[#000]">Grade {student.grade}</p>
        </div>
      </div>

      {/* Notes Icon */}
      <div className="text-gray-500 cursor-pointer" onClick={() => onOpenModal(student)}>
        <FileText size={24} className="text-[#0A0A0A]" />
      </div>
  </div>
  );
};

export default StudentCard;

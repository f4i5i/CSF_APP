import { Check, FileText } from "lucide-react";

const StudentCard = ({ student, onOpenModal, onCheckIn, checkingIn }) => {
  // Generate initials for fallback avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const handleCheckInClick = (e) => {
    e.stopPropagation(); // Prevent opening modal
    if (onCheckIn && !checkingIn) {
      onCheckIn(student);
    }
  };

  const handleCardClick = () => {
    if (onOpenModal) {
      onOpenModal(student);
    }
  };

  return (
    <div
      className="flex items-center justify-between bg-[#FFFFFF33] border border-[#FFFFFF33] rounded-[14px] px-4 py-3 lg:p-5 shadow-sm cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4">
        {/* Check Status */}
        <div
          onClick={handleCheckInClick}
          className={`w-10 h-10 xl:w-12 xl:h-12 rounded-full flex items-center justify-center transition-colors
            ${student.checked
              ? "bg-green-500 text-white hover:bg-green-600"
              : "border border-[#C9CBD3] hover:bg-gray-100"
            }
            ${checkingIn ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          `}
        >
          {student.checked && <Check size={14} />}
        </div>

        {/* Avatar */}
        {student.img ? (
          <img
            src={student.img}
            alt={student.name}
            className="w-10 h-10 xl:w-12 xl:h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(student.name)}
          </div>
        )}

        {/* Name + Grade */}
        <div>
          <p className="font-semibold text-xl max-xxl:text-lg max-xl:text-base max-sm:text-base text-[#0F1D2E] font-manrope">
            {student.name}
          </p>
          <p className="text-sm max-sm:text-xs max-xxl:text-xs font-manrope font-medium opacity-50 text-[#000]">
            {student.grade !== '-' ? `Grade ${student.grade}` : 'Grade N/A'}
          </p>
        </div>
      </div>

      {/* Notes Icon */}
      <div className="text-gray-500 cursor-pointer" onClick={handleCardClick}>
        <FileText size={24} className="text-[#0A0A0A]" />
      </div>
    </div>
  );
};

export default StudentCard;

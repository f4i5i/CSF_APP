import { Check, FileText, HeartPulse, Phone, X } from "lucide-react";
import { useState } from "react";
import { formatGrade } from "../../utils/format";

const StudentCard = ({ student, onOpenModal, onCheckIn, checkingIn }) => {
  const [medicalOpen, setMedicalOpen] = useState(false);

  // Generate initials for fallback avatar
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
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

  const parentPhone = student.parent?.phone;
  // Show the medical alert when flagged, or whenever we have medical text to show.
  const hasMedicalAlert =
    student.hasMedicalAlert || Boolean(student.medical_info);

  const openMedical = (e) => {
    e.stopPropagation(); // Don't trigger check-in or details modal
    setMedicalOpen(true);
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
            ${
              student.checked
                ? "bg-green-500 text-white hover:bg-green-600"
                : student.wasUnchecked
                  ? "bg-red-400 text-white hover:bg-red-500"
                  : "border border-[#C9CBD3] hover:bg-gray-100"
            }
            ${checkingIn ? "opacity-50 cursor-wait" : "cursor-pointer"}
          `}
        >
          {student.checked ? (
            <Check size={14} />
          ) : student.wasUnchecked ? (
            <X size={14} />
          ) : null}
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
          <div className="flex items-center gap-2">
            <p className="font-semibold text-xl max-xxl:text-lg max-xl:text-base max-sm:text-base text-[#0F1D2E] font-manrope">
              {student.name}
            </p>
            {student.groupNumber != null && (
              <span className="shrink-0 rounded-full bg-[#1D3557] px-2 py-0.5 text-xs font-semibold text-white font-manrope">
                Group {student.groupNumber}
              </span>
            )}
          </div>
          <p className="text-sm max-sm:text-xs max-xxl:text-xs font-manrope font-medium opacity-50 text-[#000]">
            {student.grade !== "-"
              ? `Grade ${formatGrade(student.grade)}`
              : "Grade N/A"}
          </p>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-3">
        {/* Medical alert */}
        {hasMedicalAlert && (
          <button
            type="button"
            onClick={openMedical}
            title="Medical alert"
            aria-label="View medical alert"
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <HeartPulse size={24} />
          </button>
        )}

        {/* Call parent */}
        {parentPhone && (
          <a
            href={`tel:${parentPhone}`}
            onClick={(e) => e.stopPropagation()}
            title={`Call parent: ${parentPhone}`}
            aria-label="Call parent"
            className="text-[#1D3557] hover:text-[#152942] transition-colors"
          >
            <Phone size={22} />
          </a>
        )}

        {/* Notes Icon */}
        <div className="text-gray-500 cursor-pointer" onClick={handleCardClick}>
          <FileText size={24} className="text-[#0A0A0A]" />
        </div>
      </div>

      {/* Medical alert modal */}
      {medicalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setMedicalOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-600">
              <HeartPulse size={22} />
              <h3 className="font-manrope text-lg font-semibold">
                Medical Alert
              </h3>
            </div>
            <p className="mt-1 text-sm font-medium text-[#0F1D2E]">
              {student.name}
            </p>
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-[#0F1D2E]">
              {student.medical_info
                ? student.medical_info
                : "This student is flagged with a medical alert. No further details are recorded."}
            </div>
            {parentPhone && (
              <a
                href={`tel:${parentPhone}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D3557] py-2.5 font-manrope font-semibold text-white transition-colors hover:bg-[#152942]"
              >
                <Phone size={18} />
                Call Parent
              </a>
            )}
            <button
              type="button"
              onClick={() => setMedicalOpen(false)}
              className="mt-3 w-full rounded-xl border border-gray-200 py-2.5 font-manrope font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCard;

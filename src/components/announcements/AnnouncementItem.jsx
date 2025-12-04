import { EllipsisVertical } from "lucide-react";
import Attachment from "./Attachment";

export default function AnnouncementItem({ item }) {
  return (
    <div className="border-b last:border-b-0 pb-6">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-[#0000001A] pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar - either image URL or initials placeholder */}
          {typeof item.avatar === 'string' ? (
            <img
              src={item.avatar}
              alt={item.name}
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[54px] lg:h-[54px] rounded-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load - show initials
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-[54px] lg:h-[54px] rounded-full flex items-center justify-center text-white font-bold text-sm ${item.avatar.color}`}
            >
              {item.avatar.initials}
            </div>
          )}
          {/* Hidden fallback div for failed image loads */}
          {typeof item.avatar === 'string' && (
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[54px] lg:h-[54px] rounded-full flex items-center justify-center bg-blue-500 text-white font-bold text-sm"
              style={{ display: 'none' }}
            >
              {item.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}

          <div>
            <p className="text-sm sm:text-base font-bold font-kollektif text-black opacity-80">{item.name}</p>
            <p className="text-xs sm:text-sm font-kollektif font-semibold text-[#1B1B1B] opacity-50">{item.date}</p>
          </div>
        </div>
<div className="bg-white/50 flex items-center justify-center rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-[54px] lg:h-[54px]">
        <EllipsisVertical size={20} className="text-gray-600 " />
      </div>
</div>
      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-manrope font-semibold text-[#0F1D2E] mt-4">{item.title}</h3>

      {/* Description */}
      <p className="text-sm sm:text-base text-[#1B1B1B] font-manrope font-semibold mt-2 opacity-80">{item.description}</p>

      {/* Attachments */}
      {item.attachments?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {item.attachments.map((file, index) => (
            <Attachment key={index} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

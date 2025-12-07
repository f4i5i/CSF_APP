import { EllipsisVertical } from "lucide-react";
import Attachment from "./Attachment";

export default function AnnouncementItem({ item }) {
  return (
    <div className="flex flex-col gap-4 -ml-5">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
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
              className="w-10 h-10 xl:w-9 xl:h-9 xxl:w-9 xxl:h-9 sm:w-12 sm:h-12 lg:w-[54px] lg:h-[54px] rounded-full flex items-center justify-center bg-blue-500 text-white font-bold text-sm"
              style={{ display: 'none' }}
            >
              {item.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}

          <div className="flex flex-col">
            <p className="text-base font-kollektif font-bold text-black leading-[150%] tracking-[-0.01em]">
              {item.name}
            </p>
            <p className="text-sm font-manrope font-semibold text-[#1B1B1B]/50 leading-[150%] tracking-[-0.01em]">
              {item.date}
            </p>
          </div>
        </div>
        <div className="bg-white/50 flex items-center justify-center rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-[54px] lg:h-[54px]">
          <EllipsisVertical size={20} className="text-black" />
        </div>
      </div>
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[22px] font-manrope font-semibold text-[#0F1D2E] leading-[150%] tracking-[-0.01em]">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-base font-manrope font-semibold text-[#1B1B1B]/80 leading-[150%] tracking-[-0.01em]">
          {item.description}
        </p>
      </div>

      {/* Attachments */}
      {item.attachments?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-3">
          {item.attachments.map((file, index) => (
            <Attachment key={index} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

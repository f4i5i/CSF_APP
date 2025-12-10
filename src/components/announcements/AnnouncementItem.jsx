import { MoreVertical } from "lucide-react";
import Attachment from "./Attachment";

export default function AnnouncementItem({ item }) {
  return (
    <div className="flex flex-col gap-fluid-3">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-black/10 pb-fluid-4">
        <div className="flex items-center gap-fluid-2">
          {/* Avatar - either image URL or initials placeholder */}
          {typeof item.avatar === 'string' ? (
            <img
              src={item.avatar}
              alt={item.name}
              className="w-fluid-avatar-md h-fluid-avatar-md rounded-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load - show initials
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div
              className={`w-fluid-avatar-md h-fluid-avatar-md rounded-full flex items-center justify-center text-white font-bold text-sm ${item.avatar.color}`}
            >
              {item.avatar.initials}
            </div>
          )}
          {/* Hidden fallback div for failed image loads */}
          {typeof item.avatar === 'string' && (
            <div
              className="w-fluid-avatar-md h-fluid-avatar-md rounded-full flex items-center justify-center bg-blue-500 text-white font-bold text-sm"
              style={{ display: 'none' }}
            >
              {item.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}

          <div className="flex flex-col leading-[1.5]">
            <p className="text-fluid-base font-kollektif font-bold text-black opacity-80 tracking-[-0.01em]">
              {item.name}
            </p>
            <p className="text-fluid-sm font-manrope font-semibold text-[#1B1B1B] opacity-50 tracking-[-0.01em]">
              {item.date}
            </p>
          </div>
        </div>
        <div className="bg-white/50 flex items-center justify-center rounded-full w-fluid-avatar-md h-fluid-avatar-md">
          <MoreVertical size={20} className="text-black rotate-90" />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-fluid-2">
        {/* Title */}
        <h3 className="text-fluid-lg font-manrope font-semibold text-[#0F1D2E] leading-[1.5] tracking-[-0.01em]">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-fluid-base font-manrope font-semibold text-[#1B1B1B] opacity-80 leading-[1.5] tracking-[-0.01em]">
          {item.description}
        </p>
      </div>

      {/* Attachments */}
      {item.attachments?.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {item.attachments.map((file, index) => (
            <Attachment key={index} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { FileText } from 'lucide-react';

/**
 * CoachNextEventCard - Displays next event with time, details, and attachment
 * Matches Figma design: Time on left, gold divider, event details on right
 */
const CoachNextEventCard = ({ event, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white/20 border border-white/20 rounded-[14px] px-[12px] py-[13px] animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-white/20 border border-white/20 rounded-[14px] px-[12px] py-[13px]">
        <p className="font-manrope font-medium text-[16px] text-[#1B1B1B] opacity-60">
          No upcoming events
        </p>
      </div>
    );
  }

  // Format time from event
  const formatTime = (datetime) => {
    if (!datetime) return '00:00';
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Format date
  const formatDate = (datetime) => {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white/20 border border-[#DFE1E7] rounded-[14px] px-[12px] py-[13px] flex flex-col gap-[10px]">
      {/* Header: User Info with time and event details */}
      <div className="flex items-center justify-between pb-[15px] border-b border-black/10">
        <div className="flex items-start justify-between w-full">
          {/* Time and Divider */}
          <div className="inline-grid grid-cols-[max-content] grid-rows-[max-content]">
            {/* Time */}
            <div className="flex flex-col justify-center font-manrope font-medium text-[18px] text-[#0F1D2E] text-center tracking-[0.0738px] leading-[1.6]">
              <p>{formatTime(event.start_datetime)}</p>
            </div>
          </div>

          {/* Gold Divider */}
          <div className="w-[3px] h-[40px] bg-[#F3BC48] rounded-[3px] mx-4"></div>

          {/* Event Info */}
          <div className="flex-1 inline-grid grid-cols-[max-content] grid-rows-[max-content]">
            <p className="font-manrope font-medium text-[14px] leading-[1.6] text-[#0F1D2E]">
              {event.title || 'Event'}
            </p>
            <p className="font-manrope font-light text-[12px] leading-[1.25] text-[#0F1D2E] opacity-70">
              {formatDate(event.start_datetime)}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="font-manrope font-semibold text-[16px] leading-[1.5] text-[#1B1B1B] opacity-80 tracking-[-0.16px]">
        {event.description || 'No description available.'}
      </p>

      {/* Attachment (if any) */}
      {event.attachment_url && (
        <a
          href={event.attachment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-[10px] bg-white/50 px-[20px] py-[10px] rounded-[40px] w-fit hover:bg-white/70 transition-colors"
        >
          <FileText size={13.724} className="text-black" />
          <span className="font-manrope font-medium text-[14px] leading-[1.6] text-black opacity-70">
            {event.attachment_name || 'Attachment'}
          </span>
        </a>
      )}
    </div>
  );
};

export default CoachNextEventCard;

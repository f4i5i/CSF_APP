import { Paperclip } from 'lucide-react';

const formatTime = (date) =>
  date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const formatDate = (date) =>
  date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const AttachmentChip = ({ label }) => (
  <div className="inline-flex items-center gap-3 bg-white rounded-full px-5 py-3 text-[#1B1B1B] font-manrope text-base shadow-sm w-fit max-w-full truncate">
    <Paperclip className="w-4 h-4" />
    <span>{label}</span>
  </div>
);

const CARD_MIN_HEIGHT = 'min-h-[254px]';

const EmptyState = () => (
  <div className="w-full py-3 flex justify-start">
    <div className={`bg-white rounded-[30px] p-6 shadow-sm w-full ${CARD_MIN_HEIGHT} flex flex-col items-center justify-center text-center text-gray-500 overflow-hidden`}>
      <p className="font-kollektif text-xl text-[#0F1D2E]">Next Event</p>
      <p className="text-sm mt-2">No upcoming events scheduled</p>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="py-3 w-full flex justify-start">
    <div className={`bg-white rounded-[30px] p-6 shadow-sm w-full ${CARD_MIN_HEIGHT} animate-pulse flex flex-col gap-4 overflow-hidden`}>
      <div className="h-16 bg-gray-200/70 rounded-2xl" />
      <div className="h-10 bg-gray-200/70 rounded-2xl" />
      <div className="h-4 bg-gray-200/70 rounded-full w-1/2" />
    </div>
  </div>
);

export default function NextEvent({ event = null, loading = false }) {
  if (loading) return <LoadingState />;
  if (!event) return <EmptyState />;

  const eventDate = new Date(event.start_datetime);
  const eventTime = formatTime(eventDate);
  const eventDateStr = formatDate(eventDate);
  const attachments = event.attachments || [];

  return (
    <div className="w-full mt-4">
      <div className={`bg-white/20 rounded-[30px] shadow-sm w-full ${CARD_MIN_HEIGHT} flex items-stretch p-4 overflow-hidden`}>
        <div className=" rounded-[14px] border border-white/15 flex flex-col gap-4 w-full p-3 overflow-hidden">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex items-center gap-4">
              <p className="font-manrope font-medium text-[18px] leading-[160%] tracking-[0.0041em] text-center flex items-center text-[#0F1D2E]">
                {eventTime}
              </p>
              <span className="w-1 h-12 rounded-full bg-[#F3BC48]" />
            </div>
          <div className="flex flex-col gap-1">
            <span className="font-manrope font-light text-[12px] leading-[125%] text-[#0F1D2E] opacity-70">
              {eventDateStr}
            </span>
            <p className="font-manrope font-medium text-[14px] leading-[160%] text-[#0F1D2E]">
              {event.title}
            </p>
          </div>
        </div>

          <div className="border-t border-[#D8DCE3]" />

          {event.description && (
            <p className="text-[#1B1B1B] font-manrope text-[15px] leading-[145%] break-words">
              {event.description}
            </p>
          )}

          {attachments.length > 0 && (
            <AttachmentChip label={attachments[0].name || 'details.pdf'} />
          )}
        </div>
      </div>
    </div>
  );
}

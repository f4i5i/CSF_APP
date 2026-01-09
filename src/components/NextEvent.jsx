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
  <div className="inline-flex items-center gap-2.5 bg-white/50 rounded-full px-5 py-2.5 text-black font-manrope font-medium text-sm opacity-70 w-fit">
    <Paperclip className="w-3 h-3" />
    <span className='font-manrope'>{label}</span>
  </div>
);

const EmptyState = () => (
  <div className="w-full">
    <div className="bg-white/20 border border-white/20 rounded-fluid-md p-fluid-4 flex flex-col items-center justify-center text-center text-gray-500 min-h-fluid-event-card">
      <p className="text-sm font-manrope">No upcoming events scheduled</p>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="w-full">
    <div className="bg-white/20 border border-white/20 rounded-fluid-md p-fluid-4 animate-pulse flex flex-col gap-fluid-3 min-h-fluid-event-card">
      <div className="h-16 bg-gray-200/30 rounded" />
      <div className="h-10 bg-gray-200/30 rounded" />
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
    <div className="lg:max-w-[360px] w-full overflow-hidden">
      <div className="bg-white/20 border border-white rounded-fluid-md p-fluid-4 flex flex-col gap-fluid-3 overflow-hidden">
        {/* Header with time and event info */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-fluid-3">
            {/* Time */}
            <div className="flex flex-col items-center justify-center">
              <p className="font-manrope font-medium text-fluid-md leading-[160%] text-center text-[#0F1D2E] whitespace-nowrap">
                {eventTime}
              </p>
            </div>

            {/* Divider */}
            <div className="w-fluid-divider h-fluid-10 rounded-full bg-[#F3BC48]" />

            {/* Event info */}
            <div className="flex flex-col">
              <p className="font-manrope font-light text-fluid-sm leading-[125%] text-[#0F1D2E] opacity-70">
                {eventDateStr}
              </p>
              <p className="font-manrope font-medium text-fluid-base leading-[160%] text-[#0F1D2E]">
                {event.title}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-[#1B1B1B] opacity-80 font-manrope font-medium text-sm leading-[150%] tracking-[-0.01em] break-words overflow-hidden line-clamp-4">
            {event.description}
          </p>
        )}

        {/* Attachment */}
        {attachments.length > 0 && (
          <AttachmentChip label={attachments[0].name || 'details.pdf'} />
        )}
      </div>
    </div>
  );
}

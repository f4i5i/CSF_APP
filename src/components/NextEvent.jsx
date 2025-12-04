import { Link } from 'react-router-dom';
import { Paperclip, Calendar, MapPin, Clock } from 'lucide-react';

const NextEvent = ({ event = null, loading = false }) => {
  // Loading state
  if (loading) {
    return (
      <div className="p-3 w-full">
        <div className="bg-[#FFFFFF50] rounded-3xl p-6 shadow-sm w-full animate-pulse">
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // No event state
  if (!event) {
    return (
      <div className=" w-full">
        <div className="bg-[#FFFFFF50] rounded-3xl p-6 shadow-sm w-full">
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No upcoming events</p>
            <p className="text-sm mt-1">Check back later for new events</p>
          </div>
        </div>
      </div>
    );
  }

  // Parse event date
  const eventDate = new Date(event.start_datetime);
  const eventTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const eventDateStr = eventDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Calculate days until event
  const today = new Date();
  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;

  // Event type icon
  const getEventIcon = (type) => {
    switch (type) {
      case 'tournament':
        return '🏆';
      case 'practice':
        return '🏃';
      case 'social':
        return '🎉';
      case 'game':
        return '⚽';
      default:
        return '📅';
    }
  };

  return (
    <div className="py-3 w-full">
      <div className="bg-[#FFFFFF50] rounded-3xl p-6 shadow-sm w-full">
        {/* Time + Title */}
        <div className="flex items-start gap-4 mb-4">
          {/* Event Icon */}
          <div className="text-4xl mt-1">{getEventIcon(event.type)}</div>

          <div className="flex-1">
            {/* Time badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[24px] font-medium font-manrope text-gray-900">
                {eventTime}
              </span>
              {isToday && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  Today
                </span>
              )}
              {isTomorrow && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  Tomorrow
                </span>
              )}
            </div>

            {/* Date & Title */}
            <div className="border-l-2 border-[#F4B728] pl-4">
              <p className="text-sm text-gray-500 font-medium font-manrope flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {eventDateStr}
              </p>
              <p className="text-[16px] font-medium font-manrope text-gray-900 mt-1">
                {event.title}
              </p>

              {/* Event type badge */}
              {event.type && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                  {event.type}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{event.location}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-[#0000001A] mt-4 mb-4"></div>

        {/* Description */}
        {event.description && (
          <p className="text-[16px] text-[#1b1b1b] font-semibold font-manrope leading-relaxed mb-4">
            {event.description}
          </p>
        )}

        {/* RSVP Status */}
        {event.my_rsvp && (
          <div className="mb-4">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
              event.my_rsvp.status === 'attending'
                ? 'bg-green-100 text-green-700'
                : event.my_rsvp.status === 'not_attending'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              <span className="text-sm font-medium">
                {event.my_rsvp.status === 'attending'
                  ? '✓ You\'re attending'
                  : event.my_rsvp.status === 'not_attending'
                  ? '✗ Not attending'
                  : '? Maybe attending'}
              </span>
            </div>
          </div>
        )}

        {/* Attachments */}
        {event.attachments && event.attachments.length > 0 && (
          <div className="space-y-2">
            {event.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-[14px] bg-[#FFFFFF80] px-3 py-2 rounded-full w-fit text-gray-600 cursor-pointer hover:bg-white transition"
              >
                <Paperclip className="w-4 h-4" />
                <span>{attachment.name || 'Attachment'}</span>
              </div>
            ))}
          </div>
        )}

        {/* View Details Link */}
        <Link
          to={`/events/${event.id}`}
          className="mt-4 inline-block text-sm text-primary hover:underline font-medium"
        >
          View Event Details →
        </Link>
      </div>
    </div>
  );
};

export default NextEvent;

/**
 * EventRsvpCard Component
 * Displays an event with RSVP buttons (Yes, No, Maybe) for parents
 */

import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Check, X, HelpCircle, Loader2, Eye, Tag, RefreshCw } from 'lucide-react';
import { useMyRsvp, useRsvp, useUpdateRsvp } from '../api/hooks/events/useRsvp';

const formatDate = (dateString) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const RsvpButton = ({ status, currentStatus, onClick, loading, icon: Icon, label }) => {
  const isSelected = currentStatus === status;
  const baseClasses = 'flex items-center gap-2 px-4 py-2 rounded-full font-manrope font-medium text-sm transition-all duration-200';

  const colorClasses = {
    attending: isSelected
      ? 'bg-green-500 text-white shadow-md'
      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200',
    not_attending: isSelected
      ? 'bg-red-500 text-white shadow-md'
      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
    maybe: isSelected
      ? 'bg-yellow-500 text-white shadow-md'
      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200',
  };

  return (
    <button
      onClick={() => onClick(status)}
      disabled={loading}
      className={`${baseClasses} ${colorClasses[status]} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      <span>{label}</span>
    </button>
  );
};

// Component to show confirmed RSVP status
const ConfirmedRsvpStatus = ({ status, onChangeClick }) => {
  const statusConfig = {
    attending: {
      icon: Check,
      label: "You're Going!",
      bgClass: 'bg-green-100',
      textClass: 'text-green-700',
      borderClass: 'border-green-200',
    },
    not_attending: {
      icon: X,
      label: "Not Attending",
      bgClass: 'bg-red-100',
      textClass: 'text-red-700',
      borderClass: 'border-red-200',
    },
    maybe: {
      icon: HelpCircle,
      label: "Maybe Attending",
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-700',
      borderClass: 'border-yellow-200',
    },
  };

  const config = statusConfig[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${config.bgClass} ${config.textClass} border ${config.borderClass}`}>
        <Icon className="w-5 h-5" />
        <span className="font-manrope font-semibold">{config.label}</span>
      </div>
      <button
        onClick={onChangeClick}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#173151]/70 hover:text-[#173151] hover:bg-[#173151]/5 rounded-lg transition-colors font-manrope"
      >
        <RefreshCw className="w-4 h-4" />
        Change
      </button>
    </div>
  );
};

export default function EventRsvpCard({
  event,
  showFullDetails = true,
  onViewDetails,
  className = ''
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isChangingResponse, setIsChangingResponse] = useState(false);
  const [isChangingInModal, setIsChangingInModal] = useState(false);

  // Get event ID - handle different field names and ensure string type
  const eventId = String(event?.id || event?.event_id || '');

  // Get user's current RSVP status
  const { data: myRsvp, isLoading: loadingRsvp, refetch: refetchMyRsvp } = useMyRsvp({
    eventId: eventId,
    queryOptions: {
      enabled: !!eventId,
    }
  });

  // RSVP mutations
  const { mutate: submitRsvp } = useRsvp({
    onSuccess: () => {
      setIsSubmitting(false);
      setIsChangingResponse(false);
      setIsChangingInModal(false);
      // Force refetch to ensure UI updates
      refetchMyRsvp();
    },
    onError: () => setIsSubmitting(false),
  });

  const { mutate: updateRsvp } = useUpdateRsvp({
    onSuccess: () => {
      setIsSubmitting(false);
      setIsChangingResponse(false);
      setIsChangingInModal(false);
      // Force refetch to ensure UI updates
      refetchMyRsvp();
    },
    onError: () => setIsSubmitting(false),
  });

  if (!event) return null;

  // Validate event ID before allowing RSVP
  const canRsvp = !!eventId;

  const handleRsvp = (status) => {
    if (!canRsvp) {
      console.error('Cannot RSVP: Event ID is missing', event);
      return;
    }

    setIsSubmitting(true);

    if (myRsvp) {
      // Update existing RSVP
      updateRsvp({
        eventId: eventId,
        rsvpId: myRsvp.id,
        data: { status },
      });
    } else {
      // Create new RSVP
      submitRsvp({
        eventId: eventId,
        data: { status },
      });
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(event);
    } else {
      setViewModalOpen(true);
    }
  };

  const currentStatus = myRsvp?.status;
  const eventDate = event.start_datetime || event.event_date;
  const isRequiresRsvp = event.requires_rsvp;
  const maxAttendees = event.max_attendees;
  const currentAttendees = event.rsvp_count || event.current_attendees_count || 0;
  const spotsRemaining = maxAttendees ? maxAttendees - currentAttendees : null;
  const eventType = event.event_type || event.type;
  const className_ = event.class_name || event.class?.name;

  return (
    <>
      <div className={`bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-sm ${className}`}>
        {/* Event Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-manrope font-semibold text-lg text-[#173151] leading-tight">
                {event.title}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {eventType && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#173151]/10 text-[#173151] text-xs font-medium rounded-full capitalize">
                    <Tag className="w-3 h-3" />
                    {eventType}
                  </span>
                )}
                {className_ && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F3BC48]/20 text-[#173151] text-xs font-medium rounded-full">
                    {className_}
                  </span>
                )}
              </div>
            </div>

            {/* RSVP Status Badge */}
            {currentStatus && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentStatus === 'attending' ? 'bg-green-100 text-green-700' :
                currentStatus === 'not_attending' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {currentStatus === 'attending' ? 'Going' :
                 currentStatus === 'not_attending' ? 'Not Going' : 'Maybe'}
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        {showFullDetails && (
          <div className="space-y-2 mb-4 text-sm text-[#173151]/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#F3BC48] flex-shrink-0" />
              <span>{formatDate(eventDate)}</span>
            </div>

            {event.start_datetime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F3BC48] flex-shrink-0" />
                <span>
                  {formatTime(event.start_datetime)}
                  {event.end_datetime && ` - ${formatTime(event.end_datetime)}`}
                </span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F3BC48] flex-shrink-0" />
                <span>{event.location}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F3BC48] flex-shrink-0" />
              <span>
                {currentAttendees}{maxAttendees ? `/${maxAttendees}` : ''} attending
                {spotsRemaining !== null && spotsRemaining > 0 && (
                  <span className="text-green-600 ml-1">({spotsRemaining} spots left)</span>
                )}
                {spotsRemaining !== null && spotsRemaining <= 0 && (
                  <span className="text-red-600 ml-1">(Full)</span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        {event.description && showFullDetails && (
          <p className="text-sm text-[#173151]/70 mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* RSVP Section */}
        <div className="pt-4 border-t border-[#173151]/10">
          {!canRsvp ? (
            <p className="text-sm text-red-500">Unable to RSVP - Event data incomplete</p>
          ) : loadingRsvp ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : currentStatus && !isChangingResponse ? (
            // Show confirmed status when already RSVP'd
            <ConfirmedRsvpStatus
              status={currentStatus}
              onChangeClick={() => setIsChangingResponse(true)}
            />
          ) : (
            // Show RSVP buttons when no status or changing response
            <>
              <p className="text-xs text-[#173151]/60 mb-3 font-manrope">
                {isChangingResponse ? 'Change your response:' : (isRequiresRsvp ? 'RSVP Required' : 'Will you attend?')}
              </p>
              <div className="flex flex-wrap gap-2">
                <RsvpButton
                  status="attending"
                  currentStatus={currentStatus}
                  onClick={handleRsvp}
                  loading={isSubmitting}
                  icon={Check}
                  label="Yes"
                />
                <RsvpButton
                  status="not_attending"
                  currentStatus={currentStatus}
                  onClick={handleRsvp}
                  loading={isSubmitting}
                  icon={X}
                  label="No"
                />
                <RsvpButton
                  status="maybe"
                  currentStatus={currentStatus}
                  onClick={handleRsvp}
                  loading={isSubmitting}
                  icon={HelpCircle}
                  label="Maybe"
                />
                {isChangingResponse && (
                  <button
                    onClick={() => setIsChangingResponse(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-manrope"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* View Details Button */}
        <div className="mt-4 pt-3 border-t border-[#173151]/10">
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#173151]/5 hover:bg-[#173151]/10 text-[#173151] rounded-lg font-manrope font-medium text-sm transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Full Details
          </button>
        </div>
      </div>

      {/* View Details Modal */}
      {viewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-manrope font-bold text-xl text-[#173151]">
                  {event.title}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {eventType && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#173151]/10 text-[#173151] text-xs font-medium rounded-full capitalize">
                      {eventType}
                    </span>
                  )}
                  {className_ && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F3BC48]/20 text-[#173151] text-xs font-medium rounded-full">
                      {className_}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              {/* Date & Time */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-manrope font-semibold text-sm text-gray-500 mb-2">Date & Time</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#173151]">
                    <Calendar className="w-5 h-5 text-[#F3BC48]" />
                    <span className="font-medium">{formatDate(eventDate)}</span>
                  </div>
                  {event.start_datetime && (
                    <div className="flex items-center gap-2 text-[#173151]">
                      <Clock className="w-5 h-5 text-[#F3BC48]" />
                      <span>
                        {formatTime(event.start_datetime)}
                        {event.end_datetime && ` - ${formatTime(event.end_datetime)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-manrope font-semibold text-sm text-gray-500 mb-2">Location</h4>
                  <div className="flex items-center gap-2 text-[#173151]">
                    <MapPin className="w-5 h-5 text-[#F3BC48]" />
                    <span>{event.location}</span>
                  </div>
                </div>
              )}

              {/* Capacity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-manrope font-semibold text-sm text-gray-500 mb-2">Attendance</h4>
                <div className="flex items-center gap-2 text-[#173151]">
                  <Users className="w-5 h-5 text-[#F3BC48]" />
                  <span>
                    <strong>{currentAttendees}</strong>
                    {maxAttendees ? ` / ${maxAttendees}` : ''} attending
                    {spotsRemaining !== null && spotsRemaining > 0 && (
                      <span className="text-green-600 ml-2">({spotsRemaining} spots left)</span>
                    )}
                    {spotsRemaining !== null && spotsRemaining <= 0 && (
                      <span className="text-red-600 ml-2">(Full)</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div>
                  <h4 className="font-manrope font-semibold text-sm text-gray-500 mb-2">Description</h4>
                  <p className="text-[#173151] whitespace-pre-wrap">{event.description}</p>
                </div>
              )}

              {/* Your RSVP Status */}
              {currentStatus && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-manrope font-semibold text-sm text-gray-500 mb-2">Your RSVP</h4>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    currentStatus === 'attending' ? 'bg-green-100 text-green-700' :
                    currentStatus === 'not_attending' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {currentStatus === 'attending' ? <Check className="w-4 h-4" /> :
                     currentStatus === 'not_attending' ? <X className="w-4 h-4" /> :
                     <HelpCircle className="w-4 h-4" />}
                    {currentStatus === 'attending' ? 'You\'re going!' :
                     currentStatus === 'not_attending' ? 'Not attending' : 'Maybe attending'}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - RSVP Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              {canRsvp && !loadingRsvp && (
                currentStatus && !isChangingInModal ? (
                  // Show confirmed status when already RSVP'd
                  <ConfirmedRsvpStatus
                    status={currentStatus}
                    onChangeClick={() => setIsChangingInModal(true)}
                  />
                ) : (
                  // Show RSVP buttons when no status or changing response
                  <>
                    <p className="text-xs text-gray-500 mb-3 font-manrope">
                      {isChangingInModal ? 'Change your response:' : 'Will you attend?'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <RsvpButton
                        status="attending"
                        currentStatus={currentStatus}
                        onClick={handleRsvp}
                        loading={isSubmitting}
                        icon={Check}
                        label="Yes"
                      />
                      <RsvpButton
                        status="not_attending"
                        currentStatus={currentStatus}
                        onClick={handleRsvp}
                        loading={isSubmitting}
                        icon={X}
                        label="No"
                      />
                      <RsvpButton
                        status="maybe"
                        currentStatus={currentStatus}
                        onClick={handleRsvp}
                        loading={isSubmitting}
                        icon={HelpCircle}
                        label="Maybe"
                      />
                      {isChangingInModal && (
                        <button
                          onClick={() => setIsChangingInModal(false)}
                          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-manrope"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </>
                )
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setViewModalOpen(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-manrope font-medium text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

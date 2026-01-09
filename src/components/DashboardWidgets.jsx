"use client";

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { getFileUrl } from "../api/config";
import ProgramPhotoSrc from "../assets/program.png";
import EarnedBadgeSrc from "../assets/Earned_Badges.png";
import LeftArrowSrc from "../assets/left_errow.png";
import RightArrowSrc from "../assets/right_errow.png";
import leftArrow from "../assets/left.png";
import rightArrow from "../assets/right.png";
import pdfLinkIcon from "../assets/pdf_link.png";
import arrowRightUpLine from "../assets/arrow-right-up-line.png";

export default function DashboardWidgets({
  calendarEvents = [],
  nextEvent = null,
  badges = [],
  photo = null,
  loadingEvents = false,
  loadingBadges = false,
  loadingPhoto = false,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthOffset, setMonthOffset] = useState(0);
  const [badgeIndex, setBadgeIndex] = useState(0);
  const [viewMoreEvent, setViewMoreEvent] = useState(null);

  const viewDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstWeekday = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);

  const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const blanksBefore = (firstWeekday + 6) % 7;

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Get highlighted days from calendar events
  const highlightedDays = useMemo(() => {
    if (!calendarEvents || calendarEvents.length === 0) return [];
    return calendarEvents
      .filter((event) => {
        const eventDate = new Date(event.start_datetime);
        return eventDate.getMonth() === month && eventDate.getFullYear() === year;
      })
      .map((event) => new Date(event.start_datetime).getDate());
  }, [calendarEvents, month, year]);

  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlPattern);
    return parts.map((part, index) => {
      if (part.match(urlPattern)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const renderEventDescriptionWithViewMore = (description) => {
    if (!description) return null;
    
    const maxLength = 300;
    const shouldShowViewMore = description.length > maxLength;
    
    return (
      <div>
        <p className="text-sm lg:text-xs xl:text-base font-medium text-[#1B1B1B]">
          {shouldShowViewMore ? `${description.substring(0, maxLength)}...` : description}
        </p>
        {shouldShowViewMore && (
          <button
            onClick={() => setViewMoreEvent(true)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-1"
          >
            View More
          </button>
        )}
      </div>
    );
  };

  // Demo badges for fallback
  const demoBadges = [
    {
      id: 1,
      title: "Perfect Attendance",
      subtitle: "Never missed a practice session",
      img: EarnedBadgeSrc,
    },
    {
      id: 2,
      title: "Team Player",
      subtitle: "Great cooperation with team",
      img: EarnedBadgeSrc,
    },
    {
      id: 3,
      title: "Top Scorer",
      subtitle: "Most goals this season",
      img: EarnedBadgeSrc,
    },
  ];

  // Demo next event with long description for testing
  const demoNextEvent = {
    title: "Tournament Day",
    description: "Annual soccer tournament. All teams will compete. Please arrive 30 minutes early for warm-up. This is a very important event for our team. We've been preparing for months and this is our chance to showcase our skills. Make sure to bring your complete gear including cleats, shin guards, and water bottles. We'll have a team meeting 15 minutes before the match to discuss strategy. Parents are welcome to attend and cheer for the team. After the tournament, we'll have a small celebration at the clubhouse. Please let the coach know if you have any dietary restrictions. This tournament is part of the regional championship series, and winning could qualify us for the state finals. We need everyone's best effort and team spirit. Remember, it's not just about winning, but about playing with honor and sportsmanship. Good luck to all players! May the best team win. Annual soccer tournament. All teams will compete. Please arrive 30 minutes early for warm-up. This is a very important event for our team. We've been preparing for months and this is our chance to showcase our skills. Make sure to bring your complete gear including cleats, shin guards, and water bottles.",
    start_datetime: "2025-10-29T14:00:00",
    attachment_name: "tournament_details.pdf",
  };

  // Use real data or demo data
  const displayBadges = useMemo(() => {
    if (badges && badges.length > 0) {
      return badges.map((badge) => ({
        id: badge.id,
        title: badge.name || badge.title,
        subtitle: badge.description || badge.subtitle || "Badge earned",
        img: badge.icon_url || badge.image_url || EarnedBadgeSrc,
      }));
    }
    return demoBadges;
  }, [badges]);

  const displayNextEvent = useMemo(() => {
    if (nextEvent) return nextEvent;
    return demoNextEvent;
  }, [nextEvent]);

  // Format time for event display
  const formatTime = (dateString) => {
    if (!dateString) return "00:00";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format event date
  const formatEventDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format photo date
  const formatPhotoDate = (dateString) => {
    if (!dateString) return "Oct 24, 2024";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePrevBadge = () =>
    setBadgeIndex((i) => (i - 1 + displayBadges.length) % displayBadges.length);
  const handleNextBadge = () =>
    setBadgeIndex((i) => (i + 1) % displayBadges.length);

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {/* Calendar & Next Event - Desktop */}
        <div className="sm:flex hidden flex-col sm:flex-row shadow-sm items-start justify-center gap-3 bg-white/50 rounded-2xl sm:rounded-3xl px-3 sm:px-5 py-2 sm:py-5 w-full">
          {/* Calendar */}
          <div className="w-[40%]">
            <h3 className="text-lg sm:text-xl font-kollektif font-medium text-heading-dark">
              Calendar
            </h3>
            <div className="flex items-center justify-between mt-2 sm:mt-3 mb-1">
              <p className="text-sm font-semibold text-grey-400">
                {viewDate
                  .toLocaleString(undefined, {
                    month: "short",
                    year: "numeric",
                  })
                  .toUpperCase()}
              </p>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setMonthOffset((o) => o - 1)}
                  aria-label="Previous month"
                >
                  <img
                    src={leftArrow}
                    alt="Prev"
                    width={40}
                    height={40}
                    className="rounded-full size-3 sm:size-4 object-cover"
                  />
                </button>
                <button
                  onClick={() => setMonthOffset((o) => o + 1)}
                  aria-label="Next month"
                >
                  <img
                    src={rightArrow}
                    alt="Next"
                    width={40}
                    height={40}
                    className="rounded-full size-3 sm:size-4 object-cover"
                  />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600 mb-2">
              {weekdayOrder.map((d) => (
                <div
                  key={d}
                  className="h-6 sm:h-8 flex items-center justify-center text-[#6F6F6F] text-[9px] sm:text-[10px] font-medium"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm">
              {Array.from({ length: blanksBefore }).map((_, i) => (
                <div key={`b-${i}`} className="h-6 sm:h-8" />
              ))}

              {calendarDays.map((d) => {
                const isActive =
                  selectedDate.getDate() === d &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getFullYear() === year;
                const isHighlighted = highlightedDays.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(new Date(year, month, d))}
                    className={`h-6 w-6 flex items-center justify-center text-[11px] sm:text-xs m-auto font-medium rounded-full ${
                      isActive ? "text-black" : "text-[#6F6F6F]"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: "#F3BC48" }
                        : isHighlighted
                        ? { backgroundColor: "#F3BC48", color: "black" }
                        : {}
                    }
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Event - Desktop */}
          <div className="w-[60%]">
            <h3 className="text-lg sm:text-xl font-medium text-heading-dark">
              Next Event
            </h3>
            {loadingEvents ? (
              <div className="animate-pulse bg-white/50 rounded-[10px] p-3 mt-2 min-h-52">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ) : (
              <div className="flex items-start flex-col gap-2 bg-white/50 shadow-sm rounded-[10px] px-2 sm:px-3 py-2 mt-2 sm:mt-3 w-full min-h-52">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="text-base sm:text-lg font-medium text-heading-dark">
                    {formatTime(displayNextEvent?.start_datetime)}
                  </div>

                  <div className="w-1 bg-[#F3BC48] h-7 sm:h-9 rounded" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-light text-gray-500">
                      {formatEventDate(displayNextEvent?.start_datetime)}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-heading-dark">
                      {displayNextEvent?.title}
                    </p>
                  </div>
                </div>
                <hr className="border-black/10 w-full" />

                {renderEventDescriptionWithViewMore(displayNextEvent?.description)}
                
                {displayNextEvent?.attachment_name && (
                  <div
                    className="flex items-center gap-2 bg-white/50 px-2 sm:px-3.5 mt-2 py-2 rounded-[60px] text-xs text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors w-fit"
                  >
                    <img
                      src={pdfLinkIcon}
                      alt="linkicon"
                      width={40}
                      height={40}
                      className="size-[13px] object-cover"
                    />
                    <span className="text-xs sm:text-sm text-[#1B1B1B] font-semibold">
                      {displayNextEvent.attachment_name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Program Photos & Badges */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-5 sm:gap-3 w-full">
          {/* Program Photos */}
          <div className="w-full sm:w-1/2 relative h-[290px] sm:h-[420px] rounded-3xl overflow-hidden">
            {loadingPhoto ? (
              <div className="w-full h-full bg-gray-200 animate-pulse"></div>
            ) : (
              <>
                <img
                  src={photo?.image_url ? getFileUrl(photo.image_url) : (photo?.url || ProgramPhotoSrc)}
                  alt="Program Photos"
                  className="w-full h-full object-cover"
                />

                <Link
                  to="/photos"
                  className="absolute right-2 sm:right-4 top-2 sm:top-4 bg-[#dde3e8] rounded-full size-12 sm:size-[60px] flex items-center justify-center z-10 hover:bg-[#c5ccd3] transition-colors"
                >
                  <img
                    src={arrowRightUpLine}
                    alt="arrow-right-up-line"
                    width={120}
                    height={120}
                    className="object-contain size-5 sm:size-[25px] text-white"
                  />
                </Link>
                <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 text-white">
                  <h2 className="font-bold text-xl">Program Photos</h2>
                  <p className="font-light text-white text-lg opacity-70">
                    {formatPhotoDate(photo?.created_at)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Earned Badges */}
          <div className="bg-white/50 rounded-3xl sm:rounded-4xl p-5 sm:p-6 shadow-sm w-full sm:w-1/2 flex flex-col justify-between items-center gap-3 sm:gap-5 min-h-96 sm:min-h-[420px]">
            <div className="flex w-full items-start justify-start">
              <h3 className="text-lg sm:text-xl font-semibold text-[#0F1D2E]">
                Earned Badges
              </h3>
            </div>
            {loadingBadges ? (
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="size-20 sm:size-[140px] bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
            ) : displayBadges.length > 0 ? (
              <div>
                <div className="flex flex-col items-center gap-3 sm:gap-6">
                  <div className="rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={displayBadges[badgeIndex]?.img}
                      alt={displayBadges[badgeIndex]?.title}
                      width={120}
                      height={120}
                      className="object-contain size-20 sm:size-[140px]"
                    />
                  </div>
                  <div className="flex-1 flex items-center flex-col text-center">
                    <h4 className="text-base sm:text-lg font-semibold text-[#1B1B1B">
                      {displayBadges[badgeIndex]?.title}
                    </h4>
                    <p className="text-xs sm:text-sm font-medium text-[#0F1D2E]">
                      {displayBadges[badgeIndex]?.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <img
                  src={EarnedBadgeSrc}
                  alt="No badges"
                  className="size-20 sm:size-[100px] opacity-30"
                />
                <p className="text-sm text-gray-500">No badges earned yet</p>
              </div>
            )}
            {displayBadges.length > 1 && (
              <div className="flex items-center justify-center w-full">
                <div className="flex items-center gap-5">
                  <button
                    onClick={handlePrevBadge}
                    className="size-12 sm:size-[50px] flex items-center justify-center bg-white rounded-full hover:bg-gray-200"
                  >
                    <img
                      src={LeftArrowSrc}
                      alt="Prev"
                      width={24}
                      height={24}
                      className="size-4 sm:size-[30px]"
                    />
                  </button>
                  <span className="text-xs sm:text-sm font-medium text-[#1B1B1B] whitespace-nowrap">
                    {badgeIndex + 1}/{displayBadges.length}
                  </span>
                  <button
                    onClick={handleNextBadge}
                    className="size-12 sm:size-[54px] flex items-center justify-center bg-white rounded-full hover:bg-gray-200"
                  >
                    <img
                      src={RightArrowSrc}
                      alt="Next"
                      width={24}
                      height={24}
                      className="size-4 sm:size-[30px]"
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View More Modal for Event Description */}
      {viewMoreEvent && displayNextEvent && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-manrope font-semibold text-[#0F1D2E]">
                Event Details
              </h2>
              <button
                onClick={() => setViewMoreEvent(false)}
                className="w-10 h-10 rounded-full border border-border-light flex items-center justify-center hover:bg-gray-50 transition"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="px-6 py-4 border-b border-border-light flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-xl font-manrope font-semibold text-[#0F1D2E]">
                        {formatTime(displayNextEvent?.start_datetime)}
                      </div>
                      <div className="w-1 bg-[#F3BC48] h-7 rounded"></div>
                      <div>
                        <p className="text-sm text-gray-500 font-manrope">
                          {formatEventDate(displayNextEvent?.start_datetime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/*  title */}
                <div className="px-6 py-4 border-b border-border-light flex-shrink-0">
                  <h3 className="text-2xl font-manrope font-semibold text-[#0F1D2E]">
                    {displayNextEvent?.title}
                  </h3>
                </div>

                {/* description */}
                <div className="flex-1 overflow-y-auto max-h-80 px-6 py-4">
                  <div className="text-[#1b1b1b] opacity-80 font-manrope leading-relaxed whitespace-pre-wrap">
                    {renderTextWithLinks(displayNextEvent?.description || '')}
                  </div>
                </div>

                {/*  attachment section */}
                {displayNextEvent?.attachment_name && (
                  <div className="px-6 py-4 border-t border-border-light bg-gray-50 flex-shrink-0">
                    <p className="text-sm font-manrope font-semibold text-gray-600 mb-3">
                      Attachment
                    </p>
                      <img
                        src={pdfLinkIcon}
                        alt="PDF"
                        className="w-8 h-8 rounded object-cover"
                      />
                      <span className="font-manrope text-sm text-gray-700">
                        {displayNextEvent.attachment_name}
                      </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-border-light px-6 py-4 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setViewMoreEvent(false)}
                className="px-6 py-2 font-manrope rounded-full border border-gray-300 font-semibold text-[#0F1D2E] hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
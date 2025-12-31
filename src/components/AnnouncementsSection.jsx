"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import teamList from "../assets/teamlist.png";
import teamList1 from "../assets/teamlist1.png";
import pdfIcon from "../assets/pdf_link.png";
import userImg from "../assets/user_img.png";

export default function AnnouncementsSection({
  announcements = [],
  nextEvent = null,
  loading = false,
  loadingEvent = false,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format time for event display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Format event date
  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get author display name
  const getAuthorName = (announcement) => {
    if (announcement.author?.first_name) {
      return `Coach ${announcement.author.first_name}`;
    }
    return announcement.author_name || 'Coach';
  };

  // Get attachment info
  const getAttachmentInfo = (announcement) => {
    if (!announcement.attachments || announcement.attachments.length === 0) return null;
    const attachment = announcement.attachments[0];
    const isImage = attachment.type?.startsWith('image/') ||
                    attachment.name?.match(/\.(jpg|jpeg|png|gif)$/i);
    return {
      name: attachment.name || 'attachment',
      url: attachment.url,
      isImage,
      img: isImage ? (attachment.url || teamList1) : teamList,
    };
  };

  // Demo announcements for fallback
  const demoAnnouncements = [
    {
      id: 1,
      author: { first_name: "Martinez" },
      created_at: "2025-10-27T10:30:00",
      title: "Tournament This Saturday",
      content: "Great practice today! Remember, we have a tournament this Saturday at 9 AM. Please arrive 30 minutes early",
      attachments: [{ name: "teamList.pdf", type: "application/pdf" }],
    },
    {
      id: 2,
      author: { first_name: "Martinez" },
      created_at: "2025-10-27T10:30:00",
      title: "New Team Jerseys",
      content: "New team jerseys have arrived! You can pick them up from the front desk.",
      attachments: [{ name: "image-2.jpg", type: "image/jpeg" }],
    },
    {
      id: 3,
      author: { first_name: "Martinez" },
      created_at: "2025-10-27T10:30:00",
      title: "Registration Deadline",
      content: "Reminder: Registration for next month closes this Friday. Make sure your account is up to date!",
    },
  ];

  // Demo next event
  const demoNextEvent = {
    title: "Tournament Day",
    description: "Annual soccer tournament. All teams will compete. Please arrive 30 minutes early for warm-up.",
    start_datetime: "2025-10-29T14:00:00",
    attachment_name: "details.pdf",
  };

  // Use demo data if no real data provided
  const displayAnnouncements = useMemo(() => {
    if (announcements && announcements.length > 0) return announcements;
    return demoAnnouncements;
  }, [announcements]);

  const displayNextEvent = useMemo(() => {
    if (nextEvent) return nextEvent;
    return demoNextEvent;
  }, [nextEvent]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openDropdown &&
        dropdownRefs.current[openDropdown] &&
        !dropdownRefs.current[openDropdown].contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  return (
    <>
      {/* MOBILE NEXT EVENT */}
      <div className="flex sm:hidden mb-3 flex-col gap-3">
        <div className="w-full bg-white/50 p-4 rounded-4xl">
          <h3 className="text-lg font-normal text-[#0F1D2E]">Next Event</h3>

          {loadingEvent ? (
            <div className="animate-pulse bg-white/50 rounded-[10px] p-3 mt-2">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 bg-white/50 shadow-sm rounded-[10px] px-2 py-2 mt-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-lg font-normal text-[#0F1D2E]">
                  {formatTime(displayNextEvent?.start_datetime)}
                </div>
                <div className="w-1 bg-[#F3BC48] h-9 rounded" />
                <div>
                  <p className="text-xs text-gray-400">
                    {formatEventDate(displayNextEvent?.start_datetime)}
                  </p>
                  <p className="text-sm font-normal text-[#0F1D2E]">
                    {displayNextEvent?.title}
                  </p>
                </div>
              </div>

              <hr className="border-black/10" />

              <p className="text-sm font-semibold text-[#1B1B1B]">
                {displayNextEvent?.description}
              </p>

              {displayNextEvent?.attachment_name && (
                <button className="flex items-center gap-2 bg-[#eff2f5] px-3 py-2 rounded-[60px] text-xs text-gray-700">
                  <img
                    src={pdfIcon}
                    alt="PDF"
                    className="size-[13px] object-cover"
                  />
                  <span className="font-semibold">{displayNextEvent.attachment_name}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="bg-white/50 rounded-3xl md:max-h-[723px] md:overflow-auto no-scrollbar px-3 sm:px-4 py-2 font-manrope sm:py-5 w-full">
        <h2 className="text-lg sm:text-xl font-manrope font-semibold mb-3">
          Announcements
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {loading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white/50 rounded-[20px] p-3 sm:p-5 shadow-sm animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-[54px] bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))
          ) : (
            displayAnnouncements.map((announcement) => {
              const attachmentInfo = getAttachmentInfo(announcement);
              return (
                <div
                  key={announcement.id}
                  className="bg-white/50 rounded-[20px] p-3 sm:p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={announcement.author?.profile_image || userImg}
                        alt={getAuthorName(announcement)}
                        className="size-[54px] rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm sm:text-base">
                          {getAuthorName(announcement)}
                        </p>
                        <p className="text-xs text-[#1B1B1B] opacity-50 font-medium">
                          {formatDate(announcement.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-black/10 my-2" />

                  {announcement.title && (
                    <h3 className="font-medium text-lg sm:text-2xl mb-2">
                      {announcement.title}
                    </h3>
                  )}

                  {(announcement.content || announcement.description) && (
                    <p className="text-sm sm:text-base font-medium opacity-80 mb-3">
                      {announcement.content || announcement.description}
                    </p>
                  )}

                  {attachmentInfo && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-[60px] cursor-pointer">
                        <img
                          src={attachmentInfo.img}
                          alt={attachmentInfo.name}
                          className="size-[30px] rounded-full object-cover"
                        />
                        <span className="text-sm font-bold text-black opacity-70 truncate">
                          {attachmentInfo.name}
                        </span>
                        <span className="text-gray-400">×</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}

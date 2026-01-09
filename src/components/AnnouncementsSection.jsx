"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X } from "lucide-react";
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
  const [viewMoreAnnouncement, setViewMoreAnnouncement] = useState(null);
  const [viewMoreEvent, setViewMoreEvent] = useState(false); 
  const dropdownRefs = useRef({});

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
  // Get author avatar
  const getAuthorAvatar = (announcement) => {
    if (announcement.author?.avatar) {
      return announcement.author.avatar;
    }
    if (announcement.author?.first_name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(announcement.author.first_name)}&background=F3BC48&color=0F1D2E`;
    }
    return userImg;
  };

  // Get attachment info
  const getAttachmentInfo = (announcement) => {
    if (!announcement.attachments || announcement.attachments.length === 0) return null;
    const attachment = announcement.attachments[0];
    const isImage = attachment.file_type === 'image' || 
                    attachment.file_type === 'IMAGE' ||
                    attachment.type?.startsWith('image/') ||
                    attachment.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                    attachment.mime_type?.startsWith('image/');
    
    return {
      name: attachment.file_name || attachment.name || 'attachment',
      url: attachment.file_path || attachment.url,
      isImage,
      img: isImage ? (attachment.file_path || attachment.url || teamList1) : teamList,
    };
  };

  const renderContentWithViewMore = (content, announcementId) => {
    if (!content) return null;
    
    const maxLength = 500;
    const shouldShowViewMore = content.length > maxLength;
    
    return (
      <div className="mb-3">
        <p className="text-sm sm:text-base font-medium opacity-80">
          {shouldShowViewMore ? `${content.substring(0, maxLength)}...` : content}
        </p>
        {shouldShowViewMore && (
          <button
            onClick={() => setViewMoreAnnouncement(announcementId)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-1"
          >
            View More
          </button>
        )}
      </div>
    );
  };

  // Function to render event description with "View More" for mobile 
  const renderEventDescriptionWithViewMore = (description) => {
    if (!description) return null;
    
    const maxLength = 400; 
    const shouldShowViewMore = description.length > maxLength;
    
    return (
      <div>
        <p className="text-sm font-semibold text-[#1B1B1B]">
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
      content: "New team jerseys have arrived! You can pick them up from the front desk. We have sizes ranging from small to extra large. Please try them on for fit before taking them home. The jerseys are made of moisture-wicking material and feature our new team logo. If you need a different size, please let me know by Friday. Also, remember to wash them in cold water and hang dry to preserve the colors and logo. We'll be wearing these for the upcoming tournament, so make sure you have yours ready! Additional information about jersey care and maintenance will be provided in a separate document. This is a very long description to test the view more button functionality. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      attachments: [{ name: "image-2.jpg", type: "image/jpeg" }],
    },
    {
      id: 3,
      author: { first_name: "Martinez" },
      created_at: "2025-10-27T10:30:00",
      title: "Registration Deadline",
      content: "Reminder: Registration for next month closes this Friday. Make sure your account is up to date! lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Reminder: Registration for next month closes this Friday. Make sure your account is up to date! lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Reminder: Registration for next month closes this Friday. Make sure your account is up to date! lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Reminder: Registration for next month closes this Friday. Make sure your account is up to date! lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];

  const demoNextEvent = {
    title: "Tournament Day",
    description: "Annual soccer tournament. All teams will compete. Please arrive 30 minutes early for warm-up. This is a very important event for our team. We've been preparing for months and this is our chance to showcase our skills. Make sure to bring your complete gear including cleats, shin guards, and water bottles. We'll have a team meeting 15 minutes before the match to discuss strategy. Parents are welcome to attend and cheer for the team. After the tournament, we'll have a small celebration at the clubhouse. Please let the coach know if you have any dietary restrictions. This tournament is part of the regional championship series, and winning could qualify us for the state finals. We need everyone's best effort and team spirit. Remember, it's not just about winning, but about playing with honor and sportsmanship. Good luck to all players! May the best team win. Annual soccer tournament. All teams will compete. Please arrive 30 minutes early for warm-up. This is a very important event for our team. We've been preparing for months and this is our chance to showcase our skills. Make sure to bring your complete gear including cleats, shin guards, and water bottles.",
    start_datetime: "2025-10-29T14:00:00",
    attachment_name: "details.pdf",
  };

  // Use demo data if no real data provided
  const displayAnnouncements = useMemo(() => {
    if (announcements && announcements.length > 0) return announcements;
    return demoAnnouncements;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcements]);

  const displayNextEvent = useMemo(() => {
    if (nextEvent) return nextEvent;
    return demoNextEvent;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextEvent]);

  // Find announcement by ID for view more modal
  const getAnnouncementById = (id) => {
    return displayAnnouncements.find(ann => ann.id === id);
  };

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
        <div className="w-full bg-white/50 p-4 rounded-3xl">
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

              {renderEventDescriptionWithViewMore(displayNextEvent?.description)}

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
        <h2 className="text-lg sm:text-xl font-manrope font-semibold  mb-3">
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
              const content = announcement.content || announcement.description || '';
              
              return (
                <div
                  key={announcement.id}
                  className="bg-white/50 rounded-[20px] p-3 sm:p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={getAuthorAvatar(announcement)}
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

                  {content && renderContentWithViewMore(content, announcement.id)}

                  {attachmentInfo && (
                    <div className="flex items-center gap-2">
                      <a
                        href={attachmentInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-[60px] cursor-pointer hover:bg-gray-50 transition"
                      >
                        <img
                          src={attachmentInfo.img}
                          alt={attachmentInfo.name}
                          className="size-[30px] rounded-full object-cover"
                        />
                        <span className="text-sm font-bold text-black opacity-70 truncate max-w-[150px]">
                          {attachmentInfo.name}
                        </span>
                        <span className="text-gray-400">×</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* View More Modal for Long Descriptions */}
      {viewMoreAnnouncement && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-manrope font-semibold text-[#0F1D2E]">
                Announcement Details
              </h2>
              <button
                onClick={() => setViewMoreAnnouncement(null)}
                className="w-10 h-10 rounded-full border border-border-light flex items-center justify-center hover:bg-gray-50 transition"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Content - Fixed height with scrollable description */}
            <div className="flex-1 overflow-hidden">
              {/* Get the announcement details */}
              {(() => {
                const announcement = getAnnouncementById(viewMoreAnnouncement);
                if (!announcement) return null;

                return (
                  <div className="h-full flex flex-col">
                    {/* Fixed author info */}
                    <div className="px-6 py-4 border-b border-border-light flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img
                            src={getAuthorAvatar(announcement)}
                            alt={getAuthorName(announcement)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-manrope font-semibold text-[#0F1D2E]">
                            {getAuthorName(announcement)}
                          </p>
                          <p className="text-sm text-gray-500 font-manrope">
                            {formatDate(announcement.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fixed title */}
                    {announcement.title && (
                      <div className="px-6 py-4 border-b border-border-light flex-shrink-0">
                        <h3 className="text-2xl font-manrope font-semibold text-[#0F1D2E]">
                          {announcement.title}
                        </h3>
                      </div>
                    )}

                    {/* Scrollable description */}
                    <div className="flex-1 overflow-y-auto max-sm:max-h-72 max-h-80 px-6 py-4">
                      <div className="text-[#1b1b1b] opacity-80 font-manrope leading-relaxed whitespace-pre-wrap">
                        {renderTextWithLinks(announcement.content || announcement.description || '')}
                      </div>
                    </div>

                    {/* Fixed attachments section */}
                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <div className="px-6 py-4 border-t border-border-light bg-gray-50 flex-shrink-0">
                        <p className="text-sm font-manrope font-semibold text-gray-600 mb-3">
                          Attachments ({announcement.attachments.length})
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {announcement.attachments.map((attachment, index) => {
                            const isImage = attachment.file_type === 'image' || 
                                          attachment.file_type === 'IMAGE' ||
                                          attachment.type?.startsWith('image/') ||
                                          attachment.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                                          attachment.mime_type?.startsWith('image/');
                            
                            return (
                              <a
                                key={index}
                                href={attachment.file_path || attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-white hover:bg-gray-100 rounded-lg px-4 py-2 transition cursor-pointer border border-border-light"
                              >
                                <img
                                  src={isImage ? (attachment.file_path || attachment.url || teamList1) : teamList}
                                  alt={attachment.file_name || attachment.name || 'attachment'}
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <span className="font-manrope text-sm text-gray-700 max-w-[150px] truncate">
                                  {attachment.file_name || attachment.name || 'attachment'}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-border-light px-6 py-4 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setViewMoreAnnouncement(null)}
                className="px-6 py-2 font-manrope rounded-full border border-border-light font-semibold text-[#0F1D2E] hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View More Modal for Mobile Event Description */}
      {viewMoreEvent && displayNextEvent && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 sm:hidden">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
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

            {/* description */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full flex flex-col">
                {/*  event info */}
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
                        <p className="font-manrope font-semibold text-[#0F1D2E]">
                          {displayNextEvent?.title}
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

                {/*  description */}
                <div className="flex-1 overflow-y-auto max-h-64 px-6 py-4">
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
                        src={pdfIcon}
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
    </>
  );
}
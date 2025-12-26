import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, FileText, X, Image as ImageIcon } from 'lucide-react';

/**
 * CoachAnnouncementItem - Individual announcement card
 * Matches Figma design: Avatar, user info, menu, title, content, attachments
 */
const CoachAnnouncementItem = ({
  announcement,
  onEdit,
  onDelete,
  currentUserId
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get author name
  const getAuthorName = () => {
    if (announcement.author?.first_name) {
      return `${announcement.author.role === 'coach' ? 'Coach ' : ''}${announcement.author.first_name}`;
    }
    return 'Coach';
  };

  // Default avatar placeholder
  const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(getAuthorName()) + '&background=F3BC48&color=0F1D2E';

  // Check if current user is author (can edit/delete)
  const isAuthor = currentUserId && announcement.author?.id === currentUserId;

  // Determine attachment type and render
  const renderAttachment = (attachment) => {
    if (!attachment) return null;

    const isImage = attachment.type?.startsWith('image/') ||
      attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isImage) {
      return (
        <div className="flex items-center justify-between bg-white/50 rounded-[40px] pl-[9px] pr-[20px] py-[10px] w-[183px] overflow-hidden">
          <div className="w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0">
            <img
              src={attachment.url || attachment.thumbnail}
              alt={attachment.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-manrope font-medium text-[14px] leading-[1.6] text-black opacity-70 truncate ml-2">
            {attachment.name || 'image.jpg'}
          </span>
          <X size={12} className="text-[#8796AF] ml-2 flex-shrink-0 cursor-pointer" />
        </div>
      );
    }

    // PDF or other file
    return (
      <div className="flex items-center justify-between bg-white/50 rounded-[40px] pl-[16px] pr-[20px] py-[10px] w-[183px] overflow-hidden">
        <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
          <div className="relative">
            <div className="w-[33.5px] h-[30.747px] bg-[#F9EFCD] rounded-[20px]"></div>
            <FileText size={20} className="absolute top-[5px] left-[7px] text-[#0F1D2E]" />
          </div>
        </div>
        <span className="font-manrope font-bold text-[14px] leading-[1.6] text-black opacity-70 truncate ml-2">
          {attachment.name || 'file.pdf'}
        </span>
        <X size={12} className="text-[#8796AF] ml-2 flex-shrink-0 cursor-pointer" />
      </div>
    );
  };

  return (
    <div className="bg-white/50 rounded-[20px] p-[20px] flex flex-col gap-[14px]">
      {/* User Info Header */}
      <div className="flex items-center justify-between pb-[15px] border-b border-text-body border-opacity-20 ">
        {/* User Details */}
        <div className="flex items-center gap-[10px]">
          {/* Avatar */}
          <div className="w-[54px] h-[54px] rounded-full overflow-hidden">
            <img
              src={announcement.author?.avatar || defaultAvatar}
              alt={getAuthorName()}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Name and Date */}
          <div className="flex flex-col leading-[1.5]">
            <p className="font-kollektif font-bold text-[16px] text-black opacity-80 tracking-[-0.16px]">
              {getAuthorName()}
            </p>
            <p className="font-manrope font-semibold text-[14px] text-[#1B1B1B] opacity-50 tracking-[-0.14px]">
              {formatDate(announcement.created_at)}
            </p>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-[54px] h-[54px] rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition-colors"
          >
            <MoreVertical size={26} className="text-[#0F1D2E] rotate-90" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-[12px] shadow-lg border border-gray-100 py-2 z-50 min-w-[120px]">
              {isAuthor && onEdit && (
                <button
                  onClick={() => {
                    onEdit(announcement);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[14px] font-manrope hover:bg-gray-50"
                >
                  Edit
                </button>
              )}
              {isAuthor && onDelete && (
                <button
                  onClick={() => {
                    onDelete(announcement);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[14px] font-manrope text-red-600 hover:bg-gray-50"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full text-left px-4 py-2 text-[14px] font-manrope hover:bg-gray-50"
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Announcement Content */}
      <div className="flex flex-col gap-[10px]">
        <p className="font-manrope font-semibold text-[24px] leading-[1.5] text-[#0F1D2E] tracking-[-0.24px]">
          {announcement.title}
        </p>
        <p className="font-manrope font-semibold text-[16px] leading-[1.5] text-[#1B1B1B] opacity-80 tracking-[-0.16px]">
          {announcement.content}
        </p>
      </div>

      {/* Attachments */}
      {announcement.attachments && announcement.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {announcement.attachments.map((attachment, index) => (
            <div key={index}>
              {renderAttachment(attachment)}
            </div>
          ))}
        </div>
      )}

      {/* Single attachment (legacy support) */}
      {announcement.attachment_url && !announcement.attachments && (
        renderAttachment({
          url: announcement.attachment_url,
          name: announcement.attachment_name || 'attachment',
          type: announcement.attachment_type
        })
      )}
    </div>
  );
};

export default CoachAnnouncementItem;

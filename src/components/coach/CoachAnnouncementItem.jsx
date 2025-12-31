import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, FileText, Eye, Edit2, Trash2, X, Download } from 'lucide-react';
import { getFileUrl } from '../../api/config';

/**
 * CoachAnnouncementItem - Individual announcement card
 * Matches Figma design: Avatar, user info, menu, title, content, attachments
 * @param {Object} announcement - Announcement data
 * @param {Function} onEdit - Edit callback (coach only)
 * @param {Function} onDelete - Delete callback (coach only)
 * @param {Function} onViewDetails - View details callback
 * @param {string} currentUserId - Current user ID
 * @param {string} userRole - User role ('coach' or 'parent')
 */
const CoachAnnouncementItem = ({
  announcement,
  onEdit,
  onDelete,
  onViewDetails,
  currentUserId,
  userRole = 'parent'
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const menuRef = useRef(null);
  const isCoach = userRole === 'coach';

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

  // Parse text and make URLs clickable
  const renderTextWithLinks = (text) => {
    if (!text) return null;

    // URL regex pattern
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

  // Determine attachment type and render
  const renderAttachment = (attachment) => {
    if (!attachment) return null;

    // Map backend fields to expected format and construct full URL
    const rawPath = attachment.url || attachment.file_path;
    const url = getFileUrl(rawPath);
    const name = attachment.name || attachment.file_name;
    const type = attachment.type || attachment.mime_type || attachment.file_type;

    // Check if it's an image
    const isImage = type === 'image' || type === 'IMAGE' ||
      type?.startsWith('image/') ||
      url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    const handleClick = () => {
      setPreviewAttachment({ url, name, type, isImage });
    };

    if (isImage) {
      return (
        <button
          onClick={handleClick}
          className="flex items-center justify-between bg-white/50 rounded-[40px] pl-[9px] pr-[20px] py-[10px] w-[183px] overflow-hidden hover:bg-white/70 transition-colors cursor-pointer"
        >
          <div className="w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0">
            <img
              src={url}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-manrope font-medium text-[14px] leading-[1.6] text-black opacity-70 truncate ml-2">
            {name || 'image.jpg'}
          </span>
        </button>
      );
    }

    // PDF or other file
    return (
      <button
        onClick={handleClick}
        className="flex items-center justify-between bg-white/50 rounded-[40px] pl-[16px] pr-[20px] py-[10px] w-[183px] overflow-hidden hover:bg-white/70 transition-colors cursor-pointer"
      >
        <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
          <div className="relative">
            <div className="w-[33.5px] h-[30.747px] bg-[#F9EFCD] rounded-[20px]"></div>
            <FileText size={20} className="absolute top-[5px] left-[7px] text-[#0F1D2E]" />
          </div>
        </div>
        <span className="font-manrope font-bold text-[14px] leading-[1.6] text-black opacity-70 truncate ml-2">
          {name || 'file.pdf'}
        </span>
      </button>
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
            <div className="absolute right-0 top-full mt-2 bg-white rounded-[12px] shadow-lg border border-gray-100 py-1 z-50 min-w-[160px]">
              {/* View Details - Available for everyone */}
              <button
                onClick={() => {
                  if (onViewDetails) onViewDetails(announcement);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-[14px] font-manrope hover:bg-gray-50 flex items-center gap-3"
              >
                <Eye size={16} className="text-gray-500" />
                View Details
              </button>

              {/* Edit - Coach only */}
              {isCoach && onEdit && (
                <button
                  onClick={() => {
                    onEdit(announcement);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-[14px] font-manrope hover:bg-gray-50 flex items-center gap-3"
                >
                  <Edit2 size={16} className="text-gray-500" />
                  Edit
                </button>
              )}

              {/* Delete - Coach only */}
              {isCoach && onDelete && (
                <button
                  onClick={() => {
                    onDelete(announcement);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-[14px] font-manrope text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <Trash2 size={16} className="text-red-500" />
                  Delete
                </button>
              )}
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
          {renderTextWithLinks(announcement.description || announcement.content)}
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

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center gap-3">
                {previewAttachment.isImage ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden">
                    <img src={previewAttachment.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-[#F9EFCD] rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-[#0F1D2E]" />
                  </div>
                )}
                <div>
                  <p className="font-manrope font-semibold text-[#0F1D2E] truncate max-w-[300px]">
                    {previewAttachment.name}
                  </p>
                  <p className="text-xs text-gray-500 font-manrope">
                    {previewAttachment.isImage ? 'Image' : 'Document'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewAttachment.url}
                  download={previewAttachment.name}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                  title="Download"
                >
                  <Download size={18} className="text-gray-600" />
                </a>
                <button
                  onClick={() => setPreviewAttachment(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] flex items-center justify-center bg-gray-100">
              {previewAttachment.isImage ? (
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              ) : (
                <iframe
                  src={previewAttachment.url}
                  title={previewAttachment.name}
                  className="w-full h-[70vh] rounded-lg bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachAnnouncementItem;

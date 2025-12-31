import React from 'react';
import { ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFileUrl } from '../../api/config';

/**
 * CoachPhotosCard - Photo gallery preview with overlay and navigation
 * Matches Figma design: Full-width image, gradient overlay, title/date in bottom-left
 */
const CoachPhotosCard = ({ photo, albumTitle, date, loading = false }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get photo URL - use getFileUrl to handle API endpoint URLs
  const rawPhotoUrl = photo?.url || photo?.image_url || photo?.thumbnail_url || null;
  const photoUrl = rawPhotoUrl ? getFileUrl(rawPhotoUrl) : null;

  if (loading) {
    return (
      <div className="relative w-full h-[419px] rounded-[30px] overflow-hidden bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/55"></div>
      </div>
    );
  }

  // Empty state when no photo
  if (!photoUrl) {
    return (
      <div className="relative w-full h-[419px] rounded-[30px] overflow-hidden bg-white/50 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <ImageIcon size={40} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-[#173151] mb-2">No photos yet</h3>
        <p className="text-gray-500 text-sm mb-4">Upload photos to share with parents</p>
        <Link
          to="/Gallery"
          className="flex items-center gap-2 bg-[#F3BC48] hover:bg-[#e5a920] px-4 py-2 rounded-full transition-colors"
        >
          <span className="font-manrope font-semibold text-black">Upload Photos</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[419px] rounded-[30px] overflow-hidden group">
      {/* Background Image */}
      <img
        src={photoUrl}
        alt={albumTitle || 'Program Photos'}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55"></div>

      {/* Arrow Button (top-right) */}
      <Link
        to="/Gallery"
        className="absolute top-[10px] right-[10px] w-[54px] h-[54px] xl:w-[80px] xl:h-[80px] rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition-colors"
      >
        <ArrowUpRight style={{width:"35px", height:"35px"}} className="text-white" />
      </Link>

      {/* Title and Date (bottom-left) */}
      <div className="absolute bottom-[20px] left-[20px]">
        <p className="font-manrope font-bold text-[20px] leading-[1.5] text-white tracking-[-0.2px]">
          {albumTitle || 'Program Photos'}
        </p>
        {(date || photo?.created_at) && (
          <p className="font-manrope font-normal text-[19.529px] leading-normal text-white opacity-70">
            {formatDate(date || photo?.created_at)}
          </p>
        )}
      </div>
    </div>
  );
};

export default CoachPhotosCard;

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  // Default placeholder image
  const defaultImage = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80';

  if (loading) {
    return (
      <div className="relative w-full h-[419px] rounded-[30px] overflow-hidden bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/55"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[419px] rounded-[30px] overflow-hidden group">
      {/* Background Image */}
      <img
        src={photo?.url || photo?.image_url || defaultImage}
        alt={albumTitle || 'Program Photos'}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55"></div>

      {/* Arrow Button (top-right) */}
      <Link
        to="/Gallery"
        className="absolute top-[10px] right-[10px] w-[54px] h-[54px] rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-colors"
      >
        <ArrowUpRight size={14} className="text-white" />
      </Link>

      {/* Title and Date (bottom-left) */}
      <div className="absolute bottom-[20px] left-[20px]">
        <p className="font-manrope font-bold text-[20px] leading-[1.5] text-white tracking-[-0.2px]">
          {albumTitle || 'Program Photos'}
        </p>
        <p className="font-manrope font-normal text-[19.529px] leading-normal text-white/72">
          {formatDate(date || photo?.created_at)}
        </p>
      </div>
    </div>
  );
};

export default CoachPhotosCard;

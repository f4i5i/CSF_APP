import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

/**
 * ProgramPhotoCard Component
 * Displays a featured program photo with title, date, and navigation
 * Clicking navigates to the photos gallery page
 */
export default function ProgramPhotoCard({ photo, loading = false }) {
  if (loading) {
    return (
      <div className="relative w-full aspect-[343/648] max-h-[648px] rounded-[30px] bg-white/50 animate-pulse">
        <div className="absolute inset-0 bg-gray-200/30 rounded-[30px]" />
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="relative w-full aspect-[343/648] max-h-[648px] rounded-[30px] bg-white/50 flex items-center justify-center">
        <p className="text-gray-500 font-manrope">No photos available</p>
      </div>
    );
  }

  const imageUrl = photo?.url || photo?.photo_url || photo?.image || 'https://via.placeholder.com/343x648';
  const title = photo?.title || 'Program Photos';
  const date = photo?.date || photo?.created_at || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Link
      to="/photos"
      className="relative w-full aspect-[343/648] max-h-[648px] rounded-[30px] overflow-hidden group block"
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/432x648?text=No+Image';
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <h3 className="font-manrope font-bold text-[20px] leading-[1.5] tracking-[-0.2px] mb-1">
          {title}
        </h3>
        <p className="font-manrope font-normal text-[19.529px] leading-normal text-white/72">
          {date}
        </p>
      </div>

      {/* Arrow Button */}
      <div className="absolute top-5 right-5 w-[54px] h-[54px] bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
        <ArrowUpRight size={20} className="text-white" />
      </div>
    </Link>
  );
}

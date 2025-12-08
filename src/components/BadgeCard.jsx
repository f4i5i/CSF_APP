import { useState } from 'react';
import { ArrowLeft, ArrowRight, Award } from 'lucide-react';

const CARD_BASE = 'w-full h-full max-sm:w-full';
const CARD_MIN_HEIGHT = 'min-h-[454px]';

const BadgeCard = ({ badges = [], loading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Loading state
  if (loading) {
    return (
      <div className={`${CARD_BASE} ${CARD_MIN_HEIGHT} bg-[#FFFFFF50] rounded-[30px] shadow-sm flex flex-col justify-between px-4 py-6 animate-pulse`}>
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="flex justify-center items-center w-full h-[150px]">
          <div className="w-[150px] h-[150px] bg-gray-200 rounded-full"></div>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="flex items-center justify-between w-full mt-auto pt-10">
          <div className="p-4 bg-gray-200 rounded-full w-12 h-12"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
          <div className="p-4 bg-gray-200 rounded-full w-12 h-12"></div>
        </div>
      </div>
    );
  }

  // Empty state - no badges
  if (!badges || badges.length === 0) {
    return (
      <div className={`${CARD_BASE} ${CARD_MIN_HEIGHT} bg-[#FFFFFF50] rounded-[30px] shadow-sm flex flex-col items-center justify-center text-gray-500 px-4 py-6`}>
        <Award className="w-16 h-16 mb-3 text-gray-300" />
        <h3 className="text-lg xxl1:text-xl font-semibold text-gray-700 mb-1">No Badges Yet</h3>
        <p className="text-sm xxl1:text-base text-center text-gray-500">
          Keep attending and participating to earn badges!
        </p>
      </div>
    );
  }

  // Current badge
  const currentBadge = badges[currentIndex];

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? badges.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === badges.length - 1 ? 0 : prev + 1));
  };

  // Format earned date
  const formatEarnedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get badge icon/emoji based on type
  const getBadgeIcon = (type) => {
    const iconMap = {
      attendance: '📅',
      achievement: '🏆',
      skill: '⚡',
      participation: '🎯',
      leadership: '👑',
      teamwork: '🤝',
      sportsmanship: '🌟',
      improvement: '📈',
      milestone: '🎖️',
      default: '🏅',
    };
    return iconMap[type?.toLowerCase()] || iconMap.default;
  };

  return (
    <div className={`${CARD_BASE} ${CARD_MIN_HEIGHT} bg-[#FFFFFF50] rounded-[30px] shadow-sm flex flex-col justify-between px-4 py-6 relative`}>
      <div className="h-full justify-between flex flex-col gap-6">
        {/* Title */}
        <h2 className="text-[20px] items-start justify-start text-start font-semibold font-manrope text-[#1b1b1b]">
          Earned Badges
        </h2>

        {/* Badge Image/Icon */}
        <div className="flex justify-center items-center w-full h-[150px]">
          {currentBadge.icon_url ? (
            <img
              src={currentBadge.icon_url}
              alt={currentBadge.name}
              className="w-[150px] h-[150px] object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`${
              currentBadge.icon_url ? 'hidden' : 'flex'
            } w-[150px] h-[150px] bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full items-center justify-center text-7xl shadow-lg`}
            style={{ display: currentBadge.icon_url ? 'none' : 'flex' }}
          >
            {getBadgeIcon(currentBadge.badge_type || currentBadge.type)}
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          {/* Badge Title */}
          <h3 className="text-[20px] font-semibold font-manrope text-[#1b1b1b] text-center">
            {currentBadge.name || currentBadge.title || 'Achievement Badge'}
          </h3>

          {/* Badge Description */}
          <p className="text-[14px] font-medium font-manrope text-[#0f1d2e] mt-1 text-center px-2">
            {currentBadge.description || 'Keep up the great work!'}
          </p>

          {/* Earned Date */}
          {currentBadge.earned_at && (
            <p className="text-[12px] font-normal font-manrope text-gray-500 mt-2">
              Earned on {formatEarnedDate(currentBadge.earned_at)}
            </p>
          )}

          {/* Badge Type Badge */}
          {currentBadge.badge_type && (
            <span className="mt-2 px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
              {currentBadge.badge_type}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Pagination - Counter Only */}
      <div className="flex items-center justify-center w-full mt-auto pt-10">
        <span className="text-[14px] font-medium text-gray-700">
          {currentIndex + 1}/{badges.length}
        </span>
      </div>

      {/* Navigation Arrows - Positioned on Sides */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-[#FFFFFF80] rounded-full hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={badges.length <= 1}
        aria-label="Previous badge"
      >
        <ArrowLeft size={20} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-[#FFFFFF80] rounded-full hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={badges.length <= 1}
        aria-label="Next badge"
      >
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default BadgeCard;

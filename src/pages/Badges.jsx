import React, { useMemo } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BadgeCard from '../components/attendence/BadgeCard'

// Hooks
import { useChildren, useApi } from '../hooks';

// Services
import { badgesService, enrollmentsService } from '../api/services';

const Badges = () => {
  // Get selected child from context
  const { selectedChild } = useChildren();

  // Get first active enrollment for the selected child
  const { data: enrollmentsData, error: enrollmentsError } = useApi(
    () => enrollmentsService.getMy({
      child_id: selectedChild?.id,
      status: 'active',
    }),
    {
      initialData: [],
      dependencies: [selectedChild?.id],
      autoFetch: !!selectedChild?.id,
      onError: (err) => console.error('Failed to load enrollments:', err),
    }
  );

  const firstEnrollment = useMemo(() => {
    if (!enrollmentsData || enrollmentsData.length === 0) return null;
    return enrollmentsData.find(e => e.child_id === selectedChild?.id) || enrollmentsData[0];
  }, [enrollmentsData, selectedChild?.id]);

  // Fetch earned badges for the enrollment - child-based
  const { data: earnedBadgesData, loading: loadingBadges, error: badgesError } = useApi(
    () => badgesService.getByEnrollment(firstEnrollment?.id),
    {
      initialData: [],
      dependencies: [firstEnrollment?.id],
      autoFetch: !!firstEnrollment?.id,
      onError: (err) => console.error('Failed to load badges:', err),
    }
  );

  // Combined error state
  const hasError = enrollmentsError || badgesError;

  // Transform API badges to component format - child-based from API
  const badges = useMemo(() => {
    if (!earnedBadgesData) return [];
    // Handle both array and paginated response
    const badgesArray = Array.isArray(earnedBadgesData) ? earnedBadgesData : (earnedBadgesData.items || []);
    if (badgesArray.length === 0) return [];
    return badgesArray.map((badge, index) => ({
      title: badge.name || badge.title,
      subtitle: badge.earned_at
        ? `Achieved: ${new Date(badge.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : badge.description,
      icon: badge.icon_url || badge.image_url,
      active: index === 0,
    }));
  }, [earnedBadgesData]);

  // Locked badges - hardcoded/static
  const locked = [
    {
      title: "Perfect Attendance",
      desc: "Completed the sprint drill under 10 seconds",
    },
    {
      title: "Sharpshooter",
      desc: "Score 5 goals in a single match",
    },
    {
      title: "MVP",
      desc: "Named Most Valuable Player of the season",
    },
    {
      title: "Early Bird",
      desc: "Arrive early to practice 20 times",
    },
  ];
  return (
    // <div className=" min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
    <div className=" min-h-screen flex flex-col justify-between max-sm:h-fit bg-page-gradient opacity-8 max-sm:pb-20">

      <Header />
 <main className=" mx-6 py-8 max-sm:py-2 max-sm:mx-3">
      <h1 className="text-fluid-xl font-manrope font-medium text-[#173151] mb-4">
        Achievements
      </h1>

      {/* Error Alert */}
      {hasError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-manrope">
          <p className="font-medium">Unable to load badges</p>
          <p className="text-sm mt-1">Please try refreshing the page or check back later.</p>
        </div>
      )}

<div className="flex flex-wrap gap-4 max-sm:justify-center max-sm:px-2 py-2 mb-8">
        {loadingBadges ? (
          // Loading skeleton
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="w-[200px] h-[200px] max-sm:w-full bg-gray-200 rounded-2xl animate-pulse" />
          ))
        ) : badges.length > 0 ? (
          badges.map((badge, i) => (
            <BadgeCard key={i} {...badge} compact={false} />
          ))
        ) : (
          <div className="w-full text-center py-8 text-gray-500">
            No badges earned yet. Keep up the good work!
          </div>
        )}
      </div>

       {/* ✅ Locked Badges */}
      <h2 className="text-fluid-xl font-medium font-manrope  text-[#0F2D50] mb-1">
        Locked Badges
      </h2>
      <p className="text-black opacity-70  font-manrope text-fluid-md mt-2 mb-6">
        Keep working to unlock these achievements
      </p>
      {/* <div className="flex max-lg:grid max-lg:grid-cols-5 max-md:grid-cols-4 gap-6 max-sm:grid-cols-2 max-sm:grid  pb-12"> */}
      <div className="flex flex-wrap gap-4 max-sm:grid-cols-2 max-sm:grid pb-12">
        {locked.map((item, index) => (
          <div
            key={index}
            className="w-48 h-48 max-sm:w-full max-sm:h-48 relative p-3 bg-white/40 rounded-[20px]"
          >
            {/* Lock Icon Container */}
            <div className="w-14 h-14 px-3 pt-3 left-1/2 -translate-x-1/2 top-[25px] absolute bg-white rounded-full shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] inline-flex flex-col justify-start items-start">
              <div className="self-stretch h-8 relative overflow-hidden flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17 8h-1V6a4 4 0 00-8 0v2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2zM9 6a3 3 0 016 0v2H9V6zm8 14H7V10h10v10z"
                    fill="#6B7280"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="w-40 left-1/2 -translate-x-1/2 top-[100px] absolute">
              <p className="text-center text-zinc-900 text-base font-semibold font-manrope leading-6">
                {item.title}
              </p>
            </div>

            {/* Description */}
            <div className="w-32 left-1/2 -translate-x-1/2 top-[137px] absolute">
              <p className="text-center text-slate-900 text-xs font-medium font-manrope leading-4">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    

      </main>
      <Footer isFixed={false} mobileHidden={true} />
</div>
  )
}

export default Badges
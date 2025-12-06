import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Calendar from '../components/Calender';
import NextEvent from '../components/NextEvent';
import PhotoCard from '../components/PhotoCard';
import BadgeCard from '../components/BadgeCard';
import AnnouncementCard from '../components/announcements/AnnouncementCard';
import EnrollmentCard from '../components/EnrollmentCard';
import PaymentStatusCard from '../components/PaymentStatusCard';
import WaiversAlert from '../components/WaiversAlert';

// Hooks
import { useAuth } from '../context/auth';
import { useChildren, useApi } from '../hooks';

// Services
import {
  announcementsService,
  eventsService,
  photosService,
  badgesService,
  attendanceService,
  enrollmentsService,
  installmentsService,
  waiversService,
} from '../api/services';
import Calender1 from '../components/Calender1';

export default function Dashboard() {
  // 1. User from auth context
  const { user } = useAuth();

  // 2. Children data
  const {
    children,
    selectedChild,
    selectChild,
    loading: loadingChildren,
    error: childrenError,
  } = useChildren();

  // Debug: Log children data
  console.log('Dashboard - Children Debug:', {
    children,
    childrenCount: children?.length,
    loadingChildren,
    childrenError,
    selectedChild
  });

  // 3. Announcements - Fetch for selected child's class
  const classId = selectedChild?.enrollments?.[0]?.class_id;
  const { data: announcements = [], loading: loadingAnnouncements } = useApi(
    () => announcementsService.getAll({ class_id: classId }),
    {
      initialData: [],
      dependencies: [classId],
      autoFetch: !!classId,
    }
  );

  // 4 & 5. Events - Will be loaded after we have enrollment with class_id
  // (Moved below after enrollment is fetched)

  // 6. Active enrollments (only if child selected) - MUST BE BEFORE enrollment-dependent calls
  const { data: enrollmentsData, loading: loadingEnrollments } = useApi(
    () =>
      enrollmentsService.getMy({
        child_id: selectedChild?.id,
        status: 'active',
      }),
    {
      initialData: [],
      dependencies: [selectedChild?.id],
      autoFetch: !!selectedChild,
    }
  );

  // Filter enrollments by selected child (client-side filtering as backup)
  const activeEnrollments = useMemo(() => {
    if (!enrollmentsData || !selectedChild) return [];

    // If API returns all enrollments for all children, filter by selected child
    const filtered = enrollmentsData.filter(
      enrollment => enrollment.child_id === selectedChild.id
    );

    console.log('Dashboard - Enrollments Filtering:', {
      rawEnrollments: enrollmentsData,
      selectedChildId: selectedChild.id,
      filteredEnrollments: filtered,
      filteredCount: filtered.length
    });

    return filtered;
  }, [enrollmentsData, selectedChild]);

  // Debug: Log enrollments data
  console.log('Dashboard - Enrollments Debug:', {
    enrollmentsData,
    activeEnrollments,
    enrollmentsCount: activeEnrollments?.length,
    loadingEnrollments,
    selectedChildId: selectedChild?.id,
    willFetch: !!selectedChild
  });

  // Get first active enrollment for enrollment-based data
  const firstEnrollment = useMemo(() => {
    return activeEnrollments?.[0] || null;
  }, [activeEnrollments]);

  // 7. Recent photos (only if enrollment has class)
  const { data: recentPhotos, loading: loadingPhotos } = useApi(
    () => photosService.getByClass(firstEnrollment?.class?.id, { limit: 6 }),
    {
      initialData: [],
      dependencies: [firstEnrollment?.class?.id],
      autoFetch: !!firstEnrollment?.class?.id,
    }
  );

  // 8. Badges (only if enrollment exists)
  const { data: badges, loading: loadingBadges } = useApi(
    () => badgesService.getByEnrollment(firstEnrollment?.id),
    {
      initialData: [],
      dependencies: [firstEnrollment?.id],
      autoFetch: !!firstEnrollment?.id,
    }
  );

  // 9. Attendance stats (only if enrollment exists)
  const { data: attendanceStats } = useApi(
    () => attendanceService.getStreak(firstEnrollment?.id),
    {
      dependencies: [firstEnrollment?.id],
      autoFetch: !!firstEnrollment?.id,
    }
  );

  // 10. Events for class (only if enrollment has class)
  const { data: classEvents, loading: loadingEvents } = useApi(
    () => eventsService.getByClass(firstEnrollment?.class?.id),
    {
      initialData: [],
      dependencies: [firstEnrollment?.class?.id],
      autoFetch: !!firstEnrollment?.class?.id,
    }
  );

  // Get upcoming events from class events (filter and sort on frontend)
  const upcomingEvents = useMemo(() => {
    if (!classEvents) return [];
    const now = new Date();
    return classEvents
      .filter(event => new Date(event.start_datetime) >= now)
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
      .slice(0, 3);
  }, [classEvents]);

  // Get this month's events (for calendar)
  const calendarEvents = useMemo(() => {
    if (!classEvents) return [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return classEvents.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  }, [classEvents]);

  // 11. Payment summary
  const { data: paymentSummary, loading: loadingPayments } = useApi(
    () => installmentsService.getSummary(),
    {
      initialData: null,
    }
  );

  // 11. Pending waivers
  const { data: pendingWaivers, loading: loadingWaivers } = useApi(
    () => waiversService.getPending(),
    {
      initialData: [],
    }
  );

  // Handle child selection
  const handleChildChange = (e) => {
    const childId = e.target.value;
    const child = children.find((c) => c.id === childId);
    if (child) {
      selectChild(child);
    }
  };

  // Get school name from child's nested enrollment
  const getSchoolName = (child) => {
    // Get school from nested enrollments (new API structure)
    if (child?.enrollments && child.enrollments.length > 0) {
      return child.enrollments[0].school_name || '';
    }
    // Fallback to child's school field if it exists
    return child?.school || '';
  };

  // Get class days from child's nested enrollment weekdays
  const getClassDays = (child) => {
    // Get weekdays from nested enrollments (new API structure)
    if (child?.enrollments && child.enrollments.length > 0) {
      const weekdays = child.enrollments[0].weekdays;
      if (!weekdays || weekdays.length === 0) return '';

      // Capitalize first letter of each day
      return weekdays.map(day =>
        day.charAt(0).toUpperCase() + day.slice(1)
      ).join(', ');
    }
    return '';
  };

  // Computed values
  const attendanceStreak = attendanceStats?.current_streak || 0;
  const badgeCount = badges?.length || 0;
  const nextEvent = upcomingEvents?.[0] || null;
  const schoolName = getSchoolName(selectedChild);
  const classDays = getClassDays(selectedChild);

  // Recent badges (sorted by earned_at)
  const recentBadges = useMemo(() => {
    if (!badges || !Array.isArray(badges)) return [];
    return [...badges]
      .sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at))
      .slice(0, 4);
  }, [badges]);

  return (
    <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />

      <main className="mx-6 py-8 max-xxl:py-4 max-sm:py-2 max-sm:mx-3">
        {/* Subheader Section */}
        <div className="flex flex-row lg:flex-row items-center lg:items-center justify-between mb-6 max-xxl:mb-4 gap-4">
          {/* Welcome Message & Child Selector */}
          <div className="flex flex-col gap-4 max-xxl:gap-2 max-xl:gap-2">
            <div className="text-[46px] max-xxl:text-[32px] max-xl:text-[32px] max-sm:text-[24px] md:text-4xl text-[#173151] font-normal font-kollektif flex items-center gap-2">
              Welcome back, {user?.first_name || 'Parent'}! 👋
            </div>

            {/* Child Selector */}
            {loadingChildren ? (
              <div className="py-2 pr-4 pl-1 bg-gray-50 w-fit max-sm:text-xs max-xxl:text-sm text-base font-medium font-manrope sm:w-full rounded-full shadow animate-pulse">
                <div className="h-8 bg-gray-200 rounded-full max-sm:w-full w-64"></div>
              </div>
            ) : (
              <div className="py-2 pr-4 pl-1 bg-gray-50 w-fit max-sm:text-xs max-xxl:text-sm  text-base font-medium font-manrope sm:w-full rounded-full shadow text-[#1B1B1B] border border-gray-50">
                <select
                  className="px-4 bg-gray-50 text-base max-sm:text-xs max-xxl:text-sm font-medium max-sm:font-normal font-manrope sm:w-full border-none text-[#1B1B1B]"
                  value={selectedChild?.id || ''}
                  onChange={handleChildChange}
                  disabled={children.length === 0}
                >
                  {children.length === 0 ? (
                    <option>No children available</option>
                  ) : (
                    children.map((child) => {
                      const school = getSchoolName(child);
                      return (
                        <option key={child.id} value={child.id}>
                          {child.first_name} {child.last_name}
                          {school ? ` • ${school}` : ''}
                          {child.grade ? ` • Grade ${child.grade}` : ''}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-16 max-sm:hidden">
            <div className="text-start flex flex-col justify-between">
              <p className="text-[60px] max-xl:text-3xl font-kollektif font-normal text-[#0F1D2E]">
                {attendanceStreak}
              </p>
              <p className="text-black font-kollektif normal text-base">
                Attendance Streak
              </p>
            </div>
            <div className="text-start flex flex-col justify-between">
              <p className="text-[60px] max-xl:text-3xl font-kollektif font-normal text-[#0F1D2E]">
                {badgeCount}
              </p>
              <p className="text-black font-kollektif normal text-base">
                Badges Earned
              </p>
            </div>
          </div>
        </div>

        {/* Waivers Alert */}
        {/* <WaiversAlert
          pendingWaivers={pendingWaivers}
          loading={loadingWaivers}
        /> */}

        <div className="flex flex-col md:flex-row lg:flex-row gap-3">
          {/* Left Column */}
          <div className="col-span-2 max-sm:hidden space-y-3 w-[60%] ">
            {/* Announcements */}
            <div>
                         <div className="w-full bg-gray-50 rounded-[30px] shadow-sm p-6">
                   <h2 className="text-xl xl:text-xl lg:text-lg xxl:text-xl max-xxl:text-lg xxl1:text-2xl font-semibold font-manrope text-[#1b1b1b] mb-4">Announcements</h2>
                       <AnnouncementCard
                         announcements={announcements}
                         loading={loadingAnnouncements}
                       />
                       </div>
                       </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 grid grid-cols-1 xxl1:w-[50%]">
            {/* Calendar & Next Event */}
            <div className="bg-[#FFFFFF80] max-md:flex-col max-xxl:pb-3 px-6 rounded-[30px] lg:w-full flex gap-2">
              <div className="w-[40%] max-sm:hidden">
                <Calender1 events={calendarEvents} />
              </div>

             <div className="lg:w-[60%] max-sm:w-full max-sm:flex">

                <div className="pt-6 max-xxl:pt-4 w-full max-md:pb-4">
                  <h2 className="text-[20px] xxl1:text-2xl text-[#0F1D2E] max-xxl:text-lg pl-3  font-kollektif font-normal mb-4 max-xxl:mb-3">
                    Next Event
                  </h2>
                  <NextEvent event={nextEvent} loading={loadingEvents} />
                </div>
              </div>
            </div>

            {/* Mobile: Announcements */}
           <div className="col-span-2 hidden max-sm:flex max-sm:w-full space-y-6 w-full">
    
                         <div className="w-full max-sm:w-[100%] bg-gray-50 rounded-[30px] shadow-sm p-6">
                   <h2 className="text-xl font-semibold font-manrope text-[#1b1b1b] mb-4">Announcements</h2>
                       <AnnouncementCard
                         announcements={announcements}
                         loading={loadingAnnouncements}
                       />
                       </div>
                      
            </div>

            {/* Photos & Badges */}
            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
              <PhotoCard photos={recentPhotos} loading={loadingPhotos} />
              <BadgeCard badges={recentBadges} loading={loadingBadges} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

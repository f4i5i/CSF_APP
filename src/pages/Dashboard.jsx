import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Calendar from '../components/Calender';
import NextEvent from '../components/NextEvent';
import PhotoCard from '../components/PhotoCard';
import BadgeCard from '../components/BadgeCard';
import AnnouncementCard from '../components/announcements/AnnouncementCard';
import EnrollmentCard from '../components/EnrollmentCard';
import PaymentStatusCard from '../components/PaymentStatusCard';
import WaiversAlert from '../components/WaiversAlert';
import StatCard from '../components/dashboard/StatCard';
import ProgramPhotoCard from '../components/dashboard/ProgramPhotoCard';

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

  // We'll fetch announcements once we derive an accurate class_id below
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

  // Resolve class ID from enrollment or fallback to child's first enrollment
  const derivedClassId = useMemo(() => {
    if (firstEnrollment?.class?.id) return firstEnrollment.class.id;
    if (firstEnrollment?.class_id) return firstEnrollment.class_id;

    const childEnrollment = selectedChild?.enrollments?.find(
      (enrollment) => enrollment.status === 'active'
    ) || selectedChild?.enrollments?.[0];

    return (
      childEnrollment?.class?.id ||
      childEnrollment?.class_id ||
      null
    );
  }, [firstEnrollment, selectedChild]);

  // 3. Announcements - Fetch for derived class
  const { data: announcements = [], loading: loadingAnnouncements } = useApi(
    () => announcementsService.getAll({ class_id: derivedClassId }),
    {
      initialData: [],
      dependencies: [derivedClassId],
      autoFetch: !!derivedClassId,
    }
  );

  // 7. Recent photos (only if enrollment has class)
  const { data: recentPhotos, loading: loadingPhotos } = useApi(
    () => photosService.getByClass(derivedClassId, { limit: 6 }),
    {
      initialData: [],
      dependencies: [derivedClassId],
      autoFetch: !!derivedClassId,
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
    () => eventsService.getByClass(derivedClassId),
    {
      initialData: [],
      dependencies: [derivedClassId],
      autoFetch: !!derivedClassId,
    }
  );

  const { data: fallbackEvents = [], loading: loadingFallbackEvents } = useApi(
    () => eventsService.getUpcoming(5),
    {
      initialData: [],
      autoFetch: !derivedClassId,
      onError: (err) => console.warn('Failed to load upcoming events', err),
    }
  );

  const normalizeEvents = (events) => {
    const raw = Array.isArray(events) ? events : events?.items || [];
    return raw.map((event) => {
      if (event.start_datetime) return event;

      const { event_date, start_time, end_time } = event;
      const normalizeTime = (time) => {
        if (!time) return '00:00';
        const [h = '00', m = '00'] = time.split(':');
        const hour = Math.min(Math.max(parseInt(h, 10) || 0, 0), 23)
          .toString()
          .padStart(2, '0');
        const minute = Math.min(Math.max(parseInt(m, 10) || 0, 0), 59)
          .toString()
          .padStart(2, '0');
        return `${hour}:${minute}`;
      };

      const startIso = event_date
        ? `${event_date}T${normalizeTime(start_time)}:00`
        : new Date().toISOString();
      const endIso = event_date
        ? `${event_date}T${normalizeTime(end_time)}:00`
        : new Date().toISOString();

      return {
        ...event,
        start_datetime: startIso,
        end_datetime: endIso,
        type: event.event_type || event.type,
      };
    });
  };

  const sourceEvents = normalizeEvents(classEvents).length > 0
    ? normalizeEvents(classEvents)
    : normalizeEvents(fallbackEvents);

  // Get upcoming events from class events (filter and sort on frontend)
  const upcomingEvents = useMemo(() => {
    if (!sourceEvents) return [];
    const now = new Date();
    return sourceEvents
      .filter(event => new Date(event.start_datetime) >= now)
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
      .slice(0, 3);
  }, [sourceEvents]);

  // Get this month's events (for calendar)
  const calendarEvents = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (!sourceEvents || sourceEvents.length === 0) {
      return [];
    }

    return sourceEvents.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  }, [sourceEvents]);

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
  const nextEventLoading = derivedClassId ? loadingEvents : loadingFallbackEvents;
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
    <div className="min-h-screen max-sm:h-fit overflow-x-hidden bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />

      <main className="px-6 py-10 max-xxl:py-5 max-sm:py-6 max-sm:px-3 mt-8">
        <div className="w-full">
        {/* Subheader Section */}
        <div className="flex flex-row lg:flex-row items-start lg:items-start justify-between mb-6 max-xxl:mb-4 gap-4 max-sm:gap-10">
          {/* Welcome Message & Child Selector */}
          <div className="flex flex-col gap-1">
            <h1 className="text-fluid-2xl text-[#173151] font-kollektif font-normal leading-[1.002] tracking-[-0.02em] max-sm:ml-3">
              Welcome back, {user?.first_name || 'Parent'}! 👋
            </h1>

            {/* Child Selector */}
            {loadingChildren ? (
              <div className="py-2 px-3 bg-white/30 border border-[#e1e1e1] w-fit text-base font-medium font-manrope rounded-fluid-2xl animate-pulse max-sm:self-end max-sm:mr-2">
                <div className="h-6 bg-gray-200 rounded-full w-64"></div>
              </div>
            ) : (
              <div className="relative py-2 px-3 bg-white/30 border border-[#e1e1e1] w-fit text-base font-medium font-manrope rounded-[42px] text-[#1B1B1B] max-sm:self-end max-sm:mr-2 flex items-center gap-2">
                <select
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  value={selectedChild?.id || ''}
                  onChange={handleChildChange}
                  disabled={children.length === 0}
                >
                  {children.length === 0 ? (
                    <option>No children available</option>
                  ) : (
                    children.map((child) => {
                      const school = getSchoolName(child);
                      const childName = `${child.first_name || ''} ${child.last_name || ''}`.trim();
                      const childClassDays = getClassDays(child);
                      return (
                        <option key={child.id} value={child.id}>
                          {childName || 'Student'}
                          {school ? ` • ${school}` : ''}
                          {child.grade ? ` • Grade ${child.grade}` : ''}
                          {childClassDays ? ` • ${childClassDays}` : ''}
                        </option>
                      );
                    })
                  )}
                </select>
                <span className="font-manrope font-medium text-base text-[#1B1B1B] pointer-events-none">
                  {children.length > 0 && selectedChild ? (
                    <>
                      {`${selectedChild.first_name || ''} ${selectedChild.last_name || ''}`.trim() || 'Student'}
                      {getSchoolName(selectedChild) ? ` • ${getSchoolName(selectedChild)}` : ''}
                      {selectedChild.grade ? ` • Grade ${selectedChild.grade}` : ''}
                      {getClassDays(selectedChild) ? ` • ${getClassDays(selectedChild)}` : ''}
                    </>
                  ) : (
                    'No children available'
                  )}
                </span>
                <ChevronDown size={20} className="text-[#1B1B1B] pointer-events-none" />
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-[42px] max-sm:hidden pr-20">
            <StatCard value={attendanceStreak} label="Attendance Streak" />
            <StatCard value={badgeCount} label="Badges Earned" />
          </div>
        </div>

        {/* Waivers Alert */}
        <WaiversAlert
          pendingWaivers={pendingWaivers?.items || []}
          loading={loadingWaivers}
        />

        <div className="flex flex-col md:flex-row lg:flex-row gap-4 max-sm:gap-6">
          {/* Left Column - Announcements */}
          {/* <div className="w-full lg:w-[48%] max-sm:hidden">

            <div className="bg-white/50 rounded-fluid-xl p-fluid-5 shadow-sm">
            <h2 className="text-fluid-lg font-semibold font-manrope text-[#1b1b1b] leading-[1.5] tracking-[-0.2px] mb-4">Announcements</h2>
              <AnnouncementCard
                announcements={announcements}
                loading={loadingAnnouncements}
              />
            </div>
          </div> */}

          {/* Right Column */}
          <div className="w-full lg:w-[48%] space-y-4 max-sm:space-y-6">
            {/* Calendar & Next Event Card */}
            <div className="bg-[#FFFFFF80] rounded-fluid-xl p-6 shadow-sm">
              <div className="flex gap-6 max-md:flex-col">
                {/* Calendar Section */}
                {/* <div className="flex-1">
                  <h2 className="text-fluid-lg font-normal font-kollektif text-[#0f1d2e] leading-[1.5] tracking-[-0.2px] mb-4">Calendar</h2>
                  <Calender1 events={calendarEvents} />
                </div> */}

                {/* Next Event Section */}
                {/* <div className="flex-1">
                  <h2 className="text-fluid-lg font-normal font-kollektif text-[#0f1d2e] leading-[1.5] tracking-[-0.2px] mb-4">Next Event</h2>
                  <NextEvent event={nextEvent} loading={nextEventLoading} />
                </div> */}
              </div>
            </div>

            {/* Program Photos & Badges - Stacked Vertically */}
            {/* <div className="flex flex-col gap-4">
              <ProgramPhotoCard photo={recentPhotos?.[0]} loading={loadingPhotos} />
              <BadgeCard badges={recentBadges} loading={loadingBadges} />
            </div> */}
          </div>

          {/* Mobile: Announcements */}
          {/* <div className="hidden max-sm:block w-full">
            <h2 className="text-fluid-lg font-semibold font-manrope text-[#1b1b1b] leading-[1.5] tracking-[-0.2px] mb-4">Announcements</h2>
            <div className="bg-white/50 rounded-fluid-xl p-fluid-5 shadow-sm">
              <AnnouncementCard
                announcements={announcements}
                loading={loadingAnnouncements}
              />
            </div>
          </div> */}
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

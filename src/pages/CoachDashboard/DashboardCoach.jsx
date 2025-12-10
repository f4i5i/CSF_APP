import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Calendar from '../../components/Calender';
import NextEvent from '../../components/NextEvent';
import PhotoCard from '../../components/PhotoCard';
import BadgeCard from '../../components/BadgeCard';
import AnnouncementCard from '../../components/announcements/AnnouncementCard';
import EnrollmentCard from '../../components/EnrollmentCard';
import PaymentStatusCard from '../../components/PaymentStatusCard';
import WaiversAlert from '../../components/WaiversAlert';
 import { Plus } from "lucide-react";

// Hooks
import { useAuth } from '../../context/auth';
import { useChildren, useApi } from '../../hooks';

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
} from '../../api/services';
import CreatePostModal from '../../components/CreatePostModal';
import Calender1 from '../../components/Calender1';

export default function DashboardCoach() {
  // 1. User from auth context
  const { user } = useAuth();
 const [openModal, setOpenModal] = useState(false);

  // 2. Children data
  const {
    children,
    selectedChild,
    selectChild,
    loading: loadingChildren,
  } = useChildren();

  // 3. Announcements - Skip for now (requires coach role or class-specific endpoint)
  const announcements = [];
  const loadingAnnouncements = false;

  // 4 & 5. Events - Will be loaded after we have enrollment with class_id
  // (Moved below after enrollment is fetched)

  // 6. Active enrollments (only if child selected) - MUST BE BEFORE enrollment-dependent calls
  const { data: activeEnrollments, loading: loadingEnrollments } = useApi(
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

  // Computed values
  const attendanceStreak = attendanceStats?.current_streak || 0;
  const badgeCount = badges?.length || 0;
  const nextEvent = upcomingEvents?.[0] || null;

  // Recent badges (sorted by earned_at)
  const recentBadges = useMemo(() => {
    if (!badges) return [];
    return [...badges]
      .sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at))
      .slice(0, 4);
  }, [badges]);

  return (
    <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />

      <main className="mx-6 py-8 max-xxl:py-4 max-sm:py-2 max-sm:mx-3">
        {/* Subheader Section */}
        <div className="flex flex-row lg:flex-row items-center lg:items-center justify-between mb-6 max-xxl:mb-3 gap-4">
          {/* Welcome Message & Child Selector */}
          <div className="flex flex-col gap-2">
            <div className="text-fluid-2xl text-[#173151] font-normal font-kollektif flex items-center gap-2">
              Welcome back, {user?.first_name || 'Coach'}! 👋
            </div>
            {/* locations and active students */}
         <p className="text-black font-manrope font-medium text-base max-xxl:text-sm">
                Managing 3 locations • 45 active students
              </p>
            
          </div>

          {/* Stats */}
          <div className="flex items-center gap-16 max-sm:hidden">
            <div className="text-start flex flex-col justify-between">
              <p className="text-fluid-3xl font-kollektif font-normal text-[#0F1D2E]">
                {attendanceStreak}
              </p>
              <p className="text-black font-kollektif normal text-base">
                Checked In Today
              </p>
            </div>
            <div className="text-start flex flex-col justify-between">
              <p className="text-fluid-3xl font-kollektif normal text-[#0F1D2E]">
                {badgeCount}
              </p>
              <p className="text-black font-kollektif normal text-base">
                Announcements
              </p>
            </div>
          </div>
        </div>

        {/* Waivers Alert */}
        {/* <WaiversAlert
          pendingWaivers={pendingWaivers}
          loading={loadingWaivers}
        /> */}

        <div className="flex flex-col lg:flex-row gap-3">
          {/* Left Column */}
          <div className="col-span-2 max-sm:hidden space-y-3 w-[60%] ">
            {/* Announcements */}
            <div>
              <div className="w-full bg-gray-50 rounded-[30px] shadow-sm p-6">
       <div className='w-full flex justify-between items-center'>
        <h2 className="text-xl xxl1:text-2xl max-xxl:text-lg  font-semibold font-manrope text-[#1b1b1b] mb-4">Announcements</h2>     
<button onClick={() => setOpenModal(true)}
 className="flex items-center gap-2 bg-[#DDE0E3] text-[#000000] px-4 py-2 rounded-full text-base font-semibold font-manrope">
  <Plus size={16} />
  New Post
</button>
</div>

            <AnnouncementCard
              announcements={announcements}
              loading={loadingAnnouncements}
            />
            </div>
            </div>

  
          </div>

          {/* Right Column */}
          <div className="space-y-3 grid grid-cols-1  xxl:w-[50%]">
              {/* Calendar & Next Event */}
             <div className="bg-[#FFFFFF80] max-md:flex-col max-xxl:pb-3 px-6 rounded-[30px] lg:w-full flex gap-2">
              <div className="w-[40%] max-sm:hidden">
                <Calender1 events={calendarEvents} />
              </div>

             <div className="lg:w-[60%]  max-sm:w-full max-sm:flex">

               <div className="pt-6 max-xxl:pt-4 w-full max-md:pb-4">
                  <h2 className="text-fluid-lg pl-3  font-kollektif font-normal mb-4 max-xxl:mb-3">
                    Next Event
                  </h2>
                  <NextEvent event={nextEvent} loading={loadingEvents} />
                </div>
              </div>
            </div>

            {/* Mobile: Announcements */}
           <div className="col-span-2 hidden max-sm:flex space-y-6 w-full">
    <div className="w-full bg-gray-50 rounded-[30px] shadow-sm p-6">
        <div className='w-full flex justify-between items-center'>
        <h2 className="text-xl font-semibold font-manrope text-[#1b1b1b] mb-4">Announcements</h2>     
<button onClick={() => setOpenModal(true)} className="flex items-center gap-2 bg-[#DDE0E3] text-[#000000] px-4 py-2 rounded-full text-base font-semibold font-manrope">
  <Plus size={16} />
  New Post
</button>
</div>
     <AnnouncementCard
              announcements={announcements}
              loading={loadingAnnouncements}
            />
            </div>
            </div>

            {/* Photos & Badges */}
            <div className="w-full max-sm:grid-cols-1 gap-4">
              <PhotoCard photos={recentPhotos} loading={loadingPhotos} />
               </div>

            {/* Mobile: Enrollments & Payment */}
            {/* <div className="hidden max-sm:block space-y-6">
              <EnrollmentCard
                enrollments={activeEnrollments}
                loading={loadingEnrollments}
              />
              <PaymentStatusCard
                summary={paymentSummary}
                loading={loadingPayments}
              />
            </div> */}
          </div>
        </div>
      </main>
       {/* Modal */}
            {openModal && <CreatePostModal onClose={() => setOpenModal(false)} />}
        
    </div>
  );
}

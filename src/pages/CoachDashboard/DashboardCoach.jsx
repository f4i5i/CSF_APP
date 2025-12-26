import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

// Layout Components
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Coach Components
import {
  CoachStatsCard,
  ClassFilterDropdown,
  CoachCalendarWidget,
  CoachNextEventCard,
  CoachAnnouncementItem,
  CoachPhotosCard,
} from '../../components/coach';

// Modals
import CreatePostModal from '../../components/CreatePostModal';

// Context & Hooks
import { useAuth } from '../../context/auth';
import { useApi } from '../../hooks';

// Services
import {
  announcementsService,
  eventsService,
  photosService,
  attendanceService,
  classesService,
} from '../../api/services';

/**
 * DashboardCoach - Coach Dashboard Page
 * Pixel-perfect implementation of Figma design
 */
export default function DashboardCoach() {
  // ============================================================================
  // STATE & CONTEXT
  // ============================================================================
  const { user } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Current date for calendar
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // ============================================================================
  // API DATA FETCHING
  // ============================================================================

  // Fetch coach's assigned classes
  const { data: classes, loading: loadingClasses } = useApi(
    () => classesService.getAll({ coach_id: user?.id }),
    {
      initialData: [],
      dependencies: [user?.id],
      autoFetch: !!user?.id,
    }
  );

  // Set first class as default when classes load
  useMemo(() => {
    if (classes?.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

  // Fetch announcements for selected class
  const { data: announcements, loading: loadingAnnouncements } = useApi(
    () => announcementsService.getAll({
      class_id: selectedClass?.id,
      limit: 10,
    }),
    {
      initialData: [],
      dependencies: [selectedClass?.id],
      autoFetch: !!selectedClass?.id,
    }
  );

  // Fetch calendar events for current month
  const { data: calendarEvents, loading: loadingEvents } = useApi(
    () => eventsService.getThisMonth(),
    {
      initialData: [],
    }
  );

  // Fetch upcoming events (for next event card)
  const { data: upcomingEvents } = useApi(
    () => eventsService.getUpcoming(1),
    {
      initialData: [],
    }
  );

  // Fetch recent photos for selected class
  const { data: recentPhotos, loading: loadingPhotos } = useApi(
    () => photosService.getByClass(selectedClass?.id, { limit: 1 }),
    {
      initialData: [],
      dependencies: [selectedClass?.id],
      autoFetch: !!selectedClass?.id,
    }
  );

  // Fetch attendance stats (for check-in count)
  const { data: attendanceStats } = useApi(
    () => attendanceService.getSummary({
      date: currentDate.toISOString().split('T')[0],
      class_id: selectedClass?.id,
    }),
    {
      dependencies: [selectedClass?.id],
      autoFetch: !!selectedClass?.id,
    }
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const checkedInToday = attendanceStats?.present_count || 50;
  const announcementCount = announcements?.length || 15;
  const nextEvent = upcomingEvents?.[0] || null;
  const latestPhoto = recentPhotos?.[0] || null;

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleClassChange = (classItem) => {
    setSelectedClass(classItem);
  };

  const handleEditAnnouncement = (announcement) => {
    console.log('Edit announcement:', announcement);
    // TODO: Open edit modal
  };

  const handleDeleteAnnouncement = (announcement) => {
    console.log('Delete announcement:', announcement);
    // TODO: Show confirm dialog
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen max-sm:h-fit overflow-x-hidden bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] max-sm:pb-20">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-5 pb-8 max-md:pb-20 ">
        {/* ================================================================ */}
        {/* TOP SECTION: Welcome + Stats */}
        {/* ================================================================ */}
        <div className="flex flex-row lg:flex-row items-start lg:items-start justify-between mb-6 max-xxl:mb-4 gap-4 max-sm:gap-10">
          {/* Welcome Container */}
          <div className="flex flex-col gap-1">
            {/* Welcome Message */}
            <h1 className="text-fluid-2xl text-[#173151] font-kollektif font-normal leading-[1.002] tracking-[-0.02em] max-sm:ml-3">
              Welcome back, {user?.first_name || 'Coach'}! 👋
            </h1>

            {/* Class Filter */}
            <ClassFilterDropdown
              classes={classes}
              selectedClass={selectedClass}
              onSelectClass={handleClassChange}
              placeholder="Select a class"
            />
          </div>

          {/* Stats Container */}
          <div className="flex items-center gap-[42px] max-sm:hidden pr-20">
            <CoachStatsCard
              value={checkedInToday}
              label="Checked In Today"
            />
            <CoachStatsCard
              value={announcementCount}
              label="Announcements"
            />
          </div>
        </div>

        {/* ================================================================ */}
        {/* MAIN CONTENT GRID */}
        {/* ================================================================ */}
        <div className="flex flex-col md:flex-row lg:flex-row gap-4 max-sm:gap-6">
          <div className="flex flex-col lg:flex-row items-start justify-center gap-3 w-full">
          {/* ============================================================ */}
          {/* LEFT COLUMN: Announcements */}
          {/* ============================================================ */}
          <div className="w-full max-sm:order-2">
            <div className="bg-white/50 rounded-[30px] p-5 min-h-[723px]">
              {/* Announcements Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-manrope font-semibold text-[20px] leading-[1.5] tracking-[-0.2px] text-[#1B1B1B]">
                  Announcements
                </h2>
                <button
                  onClick={() => setOpenModal(true)}
                  className="flex items-center gap-2 bg-[#DDE0E3] hover:bg-[#d1d4d7] px-4 py-2 w-[140px] h-12 rounded-full transition-colors"
                >
                  <Plus size={24} className="text-black" />
                  <span className="font-manrope font-semibold text-[16px] text-black">
                    New Post
                  </span>
                </button>
              </div>

              {/* Announcements List */}
              <div className="flex flex-col gap-[10px] max-h-[650px] overflow-y-auto no-scrollbar ">
                {loadingAnnouncements ? (
                  // Loading skeleton
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-white/50 rounded-[20px] p-5 animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-[54px] h-[54px] bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))
                ) : announcements?.length > 0 ? (
                  announcements.map((announcement) => (
                    <CoachAnnouncementItem
                      key={announcement.id}
                      announcement={announcement}
                      currentUserId={user?.id}
                      onEdit={handleEditAnnouncement}
                      onDelete={handleDeleteAnnouncement}
                    />
                  ))
                ) : (
                  // Demo announcements when no data
                  [
                    {
                      id: 1,
                      title: 'Tournament This Saturday',
                      content: 'Great practice today! Remember, we have a tournament this Saturday at 9 AM. Please arrive 30 minutes early',
                      created_at: '2025-10-27T10:30:00',
                      author: { first_name: 'Martinez', role: 'coach' },
                      attachments: [{ name: 'teamList.pdf', type: 'application/pdf' }]
                    },
                    {
                      id: 2,
                      title: 'New Team Jerseys',
                      content: 'New team jerseys have arrived! You can pick them up from the front desk.',
                      created_at: '2025-10-27T10:30:00',
                      author: { first_name: 'Martinez', role: 'coach' },
                      attachments: [{ name: 'image-2.jpg', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=100' }]
                    },
                    {
                      id: 3,
                      title: 'Registration Deadline',
                      content: 'Reminder: Registration for next month closes this Friday. Make sure your account is up to date!',
                      created_at: '2025-10-27T10:30:00',
                      author: { first_name: 'Martinez', role: 'coach' },
                    },
                    {
                      id: 4,
                      title: 'Ball Control Progress',
                      content: 'Awesome progress in ball control drills this week! Keep practicing at home with the exercises we covered.',
                      created_at: '2025-10-27T10:30:00',
                      author: { first_name: 'Martinez', role: 'coach' },
                      attachments: [{ name: 'teamList.pdf', type: 'application/pdf' }]
                    },
                  ].map((announcement) => (
                    <CoachAnnouncementItem
                      key={announcement.id}
                      announcement={announcement}
                      currentUserId={user?.id}
                    />
                  ))
                )}
              </div>
            </div>
           <div className='mt-3 -z-10 sm:hidden' >
            <CoachPhotosCard
              photo={latestPhoto}
              albumTitle="Program Photos"
              date={latestPhoto?.created_at || '2024-10-24'}
              loading={loadingPhotos}
            />
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Calendar + Event + Photos */}
          {/* ============================================================ */}
          <div className="w-full flex flex-col gap-5 max-sm:order-1">
            {/* Calendar + Next Event Card */}
            <div className="bg-white/50 rounded-[30px] p-5 flex flex-col lg:flex-row gap-4">
              {/* Calendar Widget */}
              <div className="lg:w-[273px] max-sm:hidden">
                <h2 className="font-kollektif text-[20px] leading-[1.5] tracking-[-0.2px] text-[#0F1D2E] mb-4">
                  Calendar
                </h2>
                <CoachCalendarWidget
                  events={calendarEvents}
                  onDateClick={(date) => console.log('Date clicked:', date)}
                />
              </div>

              {/* Next Event */}
              <div className="flex-1">
                <h2 className="font-kollektif text-[20px] leading-[1.5] tracking-[-0.2px] text-[#0F1D2E] mb-4">
                  Next Event
                </h2>
                <CoachNextEventCard
                  event={nextEvent || {
                    title: 'Tournament Day',
                    description: 'Annual soccer tournament. All teams will compete. Please arrive 30 minutes early for warm-up.',
                    start_datetime: '2025-10-29T14:00:00',
                    attachment_name: 'details.pdf',
                  }}
                  loading={loadingEvents}
                />
              </div>
            </div>

            {/* Program Photos */}
            <div className='hidden sm:block' >
            <CoachPhotosCard
              photo={latestPhoto}
              albumTitle="Program Photos"
              date={latestPhoto?.created_at || '2024-10-24'}
              loading={loadingPhotos}
            />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer isFixed={false} />

      {/* Create Post Modal */}
      {openModal && <CreatePostModal onClose={() => setOpenModal(false)} />}
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Plus, Loader2, X, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFileUrl } from '../../api/config';
import { CircleCheckBig } from 'lucide-react';
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
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, announcement: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Current date for calendar
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // ============================================================================
  // API DATA FETCHING
  // ============================================================================

  // Fetch coach's assigned classes
  const { data: classesData, loading: loadingClasses } = useApi(
    () => classesService.getAll({ coach_id: user?.id }),
    {
      initialData: { items: [] },
      dependencies: [user?.id],
      autoFetch: !!user?.id,
    }
  );

  // Extract classes array from response (handles both array and paginated response)
  const classes = useMemo(() => {
    if (Array.isArray(classesData)) return classesData;
    return classesData?.items || [];
  }, [classesData]);

  // Set first class as default when classes load
  useMemo(() => {
    if (classes?.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

  // Fetch announcements for selected class
  const { data: announcements, loading: loadingAnnouncements, refetch: refetchAnnouncements } = useApi(
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
  const todayDate = currentDate.toISOString().split('T')[0];
  const { data: attendanceStats } = useApi(
    () => attendanceService.getSummary({
      start_date: todayDate,
      end_date: todayDate,
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
  const checkedInToday = attendanceStats?.present_count || 0;
  const announcementCount = Array.isArray(announcements) ? announcements.length : 0;
  const nextEvent = upcomingEvents?.[0] || null;
  const latestPhoto = Array.isArray(recentPhotos) ? recentPhotos[0] : (recentPhotos?.items?.[0] || null);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleClassChange = (classItem) => {
    setSelectedClass(classItem);
  };

  const handleViewAnnouncement = (announcement) => {
    setViewingAnnouncement(announcement);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setOpenModal(true);
  };

  const handleDeleteAnnouncement = (announcement) => {
    setDeleteConfirm({ open: true, announcement });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.announcement) return;

    setIsDeleting(true);
    try {
      await announcementsService.delete(deleteConfirm.announcement.id);
      toast.success('Announcement deleted successfully!');
      refetchAnnouncements();
      setDeleteConfirm({ open: false, announcement: null });
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      toast.error(error?.message || 'Failed to delete announcement');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ open: false, announcement: null });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingAnnouncement(null);
  };

  // Parse text and make URLs clickable
  const renderTextWithLinks = (text) => {
    if (!text) return null;
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

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen max-sm:h-fit overflow-x-hidden bg-page-gradient max-sm:pb-20">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="px-6 py-10 max-xxl:py-5 max-sm:py-6 mb-[5%] max-sm:px-3">
        {/* ================================================================ */}
        {/* TOP SECTION: Welcome + Stats */}
        {/* ================================================================ */}
        <div className="flex items-start justify-between mb-6 max-xxl:mb-4 pt-2">
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
          <div className="flex items-center gap-[42px] max-sm:hidden pr-4">
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
        <div className="flex flex-col  justify-between lg:flex-row gap-4 max-sm:gap-6">
          {/* ============================================================ */}
          {/* LEFT COLUMN: Announcements */}
          {/* ============================================================ */}
          <div className="w-full lg:w-[49%] max-sm:order-2">
            <div className="bg-white/50 rounded-fluid-xl p-fluid-5 shadow-sm min-h-[650px]">
              {/* Announcements Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-fluid-lg font-semibold font-manrope text-[#1b1b1b] leading-[1.5] tracking-[-0.2px]">
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
                      userRole="coach"
                      onViewDetails={handleViewAnnouncement}
                      onEdit={handleEditAnnouncement}
                      onDelete={handleDeleteAnnouncement}
                    />
                  ))
                ) : (
                  // Empty state when no announcements
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Plus size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#173151] mb-2">No announcements yet</h3>
                    <p className="text-gray-500 text-sm mb-4">Create your first announcement to share with your class</p>
                    <button
                      onClick={() => setOpenModal(true)}
                      className="flex items-center gap-2 bg-[#F3BC48] hover:bg-[#e5a920] px-4 py-2 rounded-full transition-colors"
                    >
                      <Plus size={20} className="text-black" />
                      <span className="font-manrope font-semibold text-black">Create Announcement</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
           <div className='mt-3 -z-10 sm:hidden' >
            <CoachPhotosCard
              photo={latestPhoto}
              albumTitle="Program Photos"
              date={latestPhoto?.created_at}
              loading={loadingPhotos}
            />
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Calendar + Event + Photos */}
          {/* ============================================================ */}
          <button className='md:hidden flex my-1 items-center justify-center gap-3 bg-[#7E97B5] rounded-xl shadow-md w-ful h-12 text-white text-base font-medium font-manrope ' >
              <CircleCheckBig color="#fff" />  
                  Check-In</button>
          <div className="w-full lg:w-[49%] flex flex-col gap-4 max-sm:order-1">
            {/* Calendar + Next Event Card */}
            <div className="bg-[#FFFFFF80] rounded-fluid-xl p-6 shadow-sm flex flex-col lg:flex-row gap-6">
              {/* Calendar Widget */}
              <div className="flex-1 max-sm:hidden">
                <h2 className="text-fluid-lg font-normal font-kollektif text-[#0f1d2e] leading-[1.5] tracking-[-0.2px] mb-4">
                  Calendar
                </h2>
                <CoachCalendarWidget
                  events={calendarEvents}
                  onDateClick={(date) => console.log('Date clicked:', date)}
                />
              </div>

              {/* Next Event */}
              <div className="flex-1">
                <h2 className="text-fluid-lg font-normal font-kollektif text-[#0f1d2e] leading-[1.5] tracking-[-0.2px] mb-4">
                  Next Event
                </h2>
                <CoachNextEventCard
                  event={nextEvent}
                  loading={loadingEvents}
                />
              </div>
            </div>

            {/* Program Photos */}
            <div className='hidden sm:block' >
            <CoachPhotosCard
              photo={latestPhoto}
              albumTitle="Program Photos"
              date={latestPhoto?.created_at}
              loading={loadingPhotos}
            />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer isFixed={true} mobileHidden={true} />

      {/* Create/Edit Post Modal */}
      {openModal && (
        <CreatePostModal
          onClose={handleCloseModal}
          onSuccess={refetchAnnouncements}
          classes={classes}
          selectedClass={selectedClass}
          announcement={editingAnnouncement}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-lg overflow-hidden animate-fadeIn p-6">
            <h2 className="text-lg font-manrope font-semibold text-[#0F1D2E] mb-2">
              Delete Announcement
            </h2>
            <p className="text-[#1b1b1b] opacity-80 font-manrope mb-6">
              Are you sure you want to delete "{deleteConfirm.announcement?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-6 py-2 font-manrope rounded-full border border-gray-300 font-semibold text-[#0F1D2E] hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-6 py-2 font-manrope rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
              >
                {isDeleting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingAnnouncement && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-lg overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-manrope font-semibold text-[#0F1D2E]">
                Announcement Details
              </h2>
              <button
                onClick={() => setViewingAnnouncement(null)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F3BC48]">
                  <img
                    src={viewingAnnouncement.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewingAnnouncement.author?.first_name || 'Coach')}&background=F3BC48&color=0F1D2E`}
                    alt={viewingAnnouncement.author?.first_name || 'Coach'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-manrope font-semibold text-[#0F1D2E]">
                    {viewingAnnouncement.author?.role === 'coach' ? 'Coach ' : ''}
                    {viewingAnnouncement.author?.first_name || 'Coach'}
                  </p>
                  <p className="text-sm text-gray-500 font-manrope">
                    {viewingAnnouncement.created_at && new Date(viewingAnnouncement.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-manrope font-semibold text-[#0F1D2E] mb-3">
                {viewingAnnouncement.title}
              </h3>

              {/* Description */}
              <p className="text-[#1b1b1b] opacity-80 font-manrope leading-relaxed mb-6 whitespace-pre-wrap">
                {renderTextWithLinks(viewingAnnouncement.description || viewingAnnouncement.content)}
              </p>

              {/* Attachments */}
              {viewingAnnouncement.attachments && viewingAnnouncement.attachments.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-manrope font-semibold text-gray-600 mb-3">
                    Attachments ({viewingAnnouncement.attachments.length})
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {viewingAnnouncement.attachments.map((attachment, index) => {
                      const url = getFileUrl(attachment.file_path || attachment.url);
                      const name = attachment.file_name || attachment.name;
                      const isImage = attachment.file_type === 'image' || attachment.file_type === 'IMAGE' ||
                        attachment.mime_type?.startsWith('image/');

                      return (
                        <button
                          key={index}
                          onClick={() => setPreviewAttachment({ url, name, isImage })}
                          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 transition cursor-pointer"
                        >
                          {isImage ? (
                            <img src={url} alt={name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <FileText size={20} className="text-gray-600" />
                          )}
                          <span className="font-manrope text-sm text-gray-700 max-w-[150px] truncate">
                            {name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={() => setViewingAnnouncement(null)}
                className="px-6 py-2 font-manrope rounded-full border border-gray-300 font-semibold text-[#0F1D2E] hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
}

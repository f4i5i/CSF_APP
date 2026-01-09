import React, { useState, useMemo, useEffect } from 'react';
import AttendanceRow from '../components/attendence/AttendenceRow';
import BadgeCarousel from '../components/attendence/BadgeCarousel';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ChevronLeft, ChevronRight } from "lucide-react";

// Hooks
import { useChildren, useApi, useMutation } from '../hooks';
import { useAuth } from '../context/auth';

// Services
import { attendanceService, badgesService, enrollmentsService, classesService } from '../api/services';

// Fallback icons
import icon1 from "../assets/Mask group.png";
import icon2 from '../assets/Mask group (1).png';
import icon3 from '../assets/Mask group (2).png';
import icon4 from '../assets/Mask group (3).png';
import icon5 from '../assets/Mask group (4).png';

const Attendence = () => {
  // Get user role from auth context
  const { user } = useAuth();
  const role = localStorage.getItem('role');
  const isCoach = role === 'coach';

  // ============================================================================
  // PARENT-SPECIFIC DATA FETCHING
  // ============================================================================
  // Get selected child from context (only for parent role)
  const { selectedChild } = useChildren();

  // Get first active enrollment for the selected child (parent only)
  const { data: enrollmentsData, error: enrollmentsError } = useApi(
    () => enrollmentsService.getMy({
      child_id: selectedChild?.id,
      status: 'active',
    }),
    {
      initialData: [],
      dependencies: [selectedChild?.id],
      autoFetch: !isCoach && !!selectedChild?.id,
      onError: (err) => console.error('Failed to load enrollments:', err),
    }
  );

  const firstEnrollment = useMemo(() => {
    if (isCoach) return null;
    if (!enrollmentsData || enrollmentsData.length === 0) return null;
    return enrollmentsData.find(e => e.child_id === selectedChild?.id) || enrollmentsData[0];
  }, [enrollmentsData, selectedChild?.id, isCoach]);

  // ============================================================================
  // COACH-SPECIFIC DATA FETCHING
  // ============================================================================
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch coach's assigned classes
  const { data: classesData, loading: loadingClasses } = useApi(
    () => classesService.getAll({ coach_id: user?.id }),
    {
      initialData: { items: [] },
      dependencies: [user?.id],
      autoFetch: isCoach && !!user?.id,
    }
  );

  // Extract classes array
  const classes = useMemo(() => {
    if (!isCoach) return [];
    if (Array.isArray(classesData)) return classesData;
    return classesData?.items || [];
  }, [classesData, isCoach]);

  // Set first class as default when classes load
  useEffect(() => {
    if (isCoach && classes?.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass, isCoach]);

  // Fetch class attendance for coach
  const { data: classAttendanceData, loading: loadingClassAttendance, error: classAttendanceError, refetch: refetchClassAttendance } = useApi(
    () => attendanceService.getByClass(selectedClass?.id, { date: selectedDate }),
    {
      initialData: [],
      dependencies: [selectedClass?.id, selectedDate],
      autoFetch: isCoach && !!selectedClass?.id,
      onError: (err) => console.error('Failed to load class attendance:', err),
    }
  );

  // Mark attendance mutation for coach
  useMutation(
    attendanceService.create,
    {
      onSuccess: () => {
        refetchClassAttendance();
      },
    }
  );

  // ============================================================================
  // PARENT-SPECIFIC DATA (continued)
  // ============================================================================
  // Fetch badges for the enrollment (parent only)
  const { data: badgesData, loading: loadingBadges, error: badgesError } = useApi(
    () => badgesService.getByEnrollment(firstEnrollment?.id),
    {
      initialData: [],
      dependencies: [firstEnrollment?.id],
      autoFetch: !isCoach && !!firstEnrollment?.id,
      onError: (err) => console.error('Failed to load badges:', err),
    }
  );

  // Fetch attendance history for the enrollment (parent only)
  const { data: attendanceData, loading: loadingAttendance, error: attendanceError } = useApi(
    () => attendanceService.getByEnrollment(firstEnrollment?.id),
    {
      initialData: null,
      dependencies: [firstEnrollment?.id],
      autoFetch: !isCoach && !!firstEnrollment?.id,
      onError: (err) => console.error('Failed to load attendance:', err),
    }
  );

  // Combined error state
  const hasError = isCoach
    ? classAttendanceError
    : (enrollmentsError || badgesError || attendanceError);

  // Demo data fallbacks
  const demoBadges = [
    { title: "Perfect Attendance", icon: icon1 },
    { title: "Leadership", icon: icon2 },
    { title: "Star Performer", icon: icon3 },
    {
      title: "Quick Learner",
      subtitle: "Achieved: Sep 28, 2024",
      icon: icon5,
      active: true,
    },
    { title: "Team Player", icon: icon4 },
    { title: "Team Player", icon: icon5 }
  ];

  // Transform API badges to component format
  const badges = useMemo(() => {
    if (badgesData && badgesData.length > 0) {
      return badgesData.map((badge, index) => ({
        title: badge.name || badge.title,
        subtitle: badge.earned_at
          ? `Achieved: ${new Date(badge.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          : badge.description,
        icon: badge.icon_url || badge.image_url || [icon1, icon2, icon3, icon4, icon5][index % 5],
        active: index === 0,
      }));
    }
    return demoBadges;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badgesData]);

  // Transform API attendance to component format
  const attendance = useMemo(() => {
    // Handle paginated response {items, total, skip, limit}
    const records = attendanceData?.items || [];
    console.log('Attendance Debug:', {
      selectedChild: selectedChild?.id,
      selectedChildName: selectedChild?.first_name,
      firstEnrollmentId: firstEnrollment?.id,
      attendanceData,
      recordsCount: records.length,
    });
    if (records.length > 0) {
      return records.map(record => ({
        date: new Date(record.date || record.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        status: record.status === 'present' ? 'Present' : record.status === 'absent' ? 'Absent' : record.status,
      }));
    }
    // Return empty array instead of demo data to show real state
    return [];
  }, [attendanceData, selectedChild, firstEnrollment]);

  // Pagination Logic
  const itemsPerPage = 4;
  const [page, setPage] = useState(1);

  // Reset pagination when enrollment changes
  useEffect(() => {
    setPage(1);
  }, [firstEnrollment?.id]);

  const totalPages = Math.ceil(attendance.length / itemsPerPage) || 1;

  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = attendance.slice(startIndex, startIndex + itemsPerPage);

  const prevPage = () => page > 1 && setPage(page - 1);
  const nextPage = () => page < totalPages && setPage(page + 1);

  // ============================================================================
  // COACH VIEW - Transform class attendance to display format
  // ============================================================================
  const coachAttendance = useMemo(() => {
    if (!isCoach || !classAttendanceData) return [];
    const records = Array.isArray(classAttendanceData) ? classAttendanceData : (classAttendanceData?.items || []);
    return records.map(record => ({
      id: record.id,
      child_id: record.child_id,
      child_name: record.child_name || `${record.child?.first_name || ''} ${record.child?.last_name || ''}`.trim(),
      date: new Date(record.date || record.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: record.status === 'present' ? 'Present' : record.status === 'absent' ? 'Absent' : record.status,
      rawStatus: record.status,
    }));
  }, [classAttendanceData, isCoach]);

  // Loading state for coach
  const isCoachLoading = loadingClasses || loadingClassAttendance;

  return (
    <div className="min-h-screen max-sm:h-fit bg-page-gradient max-sm:pb-20">
      <Header />

      <main className="px-6 py-8 max-xxl:py-5 max-sm:py-4 max-sm:px-3">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-fluid-2xl text-[#173151] font-kollektif font-normal leading-[1.002] tracking-[-0.02em]">
              Attendance
            </h1>
            {!isCoach && selectedChild && (
              <p className="text-sm text-gray-600 font-manrope mt-1">
                Showing for: {selectedChild.first_name} {selectedChild.last_name}
                {firstEnrollment?.class_name && ` - ${firstEnrollment.class_name}`}
              </p>
            )}
          </div>

          {/* Coach Controls: Class Selector + Date Picker */}
          {isCoach && (
            <div className="flex items-center gap-4">
              {/* Date Picker */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="py-2 px-4 bg-white/50 border border-[#e1e1e1] rounded-full text-base font-medium font-manrope text-[#1B1B1B]"
              />

              {/* Class Selector */}
              {classes.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedClass?.id || ''}
                    onChange={(e) => {
                      const classItem = classes.find(c => c.id === e.target.value);
                      setSelectedClass(classItem);
                    }}
                    className="py-2 px-4 bg-white/50 border border-[#e1e1e1] rounded-full text-base font-medium font-manrope text-[#1B1B1B] cursor-pointer appearance-none pr-10"
                  >
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {hasError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-manrope">
            <p className="font-medium">Unable to load attendance data</p>
            <p className="text-sm mt-1">Please try refreshing the page or check back later.</p>
          </div>
        )}

        {/* Parent View: Badge Carousel */}
        {!isCoach && (
          <BadgeCarousel badges={badges} loading={loadingBadges} compact={true} />
        )}

        {/* Attendance History Section */}
        <div className={`${!isCoach ? 'mt-8 max-xxl1:mt-3' : ''} bg-badge-bg rounded-3xl p-6 shadow-lg`}>
          <h2 className="font-kollektif text-xl my-4 font-normal text-fluid-md text-[#0f1d2e] mb-4">
            {isCoach ? `Attendance for ${selectedDate}` : 'Attendance History'}
          </h2>

          {/* Paginated Rows */}
          <div className="flex flex-col gap-4 max-xxl1:gap-2">
            {(isCoach ? isCoachLoading : loadingAttendance) ? (
              // Loading skeleton
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white/50 rounded-xl p-4 animate-pulse flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))
            ) : isCoach ? (
              // Coach View: Show all students with attendance status
              coachAttendance.length > 0 ? (
                coachAttendance.map((item, i) => (
                  <div key={i} className="bg-white/50 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1D3557] rounded-full flex items-center justify-center text-white font-semibold">
                        {item.child_name?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium text-[#173151]">{item.child_name}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.rawStatus === 'present' ? 'bg-green-100 text-green-700' :
                      item.rawStatus === 'absent' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-600 mb-1">No attendance records</p>
                  <p className="text-sm">No attendance has been recorded for {selectedDate}</p>
                </div>
              )
            ) : (
              // Parent View: Paginated attendance history
              paginatedData.length > 0 ? (
                paginatedData.map((item, i) => (
                  <AttendanceRow key={i} {...item} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-600 mb-1">No attendance records yet</p>
                  <p className="text-sm">Attendance will appear here once recorded</p>
                </div>
              )
            )}
          </div>

          {/* Pagination Controls (Parent only) */}
          {!isCoach && (
            <div className="flex justify-center items-center gap-3 mt-6 max-xxl1:mt-4">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className={`p-2 rounded-full border ${
                  page === 1 ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-sm font-semibold">
                Page {page} / {totalPages}
              </span>

              <button
                onClick={nextPage}
                disabled={page === totalPages}
                className={`p-2 rounded-full border ${
                  page === totalPages ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer isFixed={true} mobileHidden={true} />
    </div>
  );
};

export default Attendence;

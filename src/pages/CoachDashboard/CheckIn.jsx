import React, { useState, useMemo } from "react";
import StudentList from "../../components/checkIn/StudentList";
import { MessageSquare, Search } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StudentDetailsModal from "../../components/checkIn/StudentDetailsModal";

// Context & Hooks
import { useAuth } from "../../context/auth";
import { useApi, useMutation } from "../../hooks";

// Services
import { classesService, checkinService } from "../../api/services";
import { getFileUrl } from "../../api/config";

const CheckIn = () => {
  const { user } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Alphabetical");
  const [selectedClass, setSelectedClass] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  // Extract classes array from response
  const classes = useMemo(() => {
    if (Array.isArray(classesData)) return classesData;
    return classesData?.items || [];
  }, [classesData]);

  // Set first class as default when classes load (useEffect for side effects)
  React.useEffect(() => {
    if (classes?.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes]);

  // Fetch check-in status for selected class
  const { data: checkInStatus, loading: loadingStudents, refetch: refetchStatus, error: checkInError } = useApi(
    () => checkinService.getClassStatus(selectedClass?.id),
    {
      initialData: [],
      dependencies: [selectedClass?.id],
      autoFetch: !!selectedClass?.id,
      onError: (error) => {
        console.error('Failed to fetch check-in status:', error);
      }
    }
  );

  // Debug log for troubleshooting roster data issues
  React.useEffect(() => {
    if (selectedClass?.id && !loadingStudents) {
      console.log('Check-in status for class', selectedClass.name, ':', checkInStatus);
    }
  }, [selectedClass, checkInStatus, loadingStudents]);

  // Check-in mutation
  const { mutate: toggleCheckIn, loading: checkingIn } = useMutation(
    checkinService.checkIn,
    {
      onSuccess: () => {
        refetchStatus();
      },
    }
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Transform check-in status to student format for StudentList
  const students = useMemo(() => {
    // Handle different response formats
    let statusArray = [];
    if (Array.isArray(checkInStatus)) {
      statusArray = checkInStatus;
    } else if (checkInStatus?.statuses && Array.isArray(checkInStatus.statuses)) {
      statusArray = checkInStatus.statuses;
    } else if (checkInStatus?.items && Array.isArray(checkInStatus.items)) {
      statusArray = checkInStatus.items;
    }

    if (statusArray.length === 0) {
      console.log('No students found in check-in status:', checkInStatus);
      return [];
    }

    return statusArray.map((item) => {
      const profileImage = item.child?.profile_image || item.profile_image || null;
      const firstName = item.child?.first_name || item.first_name || '';
      const lastName = item.child?.last_name || item.last_name || '';
      const childName = item.child_name || `${firstName} ${lastName}`.trim();

      return {
        id: item.enrollment_id || item.id,
        enrollment_id: item.enrollment_id || item.id,
        name: childName || 'Unknown',
        grade: item.child?.grade || item.grade || '-',
        checked: item.is_checked_in || item.checked_in || item.checked || false,
        checkInId: item.check_in_id || item.checkin_id || null,
        img: profileImage ? getFileUrl(profileImage) : null,
        // Additional data for modal
        child: item.child,
        parent: item.parent,
        medical_info: item.medical_info || item.child?.medical_info,
        notes: item.notes,
      };
    });
  }, [checkInStatus]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClassChange = (classItem) => {
    setSelectedClass(classItem);
    setDropdownOpen(false);
  };

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setOpenModal(true);
  };

  const handleCheckIn = async (student) => {
    try {
      await toggleCheckIn({
        enrollment_id: student.enrollment_id,
        class_id: selectedClass?.id,
        check_in_date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Check-in error:', error);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen max-sm:h-fit bg-page-gradient max-sm:pb-20">
      <Header />

      <main className="px-6 py-8 max-xxl:py-5 max-sm:py-4 max-sm:px-3">
        <div className="flex max-sm:justify-between mb-6 max-xxl:mb-4 max-sm:items-center">
          <h1 className="text-fluid-2xl text-[#173151] font-kollektif font-normal leading-[1.002] tracking-[-0.02em]">
            Check-In
          </h1>
          <button className="flex sm:hidden items-center whitespace-nowrap gap-2 bg-[#7d97b5] text-white px-5 py-3 rounded-full text-sm shadow-md">
            <MessageSquare size={16} />
            <span>Text Class</span>
          </button>
        </div>

        {/* TOP FILTER BAR */}
        <div className="flex max-sm:flex-col gap-4 mb-6 max-xxl:mb-3 xl:p-6 px-4 py-4 bg-[#FFFFFF80] rounded-3xl">
          {/* SEARCH BAR */}
          <div className="flex items-center bg-[#f9fafb] h-12 rounded-full shadow-sm max-xl:py-2 px-4 py-3 w-full">
            <Search size={18} className="text-[#7c7c7c] mr-2" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-[#7c7c7c]"
            />
          </div>

          {/* DROPDOWN + TEXT BUTTON CONTAINER */}
          <div className="flex items-center max-sm:gap-0 gap-4 max-sm:w-full max-sm:justify-between">
            {/* Class Selector Dropdown */}
            <div className="max-sm:w-full relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={loadingClasses}
                className="w-[316px] h-12 max-sm:w-full flex justify-between items-center
                           bg-[#FFFFFF66] px-6 py-[14px] rounded-full
                           shadow-sm text-fluid-base font-medium text-nuetral-200"
              >
                {loadingClasses ? (
                  "Loading classes..."
                ) : selectedClass ? (
                  selectedClass.name
                ) : (
                  "Select a class"
                )}

                <svg
                  className={`w-4 h-4 text-[#7c7c7c] transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && classes.length > 0 && (
                <div className="absolute mt-0 w-[316px] max-sm:w-full z-40 bg-[#FFF] shadow-md border border-gray-200 rounded-xl overflow-hidden">
                  {classes.map((classItem) => (
                    <button
                      key={classItem.id}
                      onClick={() => handleClassChange(classItem)}
                      className={`w-full text-nuetral-200 font-semibold border-b-border-light shadow-sm text-left px-6 py-4 text-[15px] max-xl:text-sm hover:bg-gray-100 ${
                        selectedClass?.id === classItem.id ? 'bg-gray-50' : ''
                      }`}
                    >
                      {classItem.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TEXT CLASS BUTTON */}
            <div>
              <button className="flex max-sm:hidden items-center w-[150px] h-12 whitespace-nowrap gap-2 bg-btn-secondary font-semibold text-white px-5 py-3 rounded-full text-sm lg:text-[16px] shadow-md">
                <MessageSquare size={18} />
                <span>Text Class</span>
              </button>
            </div>
          </div>
        </div>

        {/* Student List */}
        {loadingStudents ? (
          <div className="bg-white/60 p-4 lg:p-7 rounded-3xl shadow-md backdrop-blur-md border">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/30 rounded-xl">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !selectedClass ? (
          <div className="bg-white/60 p-8 lg:p-12 rounded-3xl shadow-md backdrop-blur-md border text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-1">No Class Selected</h3>
            <p className="text-gray-500 text-sm">Please select a class from the dropdown above to view students.</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white/60 p-8 lg:p-12 rounded-3xl shadow-md backdrop-blur-md border text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-1">No Students Enrolled</h3>
            <p className="text-gray-500 text-sm">
              {checkInError
                ? "There was an error loading students. Please try refreshing the page."
                : `No students are currently enrolled in ${selectedClass?.name || 'this class'}.`}
            </p>
            <button
              onClick={() => refetchStatus()}
              className="mt-4 px-4 py-2 bg-btn-secondary text-white rounded-lg text-sm font-medium hover:bg-btn-secondary/90 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <StudentList
            students={students}
            search={search}
            sort={sort}
            setSort={setSort}
            onOpen={handleOpenModal}
            onCheckIn={handleCheckIn}
            checkingIn={checkingIn}
          />
        )}
      </main>

      {/* Modal */}
      {openModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setOpenModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      <Footer isFixed={true} mobileHidden={true} />
    </div>
  );
};

export default CheckIn;

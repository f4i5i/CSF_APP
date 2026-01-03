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

  // Set first class as default when classes load
  useMemo(() => {
    if (classes?.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

  // Fetch check-in status for selected class
  const { data: checkInStatus, loading: loadingStudents, refetch: refetchStatus } = useApi(
    () => checkinService.getClassStatus(selectedClass?.id),
    {
      initialData: [],
      dependencies: [selectedClass?.id],
      autoFetch: !!selectedClass?.id,
    }
  );

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
    if (!checkInStatus || !Array.isArray(checkInStatus)) return [];

    return checkInStatus.map((item) => {
      const profileImage = item.child?.profile_image || item.profile_image || null;
      return {
        id: item.enrollment_id || item.id,
        enrollment_id: item.enrollment_id,
        name: item.child_name || `${item.child?.first_name || ''} ${item.child?.last_name || ''}`.trim() || 'Unknown',
        grade: item.child?.grade || item.grade || '-',
        checked: item.is_checked_in || item.checked_in || false,
        checkInId: item.check_in_id || null,
        img: profileImage ? getFileUrl(profileImage) : null,
        // Additional data for modal
        child: item.child,
        parent: item.parent,
        medical_info: item.medical_info,
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

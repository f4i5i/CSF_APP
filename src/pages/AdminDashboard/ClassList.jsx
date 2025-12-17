import { ArrowLeft } from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import classesService from "../../api/services/classes.service";
import programsService from "../../api/services/programs.service";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import DottedOverlay from "@/components/DottedOverlay";
import Footer from "@/components/Footer";
const IconClock = ({ className = "w-4 h-4 text-gray-400" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6l4 2M12 3a9 9 0 110 18 9 9 0 010-18z"
    />
  </svg>
);

const IconCalendar = ({ className = "w-4 h-4 text-gray-400" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export default function ClassList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth(); // Get auth state

  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProgram, setActiveProgram] = useState("");
  const [query, setQuery] = useState("");

  // Get area from URL params
  const areaId = searchParams.get('area');

  // Fetch programs and classes on mount
  useEffect(() => {
    loadPrograms();
    loadClasses();
  }, []);

  // Reload classes when filters change
  useEffect(() => {
    loadClasses();
  }, [activeProgram, areaId]);

  const loadPrograms = async () => {
    try {
      const response = await programsService.getAll();
      const programsList = Array.isArray(response)
        ? response
        : (response.items || response.data || []);
      setPrograms(programsList);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      toast.error('Failed to load programs');
    }
  };

  const loadClasses = async () => {
    try {
      setLoading(true);
      const filters = {
        is_active: true, // Only show active classes
      };

      if (areaId) {
        filters.area_id = areaId;
      }

      if (activeProgram) {
        filters.program_id = activeProgram;
      }

      const response = await classesService.getAll(filters);
      const classList = response.items || response.data || [];
      setClasses(classList);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter classes by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return classes.filter((c) =>
      q ? c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) : true
    );
  }, [query, classes]);

  // Handle register button click
  const handleRegister = (classId) => {
    // Check if user is logged in
    if (!user) {
      // Not logged in - save intended class and redirect to login
      sessionStorage.setItem('intendedClass', classId);
      toast('Please log in to register for this class');
      navigate('/login');
      return;
    }

    // Check if user is a parent
    const userRole = user?.role?.toUpperCase();
    if (userRole !== 'PARENT') {
      toast.error('Only parents can register for classes');
      return;
    }

    // Logged in as parent - go to checkout
    navigate(`/checkout?classId=${classId}`);
  };

  // Format schedule display
  const formatSchedule = (cls) => {
    if (!cls.weekdays || cls.weekdays.length === 0) {
      return 'Schedule TBD';
    }

    // Backend now sends full day names (Monday, Wednesday) and times in 12-hour format
    const days = cls.weekdays.join(', ');

    const time = cls.start_time && cls.end_time
      ? `${cls.start_time} - ${cls.end_time}`
      : '';

    return `${days}${time ? ' @ ' + time : ''}`;
  };

  // Format dates display
  const formatDates = (cls) => {
    if (!cls.start_date || !cls.end_date) {
      return 'Dates TBD';
    }

    const start = new Date(cls.start_date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    const end = new Date(cls.end_date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

    return `${start} - ${end}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-gradient-to-br from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8]">
      <DottedOverlay
        className="inset-x-6 inset-y-10 sm:inset-x-0 sm:inset-y-0"
      />
      <div className="w-full flex-grow flex items-center justify-center">
      <div className="w-full max-w-[900px] bg-[#FFFFFF80] rounded-2xl p-6 md:p-8 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft  className="text-[#00000099] size-[16px]" />
          </button>
          <div>
            <img
              src="/images/logo.png"
              alt="logo"
              className="size-[90px] object-contain "
              style={{
                filter: 'brightness(0.2) contrast(1.5)',
                mixBlendMode: 'normal'
              }}
            />
          </div>

          <div>
            <h2 className="text-xl md:text-[28px] font-kollektif text-text-primary">
              Available Classes
            </h2>
            <p className="text-base text-text-muted font-manrope">
              Select a class to continue registration
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col  items-start w-full justify-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveProgram("")}
              className={`px-4 py-2 rounded-full text-sm font-semibold font-manrope transition-colors border ${
                activeProgram === ""
                  ? "bg-[#101D2E] text-white border-transparent"
                  : "bg-white text-neutral-dark border-gray-200"
              }`}
            >
              All Programs
            </button>
            {programs.map((program) => (
              <button
                key={program.id}
                onClick={() => setActiveProgram(program.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold font-manrope transition-colors border ${
                  activeProgram === program.id
                    ? "bg-[#101D2E] text-white border-transparent"
                    : "bg-white text-neutral-dark border-gray-200"
                }`}
              >
                {program.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full ">
            <div className="relative w-full  ">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search classes..."
                className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF66] outline-none rounded-full border font-manrope border-gray-200 text-base placeholder:font-medium placeholder:text-gray-600"
              />
              <svg
                className="w-5 h-5 text-gray-600 absolute left-3 top-[15px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading classes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No classes found.
            </div>
          ) : (
            filtered.map((cls) => (
              <div
                key={cls.id}
                className="flex flex-col md:flex-row items-stretch gap-4 bg-[#FFFFFF80] rounded-[20px] border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="w-full md:w-44 flex-shrink-0">
                  <Link to={`/class-detail?id=${cls.id}`} className="block w-full h-full">
                    <img
                      src={cls.image_url || "/images/class_list1.png"}
                      alt={cls.name}
                      className="w-full h-32 md:h-full object-cover"
                    />
                  </Link>
                </div>

                <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                     <Link to={`/class-detail?id=${cls.id}`} className="hover:underline text-[23px] font-kollektif  text-text-primary">{cls.name}</Link>
                    <div className="mt-2 flex  flex-col items-start gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <IconClock />
                        <span className="text-text-muted font-manrope">
                          {formatSchedule(cls)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <IconCalendar />
                        <span className="text-text-muted font-manrope">
                          {formatDates(cls)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:ml-6">
                    <button
                      onClick={() => handleRegister(cls.id)}
                      className="inline-block font-manrope px-8 py-2 bg-[#f1b500] hover:bg-[#e0a400] text-sm font-semibold rounded-[8px] shadow-sm"
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>

      <Footer isFixed={false} />
    </div>
  );
}

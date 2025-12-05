import { useState, useRef, useMemo } from "react";
import image from "../assets/image (2).png"
import image7 from "../assets/image7.jpg"
import { useNavigate } from "react-router-dom";
import { usePrograms } from '../api/hooks/classes/usePrograms';
import { useAreas } from '../api/hooks/classes/useAreas';
import { useClasses } from '../api/hooks/classes/useClasses';
import ClassCard from "../components/ClassCard";
import { formatDateRange, formatSchedule } from "../utils/formatters";
import Logo from "../components/Logo";

/**
 * Get default class image
 */
const getClassImage = () => {
  return image; // Use the existing imported image
};

export default function ProgramOverview() {
  const navigate = useNavigate();
  // Fetch programs from API
  const {
    data: programsData = [],
    isLoading: programsLoading,
    error: programsError
  } = usePrograms();

  // Fetch areas from API
  const {
    data: areasData = [],
    isLoading: areasLoading,
    error: areasError
  } = useAreas();

  const DEFAULT_FILTERS = {
    school: 'all',
    weekday: 'all',
    timeOfDay: 'all',
    ageRange: 'all',
    capacity: 'all',
  };

  const [selectedProgram, setSelectedProgram] = useState(null);
  const [openArea, setOpenArea] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const areaRef = useRef(null);

  // Fetch classes with filters (only when program + area selected)
  const classesQuery = useClasses({
    filters: {
      program_id: selectedProgram,
      area_id: openArea,
      is_active: true
    },
    queryOptions: {
      enabled: !!(selectedProgram && openArea), // Only fetch when both selected
      placeholderData: [] // Ensure data is always an array when disabled
    }
  });

  // Ensure classesData is always an array
  const classesData = Array.isArray(classesQuery.data) ? classesQuery.data : [];
  const classesLoading = classesQuery.isLoading;
  const classesError = classesQuery.error;

  // Debug logging
  console.log('ProgramOverview Debug:', {
    selectedProgram,
    openArea,
    classesData,
    classesLoading,
    classesError,
    queryEnabled: !!(selectedProgram && openArea)
  });

  const weekdayOptions = ['all', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeOfDayOptions = ['all', 'morning', 'afternoon', 'evening'];
  const ageRangeOptions = ['all', 'under8', '8to12', '13plus'];
  const capacityOptions = ['all', 'available', 'full'];

  const schoolOptions = useMemo(() => {
    const unique = new Map();
    classesData.forEach((cls) => {
      if (cls.school?.id) {
        unique.set(cls.school.id, cls.school.name);
      } else if (cls.school_name) {
        unique.set(cls.school_name, cls.school_name);
      }
    });
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [classesData]);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
  };

  // Transform API programs to match UI format
  const PROGRAMS = programsData.map((program, index) => ({
    id: program.id,
    title: program.name,
    desc: program.description || 'Program description',
  }));

  // Transform API areas to match UI format
  const AREAS = areasData.map((area) => ({
    id: area.id,
    name: area.name
  }));

  // Filter and transform classes for display
  const filteredClasses = (area) => {
    const searchValue = search.toLowerCase();

    return classesData
      .filter((cls) => {
        // Classes are already filtered by area_id through the API
        const matchesArea = true; // Backend handles area filtering
        const matchesSearch =
          cls.name.toLowerCase().includes(searchValue) ||
          cls.description?.toLowerCase().includes(searchValue);

        const schoolId = cls.school?.id ?? cls.school_name ?? '';
        const schoolName = cls.school?.name ?? cls.school_name ?? '';
        const matchesSchool =
          filters.school === 'all' ||
          schoolId === filters.school ||
          schoolName === filters.school;

        const matchesWeekday =
          filters.weekday === 'all' ||
          cls.schedule?.some((item) => item.day_of_week?.toLowerCase() === filters.weekday);

        const matchesTime =
          filters.timeOfDay === 'all' ||
          getTimeOfDay(cls.schedule) === filters.timeOfDay;

        const matchesAge =
          filters.ageRange === 'all' || matchesAgeRange(cls, filters.ageRange);

        const totalCapacity = cls.capacity ?? cls.capacity_total ?? 0;
        const current = cls.current_enrollment ?? cls.capacity_filled ?? 0;
        const matchesCapacity =
          filters.capacity === 'all' ||
          (filters.capacity === 'available' ? current < totalCapacity : current >= totalCapacity);

        return (
          matchesArea &&
          matchesSearch &&
          matchesSchool &&
          matchesWeekday &&
          matchesTime &&
          matchesAge &&
          matchesCapacity
        );
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      )
      .map((cls) => ({
        id: cls.id,
        area: cls.area_id,
        program: cls.program_id,
        title: cls.name,
        description: cls.description,
        school: cls.school?.name || cls.location || 'Location TBA',
        programName: cls.program?.name || '',
        dates: formatDateRange(cls.start_date, cls.end_date),
        time: formatSchedule(cls.schedule),
        ages: cls.min_age && cls.max_age
          ? `Ages ${cls.min_age}–${cls.max_age}`
          : 'All Ages',
        capacity: {
          filled: cls.current_enrollment ?? 0,
          total: cls.capacity ?? 0
        },
        image: cls.cover_photo_url || cls.image_url || getClassImage(),
        schedule: cls.schedule,
        price: cls.base_price,
      }));
  };

  return (
    <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">

      {/* Logo and Title Section */}
      <div className="w-full py-6">
        <div className="max-w-7xl xxl1:max-w-9xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo - Left Side */}
            <div className="flex w-[64px] h-[62px] items-center max-sm:flex max-sm:justify-center max-sm:items-center">
              <Logo />
            </div>

            {/* CSF School Academy - Center */}
            <div className="flex-1 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-bold text-[#173151] font-kollektif drop-shadow-lg">
                CSF School Academy
              </h1>
            </div>

            {/* Spacer for balance */}
            <div className="w-[64px] max-sm:hidden"></div>
          </div>
        </div>
      </div>

       {/* ---------- HERO SECTION ---------- */}
<div className="w-full bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 py-14 md:py-20">
  <div className="max-w-7xl xxl1:max-w-9xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-10">

    {/* LEFT CONTENT */}
    <div className="flex-1 text-[#173151] space-y-6">
      <h1 className="font-kollektif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
        Unlock Your Child's <span className="text-[#F3BC48]">True Soccer Potential</span>
      </h1>

      <p className="text-lg md:text-xl text-gray-800 max-w-md">
        Join the Carolina Soccer Factory Academy where young athletes train, grow,
        and dream big. Professional coaching. Competitive programs. A future built on passion.
      </p>


    </div>

    {/* RIGHT IMAGE */}
    <div className="flex-1 w-full">
      <div className="relative w-full h-[280px] md:h-[380px] lg:h-[450px] rounded-3xl overflow-hidden shadow-lg">
        <img
          src={image7}
          alt="Soccer Training"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
    </div>

  </div>
</div>


{/* Loading State */}
{(programsLoading || areasLoading) && (
  <div className="max-w-7xl mx-auto px-4 py-10 text-center">
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#F3BC48] border-r-transparent"></div>
    <p className="mt-4 text-gray-600">Loading programs...</p>
  </div>
)}

{/* Error State */}
{(programsError || areasError) && (
  <div className="max-w-7xl mx-auto px-4 py-10">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <p className="text-red-800 font-semibold">Failed to load programs</p>
      <p className="text-red-600 text-sm mt-2">
        {programsError?.message || areasError?.message || 'Please try again later'}
      </p>
    </div>
  </div>
)}

{/* Only show programs if loaded and no error */}
{!programsLoading && !programsError && PROGRAMS.length > 0 && (
     <div className="max-w-7xl xxl1:max-w-8xl mx-auto px-4 py-10">
        <h2 className="text-2xl text-center font-semibold mb-6 text-[#173151] font-kollektif drop-shadow-lg">Programs</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {PROGRAMS.map((p) => (
            <div
              key={p.id}
             onClick={() => {
  setSelectedProgram(p.id);
  setOpenArea(null);

  setTimeout(() => {
    areaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);
}}
              className={`relative h-40 rounded-2xl flex justify-center bg-[#FFFFFF50] overflow-hidden shadow cursor-pointer group border
                ${selectedProgram === p.id ? "border-gray-800" : "border-gray-300"}
              `}
            >


              <div className=" flex flex-col items-center justify-center p-4 text-gray-900">
                <p className="text-xl xxl1:text-2xl font-semibold font-manrope text-[#1b1b1b] drop-shadow">{p.title}</p>
                <p className="text-sm opacity-90  drop-shadow">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
)}

      {/* ----------- AREAS (Only show when program is selected) ----------- */}
      {selectedProgram && (
        <div ref={areaRef} className="max-w-7xl mx-auto px-4 pb-10">
             {(() => {
      const selectedProgramData = PROGRAMS.find(p => p.id === selectedProgram);
      return (
        <div className="flex flex-col justify-center items-center">
       <h2 className="text-[#173151] text-3xl font-semibold mb-2">{selectedProgramData?.title}</h2>
        <h2 className="text-xl font-semibold mb-6">Select your Area </h2>
</div>
             );
    })()}

          <div className="flex flex-col gap-3 lg:flex-row">
            {AREAS.map((area) => (
              <button
                key={area.id}
                onClick={() => {
                  const nextArea = openArea === area.id ? null : area.id;
                  setOpenArea(nextArea);
                  resetFilters();
                }}
                className={`px-6 py-4 w-full rounded-md bg-[#FFFFFF50] border text-base font-medium transition
                  ${
                    openArea === area.id
                      ? " text-black border-gray-800"
                      : "bg-[#FFFFFF50] text-black border-gray-300"
                  }`}
              >
                {area.name}
              </button>
            ))}
          </div>

          {/* ----------- AREA DROPDOWN CONTENT ----------- */}
          {AREAS.map((area) => {
            const isOpen = openArea === area.id;
            return (
              <div
                key={area.id}
                className={`transition-all duration-500 overflow-hidden ${
                  isOpen ? "max-h-[3000px] mt-6" : "max-h-0"
                }`}
              >
                {/* Search / Filter */}
                <div className="bg-[#FFFFFF50] p-4 rounded-lg shadow mb-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-white/70"
                  />

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <select
                      className="rounded-lg border px-3 py-2 bg-white/80"
                      value={filters.school}
                      onChange={(e) => setFilters((prev) => ({ ...prev, school: e.target.value }))}
                    >
                      <option value="all">All Schools</option>
                      {schoolOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <select
                      className="rounded-lg border px-3 py-2 bg-white/80"
                      value={filters.weekday}
                      onChange={(e) => setFilters((prev) => ({ ...prev, weekday: e.target.value }))}
                    >
                      {weekdayOptions.map((day) => (
                        <option key={day} value={day}>
                          {day === 'all' ? 'All Weekdays' : day.charAt(0).toUpperCase() + day.slice(1)}
                        </option>
                      ))}
                    </select>

                    <select
                      className="rounded-lg border px-3 py-2 bg-white/80"
                      value={filters.timeOfDay}
                      onChange={(e) => setFilters((prev) => ({ ...prev, timeOfDay: e.target.value }))}
                    >
                      {timeOfDayOptions.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot === 'all' ? 'All Times' : slot.charAt(0).toUpperCase() + slot.slice(1)}
                        </option>
                      ))}
                    </select>

                    <select
                      className="rounded-lg border px-3 py-2 bg-white/80"
                      value={filters.ageRange}
                      onChange={(e) => setFilters((prev) => ({ ...prev, ageRange: e.target.value }))}
                    >
                      <option value="all">All Ages</option>
                      <option value="under8">Under 8</option>
                      <option value="8to12">Ages 8 - 12</option>
                      <option value="13plus">13+</option>
                    </select>

                    <select
                      className="rounded-lg border px-3 py-2 bg-white/80"
                      value={filters.capacity}
                      onChange={(e) => setFilters((prev) => ({ ...prev, capacity: e.target.value }))}
                    >
                      {capacityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option === 'all'
                            ? 'All Capacity'
                            : option === 'available'
                            ? 'Open Seats'
                            : 'Waitlisted'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Classes Loading State */}
                {classesLoading && (
                  <div className="text-center py-10">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-[#F3BC48] border-r-transparent"></div>
                    <p className="mt-3 text-gray-600">Loading classes...</p>
                  </div>
                )}

                {/* Classes Error State */}
                {classesError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">Failed to load classes</p>
                  </div>
                )}

                {/* Class Cards */}
                {!classesLoading && !classesError && (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredClasses(area.id).length === 0 ? (
                      <p className="text-gray-500">No classes found.</p>
                    ) : (
                      filteredClasses(area.id).map((cls) => (
                        <ClassCard
                          key={cls.id}
                          cls={cls}
                          onClick={() => navigate(`/class/${cls.id}`)}
                          onRegister={() => navigate(`/checkout?classId=${cls.id}`)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ----------- FILTERING HELPERS ----------- */

const getTimeOfDay = (schedule) => {
  const start = schedule?.[0]?.start_time;
  if (!start) return 'all';
  const hour = parseInt(start.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const matchesAgeRange = (cls, filter) => {
  const min = cls.min_age ?? 0;
  const max = cls.max_age ?? 99;
  if (filter === 'under8') return max < 8;
  if (filter === '8to12') return min <= 12 && max >= 8;
  if (filter === '13plus') return min >= 13;
  return true;
};

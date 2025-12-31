import { useState } from "react";
import StudentCard from "./StudentCard";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const StudentList = ({ students, search, sort, setSort, onOpen, onCheckIn, checkingIn }) => {
  const [page, setPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const perPage = 5;

  const sortOptions = ["Alphabetical", "Grade", "Check-In Status"];

  // SEARCH FILTER
  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // SORT
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "Alphabetical":
        return a.name.localeCompare(b.name);
      case "Grade":
        return (a.grade || 0) - (b.grade || 0);
      case "Check-In Status":
        return (b.checked ? 1 : 0) - (a.checked ? 1 : 0);
      default:
        return 0;
    }
  });

  // PAGINATION CALCULATION
  const totalPages = Math.ceil(sorted.length / perPage);
  const start = (page - 1) * perPage;
  const currentStudents = sorted.slice(start, start + perPage);

  // Reset page when search changes
  const handleSearch = () => {
    setPage(1);
  };

  return (
    <div className="bg-white/60 p-4 lg:p-7 rounded-3xl shadow-md backdrop-blur-md border">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-xl font-manrope text-[#1B1B1B]">
          Students ({filtered.filter((s) => s.checked).length}/{filtered.length})
        </h2>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 justify-center bg-[#FFFFFF80] text-black w-[150px] h-10 px-4 py-2 rounded-full shadow text-[16px]"
          >
            {sort} <ChevronDown size={16} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </button>

          {sortOpen && (
            <div className="absolute right-0 mt-1 w-[180px] z-40 bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSort(option);
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 ${
                    sort === option ? 'bg-gray-50 font-semibold' : ''
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STUDENT CARDS */}
      <div className="flex flex-col gap-2">
        {currentStudents.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No students found
          </p>
        ) : (
          currentStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onOpenModal={onOpen}
              onCheckIn={onCheckIn}
              checkingIn={checkingIn}
            />
          ))
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">

          {/* PREV (Chevron Left) */}
          <button
            onClick={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
            className={`p-2 rounded-lg ${
              page === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#1B1B1B] hover:bg-gray-100"
            }`}
          >
            <ChevronLeft size={16} />
          </button>

          {/* PAGE NUMBERS */}
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  page === i + 1
                    ? "bg-[#1D3557] text-white"
                    : "text-[#1B1B1B] hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* NEXT (Chevron Right) */}
          <button
            onClick={() => page < totalPages && setPage(page + 1)}
            disabled={page === totalPages}
            className={`p-2 rounded-lg ${
              page === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#1B1B1B] hover:bg-gray-100"
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentList;

import { ArrowLeft } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const categories = ["Preschool", "Elementary", "TDC", "Camps", "Leagues"];

const sampleClasses = [
  {
    id: 1,
    title: "Davidson Elementary - Grade 4",
    time: "Wednesdays @ 3:00 PM - 4:00 PM",
    dates: "Sep 1, 2025 - Dec 15, 2025",
    image: "/images/class_list1.png",
  },
  {
    id: 2,
    title: "Davidson Elementary - Grade 5",
    time: "Thursdays @ 3:00 PM - 4:00 PM",
    dates: "Sep 1, 2025 - Dec 15, 2025",
    image: "/images/class_list2.png",
  },
  {
    id: 3,
    title: "Vance Academy - Grade 2",
    time: "Tuesdays @ 4:00 PM - 5:00 PM",
    dates: "Aug 20, 2025 - Dec 10, 2025",
    image: "/images/class_list3.png",
  },
  {
    id: 4,
    title: "Cornelius Elementary - Grade 3",
    time: "Thursdays @ 3:00 PM - 4:00 PM",
    dates: "Sep 1, 2025 - Dec 15, 2025",
    image: "/images/class_list4.png",
  },
];

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
  const [active, setActive] = useState("Elementary");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sampleClasses.filter((c) =>
      q ? c.title.toLowerCase().includes(q) : true
    );
  }, [query]);

  return (
    <div className="min-h-screen flex items-start justify-center p-6 bg-gradient-to-br from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8]">
      <div className="w-full max-w-[900px] bg-[#FFFFFF80] rounded-2xl p-6 md:p-8 shadow-lg">
        <div className="flex items-center gap-2">
          <button>
            <ArrowLeft  className="text-[#00000099] size-[16px]" />
          </button>

          <img
            src="/images/logo.png"
            alt="logo"
            className="size-[90px] object-contain mix-blend-exclusion"
          />
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
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-full text-sm font-semibold font-manrope transition-colors border ${
                  active === c
                    ? "bg-[#101D2E] text-white border-transparent"
                    : "bg-white text-neutral-dark border-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full ">
            <div className="relative w-full  ">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
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
          {filtered.map((cl, idx) => (
            <div
              key={cl.id}
              className="flex flex-col md:flex-row items-stretch gap-4 bg-[#FFFFFF80] rounded-[20px] border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="w-full md:w-44 flex-shrink-0">
                <Link to={`/class/${cl.id}`} className="block w-full h-full">
                  <img
                    src={cl.image}
                    alt={cl.title}
                    className="w-full h-32 md:h-full object-cover"
                  />
                </Link>
              </div>

              <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <Link to={`/class/${cl.id}`} className="hover:underline text-[23px] font-kollektif  text-text-primary">{cl.title}</Link>
                  <div className="mt-2 flex  flex-col items-start gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <IconClock />
                      <span className="text-text-muted font-manrope">
                        {cl.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <IconCalendar />
                      <span className="text-text-muted font-manrope">
                        {cl.dates}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:ml-6">
                  <Link
                    to="/register"
                    className="inline-block font-manrope px-8 py-2 bg-[#f1b500] hover:bg-[#e0a400] text-sm font-semibold rounded-[8px] shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No classes found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

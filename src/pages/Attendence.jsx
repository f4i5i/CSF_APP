import React, { useState } from 'react';
import AttendanceRow from '../components/attendence/AttendenceRow';
import BadgeCarousel from '../components/attendence/BadgeCarousel';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ChevronLeft, ChevronRight } from "lucide-react";

import icon1 from "../assets/Mask group.png";
import icon2 from '../assets/Mask group (1).png';
import icon3 from '../assets/Mask group (2).png';
import icon4 from '../assets/Mask group (3).png';
import icon5 from '../assets/Mask group (4).png';

const Attendence = () => {
  const badges = [
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

  const attendance = [
    { date: "Oct 24, 2024", status: "Present" },
    { date: "Oct 21, 2024", status: "Present" },
    { date: "Oct 17, 2024", status: "Present" },
    { date: "Oct 14, 2024", status: "Present" },
    { date: "Oct 13, 2024", status: "Absent" },
    { date: "Oct 12, 2024", status: "Present" },
  ];

  // ⭐ Pagination Logic
  const itemsPerPage = 4;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(attendance.length / itemsPerPage);

  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = attendance.slice(startIndex, startIndex + itemsPerPage);

  const prevPage = () => page > 1 && setPage(page - 1);
  const nextPage = () => page < totalPages && setPage(page + 1);

  return (
    // <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
    <div className="min-h-screen max-sm:h-fit bg-page-gradient">
      <Header />

      <main className="mx-6 py-8 max-xxl1:py-4 max-sm:py-2 max-sm:mx-3">
        <h1 className="text-3xl font-manrope font-bold text-[#173151] mb-4 max-xxl1:mb-0">
          Attendance
        </h1>

        <BadgeCarousel badges={badges} compact={true} />

        <div className="mt-8 max-xxl1:mt-3 bg-badge-bg rounded-3xl p-6 max-xxl1:pt-3 shadow-lg">
          <h2 className="font-kollektif text-xl my-4 font-normal text-fluid-md text-[#0f1d2e] mb-4 max-xxl1:mb-4">
            Attendance History
          </h2>

          {/* ⭐ Paginated Rows */}
          <div className="flex flex-col gap-4 max-xxl1:gap-2">
            {paginatedData.map((item, i) => (
              <AttendanceRow key={i} {...item} />
            ))}
          </div>

          {/* ⭐ Pagination Controls */}
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
        </div>
      </main>
      <Footer isFixed={false} />
    </div>
  );
};

export default Attendence;

"use client";

import { useState, useMemo } from "react";
import ProgramPhotoSrc from "../assets/program.png";
import EarnedBadgeSrc from "../assets/Earned_Badges.png";
import LeftArrowSrc from "../assets/left_errow.png";
import RightArrowSrc from "../assets/right_errow.png";
import leftArrow from "../assets/left.png";
import rightArrow from "../assets/right.png";
import pdfLinkIcon from "../assets/pdf_link.png";
import arrowRightUpLine from "../assets/arrow-right-up-line.png";

export default function DashboardWidgets() {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 8));
  const [monthOffset, setMonthOffset] = useState(0);
  const [badgeIndex, setBadgeIndex] = useState(0);

  const viewDate = useMemo(() => {
    const d = new Date(2025, 9, 1); 
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstWeekday = (y, m) => new Date(y, m, 1).getDay(); 

  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);

  const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const blanksBefore = (firstWeekday + 6) % 7; 

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const highlighted = [8, 9, 20, 21];

  const badges = [
    {
      id: 1,
      title: "Perfect Attendance",
      subtitle: "Never missed a practice session",
      img: EarnedBadgeSrc,
    },
    {
      id: 2,
      title: "Team Player",
      subtitle: "Great cooperation with team",
      img: EarnedBadgeSrc,
    },
    {
      id: 3,
      title: "Top Scorer",
      subtitle: "Most goals this season",
      img: EarnedBadgeSrc,
    },
    {
      id: 4,
      title: "MVP",
      subtitle: "Most valuable player",
      img: EarnedBadgeSrc,
    },
    {
      id: 5,
      title: "Leader",
      subtitle: "Team captain for a month",
      img: EarnedBadgeSrc,
    },
  ];

  const handlePrevBadge = () =>
    setBadgeIndex((i) => (i - 1 + badges.length) % badges.length);
  const handleNextBadge = () => setBadgeIndex((i) => (i + 1) % badges.length);

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <div className="sm:flex hidden flex-col sm:flex-row shadow-sm items-start justify-center gap-3 bg-white/50 rounded-2xl sm:rounded-3xl px-3 sm:px-5 py-2 sm:py-5 w-full">
          <div className="w-[40%] ">
            <h3 className="text-lg sm:text-xl font-kollektif font-medium text-heading-dark">Calendar</h3>
            <div className="flex items-center justify-between mt-2 sm:mt-3 mb-1">
              <p className="text-sm font-semibold text-grey-400">
                {viewDate
                  .toLocaleString(undefined, {
                    month: "short",
                    year: "numeric",
                  })
                  .toUpperCase()}
              </p>{" "}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setMonthOffset((o) => o - 1)}
                  className=""
                  aria-label="Previous month"
                >
                  <img
                    src={leftArrow}
                    alt="Prev"
                    width={40}
                    height={40}
                    className="rounded-full size-3 sm:size-4 object-cover"
                  />{" "}
                </button>
                <button
                  onClick={() => setMonthOffset((o) => o + 1)}
                  className=""
                  aria-label="Next month"
                >
                  <img
                    src={rightArrow}
                    alt="Next"
                    width={40}
                    height={40}
                    className="rounded-full size-3 sm:size-4 object-cover"
                  />{" "}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600 mb-2">
              {weekdayOrder.map((d) => (
                <div
                  key={d}
                  className="h-6 sm:h-8 flex items-center justify-center text-[#6F6F6F] text-[9px] sm:text-[10px] font-medium"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm">
              {Array.from({ length: blanksBefore }).map((_, i) => (
                <div key={`b-${i}`} className="h-6 sm:h-8" />
              ))}

              {calendarDays.map((d) => {
                const isActive =
                  selectedDate.getDate() === d &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getFullYear() === year;
                const isHighlighted = highlighted.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(new Date(year, month, d))}
                    className={`h-6 w-6 flex items-center justify-center text-[11px] sm:text-xs m-auto font-medium rounded-full ${
                      isActive ? "text-black" : "text-[#6F6F6F]"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: "#F3BC48" }
                        : isHighlighted
                        ? { backgroundColor: "#F3BC48", color: "black" }
                        : {}
                    }
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-[60%] ">
            <h3 className="text-lg sm:text-xl font-medium text-heading-dark">Next Event</h3>
            <div className="flex items-start flex-col gap-2 bg-white/50  shadow-sm rounded-[10px] px-2 sm:px-3 py-2 mt-2 sm:mt-3 w-full min-h-52 ">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="text-base sm:text-lg font-medium text-heading-dark">02:00</div>

                <div className="w-1 bg-[#F3BC48] h-7 sm:h-9 rounded" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-light text-gray-500">
                    {" "}
                    29 Oct 2025
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-heading-dark">
                    Tournament Day
                  </p>
                </div>
              </div>
              <hr className="border-black/10 w-full" />

              <p className="text-sm sm:text-base font-semibold text-grey-300 leading-5">
                Annual soccer tournament. All teams will compete. Please arrive
                30 minutes early for warm-up.
              </p>
              <button className="flex items-center gap-2 bg-white/50  px-2 sm:px-3.5 mt-2 py-2 rounded-[60px] text-xs text-gray-700 cursor-pointer">
                <img
                  src={pdfLinkIcon}
                  alt="linkicon"
                  width={40}
                  height={40}
                  className="size-[13px] object-cover"
                />{" "}
                <span className="text-xs sm:text-sm text-[#1B1B1B] font-semibold">
                  details.pdf
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-3 w-full min-h-[410px] ">

          <div className="w-full sm:w-1/2 relative h-[290px]  sm:h-full rounded-3xl overflow-hidden">
            <img
              src={ProgramPhotoSrc}
              alt="Program Photos"
              className="w-full h-full object-cover absolute inset-0"
            />

            
            <div className="absolute right-2 sm:right-4 top-2 sm:top-4 bg-[#dde3e8] rounded-full size-12 sm:size-[60px] flex items-center justify-center z-10">
              <img
                src={arrowRightUpLine}
                alt="arrow-right-up-line"
                width={120}
                height={120}
                className="object-contain size-5 sm:size-[25px] text-white"
              />
            </div>
            <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 text-white"> 
                <h2 className="font-bold text-xl" >Program Photos</h2>
                <p className="font-normal text-xl opacity-100 " >Oct 24, 2024</p>
            </div>
          </div>

          <div className="bg-white/50 rounded-3xl sm:rounded-4xl  p-5 sm:p-6 shadow-sm w-full sm:w-1/2 flex flex-col justify-between items-center gap-3 sm:gap-5 min-h-96  sm:min-h-[410px] ">
          <div className="flex w-full items-start  justify-start">
            <h3 className="text-lg sm:text-xl font-semibold text-[#0F1D2E] ">
              Earned Badges
            </h3>
            </div>
            <div>
              <div className="flex flex-col items-center gap-3 sm:gap-6">
                <div className="rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={badges[badgeIndex].img}
                    alt={badges[badgeIndex].title}
                    width={120}
                    height={120}
                    className="object-contain size-20 sm:size-[140px]"
                  />
                </div>
                <div className="flex-1 flex items-center flex-col text-center">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                    {badges[badgeIndex].title}
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-[#0F1D2E]">
                    {badges[badgeIndex].subtitle}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handlePrevBadge}
                  className="size-10 sm:size-[50px] flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <img src={LeftArrowSrc} alt="Prev" width={20} height={20} className="size-4 sm:size-[30px]" />
                </button>
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                  {badgeIndex + 1}/{badges.length}
                </span>
                <button
                  onClick={handleNextBadge}
                  className="size-10 sm:size-[50px] flex items-center justify-center  bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <img
                    src={RightArrowSrc}
                    alt="Next"
                    width={20}
                    height={20}
                    className="size-4 sm:size-[30px]"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
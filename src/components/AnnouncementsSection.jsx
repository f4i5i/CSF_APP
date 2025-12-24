"use client";

import { useState, useRef, useEffect } from "react";
import teamList from "../assets/teamlist.png";
import teamList1 from "../assets/teamlist1.png";
import pdfIcon from "../assets/pdf_link.png";
import userImg from "../assets/user_img.png";

export default function AnnouncementsSection() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const announcements = [
    {
      id: 1,
      author: "Coach Martinez",
      date: "Oct 27, 2025, 10:30 AM",
      title: "Tournament This Saturday",
      description:
        "Great practice today! Remember, we have a tournament this Saturday at 9 AM. Please arrive 30 minutes early",
      attachment: {
        name: "teamList.pdf",
        pdfImg: teamList,
        pdfImgAlt: "Team List",
      },
    },
    {
      id: 2,
      author: "Coach Martinez",
      date: "Oct 27, 2025, 10:30 AM",
      title: "New Team Jerseys",
      description:
        "New team jerseys have arrived! You can pick them up from the front desk.",
      attachment: {
        name: "image-2.jpg",
        pdfImg: teamList1,
        pdfImgAlt: "Team List",
      },
    },
    {
      id: 3,
      author: "Coach Martinez",
      date: "Oct 27, 2025, 10:30 AM",
      title: "New Team Jerseys",
      description:
        "New team jerseys have arrived! You can pick them up from the front desk.",
      attachment: {
        name: "image-2.jpg",
        pdfImg: teamList1,
        pdfImgAlt: "Team List",
      },
    },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openDropdown &&
        dropdownRefs.current[openDropdown] &&
        !dropdownRefs.current[openDropdown].contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  return (
    <>
      {/* MOBILE NEXT EVENT */}
      <div className="flex sm:hidden mb-3 flex-col gap-3">
        <div className="w-full bg-[#f1f2f2] p-4 rounded-4xl">
          <h3 className="text-lg font-normal text-[#0F1D2E]">Next Event</h3>

          <div className="flex flex-col gap-2 bg-bg-white/50 shadow-sm rounded-[10px] px-2 py-2 mt-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-lg font-normal text-[#0F1D2E]">02:00</div>
              <div className="w-1 bg-[#F3BC48] h-9 rounded" />
              <div>
                <p className="text-xs text-gray-400">29 Oct 2025</p>
                <p className="text-sm font-normal text-[#0F1D2E]">
                  Tournament Day
                </p>
              </div>
            </div>

            <hr className="border-black/10" />

            <p className="text-sm font-semibold text-[#1B1B1B]">
              Annual soccer tournament. All teams will compete. Please arrive 30
              minutes early for warm-up.
            </p>

            <button className="flex items-center gap-2 bg-[#eff2f5] px-3 py-2 rounded-[60px] text-xs text-gray-700">
              <img
                src={pdfIcon}
                alt="PDF"
                className="size-[13px] object-cover"
              />
              <span className="font-semibold">details.pdf</span>
            </button>
          </div>
        </div>
      </div>

      <section className="bg-card_bg rounded-3xl md:max-h-[723px] md:overflow-auto no-scrollbar px-3 sm:px-4 py-2 font-manrope sm:py-5 w-full">
        <h2 className="text-lg sm:text-xl font-manrope font-semibold mb-3">
          Announcements
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-[#f7f8f8] rounded-[20px] p-3 sm:p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={userImg}
                    alt={announcement.author}
                    className="size-[54px] rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm sm:text-base">
                      {announcement.author}
                    </p>
                    <p className="text-xs text-[#1B1B1B] opacity-50  font-medium">
                      {announcement.date}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-black/10 my-2" />

              {announcement.title && (
                <h3 className="font-medium text-lg sm:text-2xl mb-2">
                  {announcement.title}
                </h3>
              )}

              {announcement.description && (
                <p className="text-sm sm:text-base font-medium opacity-80 mb-3">
                  {announcement.description}
                </p>
              )}

              {announcement.attachment && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-[60px] cursor-pointer">
                    <img
                      src={announcement.attachment.pdfImg}
                      alt={announcement.attachment.pdfImgAlt}
                      className="size-[30px] rounded-full object-cover"
                    />
                    <span className="text-sm font-bold text-black opacity-70 truncate">
                      {announcement.attachment.name}
                    </span>
                    <span className="text-gray-400">×</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

import React from "react";
import Header from "../components/Header";
import Calendar from "../components/Calender";
import NextEvent from "../components/NextEvent";
import CalenderMini from "../components/Calendar/CalenderMini";
import FullCalender from "../components/Calendar/FullCalender";

const Calender = () => {
  return (
    <div className=" min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />
      <main className=" max-w-9xl sm:px-6 px-3 py-8 max-sm:py-2 rounded-lg border border-border-light  bg-gradient-to-br from-[#e3e5e6] via-[#b7c3d1] to-[#a4b4c8]"
        style={{ boxShadow: "0 5px 20px 0 rgb(0 0 0 / 0.05)" }}>
        <div className="flex gap-4 w-full max-sm:flex-col">
          {/* LEFT SIDE */}
          <div className="flex flex-col max-sm:p-3 gap-3 max-sm:w-full">
            <CalenderMini />
            <NextEvent />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 max-sm:p-3 max-sm:mt-4">
            <FullCalender />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calender;

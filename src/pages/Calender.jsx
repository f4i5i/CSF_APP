import React from "react";
import Header from "../components/Header";
import NextEvent from "../components/NextEvent";
import CalenderMini from "../components/Calendar/CalenderMini";
import FullCalender from "../components/Calendar/FullCalender";

const Calender = () => {
  return (
    <div className=" min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />
      <main className=" mx-6 py-8  max-xxl1:py-4  max-sm:py-2 max-sm:mx-3">
        <div className="flex flex-col lg:flex-row gap-4 bg-[#FFFFFF80] p-8 max-xxl1:py-4  max-sm:p-0 rounded-[30px] w-full">
          {/* LEFT SIDE */}
          <div className="flex flex-col sm:flex-row lg:flex-col max-sm:p-3 gap-3 sm:gap-4 max-sm:w-full max-sm:gap-3 w-full lg:w-auto">
            <div className="w-full sm:flex-1 lg:w-full">
              <CalenderMini />
            </div>
            <div className="w-full sm:flex-1 lg:w-full">
              <NextEvent />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 lg:p-0 max-lg:p-3 max-lg:mt-4 max-sm:mt-4">
            <FullCalender />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calender;

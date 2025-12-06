import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import CustomCaption from "./Calendar/CustomCaption";
import CustomNav from "./Calendar/CustomNav";

const Calendar = () => {
  const selectedDays = [new Date(2025, 9, 8), new Date(2025, 9, 10), new Date(2025, 9, 20), new Date(2025, 9, 21)];

  return (
    <div className=" rounded-3xl py-6  w-full " >
      <h2 className="text-[20px] xxl1:text-2xl font-kollektif font-normal text-[#1B1B1B] mb-4">Calendar</h2>

      <DayPicker
        mode="single"
        defaultMonth={new Date(2025, 9)}
        selected={selectedDays}
        modifiers={{
          highlighted: selectedDays,
        }}
        modifiersStyles={{
          highlighted: {
            backgroundColor: "#F4B728",
            color: "#fff",
            borderRadius: "50%",
          },
        }}
        components={{
            Caption: CustomCaption,
          
          }}
       className="!text-black !font-manrope calendar-mini"
 />
      
    </div>
  );
};

export default Calendar;

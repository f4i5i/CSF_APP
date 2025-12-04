import React, { useState } from 'react'
import { DayPicker } from 'react-day-picker';
import "react-day-picker/dist/style.css";
import CustomCaption from './CustomCaption';
import CustomNav from './CustomNav';
const CalenderMini = () => {
     const [selectedDay, setSelectedDay] = useState(new Date());

 const selectedDays = [new Date(2025, 9, 8), new Date(2025, 9, 10), new Date(2025, 9, 20), new Date(2025, 9, 21)];

  return (
    <div className=" rounded-3xl  max-sm:p-1 w-full " >
      <h2 className="text-[20px] xxl1:text-3xl font-kollektif font-medium pb-8">Calendar</h2>
<div className="bg-[#FFFFFF50] rounded-3xl p-6 shadow-sm  w-fit ">
 
      <DayPicker
        mode="single"
        defaultMonth={new Date(2025, 9)}
         selected={selectedDay}
        onSelect={setSelectedDay}
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
       
        className="!text-black !font-manrope calendar "
      />
      </div>
        <p className="mt-6 text-[20px] xl:text-base xl1:text-xl xxl1:text-3xl font-normal font-kollektif text-[#0f1d2e]">
        {selectedDay
          ? selectedDay.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "No date selected"}
      </p>
    </div>
  )
}

export default CalenderMini
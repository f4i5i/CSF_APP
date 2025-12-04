import React from 'react'
import AttendanceRow from '../components/attendence/AttendenceRow';
import BadgeCarousel from '../components/attendence/BadgeCarousel';
import Header from '../components/Header';
import icon1 from "../assets/Mask group.png"
import icon2 from '../assets/Mask group (1).png'
import icon3 from '../assets/Mask group (2).png'
import icon4 from '../assets/Mask group (3).png'
import icon5 from '../assets/Mask group (4).png'


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
     { title: "Team Player", icon: icon5 },
 
  ];

  const attendance = [
    { date: "Oct 24, 2024", status: "Present" },
    { date: "Oct 21, 2024", status: "Present" },
    { date: "Oct 17, 2024", status: "Present" },
    { date: "Oct 14, 2024", status: "Present" },
    { date: "Oct 13, 2024", status: "Absent" },
    { date: "Oct 12, 2024", status: "Present" },
  ];
  return (
     <div className=" min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">

      <Header />
 <main className=" mx-6 py-8 max-sm:py-2 max-sm:mx-3">
      <h1 className="text-[32px] xxl1:text-[46px] font-manrope font-bold text-[#1D3557] mb-4">
        Attendance
      </h1>

      <BadgeCarousel badges={badges} compact={true}/>

      <div className="mt-8 bg-white rounded-3xl p-6 shadow-lg">
        <h2 className="font-manrope font-semibold text-[18px] xxl1:text-[24px] mb-4">
          Attendance History
        </h2>

        <div className="flex flex-col gap-4">
          {attendance.map((item, i) => (
            <AttendanceRow key={i} {...item} />
          ))}
        </div>
      </div>
      </main>
    </div>
  )
}

export default Attendence
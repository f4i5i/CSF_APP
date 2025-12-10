import React from 'react'
import Header from '../components/Header'
import icon1 from "../assets/Mask group.png"
import icon2 from '../assets/Mask group (1).png'
import icon3 from '../assets/Mask group (2).png'
import icon4 from '../assets/Mask group (3).png'
import icon5 from '../assets/Mask group (4).png'
import BadgeCard from '../components/attendence/BadgeCard'


const Badges = () => {
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

   const locked = [
    {
      title: "Perfect Attendance",
      desc: "Completed the sprint drill under 10 seconds",
    },
    {
      title: "Sharpshooter",
      desc: "Score 5 goals in a single match",
    },
    {
      title: "MVP",
      desc: "Named Most Valuable Player of the season",
    },
    {
      title: "Early Bird",
      desc: "Arrive early to practice 20 times",
    },
  ];
  return (
    <div className=" min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">

      <Header />
 <main className=" mx-6 py-8 max-sm:py-2 max-sm:mx-3">
      <h1 className="text-fluid-2xl font-manrope font-medium text-[#173151] mb-4">
        Achievements
      </h1>
<div
      
      className="flex max-xl:grid max-xl:grid-cols-7 max-lg:grid max-lg:grid-cols-4 max-sm:grid-cols-2 max-sm:grid  gap-6 max-sm:px-2 py-2 mb-8"

      >
        {badges.map((badge, i) => (
          <BadgeCard key={i} {...badge} compact={false} />
        ))}
      </div>

       {/* ✅ Locked Badges */}
      <h2 className="text-fluid-2xl font-medium font-manrope  text-[#0F2D50] mb-1">
        Locked Badges
      </h2>
      <p className="text-gray-600 font-kollektif text-fluid-md mt-2 mb-6">
        Keep working to unlock these achievements
      </p>
      <div className="flex max-lg:grid max-lg:grid-cols-5 max-md:grid-cols-4 gap-6 max-sm:grid-cols-2 max-sm:grid  pb-12">
        {locked.map((item, index) => (
          <div
            key={index}
            className="bg-white/60 w-[200px] max-sm:w-full rounded-2xl py-8 flex flex-col items-center justify-center text-center shadow-sm border border-gray-200"
          >
            <div className="w-10 h-10  rounded-full border-2 border-gray-400 flex items-center justify-center mb-3">
              <svg
                width="18"
                height="18"
                fill="gray"
                viewBox="0 0 24 24"
              >
                <path d="M17 8h-1V6a4 4 0 00-8 0v2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2zM9 6a3 3 0 016 0v2H9V6zm8 14H7V10h10v10z" />
              </svg>
            </div>

            <p className="text-sm xxl1:text-base font-semibold text-[#0F2D50]">
              {item.title}
            </p>

            <p className="text-xs xxl1:text-sm text-gray-500 mt-1 px-4">{item.desc}</p>
          </div>
        ))}
      </div>
    
      
      </main>
</div>
  )
}

export default Badges
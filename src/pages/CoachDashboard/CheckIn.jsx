import React, { useState } from "react";
import StudentList from "../../components/checkIn/StudentList";
import { ChevronDown, MessageSquare, Search } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StudentDetailsModal from "../../components/checkIn/StudentDetailsModal";

const CheckIn = () => {
    const [openModal, setOpenModal] = useState(false);

     const [search, setSearch] = useState("");
  const [className, setClassName] = useState("Davidson Elementary");
  const [sort, setSort] = useState("Alphabetical");

  const students = [
    { id: 1, name: "Alex T.", grade: 6, checked: true, img: "/s1.png" },
    { id: 2, name: "Olivia C.", grade: 7, checked: false, img: "/s2.png" },
    { id: 3, name: "James L.", grade: 3, checked: true, img: "/s3.png" },
    { id: 4, name: "Emma R.", grade: 5, checked: false, img: "/s4.png" },
    { id: 5, name: "Michael K.", grade: 4, checked: true, img: "/s5.png" },
    { id: 6, name: "Michael K.", grade: 4, checked: true, img: "/s5.png" },
  ];
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Davidson Elementary");

  const options = [
    "Davidson Elementary",
    "Science - 5A",
    "Math - 3B",
    "English - 2C",
    "Computer Lab",
  ];
  return (
    <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />

      <main className="mx-10 py-6 max-xxl:py-3 max-sm:py-2 max-sm:mx-3">
        <div className="flex max-sm:justify-between mb-6 max-xxl:mb-3 max-xl:mb-3 max-sm:items-center">
       <h1 className="text-fluid-2xl font-manrope font-bold text-[#1D3557]">
     Check-In</h1>
 <button className="flex sm:hidden items-center whitespace-nowrap gap-2 bg-[#7d97b5] text-white px-5 py-3 rounded-full text-sm shadow-md">
  <MessageSquare size={16} />
  <span>Text Class</span>
</button>
</div>
      {/* TOP FILTER BAR */}
          
      <div className="flex max-sm:flex-col gap-4 mb-6 max-xxl:mb-3 max-xl:py-2 px-4 py-4 bg-[#FFFFFF80] rounded-[30px] ">

         
      {/* 🔍 SEARCH BAR */}
      <div className="flex items-center bg-[#f9fafb] rounded-full max-xl:py-2 px-4 py-3 w-full border">
        <Search size={18} className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-transparent outline-none text-sm text-gray-700"
        />
      </div>

      {/* DROPDOWN + TEXT BUTTON CONTAINER */}
      <div className="flex  items-center max-sm:gap-0 gap-4 max-sm:w-full max-sm:justify-between">

       {/* Class Selector Dropdown */}
        <div className="max-sm:w-full">
      {/* Dropdown Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-[316px] max-sm:w-full flex justify-between items-center 
                   bg-[#FFFFFF66] px-4 py-3 rounded-full 
                   shadow-sm border border-gray-200 
                   text-fluid-base font-medium"
      >
        {selected}

        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute mt-0 w-[316px] bg-[#FFFFFF66] shadow-md border border-gray-200 rounded-xl z-10 overflow-hidden">
          {options.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setSelected(item);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-[15px] max-xl:text-sm hover:bg-gray-100"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>

        {/* 💬 TEXT CLASS BUTTON */}
        <div>
       <button className="flex max-sm:hidden items-center whitespace-nowrap gap-2 bg-[#7d97b5] text-white px-5 py-3 rounded-full text-sm max-xl:text-xs shadow-md">
  <MessageSquare size={16} />
  <span>Text Class</span>
</button>
        </div>
      </div>
    
      </div>

     


      <StudentList
        students={students}
        search={search}
        sort={sort}
        setSort={setSort}
        onOpen={() => setOpenModal(true)}
      />
      </main>
             {/* Modal */}
      {openModal && <StudentDetailsModal onClose={() => setOpenModal(false)} />}
  
      <Footer />
    </div>
  );
};

export default CheckIn;

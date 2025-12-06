import { useEffect, useRef, useState } from "react";
import logo from "../assets/person.png"
import React from "react";
import Logo from "./Logo";
import { NavLink } from "react-router-dom";
import { Home, Calendar, CheckCircle, Image, User,CreditCard, Phone, Lock, LogOut, CheckCircle2, ChevronDown, UserPlus } from "lucide-react";
import { useAuth } from "../context/auth";
import {
  Settings,
  Users,
  GraduationCap,
  Wallet,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Person } from "@mui/icons-material";
const Header = () => {
  const role = localStorage.getItem("role");
  
    const navigate = useNavigate();
    const { user, logout } = useAuth();
   const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Close dropdown when clicking outside
  // useEffect(() => {
  //   const handleClick = (e) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
  //       setOpen(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClick);
  //   return () => document.removeEventListener("mousedown", handleClick);
  // }, []);
const MenuItem = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-gray-700"
  >
    <Icon size={16} />
    {label}
  </button>
);

    const navItems = [
    { name: "Home", icon: Home, path: "/dashboard" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
    { name: "Attendance", icon: CheckCircle2, path: "/attendance" },
    { name: "Photos", icon: Image, path: "/photos" },
    { name: "Account", icon: User, path: "/account" },
  ];

   const navItemscoach = [
    { name: "Home", icon: Home, path: "/coachdashboard" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
     { name: "Check-In", icon: User, path: "/checkIn" },
    { name: "Attendance", icon: CheckCircle2, path: "/attendance" },
    { name: "Photos", icon: Image, path: "/Gallery" },
   
  ];
  const navItemsadmin = [
  { name: "Home", icon: Home, path: "/admin" },
  { name: "Account", icon: Settings, path: "/company-settings" },
  { name: "Clients", icon: Users, path: "/clients" },
  { name: "Classes", icon: GraduationCap, path: "/classes" },
  { name: "Calendar", icon: Calendar, path: "/calendar" },
  { name: "Finance", icon: Wallet, path: "/financials" },
   { name: "Register", icon:Person, path: "/registerchild" },
 
  { name: "Communication", icon: MessageCircle, path: "/communication" },
  ];
 const itemsToShow =
  role === "coach"
    ? navItemscoach
    : role === "admin"
    ? navItemsadmin
    : navItems; 
  return (
    <header className="w-full py-1 flex justify-between max-sm:items-center max-sm:px-3">
      <div className="w-full mr-6 ml-1 mt-5 max-sm:mx-auto flex items-center justify-between max-sm:justify-between">

        {/* LEFT: Logo */}
        <div className="flex w-[64px] h-[62px] items-center max-sm:mx-auto max-sm:justify-start">
          <Logo/>
        </div>

        {/* MIDDLE NAVBAR */}
    {role === "parent" &&
      <nav>
  <ul className="flex items-center max-sm:hidden font-manrope xxl1:text-lg max-xl:text-base  text-base font-medium bg-[#FFFFFF66] rounded-full shadow px-2 py-1 gap-1">
    
    <li>
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Dashboard
      </NavLink>
    </li>

    <li>
      <NavLink
        to="/calendar"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Calendar
      </NavLink>
    </li>

    <li>
      <NavLink
        to="/attendance"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Attendance
      </NavLink>
    </li>

    <li>
      <NavLink
        to="/photos"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Photos
      </NavLink>
    </li>

    <li>
      <NavLink
        to="/badges"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Badges
      </NavLink>
    </li>

  </ul>
</nav>
}

{role === "admin" &&
<nav>
  <ul className="flex items-center max-sm:hidden font-manrope xxl1:text-lg max-xl:text-base text-base font-medium bg-[#FFFFFF66] rounded-full shadow px-2 py-1 gap-1">
    
    <li>
      <NavLink
        to="/admin"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Dashboard
      </NavLink>
    </li>
 <li>
      <NavLink
        to="/company-setting"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Account
      </NavLink>
    </li>
     <li>
      <NavLink
        to="/clients"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Clients
      </NavLink>
    </li>
     <li>
      <NavLink
        to="/class"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Classes
      </NavLink>
    </li>
    <li>
      <NavLink
        to="/calendar"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Calendar
      </NavLink>
    </li>
    <li>
      <NavLink
        to="/financials"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Finance
      </NavLink>
    </li>

   <li>
      <NavLink
        to="/communication"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Communication
      </NavLink>
    </li>

  </ul>
</nav>
}

{role === "coach" &&
<nav>
  <ul className="flex items-center max-sm:hidden font-manrope xxl1:text-lg max-xl:text-sm text-base font-medium bg-[#FFFFFF66] rounded-full shadow px-2 py-1 gap-1">
    
    <li>
      <NavLink
        to="/coachdashboard"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Dashboard
      </NavLink>
    </li>

    <li>
      <NavLink
        to="/calendar"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Calendar
      </NavLink>
    </li>

    <li>
      <NavLink
        to="/checkIn"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Check-In
      </NavLink>
    </li>

   <li>
      <NavLink
        to="/attendance"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Attendance
      </NavLink>
    </li>

    <li>
      <NavLink
        to="/Gallery"
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-2 rounded-full font-medium 
          ${isActive ? "bg-[#F3BC48] text-black" : "hover:bg-gray-100"}`
        }
      >
        Photos
      </NavLink>
    </li>

    

  </ul>
</nav>
}
        {/* RIGHT: PROFILE */}
         <div className=" max-sm:hidden flex max-sm:items-end max-sm:justify-end max-sm:right-0 items-center justify-between gap-3 cursor-pointer">
       
        <div className=" flex items-center gap-3 cursor-pointer max-sm:flex max-sm:justify-end max-sm:items-end">
          <img
            src={logo}
            alt="profile"
            className="w-10 h-10 max-sm:w-12 max-sm:h-12 rounded-full object-cover"
          />

          <div className="leading-tight max-sm:hidden">
            <p className="text-[#0F2D50] font-manrope font-medium text-[18px] leading-[140%] tracking-[-0.02em] capitalize">
              {user?.first_name} {user?.last_name?.charAt(0)}.
            </p>
            <p className="text-gray-500 text-xs capitalize">{user?.role || 'User'}</p>
          </div>
           </div>
           <div className="relative">
  <ChevronDown
    onClick={() => setOpen(!open)}
    size={18}
    className={`${open ? "rotate-180" : ""} transition cursor-pointer`}
  />

            {/* <svg  onClick={() => setOpen(!open)}
        ref={dropdownRef} xmlns="http://www.w3.org/2000/svg" className="flex max-sm:hidden" viewBox="0 0 512 512" height="14" width="14"> <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
         */}
           </div>

        {/* MOBILE MENU BTN */}
         </div>

           {/* ✅ DROPDOWN PANEL */}
        {open && (
          <div className="absolute right-8 top-24 w-48 bg-white shadow-xl rounded-xl border p-2 z-50">
            <MenuItem icon={User} label="Profile"   onClick={() => {
        setOpen(false);
        navigate("/settings");
      }}/>
            <MenuItem icon={CreditCard} label="Payment & Billing"
             onClick={() => {
       
        navigate("/paymentbilling");
      }} />
            <MenuItem icon={Phone} label="Contact"
             onClick={() => {
       
        navigate("/contactus");
      }}/>
            <MenuItem icon={UserPlus} label="Add Child"
             onClick={() => {
        setOpen(false);
        navigate("/registerchild");
      }}/>
            <MenuItem icon={Lock} label="Password" />
            <MenuItem
              icon={LogOut}
              label="Log out"
              onClick={async () => {
                setOpen(false);
                await logout();
                navigate('/login');
              }}
            />
          </div>
        )}
</div>
      <div className="hidden max-sm:flex items-center gap-2 cursor-pointer max-sm:justify-end max-sm:items-end pr-2">
          <img
           onClick={() => setOpen(!open)}
        ref={dropdownRef}
            src={logo}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />

        
           </div>

{/* mobile navbar */}


  <div className="fixed bottom-0 w-full bg-[#0D1B2A] py-3 px-6 flex justify-between items-center sm:hidden z-50">

  {itemsToShow.map((item) => {
    const Icon = item.icon;
    const hideLabel = role === "admin"; // 👈 Only admin hides text

    return (
      <NavLink
        key={item.name}
        to={item.path}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 transition ${
            isActive ? "text-[#F3BC48]" : "text-gray-300"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              size={24}
              className={`${isActive ? "text-[#F3BC48]" : "text-gray-300"}`}
            />

            {/* 👇 LABEL HIDDEN FOR ADMIN */}
            {!hideLabel && (
              <span
                className={`text-xs ${
                  isActive ? "text-[#F3BC48] font-medium" : "text-gray-300"
                }`}
              >
                {item.name}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  })}

  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-gray-400 opacity-60" />
</div>



    
    </header>
  );
};

export default Header;

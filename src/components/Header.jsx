import { useEffect, useRef, useState } from "react";
import logo from "../assets/person.png";
import React from "react";
import baseLogo from "../assets/logo.png";

import Logo from "./Logo";
import { Link, NavLink } from "react-router-dom";
import {
  Home,
  Calendar,
  CheckCircle,
  Image,
  User,
  CreditCard,
  Phone,
  Lock,
  LogOut,
  CheckCircle2,
  ChevronDown,
  UserPlus,
} from "lucide-react";
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
import AdminSidebar from "./AdminSidebar/AdminSidebar";
import { X } from "lucide-react";
const Header = () => {
  const role = localStorage.getItem("role");

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    { name: "Register", icon: Person, path: "/registerchild" },

    { name: "Communication", icon: MessageCircle, path: "/communication" },
  ];
  const itemsToShow =
    role === "coach"
      ? navItemscoach
      : role === "admin"
      ? navItemsadmin
      : navItems;
  return (
    <header className="w-full py-1 flex justify-between max-sm:items-center max-sm:px-3 mb-[15px]">
      <div className="w-full ml-1 max-sm:mx-auto flex items-center justify-end max-sm:justify-between">
        {/* LEFT: Logo */}
        {/* <div className="flex w-fluid-avatar-lg h-fluid-avatar-lg items-center max-sm:mx-auto max-sm:justify-start  invisible">
          <Logo />
        </div> */}

        {/* SMALL SCREEN: toggle, centered logo, profile - spaced evenly */}
        <div className="md:hidden flex items-center justify-between w-full">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 bg-white rounded-md shadow"
            aria-label="Open admin menu"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <img
            src="/images/logo3.png"
            alt="Outline"
            className="size-[80px] object-contain mix-blend-exclusion mx-2"
          />
          <div className="md:hidden flex items-center gap-2 cursor-pointer max-sm:justify-end max-sm:items-end ">
            <img
              onClick={() => {
                navigate("/settings");
              }}
              src={logo}
              alt="profile"
              className="w-fluid-avatar-lg h-fluid-avatar-lg rounded-full object-cover"
            />
          </div>
        </div>

        {/* MIDDLE NAVBAR */}
        {/* {role === "parent" && (
          <nav>
            <ul className="flex items-center max-sm:hidden font-manrope text-base font-medium bg-[#FFFFFF66] rounded-fluid-3xl shadow p-1 gap-1">
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Dashboard
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Calendar
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/attendance"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Attendance
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/photos"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Photos
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/badges"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Badges
                </NavLink>
              </li>
            </ul>
          </nav>
        )} */}

        {role === "admin" && (
          <nav>
            <ul className="flex items-center max-sm:hidden font-manrope text-base font-medium bg-[#FFFFFF66] rounded-fluid-3xl shadow p-1 gap-1">
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/company-setting"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Account
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/clients"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Clients
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/class"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Classes
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Calendar
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/financials"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Finance
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/communication"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Communication
                </NavLink>
              </li>
            </ul>
          </nav>
        )}

        {role === "coach" && (
          <nav>
            <ul className="flex items-center max-sm:hidden font-manrope text-base font-medium bg-[#FFFFFF66] rounded-fluid-3xl shadow p-1 gap-1">
              <li>
                <NavLink
                  to="/coachdashboard"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Dashboard
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Calendar
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/checkIn"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Check-In
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/attendance"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Attendance
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/Gallery"
                  className={({ isActive }) =>
                    `flex items-center justify-center px-fluid-6 py-fluid-3 rounded-fluid-3xl font-medium
          ${
            isActive
              ? "bg-[#F3BC48] text-black"
              : "text-black hover:bg-white/20"
          }`
                  }
                >
                  Photos
                </NavLink>
              </li>
            </ul>
          </nav>
        )}
        {/* RIGHT: PROFILE */}
        <div className="hidden md:flex items-center gap-1 cursor-pointer p-1 rounded-full pr-2">
          <div className="flex items-center gap-3 cursor-pointer">
            <img
              onClick={() => {
                navigate("/settings");
              }}
              src={logo}
              alt="profile"
              className="w-fluid-avatar-sm h-fluid-avatar-sm rounded-full object-cover"
            />
          </div>
          {/* <div className="flex items-center gap-3 cursor-pointer">
            <img
              src={logo}
              alt="profile"
              className="w-fluid-avatar-sm h-fluid-avatar-sm rounded-full object-cover"
            />

            <div className="leading-tight max-sm:hidden text-end">
              <p className="text-[#173151] font-manrope font-medium text-fluid-md leading-[140%] tracking-[-0.02em] capitalize">
                {user?.first_name} {user?.last_name?.charAt(0)}.
              </p>
              <p className="text-[#6f6f6f] text-sm font-manrope font-medium leading-[155%] capitalize">
                {user?.role || "User"}
              </p>
            </div>
          </div> */}
          {/* <div className="relative">
            <ChevronDown
              onClick={() => setOpen(!open)}
              size={24}
              className={`${
                open ? "rotate-180" : ""
              } transition cursor-pointer text-black ml-2`}
            />

            <svg  onClick={() => setOpen(!open)}
        ref={dropdownRef} xmlns="http://www.w3.org/2000/svg" className="flex max-sm:hidden" viewBox="0 0 512 512" height="14" width="14"> <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
        
          </div> */}

          {/* MOBILE MENU BTN */}
        </div>

        {/* ✅ DROPDOWN PANEL */}
        {/* {open && (
          <div className="absolute right-8 top-24 w-48 bg-white shadow-xl rounded-xl border p-2 z-50">
            <MenuItem
              icon={User}
              label="Profile"
              onClick={() => {
                setOpen(false);
                navigate("/settings");
              }}
            />
            <MenuItem
              icon={CreditCard}
              label="Payment & Billing"
              onClick={() => {
                navigate("/paymentbilling");
              }}
            />
            <MenuItem
              icon={Phone}
              label="Contact"
              onClick={() => {
                navigate("/contactus");
              }}
            />
            <MenuItem
              icon={UserPlus}
              label="Add Child"
              onClick={() => {
                setOpen(false);
                navigate("/registerchild");
              }}
            />
            <MenuItem icon={Lock} label="Password" />
            <MenuItem
              icon={LogOut}
              label="Log out"
              onClick={async () => {
                setOpen(false);
                await logout();
                navigate("/login");
              }}
            />
          </div>
        )} */}
      </div>

      {/* mobile navbar */}

      <div className="fixed bottom-0  w-full left-0 right-0 bg-[#0D1B2A] py-3 px-6 flex justify-between items-center sm:hidden z-10">
        {itemsToShow.map((item) => {
          const Icon = item.icon;
          const hideLabel = role === "admin";

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
                    className={`${
                      isActive ? "text-[#F3BC48]" : "text-gray-300"
                    }`}
                  />

                  {!hideLabel && (
                    <span
                      className={`text-xs ${
                        isActive
                          ? "text-[#F3BC48] font-medium"
                          : "text-gray-300"
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
      {/* Mobile overlay sidebar (full width) */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-full h-full bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-start mb-4">
              <button
                aria-label="Close sidebar"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md bg-white shadow"
              >
                <X size={20} />
              </button>
            </div>
            <AdminSidebar
              collapsed={false}
              setCollapsed={() => {}}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
